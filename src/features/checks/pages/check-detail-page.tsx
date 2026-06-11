import { useParams } from "react-router-dom";
import { useCheck } from "@/features/checks/hooks/use-checks";
import { useCheckStatusActions } from "@/features/checks/hooks/use-check-status-actions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { DetailBreadcrumb } from "@/components/data-display";
import { CheckTimeline } from "@/features/checks/components/check-timeline";
import { CheckStatusActions } from "@/features/checks/components/check-status-actions";
import { CheckDonorCard } from "@/features/checks/components/check-donor-card";
import { CheckPatientCard } from "@/features/checks/components/check-patient-card";
import { CheckMetadataCard } from "@/features/checks/components/check-metadata-card";
import { CheckImageGallery } from "@/features/checks/components/check-image-gallery";
import { CheckNotFound } from "@/features/checks/components/check-not-found";

export function CheckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: check, isLoading, error } = useCheck(id ?? "");

  const {
    actionLoading,
    selectedBloodType,
    setSelectedBloodType,
    selectedDistributor,
    setSelectedDistributor,
    handleTransfer,
    handleRecordBlood,
    handleDistribute,
    handleComplete,
  } = useCheckStatusActions(id ?? "");

  if (isLoading) {
    return <LoadingState message="Loading check details..." />;
  }

  if (error || !check) {
    return <CheckNotFound />;
  }

  return (
    <div className="space-y-lg">
      <DetailBreadcrumb backTo="/checks" trail={`Checks / ${check.serial}`} />

      <PageHeader title={check.serial} description={`Check ID: ${check.id}`}>
        <div className="flex items-center gap-sm">
          <StatusBadge status={check.status} />
          <CheckStatusActions
            check={check}
            actionLoading={actionLoading}
            selectedBloodType={selectedBloodType}
            setSelectedBloodType={setSelectedBloodType}
            selectedDistributor={selectedDistributor}
            setSelectedDistributor={setSelectedDistributor}
            onTransfer={handleTransfer}
            onRecordBlood={handleRecordBlood}
            onDistribute={handleDistribute}
            onComplete={handleComplete}
          />
        </div>
      </PageHeader>

      <CheckTimeline check={check} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 space-y-lg">
          <CheckDonorCard donor={check.donors} donorId={check.donor_id} />
          <CheckPatientCard
            patient={check.patients}
            patientId={check.patient_id}
          />
        </div>

        <div className="space-y-lg">
          <CheckMetadataCard check={check} />
          <CheckImageGallery images={check.check_images ?? []} />
        </div>
      </div>
    </div>
  );
}
