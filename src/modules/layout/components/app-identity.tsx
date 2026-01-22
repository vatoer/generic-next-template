"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppIdentityProps {
  appName?: string;
  appLogo?: React.ReactNode;
  showBrand?: boolean;
}

export const AppIdentity = ({
  appName = "Dashboard",
  appLogo,
  showBrand = true,
}: AppIdentityProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      {/* Logo */}
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70">
        {appLogo ? (
          appLogo
        ) : (
          <Icon icon="lucide:gauge" className="h-6 w-6 text-white" />
        )}
      </div>

      {/* Brand Text */}
      {showBrand && (
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold">{appName}</h1>
          <p className="text-xs text-muted-foreground">Management System</p>
        </div>
      )}

      {/* Theme Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-4 hidden sm:inline-flex">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Icon icon="lucide:monitor" className="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
