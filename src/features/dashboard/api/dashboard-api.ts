import { supabase } from "@/lib/supabase";

export async function fetchTotalDonors() {
  const { count } = await supabase
    .from("donors")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function fetchTotalPatients() {
  const { count } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function fetchTotalChecks() {
  const { count } = await supabase
    .from("donation_checks")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function fetchRareBloodDonors() {
  const { count } = await supabase
    .from("donors")
    .select("*, blood_types!inner(is_rare)", { count: "exact", head: true })
    .eq("blood_types.is_rare", true);
  return count ?? 0;
}

export async function fetchTodayDonations() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("donation_checks")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());
  return count ?? 0;
}

export async function fetchMonthlyDonations() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const { count } = await supabase
    .from("donation_checks")
    .select("*", { count: "exact", head: true })
    .gte("created_at", firstOfMonth.toISOString());
  return count ?? 0;
}

export async function fetchBloodTypeDistribution() {
  const { data } = await supabase
    .from("donors")
    .select("blood_type_id, blood_types(code)")
    .not("blood_type_id", "is", null);

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const d of data) {
    const code =
      (d as unknown as { blood_types: { code: string } }).blood_types?.code ??
      "Unknown";
    counts[code] = (counts[code] ?? 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export async function fetchDonationsPerMonth() {
  const { data } = await supabase
    .from("donation_checks")
    .select("created_at")
    .order("created_at", { ascending: true });

  if (!data) return [];

  const months: Record<string, number> = {};
  for (const d of data) {
    const key = new Date(d.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    months[key] = (months[key] ?? 0) + 1;
  }
  return Object.entries(months).map(([name, count]) => ({ name, count }));
}

export async function fetchTopDonors() {
  const { data } = await supabase
    .from("donors")
    .select("full_name, total_donations, blood_types(code, is_rare)")
    .order("total_donations", { ascending: false })
    .limit(5);

  return data ?? [];
}

export async function fetchDepartmentDistribution() {
  const { data } = await supabase.from("patients").select("department");

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const p of data) {
    counts[p.department] = (counts[p.department] ?? 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}
