"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TopbarMenuAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface TopbarMenuProps {
  actions?: TopbarMenuAction[];
  children?: React.ReactNode;
}

export const TopbarMenu = ({ actions = [], children }: TopbarMenuProps) => {
  if (!actions.length && !children) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {children ? (
          children
        ) : (
          <>
            {actions.map((action, index) => (
              <React.Fragment key={action.id}>
                <DropdownMenuItem
                  onClick={action.onClick}
                  className={action.variant === "destructive" ? "text-destructive" : ""}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  <span>{action.label}</span>
                </DropdownMenuItem>
                {index < actions.length - 1 && <DropdownMenuSeparator />}
              </React.Fragment>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
