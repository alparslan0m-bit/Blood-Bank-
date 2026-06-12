import { FlaskConical, FileText } from "lucide-react";
import { BloodTypeBadge } from "@/components/blood-type-badge";
import { formatDateTime } from "@/lib/utils";
import { getBloodTestNotes } from "@/features/checks/utils/check-metadata";
import type { BloodType, CheckWithRelations, User } from "@/types/database";

interface CheckLabBloodSectionProps {
  check: CheckWithRelations;
}

export function CheckLabBloodSection({ check }: CheckLabBloodSectionProps) {
  const bloodTestNotes = getBloodTestNotes(check);
  const donorBloodType = check.donors?.blood_types as BloodType | null;

  return (
    <div className="space-y-lg">
      <div className="rounded-md bg-canvas shadow-level-2 p-lg border border-hairline">
        <h3 className="text-body-md font-semibold text-ink mb-lg border-b border-hairline pb-sm flex items-center gap-sm">
          <FlaskConical className="h-5 w-5 text-mute" />
          Blood Type Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Donor Declared Type
            </span>
            <div>
              {donorBloodType ? (
                <BloodTypeBadge
                  code={donorBloodType.code}
                  isRare={donorBloodType.is_rare}
                />
              ) : (
                <span className="text-body-sm text-mute">Not recorded</span>
              )}
            </div>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Lab Verified Type
            </span>
            <div>
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
          </div>
        </div>
      </div>

      <div className="rounded-md bg-canvas shadow-level-2 p-lg border border-hairline">
        <h3 className="text-body-md font-semibold text-ink mb-lg border-b border-hairline pb-sm">
          Verification Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Verified By
            </span>
            <p className="text-body-sm font-medium text-ink">
              {check.blood_recorder
                ? ((check.blood_recorder as User).full_name ??
                  (check.blood_recorder as User).username)
                : "—"}
            </p>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Verification Date
            </span>
            <p className="text-body-sm font-medium text-ink">
              {check.blood_recorded_at
                ? formatDateTime(check.blood_recorded_at)
                : "—"}
            </p>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Distributor Assigned
            </span>
            <p className="text-body-sm font-medium text-ink">
              {check.distributor
                ? ((check.distributor as User).full_name ??
                  (check.distributor as User).username)
                : "—"}
            </p>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Patient Served
            </span>
            <p className="text-body-sm font-medium text-ink">
              {check.patient_served_at
                ? formatDateTime(check.patient_served_at)
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-canvas shadow-level-2 p-lg border border-hairline">
        <h3 className="text-body-md font-semibold text-ink mb-lg border-b border-hairline pb-sm flex items-center gap-sm">
          <FileText className="h-5 w-5 text-mute" />
          Blood Test Notes
        </h3>
        {bloodTestNotes ? (
          <p className="text-body-sm text-body whitespace-pre-wrap leading-relaxed">
            {bloodTestNotes}
          </p>
        ) : (
          <p className="text-body-sm text-mute italic">
            No blood test notes recorded in check metadata.
          </p>
        )}
      </div>
    </div>
  );
}
