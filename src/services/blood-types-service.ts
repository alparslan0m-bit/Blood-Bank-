import { supabase } from "@/lib/supabase";
import type { BloodType } from "@/types/database";

export async function fetchBloodTypes(): Promise<BloodType[]> {
  const { data, error } = await supabase
    .from("blood_types")
    .select("*")
    .order("code");

  if (error) throw error;
  return (data ?? []) as BloodType[];
}
