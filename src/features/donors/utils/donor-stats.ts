import { differenceInDays, format, parseISO, subMonths } from "date-fns";

export type DonorStatus = "active" | "inactive" | "new";

export function getDonorStatus(
  lastDonationDate: string | null,
  referenceDate = new Date(),
): DonorStatus {
  if (!lastDonationDate) return "new";

  const last = parseISO(lastDonationDate);
  const sixMonthsAgo = subMonths(referenceDate, 6);

  return last >= sixMonthsAgo ? "active" : "inactive";
}

export function getDaysSinceLastDonation(
  lastDonationDate: string | null,
  referenceDate = new Date(),
): number | null {
  if (!lastDonationDate) return null;
  return differenceInDays(referenceDate, parseISO(lastDonationDate));
}

export interface MonthlyDonationCount {
  name: string;
  count: number;
  sortKey: string;
}

export function groupChecksByMonth(
  checks: { created_at: string }[],
): MonthlyDonationCount[] {
  const counts = new Map<string, MonthlyDonationCount>();

  for (const check of checks) {
    const date = parseISO(check.created_at);
    const sortKey = format(date, "yyyy-MM");
    const existing = counts.get(sortKey);

    if (existing) {
      existing.count += 1;
    } else {
      counts.set(sortKey, {
        name: format(date, "MMM yyyy"),
        count: 1,
        sortKey,
      });
    }
  }

  return Array.from(counts.values()).sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey),
  );
}

export const DONOR_STATUS_LABELS: Record<DonorStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  new: "New",
};
