export const KANBAN_CHECK_STATUSES = [
  { value: "created", label: "Created" },
  { value: "transferred", label: "Transferred" },
  { value: "blood_recorded", label: "Blood Recorded" },
  { value: "distributed", label: "Distributed" },
  { value: "completed", label: "Completed" },
] as const;

export type KanbanCheckStatus = (typeof KANBAN_CHECK_STATUSES)[number]["value"];
