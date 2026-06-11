import { useQuery } from "@tanstack/react-query";
import * as patientsApi from "@/features/patients/api/patients-api";

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: patientsApi.fetchPatients,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () => patientsApi.fetchPatient(id),
    enabled: !!id,
  });
}

export function usePatientChecks(patientId: string) {
  return useQuery({
    queryKey: ["patients", patientId, "checks"],
    queryFn: () => patientsApi.fetchPatientChecks(patientId),
    enabled: !!patientId,
  });
}
