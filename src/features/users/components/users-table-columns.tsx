import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings2, UserMinus, UserCheck } from "lucide-react";
import type { Column } from "@/components/data-table";
import type { UserWithRoles } from "@/types/database";

interface UsersTableColumnsOptions {
  onManageRoles: (user: UserWithRoles) => void;
  onToggleDisabled: (user: UserWithRoles) => void;
}

export function getUsersTableColumns({
  onManageRoles,
  onToggleDisabled,
}: UsersTableColumnsOptions): Column<UserWithRoles>[] {
  return [
    {
      key: "username",
      header: "User identity",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-ink">
            {row.full_name ?? row.username}
          </span>
          <span className="text-caption text-mute">@{row.username}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email address",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-body-sm">{row.email}</span>
      ),
    },
    {
      key: "phone",
      header: "Contact Phone",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-body-sm">{row.phone ?? "—"}</span>
      ),
    },
    {
      key: "roles",
      header: "Assigned Roles",
      render: (row) => (
        <div className="flex flex-wrap gap-xs">
          {row.user_roles?.length > 0 ? (
            row.user_roles.map((ur) => (
              <Badge
                key={ur.role_id}
                variant="secondary"
                className="font-mono text-[10px]"
              >
                {ur.roles?.label ?? "Role"}
              </Badge>
            ))
          ) : (
            <span className="text-caption text-mute">No roles</span>
          )}
        </div>
      ),
    },
    {
      key: "disabled",
      header: "System Status",
      sortable: true,
      render: (row) => (
        <Badge
          variant={row.disabled ? "destructive" : "default"}
          className="rounded-[4px] uppercase font-mono text-[9px] tracking-wider"
        >
          {row.disabled ? "Disabled" : "Active"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Administration",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-xs">
          <Button
            size="xs"
            variant="outline"
            onClick={() => onManageRoles(row)}
            className="flex items-center gap-xxs"
          >
            <Settings2 className="h-3 w-3" />
            Roles
          </Button>
          <Button
            size="xs"
            variant={row.disabled ? "default" : "outline"}
            onClick={() => onToggleDisabled(row)}
            className="flex items-center gap-xxs min-w-[70px] justify-center"
          >
            {row.disabled ? (
              <UserCheck className="h-3 w-3" />
            ) : (
              <UserMinus className="h-3 w-3" />
            )}
            {row.disabled ? "Enable" : "Disable"}
          </Button>
        </div>
      ),
    },
  ];
}
