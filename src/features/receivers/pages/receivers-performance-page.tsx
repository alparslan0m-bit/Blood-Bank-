import { useReceiversPerformance } from "@/features/receivers/hooks/use-receiver-performance";
import { useReceiversFilters } from "@/features/receivers/hooks/use-receivers-filters";
import { getReceiversTableColumns } from "@/features/receivers/components/receivers-table-columns";
import { useReceivers } from "@/hooks/use-lookups";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { FilterBar, FilterSelect, FilterDateRange } from "@/components/data-display";

export function ReceiversPerformancePage() {
  const { data: performance, isLoading } = useReceiversPerformance();
  const { data: receivers } = useReceivers();

  const {
    search,
    setSearch,
    receiverFilter,
    setReceiverFilter,
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
  } = useReceiversFilters(performance);

  const columns = getReceiversTableColumns();

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Receivers Performance"
        description="Receiver staff activity across donor registrations and check handling."
      />

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
        searchPlaceholder="Search by receiver, donor, or check number..."
        searchValue={search}
        onSearchChange={setSearch}
        emptyTitle="No receiver performance data"
        emptyDescription="Adjust filters or wait for receiver activity to be logged."
      />
    </div>
  );
}
