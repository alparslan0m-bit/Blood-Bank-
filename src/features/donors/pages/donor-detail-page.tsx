import { useParams } from "react-router-dom";
import { useDonor, useDonorChecks } from "@/features/donors/hooks/use-donors";
import {
  getDonorChecksColumns,
  type DonorCheckRow,
} from "@/features/donors/components/donor-checks-columns";
import { PageHeader } from "@/components/page-header";
import { BloodTypeBadge } from "@/components/blood-type-badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { NotFoundState } from "@/components/feedback/not-found-state";
import {
  DetailBreadcrumb,
  DetailSection,
  DetailField,
  RecordsTable,
} from "@/components/data-display";
import { formatDate } from "@/lib/utils";
import { Phone, MapPin, ClipboardCheck, User, FileText } from "lucide-react";

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
        trail={`Donors / ${donor.full_name}`}
      />

      <PageHeader
        title={donor.full_name}
        description={`National ID: ${donor.national_id}`}
      >
        {donor.blood_types && (
          <BloodTypeBadge
            code={donor.blood_types.code}
            isRare={donor.blood_types.is_rare}
          />
        )}
      </PageHeader>

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
              <DetailField label="Total registered donations">
                <span className="tabular-nums">{donor.total_donations}</span>
              </DetailField>
              <DetailField label="Last donation date">
                {donor.last_donation_date
                  ? formatDate(donor.last_donation_date)
                  : "No recorded donations"}
              </DetailField>
              {donor.notes && (
                <div className="border-t border-hairline pt-sm">
                  <DetailField label="Staff notes">
                    <p className="rounded-sm bg-canvas-soft p-sm font-normal text-body">
                      {donor.notes}
                    </p>
                  </DetailField>
                </div>
              )}
            </div>
          </DetailSection>
        </div>

        <div className="lg:col-span-2">
          <DetailSection title="Donation records" icon={ClipboardCheck}>
            <RecordsTable<DonorCheckRow>
              columns={getDonorChecksColumns()}
              data={(checks ?? []) as DonorCheckRow[]}
              loading={loadingChecks}
              getRowKey={(row) => row.id}
              emptyTitle="No donation checks"
              emptyDescription="Checks linked to this donor will appear here."
            />
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
