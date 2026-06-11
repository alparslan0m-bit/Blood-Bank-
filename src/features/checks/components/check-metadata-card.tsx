import { ClipboardList } from "lucide-react";
import { BloodTypeBadge } from "@/components/blood-type-badge";
import type { BloodType, CheckWithRelations, User } from "@/types/database";

interface CheckMetadataCardProps {
  check: CheckWithRelations;
}

export function CheckMetadataCard({ check }: CheckMetadataCardProps) {
  return (
    <div className="rounded-md bg-canvas shadow-level-2 p-lg border border-hairline">
      <h3 className="text-body-md font-semibold text-ink mb-lg border-b border-hairline pb-sm flex items-center gap-sm">
        <ClipboardList className="h-5 w-5 text-mute" />
        Check Record Metadata
      </h3>
      <div className="space-y-md">
        <div className="flex justify-between items-center text-body-sm">
          <span className="text-mute">Blood Group (Lab)</span>
          {check.blood_types ? (
            <BloodTypeBadge
              code={(check.blood_types as BloodType).code}
              isRare={(check.blood_types as BloodType).is_rare}
            />
          ) : (
            <span className="text-caption bg-warning-soft text-warning-deep px-xs py-0.5 rounded-sm">
              Unverified
            </span>
          )}
        </div>
        <div className="flex justify-between items-center text-body-sm">
          <span className="text-mute">Created By</span>
          <span className="font-medium text-ink">
            {(check.created_by_user as User | null)?.full_name ??
              (check.created_by_user as User | null)?.username ??
              "Receiver"}
          </span>
        </div>
        {check.distributor && (
          <div className="flex justify-between items-center text-body-sm">
            <span className="text-mute">Distributor Assigned</span>
            <span className="font-medium text-ink">
              {(check.distributor as User).full_name}
            </span>
          </div>
        )}
        {check.blood_recorder && (
          <div className="flex justify-between items-center text-body-sm">
            <span className="text-mute">Verified By (Lab)</span>
            <span className="font-medium text-ink">
              {(check.blood_recorder as User).full_name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
