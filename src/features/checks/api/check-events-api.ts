import { supabase } from "@/lib/supabase";
import type { CheckEvent } from "@/types/database";

export async function fetchCheckEvents(checkId: string): Promise<CheckEvent[]> {
  const { data, error } = await supabase
    .from("check_events")
    .select("*, actor:users(full_name, username)")
    .eq("check_id", checkId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CheckEvent[];
}

export async function createCheckEvent(
  checkId: string,
  eventType: string,
  actorId: string,
  actorRole: string,
  options?: {
    notes?: string;
    metadata?: Record<string, unknown>;
    device_info?: Record<string, unknown>;
  },
): Promise<CheckEvent> {
  const { data, error } = await supabase
    .from("check_events")
    .insert({
      check_id: checkId,
      event_type: eventType,
      actor_id: actorId,
      actor_role: actorRole,
      notes: options?.notes,
      metadata: options?.metadata ?? {},
      device_info: options?.device_info,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CheckEvent;
}
