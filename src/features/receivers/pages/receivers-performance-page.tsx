import { useReceiversPerformance } from "@/features/receivers/hooks/use-receiver-performance";
import { useReceiversFilters } from "@/features/receivers/hooks/use-receivers-filters";
import { getReceiversTableColumns } from "@/features/receivers/components/receivers-table-columns";
import { ReceiversKanbanBoard } from "@/features/receivers/components/receivers-kanban-board";
import { useReceivers } from "@/hooks/use-lookups";
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

export function ReceiversPerformancePage() {
  const { view, setView } = useListViewPreference(
    LIST_VIEW_STORAGE_KEYS.receivers,
  );
  const { data: performance, isLoading } = useReceiversPerformance();
  const { data: receivers } = useReceivers();

  const {
    search,
    setSearch,
    receiverFilter,
    setReceiverFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredPerformance,
    hasActiveFilters,
    resetFilters,
  } = useReceiversFilters(performance);

  const columns = getReceiversTableColumns();
  const emptyStateProps = {
    emptyTitle: "No receiver performance data",
    emptyDescription:
      "Adjust filters or wait for receiver activity to be logged.",
    emptyIcon: <EntityEmptyIcon entity="receivers" />,
  };

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Receivers Performance"
        description="Receiver staff activity across donor registrations and check handling."
      >
        <ListViewToggle
          view={view}
          onViewChange={setView}
          label="Receivers view mode"
        />
      </PageHeader>

      <FilterBar showReset={hasActiveFilters} onReset={resetFilters}>
        <FilterSelect
          label="Filter Receiver"
          value={receiverFilter}
          onValueChange={setReceiverFilter}
          placeholder="All Receivers"
          options={[
            { value: "all", label: "All Receivers" },
            ...(receivers?.map((receiver) => ({
              value: String(receiver.id),
              label: receiver.full_name || receiver.username,
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
          searchPlaceholder="Search by receiver, donor, or check number..."
          searchValue={search}
          onSearchChange={setSearch}
          {...emptyStateProps}
        />
      ) : (
        <ReceiversKanbanBoard
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
