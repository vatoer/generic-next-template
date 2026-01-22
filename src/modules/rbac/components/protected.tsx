"use client";

import { ReactNode } from "react";

interface ProtectedProps {
  children: ReactNode;
  hasPermission: boolean;
  fallback?: ReactNode;
}

export const Protected = ({ children, hasPermission, fallback = null }: ProtectedProps) => {
  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface ProtectedByPermissionProps {
  children: ReactNode;
  userPermissions: Array<{ resource: string; action: string }>;
  resource: string;
  action: string;
  fallback?: ReactNode;
}

export const ProtectedByPermission = ({
  children,
  userPermissions,
  resource,
  action,
  fallback = null,
}: ProtectedByPermissionProps) => {
  const hasPermission = userPermissions.some(
    (p) => p.resource === resource && p.action === action
  );

  return <Protected hasPermission={hasPermission} fallback={fallback}>{children}</Protected>;
};

interface ProtectedByRoleProps {
  children: ReactNode;
  userRoles: Array<{ name: string }>;
  role: string;
  fallback?: ReactNode;
}

export const ProtectedByRole = ({
  children,
  userRoles,
  role,
  fallback = null,
}: ProtectedByRoleProps) => {
  const hasRole = userRoles.some((r) => r.name === role);

  return <Protected hasPermission={hasRole} fallback={fallback}>{children}</Protected>;
};
