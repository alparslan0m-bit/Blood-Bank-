import { useQuery } from "@tanstack/react-query";
import * as checksApi from "@/features/checks/api/checks-api";
import type { CheckWithRelations } from "@/types/database";

export function useChecks() {
  return useQuery<CheckWithRelations[]>({
    queryKey: ["checks"],
    queryFn: checksApi.fetchChecks,
  });
}

export function useCheck(id: string) {
  return useQuery<CheckWithRelations | null>({
    queryKey: ["checks", id],
    queryFn: () => checksApi.fetchCheck(id),
    enabled: !!id,
  });
}
