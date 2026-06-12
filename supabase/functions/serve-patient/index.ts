import {
  authenticateUser,
  createServiceClient,
  getUserRoles,
  handleCors,
  insertCheckEvent,
  jsonResponse,
  requireRole,
} from "../_shared/check-handoff.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const { check_id, notes, metadata, device_info } = await req.json();
  const supabase = createServiceClient();

  const auth = await authenticateUser(supabase, req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const roleNames = await getUserRoles(supabase, user!.id);
  if (!requireRole(roleNames, ["distributor", "admin"])) {
    return jsonResponse({ error: "Forbidden: distributor role required" }, 403);
  }

  if (!notes?.trim()) {
    return jsonResponse(
      { error: "notes are required — delivery confirmation must be documented" },
      422,
    );
  }

  const { data: check } = await supabase
    .from("donation_checks")
    .select("id, status, distributor_id, patient_id")
    .eq("id", check_id)
    .single();

  if (!check || check.status !== "blood_recorded") {
    return jsonResponse(
      {
        error: `Check must be in 'blood_recorded' status, currently: ${check?.status ?? "not found"}`,
      },
      422,
    );
  }

  if (
    check.distributor_id &&
    check.distributor_id !== user!.id &&
    !roleNames.includes("admin")
  ) {
    return jsonResponse(
      { error: "Distributor can only close their own assigned checks" },
      403,
    );
  }

  const result = await insertCheckEvent(supabase, {
    check_id,
    event_type: "patient_served",
    actor_id: user!.id,
    actor_role: "distributor",
    notes: notes.trim(),
    metadata: metadata ?? {},
    device_info,
  });

  if (result.error) return result.error;
  return jsonResponse({ check: result.check, event: result.event });
});
