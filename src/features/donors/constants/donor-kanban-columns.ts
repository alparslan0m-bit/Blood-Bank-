import type { KanbanColumnDef } from "@/components/kanban-board";

export const DONOR_KANBAN_COLUMNS: KanbanColumnDef[] = [
  { key: "active", label: "Active", badgeClassName: "bg-teal-soft text-teal-deep" },
  {
    key: "inactive",
    label: "Inactive",
    badgeClassName: "bg-canvas-soft-2 text-mute",
  },
  { key: "new", label: "New", badgeClassName: "bg-indigo-soft text-indigo-deep" },
];
