import { supabase } from "@/lib/supabase";
import type { Activity } from "@/types/database";

export async function fetchActivitiesByEntityId(
  entityId: string,
  limit = 5,
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*, user:users(full_name, username)")
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Activity[];
}
