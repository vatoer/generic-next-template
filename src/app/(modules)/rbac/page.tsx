"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreateRoleDialog,
  RolesTable,
  CreatePermissionDialog,
  PermissionsTable,
  AssignPermissions,
} from "@/modules/rbac/components";
import {
  createRoleAction,
  deleteRoleAction,
  getAllRolesAction,
  createPermissionAction,
  deletePermissionAction,
  getAllPermissionsAction,
  assignPermissionsToRoleAction,
  getRolePermissionsAction,
} from "@/modules/rbac/actions";
import type { CreateRoleInput, CreatePermissionInput } from "@/modules/rbac/schemas";

export default function RBACPage() {
  const [roles, setRoles] = React.useState<any[]>([]);
  const [permissions, setPermissions] = React.useState<any[]>([]);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = React.useState(false);
  const [isCreatePermissionOpen, setIsCreatePermissionOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<any | null>(null);
  const [rolePermissions, setRolePermissions] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [rolesResult, permissionsResult] = await Promise.all([
        getAllRolesAction(),
        getAllPermissionsAction(),
      ]);

      if (rolesResult.success && rolesResult.data) {
        setRoles(rolesResult.data);
      }

      if (permissionsResult.success && permissionsResult.data) {
        setPermissions(permissionsResult.data);
      }
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRole = async (data: CreateRoleInput) => {
    const result = await createRoleAction(data);

    if (result.success) {
      toast.success("Role created successfully");
      await loadData();
    } else {
      toast.error(result.error || "Failed to create role");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const result = await deleteRoleAction({ id: roleId });

    if (result.success) {
      toast.success("Role deleted successfully");
      await loadData();
    } else {
      toast.error(result.error || "Failed to delete role");
    }
  };

  const handleCreatePermission = async (data: CreatePermissionInput) => {
    const result = await createPermissionAction(data);

    if (result.success) {
      toast.success("Permission created successfully");
      await loadData();
    } else {
      toast.error(result.error || "Failed to create permission");
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    const result = await deletePermissionAction({ id: permissionId });

    if (result.success) {
      toast.success("Permission deleted successfully");
      await loadData();
    } else {
      toast.error(result.error || "Failed to delete permission");
    }
  };

  const handleManagePermissions = async (role: any) => {
    setSelectedRole(role);
    const result = await getRolePermissionsAction(role.id);

    if (result.success && result.data) {
      setRolePermissions(result.data.map((p: any) => p.id));
    }
  };

  const handleAssignPermissions = async (permissionIds: string[]) => {
    if (!selectedRole) return;

    const result = await assignPermissionsToRoleAction({
      roleId: selectedRole.id,
      permissionIds,
    });

    if (result.success) {
      toast.success("Permissions updated successfully");
      setSelectedRole(null);
      await loadData();
    } else {
      toast.error(result.error || "Failed to update permissions");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (selectedRole) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Permissions for {selectedRole.name}
            </h1>
            <p className="text-muted-foreground">
              {selectedRole.description || "Assign permissions to this role"}
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedRole(null)}>
            Back to Roles
          </Button>
        </div>

        <AssignPermissions
          roleId={selectedRole.id}
          permissions={permissions}
          selectedPermissionIds={rolePermissions}
          onAssign={handleAssignPermissions}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
        <p className="text-muted-foreground">
          Manage roles and permissions for your application
        </p>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Roles</CardTitle>
                  <CardDescription>
                    Manage roles and their permissions
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreateRoleOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RolesTable
                roles={roles}
                onEdit={(role) => {
                  // TODO: Implement edit
                  toast.info("Edit functionality coming soon");
                }}
                onDelete={handleDeleteRole}
                onManagePermissions={handleManagePermissions}
                onViewUsers={(role) => {
                  // TODO: Implement view users
                  toast.info("View users functionality coming soon");
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Permissions</CardTitle>
                  <CardDescription>
                    Manage permissions for resources and actions
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreatePermissionOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Permission
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PermissionsTable
                permissions={permissions}
                onEdit={(permission) => {
                  // TODO: Implement edit
                  toast.info("Edit functionality coming soon");
                }}
                onDelete={handleDeletePermission}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateRoleDialog
        open={isCreateRoleOpen}
        onOpenChange={setIsCreateRoleOpen}
        onSubmit={handleCreateRole}
      />

      <CreatePermissionDialog
        open={isCreatePermissionOpen}
        onOpenChange={setIsCreatePermissionOpen}
        onSubmit={handleCreatePermission}
      />
    </div>
  );
}
