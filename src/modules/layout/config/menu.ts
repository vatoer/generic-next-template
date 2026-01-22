import type { RouteItem } from "../types/navigation";

export const navigationMenus: RouteItem[] = [
  {
    name: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    iconName: "lucide:layout-dashboard",
    order: 1,
    displayAsMenu: true,
    permissions: ["dashboard:read"],
  },
  {
    name: "rbac",
    title: "RBAC Management",
    href: "/rbac",
    iconName: "lucide:shield-check",
    order: 2,
    displayAsMenu: true,
    permissions: ["roles:read"],
    cascadePermissions: true,
    subs: [
      {
        name: "roles",
        title: "Roles",
        href: "/rbac?tab=roles",
        iconName: "lucide:users-cog",
        permissions: ["roles:read"],
      },
      {
        name: "permissions",
        title: "Permissions",
        href: "/rbac?tab=permissions",
        iconName: "lucide:key",
        permissions: ["permissions:read"],
      },
    ],
  },
  {
    name: "users",
    title: "Users",
    href: "/users",
    iconName: "lucide:users",
    order: 3,
    displayAsMenu: true,
    permissions: ["users:read"],
    cascadePermissions: true,
    subs: [
      {
        name: "users-list",
        title: "All Users",
        href: "/users",
        iconName: "lucide:list",
        permissions: ["users:read"],
      },
      {
        name: "users-create",
        title: "Create User",
        href: "/users/create",
        iconName: "lucide:user-plus",
        permissions: ["users:create"],
      },
    ],
  },
  {
    name: "settings",
    title: "Settings",
    href: "/settings",
    iconName: "lucide:settings",
    order: 99,
    displayAsMenu: true,
    subs: [
      {
        name: "profile",
        title: "Profile",
        href: "/settings/profile",
        iconName: "lucide:user",
      },
      {
        name: "security",
        title: "Security",
        href: "/settings/security",
        iconName: "lucide:lock",
      },
    ],
  },
];
