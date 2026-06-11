import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), "MMM d, yyyy · h:mm a");
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export const CHECK_STATUSES: Record<string, { label: string; color: string }> =
  {
    created: { label: "Created", color: "bg-coral-soft text-coral-deep" },
    transferred: {
      label: "Transferred",
      color: "bg-indigo-soft text-indigo-deep",
    },
    blood_recorded: {
      label: "Blood Recorded",
      color: "bg-teal-soft text-teal-deep",
    },
    distributed: {
      label: "Distributed",
      color: "bg-amber-soft text-amber-deep",
    },
    completed: { label: "Completed", color: "bg-canvas-soft-2 text-ink" },
  };

export function getStatusConfig(status: string) {
  return (
    CHECK_STATUSES[status] ?? {
      label: status,
      color: "bg-canvas-soft-2 text-body",
    }
  );
}
