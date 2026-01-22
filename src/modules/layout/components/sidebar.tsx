"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarMenuItem } from "./sidebar-menu-item";
import type { RouteItem } from "../types/navigation";

interface SidebarProps {
  menus: RouteItem[];
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onMenuItemClick?: () => void;
}

export const Sidebar = ({
  menus,
  isCollapsed = false,
  onCollapsedChange,
  onMenuItemClick,
}: SidebarProps) => {
  const [internalCollapsed, setInternalCollapsed] = React.useState(isCollapsed);

  const handleToggleCollapse = () => {
    const newState = !internalCollapsed;
    setInternalCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  return (
    <div
      className={cn(
        "h-full bg-background border-r transition-all duration-300",
        internalCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header with collapse button */}
        <div className="flex items-center justify-between p-4 border-b">
          {!internalCollapsed && (
            <h2 className="text-lg font-semibold truncate">Menu</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCollapse}
            className="ml-auto"
          >
            {internalCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Menu items */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            <TooltipProvider delayDuration={300}>
              {menus.map((menu) => (
                <div key={menu.href}>
                  {internalCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 mx-auto"
                          asChild
                        >
                          <a href={menu.href} onClick={onMenuItemClick}>
                            <Icon icon={menu.iconName} className="h-4 w-4" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2">
                        {menu.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuItem
                      item={menu}
                      isActive={false}
                      level={0}
                      isCollapsed={internalCollapsed}
                      onItemClick={onMenuItemClick}
                    />
                  )}
                </div>
              ))}
            </TooltipProvider>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
