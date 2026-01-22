import type { RouteItem, UserPermissionContext } from "../types/navigation";

export const filterMenuByPermissions = (
  menus: RouteItem[],
  permissionContext: UserPermissionContext
): RouteItem[] => {
  return menus
    .filter((menu) => shouldDisplayMenu(menu, permissionContext))
    .map((menu) => ({
      ...menu,
      subs: menu.subs
        ? filterMenuByPermissions(menu.subs, permissionContext)
        : undefined,
    }))
    .filter((menu) => menu.displayAsMenu === false || !menu.subs || menu.subs.length > 0);
};

export const shouldDisplayMenu = (
  menu: RouteItem,
  permissionContext: UserPermissionContext
): boolean => {
  // If displayAsMenu is explicitly false, hide it
  if (menu.displayAsMenu === false) {
    return false;
  }

  // If no permissions required, show it
  if (!menu.permissions || menu.permissions.length === 0) {
    return true;
  }

  // Check if user has required permissions
  return hasRequiredPermissions(menu.permissions, permissionContext.permissions);
};

export const hasRequiredPermissions = (
  requiredPermissions: string[],
  userPermissions: Array<{ resource: string; action: string }>
): boolean => {
  return requiredPermissions.every((requiredPerm) => {
    const [resource, action] = requiredPerm.split(":");
    return userPermissions.some(
      (perm) => perm.resource === resource && perm.action === action
    );
  });
};

export const sortMenuByOrder = (menus: RouteItem[]): RouteItem[] => {
  return [...menus].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });
};

export const processMenus = (
  menus: RouteItem[],
  permissionContext: UserPermissionContext
): RouteItem[] => {
  const filtered = filterMenuByPermissions(menus, permissionContext);
  const sorted = sortMenuByOrder(filtered);
  return sorted;
};
