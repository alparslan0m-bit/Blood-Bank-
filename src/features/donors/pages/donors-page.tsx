import { useNavigate } from "react-router-dom";
import { useDonors } from "@/features/donors/hooks/use-donors";
import { useDonorsFilters } from "@/features/donors/hooks/use-donors-filters";
import { getDonorsTableColumns } from "@/features/donors/components/donors-table-columns";
import { DonorsKanbanBoard } from "@/features/donors/components/donors-kanban-board";
import { DonorsBloodTypeInfoCard } from "@/features/donors/components/donors-blood-type-info-card";
import { useBloodTypes } from "@/hooks/use-blood-types";
import {
  LIST_VIEW_STORAGE_KEYS,
  useListViewPreference,
} from "@/hooks/use-list-view-preference";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { ListViewToggle } from "@/components/list-view-toggle";
import { FilterBar, FilterSelect } from "@/components/data-display";

export function DonorsPage() {
  const navigate = useNavigate();
  const { view, setView } = useListViewPreference(
    LIST_VIEW_STORAGE_KEYS.donors,
  );
  const { data: donors, isLoading } = useDonors();
  const { data: bloodTypes } = useBloodTypes();

  const {
    search,
    setSearch,
    bloodFilter,
    setBloodFilter,
    filteredDonors,
    hasActiveFilters,
    resetFilters,
  } = useDonorsFilters(donors);

  const columns = getDonorsTableColumns();
  const isEmpty = !isLoading && filteredDonors.length === 0;
  const emptyStateProps = {
    emptyTitle: "No donors found",
    emptyDescription: "Broaden your search or clear the blood group filter.",
    emptyIcon: <EntityEmptyIcon entity="donors" />,
  };

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Donors Directory"
        description="Browse registered donors and open profiles for donation history."
      >
        <ListViewToggle
          view={view}
          onViewChange={setView}
          label="Donors view mode"
        />
      </PageHeader>

      <FilterBar showReset={hasActiveFilters} onReset={resetFilters}>
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
          data={filteredDonors}
          loading={isLoading}
          loadingSkeleton="donors"
          getRowKey={(row) => row.id}
          searchPlaceholder="Search by name, phone, or national ID..."
          searchValue={search}
          onSearchChange={setSearch}
          onRowClick={(row) => navigate(`/donors/${row.id}`)}
          {...emptyStateProps}
        />
      ) : (
        <DonorsKanbanBoard
          donors={filteredDonors}
          loading={isLoading}
          search={search}
          onSearchChange={setSearch}
          {...emptyStateProps}
        />
      )}

      {isEmpty && <DonorsBloodTypeInfoCard />}
    </div>
  );
}
