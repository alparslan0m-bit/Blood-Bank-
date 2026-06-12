import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { KanbanBoard, buildKanbanColumns } from "@/components/kanban-board";
import { KanbanCard } from "@/components/kanban-card";
import { formatRelative } from "@/lib/utils";

type DistributorPerformanceRow = {
  id?: string;
  created_at: string;
  quantity?: number | null;
  distributor?: { full_name?: string; username?: string };
  patient?: { full_name?: string; department?: string };
  donation_check?: { serial?: string };
};

interface DistributorsKanbanBoardProps {
  performance: DistributorPerformanceRow[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
}

export function DistributorsKanbanBoard({
  performance,
  loading,
  search,
  onSearchChange,
  emptyTitle,
  emptyDescription,
  emptyIcon,
}: DistributorsKanbanBoardProps) {
  const columns = useMemo(
    () =>
      buildKanbanColumns(
        performance.map(
          (row) =>
            row.distributor?.full_name ??
            row.distributor?.username ??
            "Unknown",
        ),
      ),
    [performance],
  );

  return (
    <KanbanBoard
      columns={columns}
      items={performance}
      groupBy={(row) =>
        row.distributor?.full_name ?? row.distributor?.username ?? "Unknown"
      }
      getItemKey={(row) => String(row.id ?? row.created_at)}
      loading={loading}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by distributor, patient, or check number..."
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyIcon={emptyIcon}
      emptyColumnLabel="No activity"
      renderCard={(row) => (
        <KanbanCard>
          <p className="truncate font-medium text-body-sm text-ink">
            {row.distributor?.full_name ??
              row.distributor?.username ??
              "Unknown"}
          </p>
          <p className="mt-xxs truncate text-caption text-body">
            {row.patient?.full_name ?? "—"}
          </p>
          <div className="mt-sm flex items-center justify-between gap-xs">
            <span className="truncate font-mono text-[10px] text-mute">
              {row.donation_check?.serial ?? "—"}
            </span>
            {row.quantity ? (
              <span className="shrink-0 text-[10px] text-mute">
                {row.quantity} units
              </span>
            ) : null}
          </div>
          <div className="mt-xxs text-[10px] font-mono text-mute">
            {formatRelative(row.created_at)}
          </div>
        </KanbanCard>
      )}
    />
  );
}
