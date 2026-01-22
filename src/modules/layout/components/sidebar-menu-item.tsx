"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { RouteItem } from "../types/navigation";

interface SidebarMenuItemProps {
  item: RouteItem;
  isActive: boolean;
  level?: number;
  onItemClick?: () => void;
}

export const SidebarMenuItem = ({
  item,
  isActive,
  level = 0,
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
            {item.subs.map((sub) => (
              <SidebarMenuItem
                key={sub.href}
                item={sub}
                isActive={pathname === sub.href}
                level={level + 1}
                onItemClick={onItemClick}
              />
            ))}
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

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
