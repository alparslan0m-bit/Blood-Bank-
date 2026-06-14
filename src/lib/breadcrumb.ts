export const ROUTE_SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  checks: "Checks",
  "checks-lifecycle": "Lifecycle",
  donors: "Donors",
  patients: "Patients",
  users: "Users",
  "receivers-performance": "Receivers",
  "distributors-performance": "Distributors",
};

export interface BreadcrumbSegment {
  label: string;
  to?: string;
  current?: boolean;
}

export function buildBreadcrumbSegments(
  pathname: string,
  currentLabel: string,
): BreadcrumbSegment[] {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) {
    return [{ label: currentLabel, current: true }];
  }

  const segments: BreadcrumbSegment[] = [];
  let path = "";

  for (let i = 0; i < parts.length - 1; i++) {
    const segment = parts[i];
    if (!segment) continue;

    path += `/${segment}`;
    segments.push({
      label: ROUTE_SEGMENT_LABELS[segment] ?? formatSegment(segment),
      to: path,
    });
  }

  segments.push({ label: currentLabel, current: true });
  return segments;
}

function formatSegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function canNavigateBack(): boolean {
  const state = window.history.state as { idx?: number } | null;
  const idx = state?.idx;
  return typeof idx === "number" && idx > 0;
}
