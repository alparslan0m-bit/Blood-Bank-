import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/types/database";

interface CheckPatientCardProps {
  patient: Patient | null | undefined;
  patientId: string | null;
}

export function CheckPatientCard({ patient, patientId }: CheckPatientCardProps) {
  return (
    <div className="rounded-md bg-canvas shadow-level-2 p-lg border border-hairline">
      <div className="flex items-center justify-between mb-lg border-b border-hairline pb-sm">
        <h3 className="text-body-md font-semibold text-ink flex items-center gap-sm">
          <Users className="h-5 w-5 text-mute" />
          Recipient Patient Profile
        </h3>
        {patientId && (
          <Link to={`/patients/${patientId}`} className="no-print">
            <Button variant="ghost" size="sm" className="text-caption">
              View File
            </Button>
          </Link>
        )}
      </div>
      {patient ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Full Name
            </span>
            <p className="text-body-sm font-medium text-ink">
              {patient.full_name}
            </p>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Hospital File Number
            </span>
            <p className="text-body-sm font-medium text-ink">
              {patient.file_number}
            </p>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Medical Department
            </span>
            <p className="text-body-sm font-medium text-ink">
              {patient.department}
            </p>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Contact Phone
            </span>
            <p className="text-body-sm font-medium text-ink">{patient.phone}</p>
          </div>
          {patient.medical_notes && (
            <div className="space-y-xs md:col-span-2">
              <span className="text-[10px] font-mono text-error uppercase font-semibold">
                Critical Medical Notes
              </span>
              <p className="text-body-sm p-sm bg-error-soft text-error-deep rounded-sm border border-error/20">
                {patient.medical_notes}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-md text-center text-caption text-mute bg-canvas-soft rounded-sm border border-dashed border-hairline">
          Direct/Anonymous Donation — No specific patient assigned
        </div>
      )}
    </div>
  );
}
