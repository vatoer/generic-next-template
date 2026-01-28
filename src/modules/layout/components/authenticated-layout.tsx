"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "./topbar";
import { Sidebar } from "./sidebar";
import { processMenus } from "../lib/menu-utils";
import { navigationMenus } from "../config/menu";
import type { RouteItem, UserPermissionContext, LayoutUser } from "../types/navigation";
import { authClient } from "@/shared/auth/auth-client";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  user: LayoutUser | null;
  permissionContext: UserPermissionContext;
  appName?: string;
  appLogo?: React.ReactNode;
}

export const AuthenticatedLayout = ({
  children,
  user,
  permissionContext,
  appName = "Dashboard",
  appLogo,
}: AuthenticatedLayoutProps) => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [processedMenus, setProcessedMenus] = React.useState<RouteItem[]>([]);

  React.useEffect(() => {
    const menus = processMenus(navigationMenus, permissionContext);
    setProcessedMenus(menus);
  }, [permissionContext]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar - Always visible */}
      <Topbar
        user={user}
        appName={appName}
        appLogo={appLogo}
        onLogout={handleLogout}
        onSettings={() => {
          // Navigate to settings
          window.location.href = "/settings";
        }}
        onHelp={() => {
          // Navigate to help
          window.location.href = "/help";
        }}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Collapsible */}
        <Sidebar
          menus={processedMenus}
          isCollapsed={isCollapsed}
          onCollapsedChange={setIsCollapsed}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};
