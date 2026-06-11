import { useNavigate } from "react-router-dom";
import { useChecks } from "@/features/checks/hooks/use-checks";
import { useChecksFilters } from "@/features/checks/hooks/use-checks-filters";
import { getChecksTableColumns } from "@/features/checks/components/checks-table-columns";
import { useBloodTypes } from "@/hooks/use-blood-types";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { FilterBar, FilterSelect } from "@/components/data-display";
import { CHECK_STATUSES } from "@/constants/check-statuses";

export function ChecksPage() {
  const navigate = useNavigate();
  const { data: checks, isLoading } = useChecks();
  const { data: bloodTypes } = useBloodTypes();

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    bloodFilter,
    setBloodFilter,
    filteredChecks,
    hasActiveFilters,
    resetFilters,
  } = useChecksFilters(checks);

  const columns = getChecksTableColumns();

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Donation Checks"
        description="Track check lifecycle from creation through distribution."
      />

      <FilterBar showReset={hasActiveFilters} onReset={resetFilters}>
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

      <DataTable
        columns={columns}
        data={filteredChecks}
        loading={isLoading}
        getRowKey={(row) => row.id}
        searchPlaceholder="Search by serial, donor, or patient name..."
        searchValue={search}
        onSearchChange={setSearch}
        onRowClick={(row) => navigate(`/checks/${row.id}`)}
        emptyTitle="No checks match your criteria"
        emptyDescription="Update your search or adjust the status and blood group filters."
      />
    </div>
  );
}
