import { supabase } from "@/lib/supabase";

export async function getDistributorsPerformance() {
  const { data, error } = await supabase
    .from("distributor_performance")
    .select(
      `
      *,
      distributor:distributor_id(id, username, full_name, email, phone),
      patient:patient_id(id, full_name, department),
      donation_check:donation_check_id(id, serial, status),
      blood_type:blood_type_id(id, code, label, is_rare)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
