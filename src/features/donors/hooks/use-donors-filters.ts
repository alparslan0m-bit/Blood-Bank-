import { useState } from "react";
import type { DonorWithBloodType } from "@/types/database";
import { matchesSearch } from "@/utils/filter-utils";

export function useDonorsFilters(donors: DonorWithBloodType[] | undefined) {
  const [search, setSearch] = useState("");
  const [bloodFilter, setBloodFilter] = useState("all");

  const filteredDonors = (donors ?? []).filter((donor) => {
    const matchesSearchQuery =
      matchesSearch(donor.full_name, search) ||
      donor.phone.includes(search) ||
      donor.national_id.includes(search);

    const matchesBlood =
      bloodFilter === "all" || String(donor.blood_type_id) === bloodFilter;

    return matchesSearchQuery && matchesBlood;
  });

  const hasActiveFilters = bloodFilter !== "all" || search !== "";

  const resetFilters = () => {
    setSearch("");
    setBloodFilter("all");
  };

  return {
    search,
    setSearch,
    bloodFilter,
    setBloodFilter,
    filteredDonors,
    hasActiveFilters,
    resetFilters,
  };
}
