"use client";

/**
 * Organization Tree Component
 * Tampilkan hierarki organisasi dengan expand/collapse
 */

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrganisasiWithTree, JenisOrganisasi } from "../types";

interface OrganizationTreeProps {
  tree: OrganisasiWithTree[];
  onSelectOrganization?: (org: OrganisasiWithTree) => void;
  filterKind?: JenisOrganisasi;
  selectedId?: string;
}

export function OrganizationTree({
  tree,
  onSelectOrganization,
  filterKind,
  selectedId,
}: OrganizationTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const filteredTree = filterKind
    ? tree.filter((org) => org.jenis === filterKind)
    : tree;

  return (
    <div className="space-y-1">
      {filteredTree.map((org) => (
        <TreeNode
          key={org.id}
          org={org}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          onSelect={onSelectOrganization}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  org: OrganisasiWithTree;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect?: (org: OrganisasiWithTree) => void;
  selectedId?: string;
  level?: number;
}

function TreeNode({
  org,
  expanded,
  onToggleExpand,
  onSelect,
  selectedId,
  level = 0,
}: TreeNodeProps) {
  const isExpanded = expanded.has(org.id);
  const hasChildren = org.subOrganisasi.length > 0;

  return (
    <div>
      {/* Node */}
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors",
          selectedId === org.id && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect?.(org)}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(org.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="h-6 w-6" />
        )}

        {/* Icon */}
        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate text-sm">{org.nama}</div>
          {org.singkatan && (
            <div className="text-xs text-muted-foreground truncate">
              {org.singkatan}
            </div>
          )}
        </div>

        {/* Badge */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {org.jenis === "KELOMPOK_KERJA" && (
            <Badge variant="outline" className="text-xs">
              Pokja
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {org.jumlahAnggota}
          </Badge>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {org.subOrganisasi.map((child) => (
            <TreeNode
              key={child.id}
              org={child}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              selectedId={selectedId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
