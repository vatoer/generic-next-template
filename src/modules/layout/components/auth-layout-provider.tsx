"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserRolesAction, getUserPermissionsAction } from "@/modules/rbac/actions";
import { Spinner } from "@/components/ui/spinner";
import { AuthenticatedLayout } from "./authenticated-layout";
import type { LayoutUser, UserPermissionContext } from "../types/navigation";

interface AuthLayoutProviderProps {
  children: React.ReactNode;
  user: LayoutUser | null;
}

export const AuthLayoutProvider = ({ children, user }: AuthLayoutProviderProps) => {
  const { data: rolesResult, isLoading: rolesLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: () => (user?.id ? getUserRolesAction({ userId: user.id }) : null),
    enabled: !!user?.id,
  });

  const { data: permissionsResult, isLoading: permissionsLoading } = useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: () => (user?.id ? getUserPermissionsAction(user.id) : null),
    enabled: !!user?.id,
  });

  const isLoading = rolesLoading || permissionsLoading;

  const permissionContext: UserPermissionContext = React.useMemo(() => {
    return {
      permissions: permissionsResult?.success ? permissionsResult.data || [] : [],
      roles: rolesResult?.success ? rolesResult.data || [] : [],
    };
  }, [rolesResult, permissionsResult]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <AuthenticatedLayout
      user={user}
      permissionContext={permissionContext}
    >
      {children}
    </AuthenticatedLayout>
  );
};
