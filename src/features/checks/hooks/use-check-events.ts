import { useQuery } from "@tanstack/react-query";
import { fetchCheckEvents } from "@/features/checks/api/check-events-api";

export function useCheckEvents(checkId: string) {
  return useQuery({
    queryKey: ["checks", checkId, "events"],
    queryFn: () => fetchCheckEvents(checkId),
    enabled: !!checkId,
  });
}
