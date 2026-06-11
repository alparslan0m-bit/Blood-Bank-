import { useQuery } from "@tanstack/react-query";
import * as donorsApi from "@/features/donors/api/donors-api";

export function useDonors() {
  return useQuery({ queryKey: ["donors"], queryFn: donorsApi.fetchDonors });
}

export function useDonor(id: string) {
  return useQuery({
    queryKey: ["donors", id],
    queryFn: () => donorsApi.fetchDonor(id),
    enabled: !!id,
  });
}

export function useDonorChecks(donorId: string) {
  return useQuery({
    queryKey: ["donors", donorId, "checks"],
    queryFn: () => donorsApi.fetchDonorChecks(donorId),
    enabled: !!donorId,
  });
}
