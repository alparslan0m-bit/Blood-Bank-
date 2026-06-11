export const ROUTE_SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  checks: "Checks",
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
    path += `/${parts[i]}`;
    segments.push({
      label: ROUTE_SEGMENT_LABELS[parts[i]] ?? formatSegment(parts[i]),
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
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return typeof idx === "number" && idx > 0;
}
