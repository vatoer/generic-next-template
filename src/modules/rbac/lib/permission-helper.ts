import { auth } from "@/utils/auth";
import { getUserPermissions, checkUserHasPermission, checkUserHasRole } from "../services/user-role.service";

export const getCurrentUserPermissions = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return await getUserPermissions(session.user.id);
};

export const checkPermission = async (resource: string, action: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  return await checkUserHasPermission(session.user.id, resource, action);
};

export const checkRole = async (roleName: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  return await checkUserHasRole(session.user.id, roleName);
};

export const requirePermission = async (resource: string, action: string) => {
  const hasPermission = await checkPermission(resource, action);
  if (!hasPermission) {
    throw new Error(`Access denied: Missing permission ${resource}:${action}`);
  }
  return true;
};

export const requireRole = async (roleName: string) => {
  const hasRole = await checkRole(roleName);
  if (!hasRole) {
    throw new Error(`Access denied: Missing role ${roleName}`);
  }
  return true;
};
