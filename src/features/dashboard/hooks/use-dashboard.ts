import { useQuery } from "@tanstack/react-query";
import * as dashboardApi from "@/features/dashboard/api/dashboard-api";

export function useTotalDonors() {
  return useQuery({
    queryKey: ["kpi", "totalDonors"],
    queryFn: dashboardApi.fetchTotalDonors,
  });
}

export function useTotalPatients() {
  return useQuery({
    queryKey: ["kpi", "totalPatients"],
    queryFn: dashboardApi.fetchTotalPatients,
  });
}

export function useTotalChecks() {
  return useQuery({
    queryKey: ["kpi", "totalChecks"],
    queryFn: dashboardApi.fetchTotalChecks,
  });
}

export function useRareBloodDonors() {
  return useQuery({
    queryKey: ["kpi", "rareBloodDonors"],
    queryFn: dashboardApi.fetchRareBloodDonors,
  });
}

export function useTodayDonations() {
  return useQuery({
    queryKey: ["kpi", "todayDonations"],
    queryFn: dashboardApi.fetchTodayDonations,
  });
}

export function useMonthlyDonations() {
  return useQuery({
    queryKey: ["kpi", "monthlyDonations"],
    queryFn: dashboardApi.fetchMonthlyDonations,
  });
}

export function useBloodTypeDistribution() {
  return useQuery({
    queryKey: ["chart", "bloodTypeDistribution"],
    queryFn: dashboardApi.fetchBloodTypeDistribution,
  });
}

export function useDonationsPerMonth() {
  return useQuery({
    queryKey: ["chart", "donationsPerMonth"],
    queryFn: dashboardApi.fetchDonationsPerMonth,
  });
}

export function useTopDonors() {
  return useQuery({
    queryKey: ["chart", "topDonors"],
    queryFn: dashboardApi.fetchTopDonors,
  });
}

export function useDepartmentDistribution() {
  return useQuery({
    queryKey: ["chart", "departmentDistribution"],
    queryFn: dashboardApi.fetchDepartmentDistribution,
  });
}
