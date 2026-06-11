import { LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ListViewMode } from "@/hooks/use-list-view-preference";

interface ListViewToggleProps {
  view: ListViewMode;
  onViewChange: (view: ListViewMode) => void;
  label?: string;
}

export function ListViewToggle({
  view,
  onViewChange,
  label = "View mode",
}: ListViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-sm border border-hairline bg-canvas-soft p-xxs"
      role="group"
      aria-label={label}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          view === "table" && "bg-canvas text-ink shadow-level-1",
        )}
        onClick={() => onViewChange("table")}
        aria-pressed={view === "table"}
        aria-label="Table view"
      >
        <Table2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          view === "kanban" && "bg-canvas text-ink shadow-level-1",
        )}
        onClick={() => onViewChange("kanban")}
        aria-pressed={view === "kanban"}
        aria-label="Kanban view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
