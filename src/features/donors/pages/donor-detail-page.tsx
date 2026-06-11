import { Link, useParams } from "react-router-dom";
import { useDonor, useDonorChecks } from "@/features/donors/hooks/use-donors";
import {
  getDonorChecksColumns,
  type DonorCheckRow,
} from "@/features/donors/components/donor-checks-columns";
import { DonorStatsRow } from "@/features/donors/components/donor-stats-row";
import { DonorDonationChart } from "@/features/donors/components/donor-donation-chart";
import { DonorNotesCard } from "@/features/donors/components/donor-notes-card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { NotFoundState } from "@/components/feedback/not-found-state";
import {
  DetailBreadcrumb,
  DetailSection,
  DetailField,
  RecordsTable,
} from "@/components/data-display";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { Phone, MapPin, ClipboardCheck, User, FileText, Plus } from "lucide-react";

export function DonorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: donor, isLoading, error } = useDonor(id ?? "");
  const { data: checks, isLoading: loadingChecks } = useDonorChecks(id ?? "");

  if (isLoading) {
    return <LoadingState message="Loading donor profile..." />;
  }

  if (error || !donor) {
    return (
      <NotFoundState
        icon={FileText}
        title="Donor profile not found"
        description="The donor ID may be invalid or removed from the database."
        backTo="/donors"
        backLabel="Back to Donors"
      />
    );
  }

  return (
    <div className="space-y-lg">
      <DetailBreadcrumb
        backTo="/donors"
        currentLabel={donor.full_name}
      />

      <PageHeader
        title={donor.full_name}
        description={`National ID: ${donor.national_id}`}
      >
        <Button size="sm" asChild>
          <Link to={`/checks?donor_id=${donor.id}`}>
            <Plus className="mr-2 h-4 w-4" />
            New Check for Donor
          </Link>
        </Button>
      </PageHeader>

      <DonorStatsRow donor={donor} />

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        <div className="lg:col-span-1">
          <DetailSection title="Donor identification" icon={User}>
            <div className="grid gap-md">
              <DetailField label="Gender & age">
                {donor.gender} · {donor.age} years old
              </DetailField>
              <DetailField label="Contact phone">
                <span className="inline-flex items-center gap-xxs">
                  <Phone className="h-3.5 w-3.5 text-mute" aria-hidden />
                  {donor.phone}
                </span>
              </DetailField>
              <DetailField label="Living address">
                <span className="inline-flex items-center gap-xxs">
                  <MapPin className="h-3.5 w-3.5 text-mute" aria-hidden />
                  {donor.address}
                </span>
              </DetailField>
              {donor.notes && (
                <DonorNotesCard notes={donor.notes} updatedAt={donor.updated_at} />
              )}
            </div>
          </DetailSection>
        </div>

        <div className="lg:col-span-2 space-y-lg">
          <DonorDonationChart checks={checks} loading={loadingChecks} />
          <DetailSection title="Donation records" icon={ClipboardCheck}>
            <RecordsTable<DonorCheckRow>
              columns={getDonorChecksColumns()}
              data={(checks ?? []) as DonorCheckRow[]}
              loading={loadingChecks}
              getRowKey={(row) => row.id}
              emptyTitle="No donation checks"
              emptyDescription="Checks linked to this donor will appear here."
              emptyIcon={<EntityEmptyIcon entity="checks" />}
            />
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
