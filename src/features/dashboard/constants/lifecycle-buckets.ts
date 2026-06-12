import type { CheckWithRelations } from "@/types/database";
import { BOTTLENECK_STATUSES } from "@/constants/check-statuses";

export const LIFECYCLE_BUCKETS = [
  { value: "all-active", label: "All Active" },
  { value: "pending-transfer", label: "Awaiting Transfer" },
  { value: "pending-patient-service", label: "Awaiting Patient Service" },
  { value: "stale", label: "Stale" },
  { value: "bottleneck", label: "Bottlenecks" },
] as const;

export type LifecycleBucket = (typeof LIFECYCLE_BUCKETS)[number]["value"];

const STALE_MS = 24 * 60 * 60 * 1000;

export function isLifecycleBucket(value: string | null): value is LifecycleBucket {
  return LIFECYCLE_BUCKETS.some((bucket) => bucket.value === value);
}

export function filterChecksByLifecycleBucket(
  checks: CheckWithRelations[],
  bucket: LifecycleBucket,
): CheckWithRelations[] {
  const now = Date.now();

  switch (bucket) {
    case "all-active":
      return checks.filter((check) => check.status !== "patient_served");
    case "pending-transfer":
      return checks.filter((check) => check.status === "created");
    case "pending-patient-service":
      return checks.filter((check) => check.status === "blood_recorded");
    case "stale":
      return checks.filter(
        (check) =>
          check.status === "created" &&
          now - new Date(check.created_at).getTime() > STALE_MS,
      );
    case "bottleneck":
      return checks.filter((check) =>
        BOTTLENECK_STATUSES.includes(
          check.status as (typeof BOTTLENECK_STATUSES)[number],
        ),
      );
    default:
      return checks;
  }
}
