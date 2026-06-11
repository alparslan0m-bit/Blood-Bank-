import { supabase } from "@/lib/supabase";
import type { DonorWithBloodType } from "@/types/database";

export async function fetchDonors() {
  const { data, error } = await supabase
    .from("donors")
    .select("*, blood_types(code, label, is_rare)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DonorWithBloodType[];
}

export async function fetchDonor(id: string) {
  const { data, error } = await supabase
    .from("donors")
    .select("*, blood_types(code, label, is_rare)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as DonorWithBloodType;
}

export async function fetchDonorChecks(donorId: string) {
  const { data, error } = await supabase
    .from("donation_checks")
    .select("*, blood_types(code, label), patients(full_name, department)")
    .eq("donor_id", donorId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
