import { useNavigate } from "react-router-dom";
import { BloodTypeBadge } from "@/components/blood-type-badge";
import { KanbanBoard } from "@/components/kanban-board";
import { KanbanCard } from "@/components/kanban-card";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  KANBAN_CHECK_STATUSES,
} from "@/features/checks/constants/kanban-statuses";
import {
  getLastStatusChangeAt,
  isStaleCreatedCheck,
  isStaleTransferredCheck,
} from "@/features/checks/utils/check-status-timing";
import { getStatusConfig } from "@/lib/utils";
import type { BloodType, CheckWithRelations } from "@/types/database";

interface ChecksKanbanBoardProps {
  checks: CheckWithRelations[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
}

const CHECK_COLUMNS = KANBAN_CHECK_STATUSES.map((status) => ({
  key: status.value,
  label: status.label,
  badgeClassName: getStatusConfig(status.value).color,
}));

export function ChecksKanbanBoard({
  checks,
  loading,
  search,
  onSearchChange,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
}: ChecksKanbanBoardProps) {
  const navigate = useNavigate();

  return (
    <KanbanBoard
      columns={CHECK_COLUMNS}
      items={checks}
      groupBy={(check) => check.status}
      getItemKey={(check) => check.id}
      onItemClick={(check) => navigate(`/checks/${check.id}`)}
      loading={loading}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by serial, donor, or patient name..."
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyIcon={emptyIcon}
      emptyAction={emptyAction}
      emptyColumnLabel="No checks"
      renderCard={(check, { onClick, className }) => {
        const lastChange = getLastStatusChangeAt(check);
        return (
          <KanbanCard
            onClick={onClick}
            className={cn(
              className,
              isStaleCreatedCheck(check) && "border-l-[3px] border-l-coral",
              isStaleTransferredCheck(check) && "border-l-[3px] border-l-amber",
            )}
          >
            <p className="truncate font-mono text-body-sm font-semibold text-ink">
              {check.serial}
            </p>
            <p className="mt-xxs truncate text-caption text-body">
              {check.donors?.full_name ?? "Unknown donor"}
            </p>
            <div className="mt-sm flex items-center justify-between gap-xs">
              {check.blood_types ? (
                <BloodTypeBadge
                  code={(check.blood_types as BloodType).code}
                  isRare={(check.blood_types as BloodType).is_rare}
                />
              ) : (
                <span className="text-caption text-mute">Pending</span>
              )}
              <span className="shrink-0 text-[10px] font-mono text-mute">
                {formatRelative(lastChange)}
              </span>
            </div>
          </KanbanCard>
        );
      }}
    />
  );
}
