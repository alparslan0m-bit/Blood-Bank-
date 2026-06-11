import { useMemo, useState } from "react";
import type { Patient } from "@/types/database";
import { matchesDateRange, matchesSearch } from "@/utils/filter-utils";

export function usePatientsFilters(patients: Patient[] | undefined) {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const departmentOptions = useMemo(() => {
    return Array.from(
      new Set(
        (patients ?? []).map((patient) => patient.department).filter(Boolean),
      ),
    ).sort();
  }, [patients]);

  const filteredPatients = (patients ?? []).filter((patient) => {
    const matchesSearchQuery =
      matchesSearch(patient.full_name, search) ||
      matchesSearch(patient.department, search) ||
      matchesSearch(patient.file_number, search) ||
      patient.phone.includes(search);

    const matchesDepartment =
      departmentFilter === "all" || patient.department === departmentFilter;

    const matchesDate = matchesDateRange(
      patient.created_at,
      startDate,
      endDate,
    );

    return matchesSearchQuery && matchesDepartment && matchesDate;
  });

  const hasActiveFilters =
    departmentFilter !== "all" ||
    startDate !== "" ||
    endDate !== "" ||
    search !== "";

  const resetFilters = () => {
    setSearch("");
    setDepartmentFilter("all");
    setStartDate("");
    setEndDate("");
  };

  return {
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
  };
}
