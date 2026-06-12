import { useState } from "react";
import { matchesDateRange, matchesSearch } from "@/utils/filter-utils";

type ReceiverPerformanceRecord = {
  receiver_id: string;
  created_at: string;
  receiver?: { full_name?: string; username?: string; phone?: string | null };
  donor?: { full_name?: string; national_id?: string };
  donation_check?: { serial?: string };
};

export function useReceiversFilters(
  performance: ReceiverPerformanceRecord[] | undefined,
) {
  const [search, setSearch] = useState("");
  const [receiverFilter, setReceiverFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredPerformance = (performance ?? []).filter((record) => {
    const matchesSearchQuery =
      matchesSearch(record.receiver?.full_name ?? "", search) ||
      matchesSearch(record.receiver?.username ?? "", search) ||
      matchesSearch(record.donor?.full_name ?? "", search) ||
      (record.donation_check?.serial?.includes(search) ?? false);

    const matchesReceiver =
      receiverFilter === "all" || String(record.receiver_id) === receiverFilter;

    const matchesDate = matchesDateRange(record.created_at, startDate, endDate);

    return matchesSearchQuery && matchesReceiver && matchesDate;
  });

  const hasActiveFilters =
    receiverFilter !== "all" ||
    search !== "" ||
    startDate !== "" ||
    endDate !== "";

  const resetFilters = () => {
    setSearch("");
    setReceiverFilter("all");
    setStartDate("");
    setEndDate("");
  };

  return {
    search,
    setSearch,
    receiverFilter,
    setReceiverFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredPerformance,
    hasActiveFilters,
    resetFilters,
  };
}
