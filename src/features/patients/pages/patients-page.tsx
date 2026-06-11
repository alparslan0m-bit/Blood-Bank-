import { useNavigate } from "react-router-dom";
import { usePatients } from "@/features/patients/hooks/use-patients";
import { usePatientsFilters } from "@/features/patients/hooks/use-patients-filters";
import { getPatientsTableColumns } from "@/features/patients/components/patients-table-columns";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { FilterBar, FilterSelect, FilterDateRange } from "@/components/data-display";

export function PatientsPage() {
  const navigate = useNavigate();
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

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Patients Registry"
        description="Hospital patient records with department and registration filters."
      />

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

      <DataTable
        columns={columns}
        data={filteredPatients}
        loading={isLoading}
        getRowKey={(row) => row.id}
        searchPlaceholder="Search by name, file number, phone, or department..."
        searchValue={search}
        onSearchChange={setSearch}
        onRowClick={(row) => navigate(`/patients/${row.id}`)}
        emptyTitle="No patient profiles match"
        emptyDescription="Update your search or register patients through the receiver system."
      />
    </div>
  );
}
