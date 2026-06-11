import { supabase } from "@/lib/supabase";

export async function getReceiversPerformance() {
  const { data, error } = await supabase
    .from("receiver_performance")
    .select(
      `
      *,
      receiver:receiver_id(id, username, full_name, email, phone),
      donor:donor_id(id, full_name, national_id, blood_type_id),
      donation_check:donation_check_id(id, serial, status),
      blood_type:blood_type_id(id, code, label, is_rare)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
