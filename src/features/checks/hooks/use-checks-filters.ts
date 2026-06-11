import { useState } from "react";
import type { CheckWithRelations } from "@/types/database";
import { matchesSearch } from "@/utils/filter-utils";

interface UseChecksFiltersOptions {
  donorId?: string | null;
}

export function useChecksFilters(
  checks: CheckWithRelations[] | undefined,
  options: UseChecksFiltersOptions = {},
) {
  const donorIdFilter = options.donorId ?? null;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bloodFilter, setBloodFilter] = useState("all");

  const filteredChecks = (checks ?? []).filter((check) => {
    const matchesSearchQuery =
      matchesSearch(check.serial, search) ||
      matchesSearch(check.donors?.full_name ?? "", search) ||
      matchesSearch(check.patients?.full_name ?? "", search);

    const matchesStatus =
      statusFilter === "all" || check.status === statusFilter;
    const matchesBlood =
      bloodFilter === "all" || String(check.blood_type_id) === bloodFilter;
    const matchesDonor =
      !donorIdFilter || check.donor_id === donorIdFilter;

    return (
      matchesSearchQuery && matchesStatus && matchesBlood && matchesDonor
    );
  });

  const hasLocalFilters =
    statusFilter !== "all" || bloodFilter !== "all" || search !== "";
  const hasActiveFilters = hasLocalFilters || !!donorIdFilter;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setBloodFilter("all");
  };

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    bloodFilter,
    setBloodFilter,
    donorIdFilter,
    filteredChecks,
    hasActiveFilters,
    hasLocalFilters,
    resetFilters,
  };
}
