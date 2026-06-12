import { useDistributorsPerformance } from "@/features/distributors/hooks/use-distributor-performance";
import { useDistributorsFilters } from "@/features/distributors/hooks/use-distributors-filters";
import { getDistributorsTableColumns } from "@/features/distributors/components/distributors-table-columns";
import { DistributorsKanbanBoard } from "@/features/distributors/components/distributors-kanban-board";
import { useDistributors } from "@/hooks/use-lookups";
import {
  LIST_VIEW_STORAGE_KEYS,
  useListViewPreference,
} from "@/hooks/use-list-view-preference";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { ListViewToggle } from "@/components/list-view-toggle";
import {
  FilterBar,
  FilterSelect,
  FilterDateRange,
} from "@/components/data-display";

export function DistributorsPerformancePage() {
  const { view, setView } = useListViewPreference(
    LIST_VIEW_STORAGE_KEYS.distributors,
  );
  const { data: performance, isLoading } = useDistributorsPerformance();
  const { data: distributors } = useDistributors();

  const {
    search,
    setSearch,
    distributorFilter,
    setDistributorFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredPerformance,
    hasActiveFilters,
    resetFilters,
  } = useDistributorsFilters(performance);

  const columns = getDistributorsTableColumns();
  const emptyStateProps = {
    emptyTitle: "No distributor performance data",
    emptyDescription:
      "Adjust filters or wait for distributor activity to be logged.",
    emptyIcon: <EntityEmptyIcon entity="distributors" />,
  };

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Distributors Performance"
        description="Distributor staff activity across patient assignments and check fulfillment."
      >
        <ListViewToggle
          view={view}
          onViewChange={setView}
          label="Distributors view mode"
        />
      </PageHeader>

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
        <FilterDateRange
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </FilterBar>

      {view === "table" ? (
        <DataTable
          columns={columns}
          data={filteredPerformance}
          loading={isLoading}
          getRowKey={(row) =>
            String((row as { id?: string }).id ?? row.created_at)
          }
          searchPlaceholder="Search by distributor, patient, or check number..."
          searchValue={search}
          onSearchChange={setSearch}
          {...emptyStateProps}
        />
      ) : (
        <DistributorsKanbanBoard
          performance={filteredPerformance}
          loading={isLoading}
          search={search}
          onSearchChange={setSearch}
          {...emptyStateProps}
        />
      )}
    </div>
  );
}
