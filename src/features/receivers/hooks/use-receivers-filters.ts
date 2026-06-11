import { useMemo, useState } from "react";
import { matchesDateRange, matchesSearch } from "@/utils/filter-utils";

type ReceiverPerformanceRecord = {
  receiver_id: string;
  action: string;
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
  const [actionFilter, setActionFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const uniqueActions = useMemo(
    () =>
      Array.from(new Set((performance ?? []).map((p) => p.action))).sort(),
    [performance],
  );

  const filteredPerformance = (performance ?? []).filter((record) => {
    const matchesSearchQuery =
      matchesSearch(record.receiver?.full_name ?? "", search) ||
      matchesSearch(record.receiver?.username ?? "", search) ||
      matchesSearch(record.donor?.full_name ?? "", search) ||
      (record.donation_check?.serial?.includes(search) ?? false);

    const matchesReceiver =
      receiverFilter === "all" ||
      String(record.receiver_id) === receiverFilter;

    const matchesAction =
      actionFilter === "all" ||
      record.action.toLowerCase() === actionFilter.toLowerCase();

    const matchesDate = matchesDateRange(
      record.created_at,
      startDate,
      endDate,
    );

    return (
      matchesSearchQuery && matchesReceiver && matchesAction && matchesDate
    );
  });

  const hasActiveFilters =
    receiverFilter !== "all" ||
    actionFilter !== "all" ||
    search !== "" ||
    startDate !== "" ||
    endDate !== "";

  const resetFilters = () => {
    setSearch("");
    setReceiverFilter("all");
    setActionFilter("all");
    setStartDate("");
    setEndDate("");
  };

  return {
    search,
    setSearch,
    receiverFilter,
    setReceiverFilter,
    actionFilter,
    setActionFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    uniqueActions,
    filteredPerformance,
    hasActiveFilters,
    resetFilters,
  };
}
