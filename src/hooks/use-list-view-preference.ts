import { useState } from "react";

export type ListViewMode = "table" | "kanban";

export const LIST_VIEW_STORAGE_KEYS = {
  checks: "checks-view-preference",
  donors: "donors-view-preference",
  patients: "patients-view-preference",
  users: "users-view-preference",
  receivers: "receivers-view-preference",
  distributors: "distributors-view-preference",
} as const;

function readStoredView(storageKey: string): ListViewMode {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored === "kanban" ? "kanban" : "table";
  } catch {
    return "table";
  }
}

export function useListViewPreference(storageKey: string) {
  const [view, setViewState] = useState<ListViewMode>(() =>
    readStoredView(storageKey),
  );

  const setView = (next: ListViewMode) => {
    setViewState(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // Ignore storage failures (private browsing, quota, etc.)
    }
  };

  return { view, setView };
}
