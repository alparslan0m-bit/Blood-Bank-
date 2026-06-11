import { useDistributorsPerformance } from "@/features/distributors/hooks/use-distributor-performance";
import { useDistributorsFilters } from "@/features/distributors/hooks/use-distributors-filters";
import { getDistributorsTableColumns } from "@/features/distributors/components/distributors-table-columns";
import { useDistributors } from "@/hooks/use-lookups";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { FilterBar, FilterSelect, FilterDateRange } from "@/components/data-display";

export function DistributorsPerformancePage() {
  const { data: performance, isLoading } = useDistributorsPerformance();
  const { data: distributors } = useDistributors();

  const {
    search,
    setSearch,
    distributorFilter,
    setDistributorFilter,
    actionFilter,
    setActionFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    uniqueActions,
    filteredPerformance,
    hasActiveFilters,
    resetFilters,
  } = useDistributorsFilters(performance);

  const columns = getDistributorsTableColumns();

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Distributors Performance"
        description="Distributor staff activity across patient assignments and check fulfillment."
      />

      <FilterBar showReset={hasActiveFilters} onReset={resetFilters}>
        <FilterSelect
          label="Filter Distributor"
          value={distributorFilter}
          onValueChange={setDistributorFilter}
          placeholder="All Distributors"
          options={[
            { value: "all", label: "All Distributors" },
            ...(distributors?.map((distributor) => ({
              value: String(distributor.id),
              label: distributor.full_name || distributor.username,
            })) ?? []),
          ]}
        />
        <FilterSelect
          label="Filter Action"
          value={actionFilter}
          onValueChange={setActionFilter}
          placeholder="All Actions"
          options={[
            { value: "all", label: "All Actions" },
            ...uniqueActions.map((action) => ({ value: action, label: action })),
          ]}
        />
        <FilterDateRange
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={filteredPerformance}
        loading={isLoading}
        getRowKey={(row) => String((row as { id?: string }).id ?? row.created_at)}
        searchPlaceholder="Search by distributor, patient, or check number..."
        searchValue={search}
        onSearchChange={setSearch}
        emptyTitle="No distributor performance data"
        emptyDescription="Adjust filters or wait for distributor activity to be logged."
      />
    </div>
  );
}
