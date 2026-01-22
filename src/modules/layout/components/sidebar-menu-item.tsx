"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { RouteItem } from "../types/navigation";

interface SidebarMenuItemProps {
  item: RouteItem;
  isActive: boolean;
  level?: number;
  isCollapsed?: boolean;
  onItemClick?: () => void;
}

export const SidebarMenuItem = ({
  item,
  isActive,
  level = 0,
  isCollapsed = false,
  onItemClick,
}: SidebarMenuItemProps) => {
  const [isOpen, setIsOpen] = React.useState(isActive);
  const pathname = usePathname();

  const isSubActive = React.useMemo(() => {
    if (item.subs && item.subs.length > 0) {
      return item.subs.some((sub) => pathname === sub.href || pathname.startsWith(sub.href));
    }
    return false;
  }, [item.subs, pathname]);

  const hasSubs = item.subs && item.subs.length > 0;

  // When collapsed and has subs, show icon with tooltip
  if (isCollapsed && hasSubs) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 mx-auto"
          >
            <Icon icon={item.iconName} className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <div className="text-sm font-medium">{item.title}</div>
          {item.subs && (
            <div className="text-xs opacity-75 mt-1">
              {item.subs.map((s) => s.title).join(", ")}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  // When collapsed, single items show icons with tooltip
  if (isCollapsed && !hasSubs) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 mx-auto"
            asChild
          >
            <Link href={item.href} onClick={onItemClick}>
              <Icon icon={item.iconName} className="h-4 w-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Expanded view with submenu
  if (hasSubs) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
        <div className="space-y-1">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                (isActive || isSubActive) && "bg-accent text-accent-foreground"
              )}
              style={{ paddingLeft: `${(level + 1) * 16}px` }}
            >
              <Icon icon={item.iconName} className="mr-2 h-4 w-4" />
              <span className="flex-1 text-left">{item.title}</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
              {item.counter && (
                <Badge variant="secondary" className="ml-2">
                  {item.counter}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.subs && item.subs.map((sub) => (
              <SidebarMenuItem
                key={sub.href}
                item={sub}
                isActive={pathname === sub.href}
                level={level + 1}
                isCollapsed={isCollapsed}
                onItemClick={onItemClick}
              />
            ))}
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // Expanded view without submenu
  return (
    <Link href={item.href} onClick={onItemClick}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          isActive && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${(level + 1) * 16}px` }}
      >
        <Icon icon={item.iconName} className="mr-2 h-4 w-4" />
        <span className="flex-1 text-left">{item.title}</span>
        {item.counter && (
          <Badge variant="secondary" className="ml-2">
            {item.counter}
          </Badge>
        )}
      </Button>
    </Link>
  );
};
