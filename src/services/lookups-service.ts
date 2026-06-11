import { supabase } from "@/lib/supabase";

export interface RoleUser {
  id: string;
  full_name: string | null;
  username: string;
  phone?: string | null;
}

export async function fetchUsersByRole(role: string): Promise<RoleUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, full_name, username, phone, user_roles!inner(role_id, roles!inner(name))",
    )
    .eq("user_roles.roles.name", role)
    .order("full_name");

  if (error) throw error;
  return (data ?? []) as RoleUser[];
}
