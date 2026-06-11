import { useQuery } from "@tanstack/react-query";
import { getReceiversPerformance } from "@/features/receivers/api/receiver-performance-api";

export function useReceiversPerformance() {
  return useQuery({
    queryKey: ["receiversPerformance"],
    queryFn: getReceiversPerformance,
  });
}
