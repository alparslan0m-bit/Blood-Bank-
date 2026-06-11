import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { useChecks } from "@/features/checks/hooks/use-checks";
import { useChecksFilters } from "@/features/checks/hooks/use-checks-filters";
import { getChecksTableColumns } from "@/features/checks/components/checks-table-columns";
import { ChecksKanbanBoard } from "@/features/checks/components/checks-kanban-board";
import { useBloodTypes } from "@/hooks/use-blood-types";
import { useDonor } from "@/features/donors/hooks/use-donors";
import {
  LIST_VIEW_STORAGE_KEYS,
  useListViewPreference,
} from "@/hooks/use-list-view-preference";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { ListViewToggle } from "@/components/list-view-toggle";
import { Button } from "@/components/ui/button";
import { FilterBar, FilterSelect } from "@/components/data-display";
import { CHECK_STATUSES } from "@/constants/check-statuses";

export function ChecksPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const donorId = searchParams.get("donor_id");
  const { view, setView } = useListViewPreference(
    LIST_VIEW_STORAGE_KEYS.checks,
  );

  const { data: checks, isLoading } = useChecks();
  const { data: bloodTypes } = useBloodTypes();
  const { data: donor } = useDonor(donorId ?? "");

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    bloodFilter,
    setBloodFilter,
    donorIdFilter,
    filteredChecks,
    hasLocalFilters,
    resetFilters,
  } = useChecksFilters(checks, { donorId });

  const columns = getChecksTableColumns();
  const checksEmptyIcon = <EntityEmptyIcon entity="checks" />;
  const showCreateAction =
    !hasLocalFilters && !donorIdFilter && !isLoading;

  const emptyAction = showCreateAction ? (
    <Button size="sm" onClick={() => navigate("/donors")}>
      <Plus className="mr-2 h-4 w-4" />
      Create first check
    </Button>
  ) : undefined;

  const clearDonorFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("donor_id");
    setSearchParams(next);
  };

  const emptyTitle = donorIdFilter
    ? "No checks for this donor"
    : "No checks match your criteria";
  const emptyDescription = donorIdFilter
    ? "Create a new check from the donor profile to get started."
    : "Update your search or adjust the status and blood group filters.";

  const emptyStateProps = {
    emptyTitle,
    emptyDescription,
    emptyIcon: checksEmptyIcon,
    emptyAction,
  };

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Donation Checks"
        description="Track check lifecycle from creation through distribution."
      >
        <ListViewToggle
          view={view}
          onViewChange={setView}
          label="Checks view mode"
        />
      </PageHeader>

      {donorIdFilter && (
        <div className="flex items-center justify-between gap-md rounded-md border border-teal/30 bg-teal-soft px-md py-sm">
          <p className="text-body-sm text-teal-deep">
            Showing checks for{" "}
            <span className="font-semibold">
              {donor?.full_name ?? "selected donor"}
            </span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDonorFilter}
            className="shrink-0 text-teal-deep hover:text-teal-deep"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear filter
          </Button>
        </div>
      )}

      <FilterBar showReset={hasLocalFilters} onReset={resetFilters}>
        <FilterSelect
          label="Filter Status"
          value={statusFilter}
          onValueChange={setStatusFilter}
          placeholder="All Statuses"
          options={CHECK_STATUSES.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
        />
        <FilterSelect
          label="Filter Blood Group"
          value={bloodFilter}
          onValueChange={setBloodFilter}
          placeholder="All Blood Groups"
          options={[
            { value: "all", label: "All Blood Groups" },
            ...(bloodTypes?.map((bt) => ({
              value: String(bt.id),
              label: `${bt.label}${bt.is_rare ? " (Rare)" : ""}`,
            })) ?? []),
          ]}
        />
      </FilterBar>

      {view === "table" ? (
        <DataTable
          columns={columns}
          data={filteredChecks}
          loading={isLoading}
          loadingSkeleton="checks"
          getRowKey={(row) => row.id}
          getRowClassName={
            donorIdFilter
              ? () => "bg-teal-soft/40 hover:bg-teal-soft/60"
              : undefined
          }
          searchPlaceholder="Search by serial, donor, or patient name..."
          searchValue={search}
          onSearchChange={setSearch}
          onRowClick={(row) => navigate(`/checks/${row.id}`)}
          {...emptyStateProps}
        />
      ) : (
        <ChecksKanbanBoard
          checks={filteredChecks}
          loading={isLoading}
          search={search}
          onSearchChange={setSearch}
          {...emptyStateProps}
        />
      )}
    </div>
  );
}
