import { supabase } from "@/lib/supabase";
import type { Patient } from "@/types/database";

export async function fetchPatients() {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Patient[];
}

export async function fetchPatient(id: string) {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Patient;
}

export async function fetchPatientChecks(patientId: string) {
  const { data, error } = await supabase
    .from("donation_checks")
    .select("*, blood_types(code, label), donors(full_name)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
