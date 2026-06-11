import { supabase } from "@/lib/supabase";

export async function fetchUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*, user_roles(role_id, roles(id, name, label))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchRoles() {
  const { data, error } = await supabase.from("roles").select("*").order("id");
  if (error) throw error;
  return data ?? [];
}

export async function updateUserDisabled(userId: string, disabled: boolean) {
  const { error } = await supabase
    .from("users")
    .update({ disabled })
    .eq("id", userId);
  if (error) throw error;
}

export async function assignRole(userId: string, roleId: number) {
  const { error } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role_id: roleId });
  if (error) throw error;
}

export async function removeRole(userId: string, roleId: number) {
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role_id", roleId);
  if (error) throw error;
}

export async function createUser(
  username: string,
  email: string,
  fullName: string,
  phone: string,
  roleIds: number[],
) {
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      username,
      email,
      full_name: fullName,
      phone,
      disabled: false,
    })
    .select()
    .single();

  if (error) throw error;

  if (roleIds.length > 0) {
    const roleInserts = roleIds.map((rid) => ({
      user_id: newUser.id,
      role_id: rid,
    }));
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert(roleInserts);
    if (roleErr) throw roleErr;
  }

  return newUser;
}
