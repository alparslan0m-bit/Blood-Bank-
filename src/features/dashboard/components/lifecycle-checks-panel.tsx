import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRightLeft, HeartHandshake, AlertTriangle } from "lucide-react";
import { useChecks } from "@/features/checks/hooks/use-checks";
import { getChecksTableColumns } from "@/features/checks/components/checks-table-columns";
import { StaleChecksAlert } from "@/features/dashboard/components/stale-checks-alert";
import {
  filterChecksByLifecycleBucket,
  isLifecycleBucket,
  LIFECYCLE_BUCKETS,
  type LifecycleBucket,
} from "@/features/dashboard/constants/lifecycle-buckets";
import {
  usePendingTransfer,
  usePendingPatientService,
  useStaleChecks,
} from "@/features/dashboard/hooks/use-dashboard";
import { DataTable } from "@/components/data-table";
import { KpiCard } from "@/components/kpi-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { matchesSearch } from "@/utils/filter-utils";
import { cn } from "@/lib/utils";

interface LifecycleKpiFilterProps {
  title: string;
  value: number;
  icon: typeof ArrowRightLeft;
  accent: "coral" | "amber" | "indigo" | "violet";
  description: string;
  loading?: boolean;
  active: boolean;
  onSelect: () => void;
}

function LifecycleKpiFilter({
  title,
  value,
  icon,
  accent,
  description,
  loading,
  active,
  onSelect,
}: LifecycleKpiFilterProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
    >
      <KpiCard
        title={title}
        value={value}
        icon={icon}
        accent={accent}
        description={description}
        loading={loading}
        className={cn(
          active && "border-primary ring-2 ring-primary/20",
          value > 0 && !active && "border-hairline-strong",
        )}
      />
    </button>
  );
}

export function LifecycleChecksPanel() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  const bucketParam = searchParams.get("bucket");
  const bucket: LifecycleBucket = isLifecycleBucket(bucketParam)
    ? bucketParam
    : "all-active";

  const { data: checks, isLoading } = useChecks();
  const { data: pendingTransfer, isLoading: loadingTransfer } =
    usePendingTransfer();
  const { data: pendingPatientService, isLoading: loadingPatientService } =
    usePendingPatientService();
  const { data: staleChecks, isLoading: loadingStale } = useStaleChecks();

  const columns = getChecksTableColumns();

  useEffect(() => {
    if (bucketParam && !isLifecycleBucket(bucketParam)) {
      const next = new URLSearchParams(searchParams);
      next.delete("bucket");
      setSearchParams(next, { replace: true });
    }
  }, [bucketParam, searchParams, setSearchParams]);

  const filteredChecks = useMemo(() => {
    const bucketFiltered = filterChecksByLifecycleBucket(checks ?? [], bucket);
    if (!search.trim()) return bucketFiltered;

    return bucketFiltered.filter(
      (check) =>
        matchesSearch(check.serial, search) ||
        matchesSearch(check.donors?.full_name ?? "", search) ||
        matchesSearch(check.patients?.full_name ?? "", search),
    );
  }, [checks, bucket, search]);

  const setBucket = (nextBucket: LifecycleBucket) => {
    const next = new URLSearchParams(searchParams);
    if (nextBucket === "all-active") {
      next.delete("bucket");
    } else {
      next.set("bucket", nextBucket);
    }
    setSearchParams(next, { replace: true });
  };

  const activeBucketLabel =
    LIFECYCLE_BUCKETS.find((item) => item.value === bucket)?.label ??
    "All Active";

  return (
    <div className="space-y-lg">
      <StaleChecksAlert />

      <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
        <LifecycleKpiFilter
          title="Awaiting Transfer"
          value={pendingTransfer ?? 0}
          icon={ArrowRightLeft}
          accent="amber"
          description="Created, not yet transferred"
          loading={loadingTransfer}
          active={bucket === "pending-transfer"}
          onSelect={() => setBucket("pending-transfer")}
        />
        <LifecycleKpiFilter
          title="Awaiting Patient Service"
          value={pendingPatientService ?? 0}
          icon={HeartHandshake}
          accent="indigo"
          description="Lab verified, not yet served"
          loading={loadingPatientService}
          active={bucket === "pending-patient-service"}
          onSelect={() => setBucket("pending-patient-service")}
        />
        <LifecycleKpiFilter
          title="Stale Checks"
          value={staleChecks?.count ?? 0}
          icon={AlertTriangle}
          accent="violet"
          description="Created >24 hours ago"
          loading={loadingStale}
          active={bucket === "stale"}
          onSelect={() => setBucket("stale")}
        />
      </div>

      <div className="space-y-md">
        <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-body-md font-semibold text-ink">
              {activeBucketLabel}
            </h2>
            <p className="text-body-sm text-mute">
              {filteredChecks.length} check
              {filteredChecks.length === 1 ? "" : "s"} — click a row to open
              the profile
            </p>
          </div>

          <Tabs
            value={bucket}
            onValueChange={(v) => setBucket(v as LifecycleBucket)}
          >
            <TabsList className="flex-wrap h-auto">
              {LIFECYCLE_BUCKETS.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <DataTable
          columns={columns}
          data={filteredChecks}
          loading={isLoading}
          loadingSkeleton="checks"
          getRowKey={(row) => row.id}
          searchPlaceholder="Search by serial, donor, or patient..."
          searchValue={search}
          onSearchChange={setSearch}
          onRowClick={(row) => navigate(`/checks/${row.id}`)}
          emptyTitle="No checks in this view"
          emptyDescription="Try another lifecycle filter or clear your search."
          emptyIcon={<EntityEmptyIcon entity="checks" />}
        />
      </div>
    </div>
  );
}
