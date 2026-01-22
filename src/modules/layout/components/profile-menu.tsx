"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, Settings, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dynamic from "next/dynamic";

// Dynamic import ProfileSwitcher to avoid hydration mismatch
const ProfileSwitcher = dynamic(
  () =>
    import("@/modules/organisasi/components/profile-switcher").then(
      (mod) => mod.ProfileSwitcher
    ),
  { ssr: false }
);

interface ProfileMenuProps {
  user: {
    name?: string | null;
    email?: string;
    image?: string | null;
  };
  onLogout?: () => Promise<void>;
  onSettings?: () => void;
  onHelp?: () => void;
}

export const ProfileMenu = ({
  user,
  onLogout,
  onSettings,
  onHelp,
}: ProfileMenuProps) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await onLogout?.();
    } finally {
      setIsLoading(false);
    }
  };

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user.email?.charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* Profile Switcher */}
        <div className="px-2 py-1.5 mb-2">
          <React.Suspense fallback={<div className="text-xs text-muted-foreground p-2">Loading profiles...</div>}>
            <ProfileSwitcher />
          </React.Suspense>
        </div>

        <DropdownMenuSeparator />

        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Profile Items */}
        <DropdownMenuItem asChild>
          <Link href="/settings/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings/profiles" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Kelola Profil</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onHelp}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
