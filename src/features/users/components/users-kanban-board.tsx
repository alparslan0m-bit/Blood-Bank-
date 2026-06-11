import { Badge } from "@/components/ui/badge";
import { KanbanBoard } from "@/components/kanban-board";
import { KanbanCard } from "@/components/kanban-card";
import { USER_KANBAN_COLUMNS } from "@/features/users/constants/user-kanban-columns";
import type { UserWithRoles } from "@/types/database";

interface UsersKanbanBoardProps {
  users: UserWithRoles[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onManageRoles?: (user: UserWithRoles) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
}

export function UsersKanbanBoard({
  users,
  loading,
  search,
  onSearchChange,
  onManageRoles,
  emptyTitle,
  emptyDescription,
  emptyIcon,
}: UsersKanbanBoardProps) {
  return (
    <KanbanBoard
      columns={USER_KANBAN_COLUMNS}
      items={users}
      groupBy={(user) => (user.disabled ? "disabled" : "active")}
      getItemKey={(user) => user.id}
      onItemClick={onManageRoles}
      loading={loading}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by username, full name, or email..."
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyIcon={emptyIcon}
      emptyColumnLabel="No users"
      renderCard={(user, { onClick }) => (
        <KanbanCard onClick={onClick}>
          <p className="truncate font-semibold text-body-sm text-ink">
            {user.full_name ?? user.username}
          </p>
          <p className="mt-xxs truncate text-caption text-mute">@{user.username}</p>
          <p className="mt-xs truncate font-mono text-[10px] text-mute">
            {user.email}
          </p>
          <div className="mt-sm flex flex-wrap gap-xxs">
            {user.user_roles?.length > 0 ? (
              user.user_roles.map((ur) => (
                <Badge
                  key={ur.role_id}
                  variant="secondary"
                  className="font-mono text-[9px]"
                >
                  {ur.roles?.label ?? "Role"}
                </Badge>
              ))
            ) : (
              <span className="text-caption text-mute">No roles</span>
            )}
          </div>
        </KanbanCard>
      )}
    />
  );
}
