"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string | null;
}

interface AssignPermissionsProps {
  roleId: string;
  permissions: Permission[];
  selectedPermissionIds: string[];
  onAssign: (permissionIds: string[]) => Promise<void>;
}

export const AssignPermissions = ({
  roleId,
  permissions,
  selectedPermissionIds,
  onAssign,
}: AssignPermissionsProps) => {
  const [selected, setSelected] = React.useState<string[]>(selectedPermissionIds);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setSelected(selectedPermissionIds);
  }, [selectedPermissionIds]);

  const groupedPermissions = React.useMemo(() => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  const handleToggle = (permissionId: string) => {
    setSelected((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllResource = (resource: string) => {
    const resourcePermissions = groupedPermissions[resource];
    const resourcePermissionIds = resourcePermissions.map((p) => p.id);
    const allSelected = resourcePermissionIds.every((id) => selected.includes(id));

    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !resourcePermissionIds.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...resourcePermissionIds])]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onAssign(selected);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = JSON.stringify([...selected].sort()) !== JSON.stringify([...selectedPermissionIds].sort());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Selected: {selected.length} / {permissions.length}
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!hasChanges || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : (
            "Save Permissions"
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => {
          const allSelected = resourcePermissions.every((p) =>
            selected.includes(p.id)
          );
          const someSelected = resourcePermissions.some((p) =>
            selected.includes(p.id)
          );

          return (
            <Card key={resource}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium capitalize">
                    {resource}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllResource(resource)}
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resourcePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-3"
                    >
                      <Checkbox
                        id={permission.id}
                        checked={selected.includes(permission.id)}
                        onCheckedChange={() => handleToggle(permission.id)}
                      />
                      <div className="flex-1 space-y-1">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {permission.name}
                          <Badge variant="secondary" className="ml-2">
                            {permission.action}
                          </Badge>
                        </label>
                        {permission.description && (
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
