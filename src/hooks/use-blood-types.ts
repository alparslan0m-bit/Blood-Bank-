import { useQuery } from "@tanstack/react-query";
import { fetchBloodTypes } from "@/services/blood-types-service";

export function useBloodTypes() {
  return useQuery({
    queryKey: ["bloodTypes"],
    queryFn: fetchBloodTypes,
  });
}
