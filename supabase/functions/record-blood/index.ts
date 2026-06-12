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

  const { check_id, blood_type_id, notes, device_info } = await req.json();
  const supabase = createServiceClient();

  const auth = await authenticateUser(supabase, req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const roleNames = await getUserRoles(supabase, user!.id);
  if (!requireRole(roleNames, ["lab", "admin"])) {
    return jsonResponse({ error: "Forbidden: lab role required" }, 403);
  }

  if (!blood_type_id) {
    return jsonResponse({ error: "blood_type_id is required" }, 422);
  }

  const { data: bloodType } = await supabase
    .from("blood_types")
    .select("id")
    .eq("id", blood_type_id)
    .single();

  if (!bloodType) {
    return jsonResponse({ error: "Invalid blood_type_id" }, 422);
  }

  const { data: check } = await supabase
    .from("donation_checks")
    .select("id, status")
    .eq("id", check_id)
    .single();

  if (!check || check.status !== "transferred") {
    return jsonResponse(
      {
        error: `Check must be in 'transferred' status, currently: ${check?.status ?? "not found"}`,
      },
      422,
    );
  }

  const result = await insertCheckEvent(supabase, {
    check_id,
    event_type: "blood_recorded",
    actor_id: user!.id,
    actor_role: "lab",
    notes,
    metadata: { blood_type_id },
    device_info,
  });

  if (result.error) return result.error;
  return jsonResponse({ check: result.check, event: result.event });
});
