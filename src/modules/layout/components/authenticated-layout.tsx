"use client";

import * as React from "react";
import { authClient } from "@/utils/auth-client";
import { Sidebar } from "./sidebar";
import { Topbar, type TopbarMenuAction } from "./topbar";
import { processMenus } from "../lib/menu-utils";
import { navigationMenus } from "../config/menu";
import type { RouteItem, UserPermissionContext, LayoutUser } from "../types/navigation";
import type { Notification } from "./notification-popover";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  user: LayoutUser | null;
  permissionContext: UserPermissionContext;
  appName?: string;
  appLogo?: React.ReactNode;
  notifications?: Notification[];
  onNotificationDismiss?: (id: string) => void;
  onNotificationViewAll?: () => void;
  topbarMenuActions?: TopbarMenuAction[];
}

export const AuthenticatedLayout = ({
  children,
  user,
  permissionContext,
  appName = "Dashboard",
  appLogo,
  notifications = [],
  onNotificationDismiss,
  onNotificationViewAll,
  topbarMenuActions = [],
}: AuthenticatedLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [processedMenus, setProcessedMenus] = React.useState<RouteItem[]>([]);

  React.useEffect(() => {
    const menus = processMenus(navigationMenus, permissionContext);
    setProcessedMenus(menus);
  }, [permissionContext]);

  const handleLogout = async () => {
    await authClient.signOut({ redirect: true, redirectTo: "/login" });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar - Always visible */}
      <Topbar
        user={user}
        appName={appName}
        appLogo={appLogo}
        notifications={notifications}
        onNotificationDismiss={onNotificationDismiss}
        onNotificationViewAll={onNotificationViewAll}
        onLogout={handleLogout}
        onSettings={() => {
          // Navigate to settings
          window.location.href = "/settings";
        }}
        onHelp={() => {
          // Navigate to help
          window.location.href = "/help";
        }}
        topbarActions={topbarMenuActions}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          menus={processedMenus}
          isCollapsed={isCollapsed}
          onCollapsedChange={setIsCollapsed}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
