import { supabase } from "@/lib/supabase";
import type { CheckWithRelations } from "@/types/database";

export async function fetchChecks() {
  const { data, error } = await supabase
    .from("donation_checks")
    .select(
      `
      *,
      donors(full_name, national_id, phone, age, blood_types(code, label, is_rare)),
      patients(full_name, national_id, phone, department, file_number, address, social_notes, medical_notes),
      blood_types(code, label, is_rare),
      created_by_user:users!donation_checks_created_by_fkey(full_name, username),
      distributor:users!donation_checks_distributor_id_fkey(full_name, username)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CheckWithRelations[];
}

export async function fetchCheck(id: string) {
  const { data, error } = await supabase
    .from("donation_checks")
    .select(
      `
      *,
      donors(*, blood_types(code, label, is_rare)),
      patients(*),
      blood_types(code, label, is_rare),
      created_by_user:users!donation_checks_created_by_fkey(full_name, username),
      distributor:users!donation_checks_distributor_id_fkey(full_name, username),
      blood_recorder:users!donation_checks_blood_recorded_by_fkey(full_name, username)
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return (data ?? null) as CheckWithRelations | null;
}

export async function updateCheck(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from("donation_checks")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

export function getCheckImageUrl(filePath: string) {
  const { data } = supabase.storage.from("checks").getPublicUrl(filePath);
  return data?.publicUrl ?? filePath;
}
