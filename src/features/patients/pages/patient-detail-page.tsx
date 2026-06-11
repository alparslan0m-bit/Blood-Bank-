import { useParams } from "react-router-dom";
import { usePatient, usePatientChecks } from "@/features/patients/hooks/use-patients";
import {
  getPatientChecksColumns,
  type PatientCheckRow,
} from "@/features/patients/components/patient-checks-columns";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/feedback/loading-state";
import { NotFoundState } from "@/components/feedback/not-found-state";
import {
  DetailBreadcrumb,
  DetailSection,
  DetailField,
  RecordsTable,
} from "@/components/data-display";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { formatDate } from "@/lib/utils";
import {
  Phone,
  MapPin,
  ClipboardCheck,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading, error } = usePatient(id ?? "");
  const { data: checks, isLoading: loadingChecks } = usePatientChecks(id ?? "");

  if (isLoading) {
    return <LoadingState message="Loading patient profile..." />;
  }

  if (error || !patient) {
    return (
      <NotFoundState
        icon={FileText}
        title="Patient profile not found"
        description="The patient ID may be invalid or archived."
        backTo="/patients"
        backLabel="Back to Patients"
      />
    );
  }

  return (
    <div className="space-y-lg">
      <DetailBreadcrumb
        backTo="/patients"
        currentLabel={patient.full_name}
      />

      <PageHeader
        title={patient.full_name}
        description={`Hospital file number: ${patient.file_number}`}
      >
        <span className="rounded-sm border border-hairline bg-canvas-soft-2 px-sm py-1 text-caption font-mono font-semibold uppercase text-ink">
          {patient.department} department
        </span>
      </PageHeader>

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        <div className="space-y-lg lg:col-span-1">
          <DetailSection title="Patient identification" icon={User}>
            <div className="grid gap-md">
              <DetailField label="National ID">{patient.national_id}</DetailField>
              <DetailField label="Contact phone">
                <span className="inline-flex items-center gap-xxs">
                  <Phone className="h-3.5 w-3.5 text-mute" aria-hidden />
                  {patient.phone}
                </span>
              </DetailField>
              <DetailField label="Hospital residence">
                <span className="inline-flex items-center gap-xxs">
                  <MapPin className="h-3.5 w-3.5 text-mute" aria-hidden />
                  {patient.address}
                </span>
              </DetailField>
              <DetailField label="Registration date">
                {formatDate(patient.created_at)}
              </DetailField>
            </div>
          </DetailSection>

          <DetailSection title="Case notes" icon={AlertCircle}>
            {patient.medical_notes && (
              <div className="space-y-xs">
                <span className="text-[10px] font-mono font-semibold uppercase text-error">
                  Medical history / contraindications
                </span>
                <p className="rounded-sm border border-error/20 bg-error-soft p-sm text-body-sm text-error-deep">
                  {patient.medical_notes}
                </p>
              </div>
            )}

            {patient.social_notes && (
              <div className={patient.medical_notes ? "mt-md space-y-xs" : "space-y-xs"}>
                <span className="text-[10px] font-mono font-semibold uppercase text-mute">
                  Social case notes
                </span>
                <p className="rounded-sm border border-hairline bg-canvas-soft p-sm text-body-sm text-body">
                  {patient.social_notes}
                </p>
              </div>
            )}

            {!patient.medical_notes && !patient.social_notes && (
              <p className="py-md text-center text-caption text-mute">
                No medical or case notes added.
              </p>
            )}
          </DetailSection>
        </div>

        <div className="lg:col-span-2">
          <DetailSection title="Assigned donation checks" icon={ClipboardCheck}>
            <RecordsTable<PatientCheckRow>
              columns={getPatientChecksColumns()}
              data={(checks ?? []) as PatientCheckRow[]}
              loading={loadingChecks}
              getRowKey={(row) => row.id}
              emptyTitle="No assigned checks"
              emptyDescription="Checks linked to this patient will appear here."
              emptyIcon={<EntityEmptyIcon entity="checks" />}
            />
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
