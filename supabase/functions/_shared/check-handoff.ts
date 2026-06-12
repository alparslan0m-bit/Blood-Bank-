import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function createServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

export async function authenticateUser(
  supabase: SupabaseClient,
  req: Request,
) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );

  if (authError || !user) {
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }

  return { user };
}

export async function getUserRoles(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId);

  return (
    roles?.flatMap((r: { roles: { name: string } | null }) =>
      r.roles?.name ? [r.roles.name] : []
    ) ?? []
  );
}

export function requireRole(roleNames: string[], allowed: string[]): boolean {
  return allowed.some((role) => roleNames.includes(role));
}

export async function insertCheckEvent(
  supabase: SupabaseClient,
  payload: {
    check_id: string;
    event_type: string;
    actor_id: string;
    actor_role: string;
    notes?: string | null;
    metadata?: Record<string, unknown>;
    device_info?: Record<string, unknown> | null;
  },
) {
  const { data: event, error: eventError } = await supabase
    .from("check_events")
    .insert(payload)
    .select()
    .single();

  if (eventError) {
    return { error: jsonResponse({ error: eventError.message }, 500) };
  }

  const { data: updatedCheck } = await supabase
    .from("donation_checks")
    .select("*, donors(*), patients(*), blood_types(*)")
    .eq("id", payload.check_id)
    .single();

  return { event, check: updatedCheck };
}
