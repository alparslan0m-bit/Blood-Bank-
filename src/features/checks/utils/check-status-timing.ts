import { differenceInHours } from "date-fns";
import type { CheckWithRelations } from "@/types/database";

export function getLastStatusChangeAt(check: CheckWithRelations): Date {
  switch (check.status) {
    case "created":
      return new Date(check.created_at);
    case "transferred":
      return new Date(check.transferred_to_distributor_at ?? check.updated_at);
    case "blood_recorded":
      return new Date(check.blood_recorded_at ?? check.updated_at);
    case "patient_served":
      return new Date(check.patient_served_at ?? check.updated_at);
    default:
      return new Date(check.updated_at);
  }
}

export function isStaleCreatedCheck(
  check: CheckWithRelations,
  referenceDate = new Date(),
): boolean {
  if (check.status !== "created") return false;
  return (
    differenceInHours(referenceDate, new Date(check.created_at)) >= 24
  );
}

export function isStaleTransferredCheck(
  check: CheckWithRelations,
  referenceDate = new Date(),
): boolean {
  if (check.status !== "transferred") return false;
  const changedAt = check.transferred_to_distributor_at ?? check.updated_at;
  return differenceInHours(referenceDate, new Date(changedAt)) >= 48;
}
