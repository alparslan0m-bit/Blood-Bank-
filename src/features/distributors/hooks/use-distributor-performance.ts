import { useQuery } from "@tanstack/react-query";
import { getDistributorsPerformance } from "@/features/distributors/api/distributor-performance-api";

export function useDistributorsPerformance() {
  return useQuery({
    queryKey: ["distributorsPerformance"],
    queryFn: getDistributorsPerformance,
  });
}
