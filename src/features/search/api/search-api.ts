import { supabase } from "@/lib/supabase";

export interface SearchResults {
  donors: Array<{ id: string; full_name: string; national_id: string }>;
  patients: Array<{ id: string; full_name: string; file_number: string }>;
  checks: Array<{
    id: string;
    serial: string;
    donors: { full_name: string } | null;
  }>;
}

export async function globalSearch(query: string): Promise<SearchResults> {
  const match = `%${query}%`;

  const [donorsRes, patientsRes, checksRes] = await Promise.all([
    supabase
      .from("donors")
      .select("id, full_name, national_id")
      .or(`full_name.ilike.${match},national_id.ilike.${match}`)
      .limit(5),
    supabase
      .from("patients")
      .select("id, full_name, file_number")
      .or(`full_name.ilike.${match},file_number.ilike.${match}`)
      .limit(5),
    supabase
      .from("donation_checks")
      .select("id, serial, donors ( full_name )")
      .ilike("serial", match)
      .limit(5),
  ]);

  return {
    donors: (donorsRes.data ?? []) as SearchResults["donors"],
    patients: (patientsRes.data ?? []) as SearchResults["patients"],
    checks: (checksRes.data ?? []) as unknown as SearchResults["checks"],
  };
}
