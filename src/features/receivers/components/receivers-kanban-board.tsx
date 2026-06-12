import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { KanbanBoard, buildKanbanColumns } from "@/components/kanban-board";
import { KanbanCard } from "@/components/kanban-card";
import { formatRelative } from "@/lib/utils";

type ReceiverPerformanceRow = {
  id?: string;
  created_at: string;
  receiver?: { full_name?: string; username?: string };
  donor?: { full_name?: string };
  donation_check?: { serial?: string };
};

interface ReceiversKanbanBoardProps {
  performance: ReceiverPerformanceRow[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
}

export function ReceiversKanbanBoard({
  performance,
  loading,
  search,
  onSearchChange,
  emptyTitle,
  emptyDescription,
  emptyIcon,
}: ReceiversKanbanBoardProps) {
  const columns = useMemo(
    () =>
      buildKanbanColumns(
        performance.map(
          (row) =>
            row.receiver?.full_name ?? row.receiver?.username ?? "Unknown",
        ),
      ),
    [performance],
  );

  return (
    <KanbanBoard
      columns={columns}
      items={performance}
      groupBy={(row) =>
        row.receiver?.full_name ?? row.receiver?.username ?? "Unknown"
      }
      getItemKey={(row) => String(row.id ?? row.created_at)}
      loading={loading}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by receiver, donor, or check number..."
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyIcon={emptyIcon}
      emptyColumnLabel="No activity"
      renderCard={(row) => (
        <KanbanCard>
          <p className="truncate font-medium text-body-sm text-ink">
            {row.donor?.full_name ?? "Unknown"}
          </p>
          <p className="mt-xxs truncate text-caption text-body">
            {row.donation_check?.serial ?? "—"}
          </p>
          <p className="mt-sm text-[10px] font-mono text-mute">
            {formatRelative(row.created_at)}
          </p>
        </KanbanCard>
      )}
    />
  );
}
