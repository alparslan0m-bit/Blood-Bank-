import { useMemo, useState } from "react";
import type { UserWithRoles } from "@/types/database";
import { matchesSearch } from "@/utils/filter-utils";

export function useUsersFilters(users: UserWithRoles[] | undefined) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const roleOptions = useMemo(() => {
    return Array.from(
      new Set(
        (users ?? [])
          .flatMap(
            (user) =>
              user.user_roles?.map((userRole) => userRole.roles?.label ?? "") ??
              [],
          )
          .filter(Boolean),
      ),
    ).sort();
  }, [users]);

  const filteredUsers = (users ?? []).filter((user) => {
    const matchesSearchQuery =
      matchesSearch(user.username, search) ||
      matchesSearch(user.email, search) ||
      matchesSearch(user.full_name ?? "", search) ||
      matchesSearch(user.phone ?? "", search);

    const matchesRole =
      roleFilter === "all" ||
      user.user_roles?.some((userRole) => userRole.roles?.label === roleFilter);

    return matchesSearchQuery && matchesRole;
  });

  const hasActiveFilters = roleFilter !== "all" || search !== "";

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
  };

  return {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    roleOptions,
    filteredUsers,
    hasActiveFilters,
    resetFilters,
  };
}
