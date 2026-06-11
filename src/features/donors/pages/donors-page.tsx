import { useNavigate } from "react-router-dom";
import { useDonors } from "@/features/donors/hooks/use-donors";
import { useDonorsFilters } from "@/features/donors/hooks/use-donors-filters";
import { getDonorsTableColumns } from "@/features/donors/components/donors-table-columns";
import { useBloodTypes } from "@/hooks/use-blood-types";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { FilterBar, FilterSelect } from "@/components/data-display";

export function DonorsPage() {
  const navigate = useNavigate();
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

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Donors Directory"
        description="Browse registered donors and open profiles for donation history."
      />

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

      <DataTable
        columns={columns}
        data={filteredDonors}
        loading={isLoading}
        getRowKey={(row) => row.id}
        searchPlaceholder="Search by name, phone, or national ID..."
        searchValue={search}
        onSearchChange={setSearch}
        onRowClick={(row) => navigate(`/donors/${row.id}`)}
        emptyTitle="No donors found"
        emptyDescription="Broaden your search or clear the blood group filter."
      />
    </div>
  );
}
