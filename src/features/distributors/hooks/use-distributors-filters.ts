import { useMemo, useState } from "react";
import { matchesDateRange, matchesSearch } from "@/utils/filter-utils";

type DistributorPerformanceRecord = {
  distributor_id: string;
  created_at: string;
  quantity?: number | null;
  distributor?: {
    full_name?: string;
    username?: string;
    phone?: string | null;
  };
  patient?: { full_name?: string; department?: string };
  donation_check?: { serial?: string };
};

export function useDistributorsFilters(
  performance: DistributorPerformanceRecord[] | undefined,
) {
  const [search, setSearch] = useState("");
  const [distributorFilter, setDistributorFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredPerformance = (performance ?? []).filter((record) => {
    const matchesSearchQuery =
      matchesSearch(record.distributor?.full_name ?? "", search) ||
      matchesSearch(record.distributor?.username ?? "", search) ||
      matchesSearch(record.patient?.full_name ?? "", search) ||
      (record.donation_check?.serial?.includes(search) ?? false);

    const matchesDistributor =
      distributorFilter === "all" ||
      String(record.distributor_id) === distributorFilter;

    const matchesDate = matchesDateRange(record.created_at, startDate, endDate);

    return matchesSearchQuery && matchesDistributor && matchesDate;
  });

  const hasActiveFilters =
    distributorFilter !== "all" ||
    search !== "" ||
    startDate !== "" ||
    endDate !== "";

  const resetFilters = () => {
    setSearch("");
    setDistributorFilter("all");
    setStartDate("");
    setEndDate("");
  };

  return {
    search,
    setSearch,
    distributorFilter,
    setDistributorFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredPerformance,
    hasActiveFilters,
    resetFilters,
  };
}
