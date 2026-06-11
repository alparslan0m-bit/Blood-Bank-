import { useState } from "react";
import { useUsers, useToggleUserDisabled } from "@/features/users/hooks/use-users";
import { useUsersFilters } from "@/features/users/hooks/use-users-filters";
import { getUsersTableColumns } from "@/features/users/components/users-table-columns";
import { UsersKanbanBoard } from "@/features/users/components/users-kanban-board";
import {
  LIST_VIEW_STORAGE_KEYS,
  useListViewPreference,
} from "@/hooks/use-list-view-preference";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { ListViewToggle } from "@/components/list-view-toggle";
import { FilterBar, FilterSelect } from "@/components/data-display";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { RoleManagementDialog } from "@/features/users/components/role-management-dialog";
import type { UserWithRoles } from "@/types/database";

export function UsersPage() {
  const { view, setView } = useListViewPreference(LIST_VIEW_STORAGE_KEYS.users);
  const { data: users, isLoading } = useUsers();
  const toggleDisabledMutation = useToggleUserDisabled();
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);

  const {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    roleOptions,
    filteredUsers,
    hasActiveFilters,
    resetFilters,
  } = useUsersFilters(users);

  const openRoleManagement = (user: UserWithRoles) => {
    setSelectedUser(user);
    setRoleOpen(true);
  };

  const handleToggleDisabled = async (user: UserWithRoles) => {
    try {
      await toggleDisabledMutation.mutateAsync({
        userId: user.id,
        disabled: !user.disabled,
      });
    } catch (error) {
      console.error("Error toggling active state:", error);
    }
  };

  const columns = getUsersTableColumns({
    onManageRoles: openRoleManagement,
    onToggleDisabled: handleToggleDisabled,
  });

  const activeSelectedUser =
    users?.find((u) => u.id === selectedUser?.id) || null;

  const emptyStateProps = {
    emptyTitle: "No staff members match",
    emptyDescription: "Update your search or add a new staff account.",
    emptyIcon: <EntityEmptyIcon entity="users" />,
  };

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Staff & Access Management"
        description="Manage staff accounts, roles, and system access."
      >
        <div className="flex items-center gap-sm">
          <ListViewToggle
            view={view}
            onViewChange={setView}
            label="Users view mode"
          />
          <UserFormDialog />
        </div>
      </PageHeader>

      <FilterBar showReset={hasActiveFilters} onReset={resetFilters}>
        <FilterSelect
          label="Filter Role"
          value={roleFilter}
          onValueChange={setRoleFilter}
          placeholder="All Roles"
          options={[
            { value: "all", label: "All Roles" },
            ...roleOptions.map((role) => ({ value: role, label: role })),
          ]}
        />
      </FilterBar>

      {view === "table" ? (
        <DataTable
          columns={columns}
          data={filteredUsers}
          loading={isLoading}
          getRowKey={(row) => row.id}
          searchPlaceholder="Search by username, full name, or email..."
          searchValue={search}
          onSearchChange={setSearch}
          {...emptyStateProps}
        />
      ) : (
        <UsersKanbanBoard
          users={filteredUsers}
          loading={isLoading}
          search={search}
          onSearchChange={setSearch}
          onManageRoles={openRoleManagement}
          {...emptyStateProps}
        />
      )}

      <RoleManagementDialog
        user={activeSelectedUser}
        open={roleOpen}
        onOpenChange={setRoleOpen}
      />
    </div>
  );
}
