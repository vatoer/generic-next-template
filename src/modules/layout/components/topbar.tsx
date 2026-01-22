"use client";

import * as React from "react";
import { AppIdentity } from "./app-identity";
import { NotificationPopover, type Notification } from "./notification-popover";
import { ProfileMenu } from "./profile-menu";
import { TopbarMenu, type TopbarMenuAction } from "./topbar-menu";
import type { LayoutUser } from "../types/navigation";

interface TopbarProps {
  user: LayoutUser | null;
  appName?: string;
  appLogo?: React.ReactNode;
  notifications?: Notification[];
  onNotificationDismiss?: (id: string) => void;
  onNotificationMarkAsRead?: (id: string) => void;
  onNotificationViewAll?: () => void;
  onLogout?: () => Promise<void>;
  onSettings?: () => void;
  onHelp?: () => void;
  topbarActions?: TopbarMenuAction[];
  topbarMenuChildren?: React.ReactNode;
}

export const Topbar = ({
  user,
  appName = "Dashboard",
  appLogo,
  notifications = [],
  onNotificationDismiss,
  onNotificationMarkAsRead,
  onNotificationViewAll,
  onLogout,
  onSettings,
  onHelp,
  topbarActions = [],
  topbarMenuChildren,
}: TopbarProps) => {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: App Identity */}
        <AppIdentity appName={appName} appLogo={appLogo} showBrand />

        {/* Right: Actions, Notifications, Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <NotificationPopover
            notifications={notifications}
            onDismiss={onNotificationDismiss}
            onMarkAsRead={onNotificationMarkAsRead}
            onViewAll={onNotificationViewAll}
          />

          {/* More Options Menu */}
          {topbarActions.length > 0 || topbarMenuChildren ? (
            <TopbarMenu actions={topbarActions}>
              {topbarMenuChildren}
            </TopbarMenu>
          ) : null}

          {/* Profile Menu */}
          {user && (
            <ProfileMenu
              user={user}
              onLogout={onLogout}
              onSettings={onSettings}
              onHelp={onHelp}
            />
          )}
        </div>
      </div>
    </header>
  );
};
