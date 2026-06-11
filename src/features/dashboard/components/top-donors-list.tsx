import { useTopDonors } from "@/features/dashboard/hooks/use-dashboard";
import { DashboardPanel } from "@/features/dashboard/components/dashboard-panel";
import { BloodTypeBadge } from "@/components/blood-type-badge";
import { EmptyState } from "@/components/empty-state";
import { Trophy } from "lucide-react";

export function TopDonorsList() {
  const { data: topDonors, isLoading } = useTopDonors();

  const getBloodType = (donor: {
    blood_types?:
      | { code: string; is_rare?: boolean }
      | { code: string; is_rare?: boolean }[]
      | null;
  }) => {
    const bt = donor.blood_types;
    if (!bt) return null;
    return Array.isArray(bt) ? bt[0] : bt;
  };

  return (
    <DashboardPanel
      title="Top donors"
      description="Highest lifetime donation counts"
      loading={isLoading}
    >
      {!isLoading && topDonors && topDonors.length > 0 ? (
        <ol className="space-y-sm">
          {topDonors.map((donor, idx) => {
            const bloodType = getBloodType(donor);
            return (
              <li
                key={`${donor.full_name}-${idx}`}
                className="flex items-center justify-between rounded-sm border border-hairline p-sm transition-colors hover:bg-canvas-soft"
              >
                <div className="flex min-w-0 items-center gap-sm">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas-soft-2 text-caption font-semibold tabular-nums text-ink"
                    aria-label={`Rank ${idx + 1}`}
                  >
                    {idx + 1}
                  </span>
                  <span className="truncate text-body-sm font-medium text-ink">
                    {donor.full_name}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-md">
                  <BloodTypeBadge
                    code={bloodType?.code ?? ""}
                    isRare={bloodType?.is_rare}
                  />
                  <div className="text-right">
                    <span className="text-body-sm font-semibold tabular-nums text-ink">
                      {donor.total_donations}
                    </span>
                    <span className="block text-[10px] leading-none text-mute">
                      donations
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : !isLoading ? (
        <EmptyState
          className="py-lg"
          icon={<Trophy className="h-6 w-6 text-mute" />}
          title="No donor rankings yet"
          description="Top donors appear after donation checks are completed."
        />
      ) : null}
    </DashboardPanel>
  );
}
