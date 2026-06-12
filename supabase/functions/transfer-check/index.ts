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

  const { check_id, distributor_id, notes, device_info } = await req.json();
  const supabase = createServiceClient();

  const auth = await authenticateUser(supabase, req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const roleNames = await getUserRoles(supabase, user!.id);
  if (!requireRole(roleNames, ["receiver", "admin"])) {
    return jsonResponse({ error: "Forbidden: receiver role required" }, 403);
  }

  if (!distributor_id) {
    return jsonResponse({ error: "distributor_id is required" }, 422);
  }

  const { data: distributorRoles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", distributor_id);

  const distRoleNames =
    distributorRoles?.flatMap((r: { roles: { name: string } | null }) =>
      r.roles?.name ? [r.roles.name] : []
    ) ?? [];

  if (!distRoleNames.includes("distributor")) {
    return jsonResponse(
      { error: "distributor_id must reference a user with distributor role" },
      422,
    );
  }

  const { data: check } = await supabase
    .from("donation_checks")
    .select("id, status")
    .eq("id", check_id)
    .single();

  if (!check || check.status !== "created") {
    return jsonResponse(
      {
        error: `Check must be in 'created' status, currently: ${check?.status ?? "not found"}`,
      },
      422,
    );
  }

  const result = await insertCheckEvent(supabase, {
    check_id,
    event_type: "transferred",
    actor_id: user!.id,
    actor_role: "receiver",
    notes,
    metadata: { distributor_id },
    device_info,
  });

  if (result.error) return result.error;
  return jsonResponse({ check: result.check, event: result.event });
});
