import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "@/features/users/api/users-api";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: usersApi.fetchUsers });
}

export function useRoles() {
  return useQuery({ queryKey: ["roles"], queryFn: usersApi.fetchRoles });
}

export function useToggleUserDisabled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, disabled }: { userId: string; disabled: boolean }) =>
      usersApi.updateUserDisabled(userId, disabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) =>
      usersApi.assignRole(userId, roleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useRemoveRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) =>
      usersApi.removeRole(userId, roleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      username,
      email,
      fullName,
      phone,
      roleIds,
    }: {
      username: string;
      email: string;
      fullName: string;
      phone: string;
      roleIds: number[];
    }) =>
      usersApi.createUser(username, email, fullName, phone, roleIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
