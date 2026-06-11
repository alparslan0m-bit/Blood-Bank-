import { Droplets, CalendarDays, Heart, Activity } from "lucide-react";
import { BloodTypeBadge } from "@/components/blood-type-badge";
import { cn } from "@/lib/utils";
import {
  DONOR_STATUS_LABELS,
  getDaysSinceLastDonation,
  getDonorStatus,
  type DonorStatus,
} from "@/features/donors/utils/donor-stats";
import type { DonorWithBloodType } from "@/types/database";

const STATUS_STYLES: Record<DonorStatus, string> = {
  active: "bg-teal-soft text-teal-deep",
  inactive: "bg-canvas-soft-2 text-mute",
  new: "bg-indigo-soft text-indigo-deep",
};

interface DonorStatsRowProps {
  donor: DonorWithBloodType;
}

interface StatChipProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function StatChip({ label, icon, children, className }: StatChipProps) {
  return (
    <div
      className={cn(
        "flex min-w-[140px] flex-1 items-center gap-sm rounded-md border border-hairline bg-canvas px-md py-sm shadow-level-1",
        className,
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-canvas-soft text-mute">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-wider text-mute">
          {label}
        </p>
        <div className="text-body-sm font-semibold text-ink tabular-nums">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DonorStatsRow({ donor }: DonorStatsRowProps) {
  const daysSince = getDaysSinceLastDonation(donor.last_donation_date);
  const status = getDonorStatus(donor.last_donation_date);

  return (
    <div className="flex flex-wrap gap-sm">
      <StatChip
        label="Total Donations"
        icon={<Droplets className="h-4 w-4" aria-hidden />}
      >
        {donor.total_donations.toLocaleString()}
      </StatChip>

      <StatChip
        label="Days Since Last"
        icon={<CalendarDays className="h-4 w-4" aria-hidden />}
      >
        {daysSince !== null ? (
          <>
            {daysSince.toLocaleString()}
            <span className="ml-1 font-normal text-mute">days</span>
          </>
        ) : (
          <span className="font-normal text-mute">Never</span>
        )}
      </StatChip>

      <StatChip
        label="Blood Type"
        icon={<Heart className="h-4 w-4" aria-hidden />}
      >
        {donor.blood_types ? (
          <BloodTypeBadge
            code={donor.blood_types.code}
            isRare={donor.blood_types.is_rare}
          />
        ) : (
          <span className="font-normal text-mute">Unknown</span>
        )}
      </StatChip>

      <StatChip
        label="Donor Status"
        icon={<Activity className="h-4 w-4" aria-hidden />}
      >
        <span
          className={cn(
            "inline-flex rounded-sm px-xs py-0.5 text-caption font-medium",
            STATUS_STYLES[status],
          )}
        >
          {DONOR_STATUS_LABELS[status]}
        </span>
      </StatChip>
    </div>
  );
}
