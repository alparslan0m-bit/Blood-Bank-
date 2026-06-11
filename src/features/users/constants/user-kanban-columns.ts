import type { KanbanColumnDef } from "@/components/kanban-board";

export const USER_KANBAN_COLUMNS: KanbanColumnDef[] = [
  { key: "active", label: "Active", badgeClassName: "bg-teal-soft text-teal-deep" },
  {
    key: "disabled",
    label: "Disabled",
    badgeClassName: "bg-error-soft text-error-deep",
  },
];
