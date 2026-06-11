import { useRoles, useAssignRole, useRemoveRole } from "@/features/users/hooks/use-users";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import type { UserWithRoles } from "@/types/database";

interface RoleManagementDialogProps {
  user: UserWithRoles | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleManagementDialog({ user, open, onOpenChange }: RoleManagementDialogProps) {
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const assignMutation = useAssignRole();
  const removeMutation = useRemoveRole();

  if (!user) return null;

  const userRoleIds = user.user_roles.map((ur) => ur.role_id);

  const handleRoleToggle = async (roleId: number, active: boolean) => {
    try {
      if (active) {
        await assignMutation.mutateAsync({ userId: user.id, roleId });
      } else {
        await removeMutation.mutateAsync({ userId: user.id, roleId });
      }
    } catch (error) {
      console.error("Error toggling role:", error);
    }
  };

  const mutating = assignMutation.isPending || removeMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Roles for {user.full_name ?? user.username}</DialogTitle>
        </DialogHeader>

        <div className="space-y-md py-4">
          <p className="text-body-sm text-mute">
            Select or deselect roles to adjust system permissions for this user.
          </p>

          {loadingRoles ? (
            <div className="flex items-center gap-sm py-4">
              <Loader2 className="h-4 w-4 animate-spin text-mute" />
              <span className="text-caption text-mute">Loading available roles...</span>
            </div>
          ) : (
            <div className="space-y-sm pt-2 relative">
              {mutating && (
                <div className="absolute inset-0 bg-canvas/40 z-10 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-mute" />
                </div>
              )}
              {roles?.map((role) => {
                const isAssigned = userRoleIds.includes(role.id);
                return (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-sm border border-hairline rounded-sm hover:bg-canvas-soft transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-body-sm font-semibold text-ink">{role.label}</span>
                      <span className="text-caption text-mute font-mono">{role.name}</span>
                    </div>
                    <Checkbox
                      checked={isAssigned}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleRoleToggle(role.id, !!checked)
                      }
                      disabled={mutating}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
