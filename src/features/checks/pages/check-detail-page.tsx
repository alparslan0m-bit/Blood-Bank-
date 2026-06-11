import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { useCheck } from "@/features/checks/hooks/use-checks";
import { useCheckStatusActions } from "@/features/checks/hooks/use-check-status-actions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { DetailBreadcrumb } from "@/components/data-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckTimeline } from "@/features/checks/components/check-timeline";
import { CheckStatusActions } from "@/features/checks/components/check-status-actions";
import { CheckDonorCard } from "@/features/checks/components/check-donor-card";
import { CheckPatientCard } from "@/features/checks/components/check-patient-card";
import { CheckMetadataCard } from "@/features/checks/components/check-metadata-card";
import { CheckImageGallery } from "@/features/checks/components/check-image-gallery";
import { CheckLabBloodSection } from "@/features/checks/components/check-lab-blood-section";
import { CheckRelatedChecks } from "@/features/checks/components/check-related-checks";
import { CheckAuditTrail } from "@/features/checks/components/check-audit-trail";
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
    <div className="check-detail-page space-y-lg">
      <div className="no-print">
        <DetailBreadcrumb backTo="/checks" currentLabel={check.serial} />
      </div>

      <PageHeader title={check.serial} description={`Check ID: ${check.id}`}>
        <div className="flex items-center gap-sm">
          <StatusBadge status={check.status} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="no-print"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </PageHeader>

      <div className="check-detail-layout grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        <div className="lg:col-span-2 space-y-lg min-w-0">
          <CheckTimeline check={check} />

          <Tabs defaultValue="donor-patient" className="check-detail-tabs">
            <TabsList className="no-print w-full justify-start">
              <TabsTrigger value="donor-patient">Donor & Patient</TabsTrigger>
              <TabsTrigger value="lab-blood">Lab & Blood</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            <TabsContent value="donor-patient" className="check-tab-panel">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <CheckDonorCard donor={check.donors} donorId={check.donor_id} />
                <CheckPatientCard
                  patient={check.patients}
                  patientId={check.patient_id}
                />
              </div>
            </TabsContent>

            <TabsContent value="lab-blood" className="check-tab-panel">
              <CheckLabBloodSection check={check} />
            </TabsContent>

            <TabsContent value="images" className="check-tab-panel">
              <CheckImageGallery
                images={check.check_images ?? []}
                embedded
              />
            </TabsContent>
          </Tabs>

          <div className="print-only space-y-lg">
            <CheckMetadataCard check={check} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <CheckDonorCard donor={check.donors} donorId={check.donor_id} />
              <CheckPatientCard
                patient={check.patients}
                patientId={check.patient_id}
              />
            </div>
            <CheckLabBloodSection check={check} />
            <CheckImageGallery images={check.check_images ?? []} embedded />
          </div>
        </div>

        <aside className="check-detail-sidebar space-y-lg lg:sticky lg:top-lg">
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
          <CheckMetadataCard check={check} />
          <div className="no-print space-y-lg">
            <CheckRelatedChecks
              donorId={check.donor_id}
              currentCheckId={check.id}
            />
            <CheckAuditTrail checkId={check.id} />
          </div>
        </aside>
      </div>
    </div>
  );
}
