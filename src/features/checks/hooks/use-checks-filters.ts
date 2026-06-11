import { useState } from "react";
import type { CheckWithRelations } from "@/types/database";
import { matchesSearch } from "@/utils/filter-utils";

export function useChecksFilters(checks: CheckWithRelations[] | undefined) {
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

    return matchesSearchQuery && matchesStatus && matchesBlood;
  });

  const hasActiveFilters =
    statusFilter !== "all" || bloodFilter !== "all" || search !== "";

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
    filteredChecks,
    hasActiveFilters,
    resetFilters,
  };
}
