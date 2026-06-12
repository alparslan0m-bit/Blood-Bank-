import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { CheckWithRelations } from "@/types/database";
import { BOTTLENECK_STATUSES } from "@/constants/check-statuses";
import { matchesSearch } from "@/utils/filter-utils";

interface UseChecksFiltersOptions {
  donorId?: string | null;
}

export function useChecksFilters(
  checks: CheckWithRelations[] | undefined,
  options: UseChecksFiltersOptions = {},
) {
  const [searchParams] = useSearchParams();
  const donorIdFilter = options.donorId ?? null;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") ?? "all",
  );
  const [bloodFilter, setBloodFilter] = useState("all");
  const [bottleneckOnly, setBottleneckOnly] = useState(
    () => searchParams.get("bottleneck") === "true",
  );

  useEffect(() => {
    const status = searchParams.get("status");
    const bottleneck = searchParams.get("bottleneck") === "true";
    if (status) setStatusFilter(status);
    setBottleneckOnly(bottleneck);
  }, [searchParams]);

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
    const matchesBottleneck =
      !bottleneckOnly ||
      BOTTLENECK_STATUSES.includes(
        check.status as (typeof BOTTLENECK_STATUSES)[number],
      );

    return (
      matchesSearchQuery &&
      matchesStatus &&
      matchesBlood &&
      matchesDonor &&
      matchesBottleneck
    );
  });

  const hasLocalFilters =
    statusFilter !== "all" ||
    bloodFilter !== "all" ||
    search !== "" ||
    bottleneckOnly;
  const hasActiveFilters = hasLocalFilters || !!donorIdFilter;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setBloodFilter("all");
    setBottleneckOnly(false);
  };

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    bloodFilter,
    setBloodFilter,
    bottleneckOnly,
    setBottleneckOnly,
    donorIdFilter,
    filteredChecks,
    hasActiveFilters,
    hasLocalFilters,
    resetFilters,
  };
}
