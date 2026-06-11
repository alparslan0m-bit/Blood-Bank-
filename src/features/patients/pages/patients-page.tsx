import { useNavigate } from "react-router-dom";
import { usePatients } from "@/features/patients/hooks/use-patients";
import { usePatientsFilters } from "@/features/patients/hooks/use-patients-filters";
import { getPatientsTableColumns } from "@/features/patients/components/patients-table-columns";
import { PatientsKanbanBoard } from "@/features/patients/components/patients-kanban-board";
import {
  LIST_VIEW_STORAGE_KEYS,
  useListViewPreference,
} from "@/hooks/use-list-view-preference";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { ListViewToggle } from "@/components/list-view-toggle";
import { FilterBar, FilterSelect, FilterDateRange } from "@/components/data-display";

export function PatientsPage() {
  const navigate = useNavigate();
  const { view, setView } = useListViewPreference(
    LIST_VIEW_STORAGE_KEYS.patients,
  );
  const { data: patients, isLoading } = usePatients();

  const {
    search,
    setSearch,
    departmentFilter,
    setDepartmentFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    departmentOptions,
    filteredPatients,
    hasActiveFilters,
    resetFilters,
  } = usePatientsFilters(patients);

  const columns = getPatientsTableColumns();
  const emptyStateProps = {
    emptyTitle: "No patient profiles match",
    emptyDescription:
      "Update your search or register patients through the receiver system.",
    emptyIcon: <EntityEmptyIcon entity="patients" />,
  };

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Patients Registry"
        description="Hospital patient records with department and registration filters."
      >
        <ListViewToggle
          view={view}
          onViewChange={setView}
          label="Patients view mode"
        />
      </PageHeader>

      <FilterBar showReset={hasActiveFilters} onReset={resetFilters}>
        <FilterSelect
          label="Filter Department"
          value={departmentFilter}
          onValueChange={setDepartmentFilter}
          placeholder="All Departments"
          options={[
            { value: "all", label: "All Departments" },
            ...departmentOptions.map((department) => ({
              value: department,
              label: department,
            })),
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
          data={filteredPatients}
          loading={isLoading}
          getRowKey={(row) => row.id}
          searchPlaceholder="Search by name, file number, phone, or department..."
          searchValue={search}
          onSearchChange={setSearch}
          onRowClick={(row) => navigate(`/patients/${row.id}`)}
          {...emptyStateProps}
        />
      ) : (
        <PatientsKanbanBoard
          patients={filteredPatients}
          loading={isLoading}
          search={search}
          onSearchChange={setSearch}
          {...emptyStateProps}
        />
      )}
    </div>
  );
}
