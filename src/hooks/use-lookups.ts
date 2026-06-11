import { useQuery } from "@tanstack/react-query";
import { fetchUsersByRole } from "@/services/lookups-service";

export function useReceivers() {
  return useQuery({
    queryKey: ["receivers"],
    queryFn: () => fetchUsersByRole("receiver"),
  });
}

export function useDistributors() {
  return useQuery({
    queryKey: ["distributors"],
    queryFn: () => fetchUsersByRole("distributor"),
  });
}

export function useDistributorsForChecks() {
  return useQuery({
    queryKey: ["users", "distributors"],
    queryFn: () => fetchUsersByRole("distributor"),
  });
}
