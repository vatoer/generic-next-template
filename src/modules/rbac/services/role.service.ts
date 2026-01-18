import { db } from "@/utils/db";
import { roleSchema, type RoleDTO } from "../schema";

/**
 * Role Service - Manages roles and role-permission assignments
 * Follows RBAC principle: Roles group permissions for profile assignment
 * Example flow: User → Profile → ProfileRole → Role → Permissions
 */
export const roleService = {
  /**
   * List all roles with their permissions and profile count
   */
  async list() {
    try {
      return await db.role.findMany({
        orderBy: { name: "asc" },
        include: {
          permissions: {
            include: { permission: true },
            orderBy: { permission: { resource: "asc" } },
          },
          profileRoles: { select: { profileId: true } },
        },
      });
    } catch (error) {
      console.error("[RoleService] List failed:", error);
      throw new Error("Failed to fetch roles");
    }
  },

  /**
   * Get single role by ID with full details
   */
  async get(id: string) {
    try {
      const role = await db.role.findUnique({
        where: { id },
        include: {
          permissions: {
            include: { permission: true },
            orderBy: { permission: { resource: "asc" } },
          },
          profileRoles: { select: { profileId: true } },
        },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      return role;
    } catch (error) {
      console.error("[RoleService] Get failed:", error);
      throw error;
    }
  },

  /**
   * Create new role with initial permissions
   */
  async create(input: RoleDTO, userId: string) {
    try {
      const data = roleSchema.parse(input);

      // Check for duplicate name
      const existing = await db.role.findFirst({
        where: { name: data.name },
      });

      if (existing) {
        throw new Error(`Role "${data.name}" already exists`);
      }

      const role = await db.role.create({
        data: {
          name: data.name,
          description: data.description,
          createdBy: userId,
          permissions: {
            createMany: {
              data: (data.permissionIds ?? []).map((pid) => ({ permissionId: pid })),
              skipDuplicates: true,
            },
          },
        },
        include: { permissions: { include: { permission: true } } },
      });

      console.log(`[RoleService] Created: ${role.id} (${role.name})`, { userId });
      return role;
    } catch (error) {
      console.error("[RoleService] Create failed:", error);
      throw error;
    }
  },

  /**
   * Update role and optionally replace permissions
   * Validates that role exists and no duplicate names
   */
  async update(id: string, input: RoleDTO, userId: string) {
    try {
      const before = await this.get(id);
      const data = roleSchema.partial().parse(input);

      // Check for duplicate name (excluding self)
      if (data.name && data.name !== before.name) {
        const existing = await db.role.findFirst({
          where: { name: data.name },
        });
        if (existing) {
          throw new Error(`Role "${data.name}" already exists`);
        }
      }

      // Update permissions if provided (delete old, create new)
      if (data.permissionIds !== undefined) {
        await db.rolePermission.deleteMany({ where: { roleId: id } });
      }

      const role = await db.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          updatedBy: userId,
          ...(data.permissionIds && {
            permissions: {
              createMany: {
                data: data.permissionIds.map((pid) => ({ permissionId: pid })),
                skipDuplicates: true,
              },
            },
          }),
        },
        include: { permissions: { include: { permission: true } } },
      });

      console.log(`[RoleService] Updated: ${id} (${role.name})`, { userId });
      return role;
    } catch (error) {
      console.error("[RoleService] Update failed:", error);
      throw error;
    }
  },

  /**
   * Delete role
   * Cascades: removes role-permission assignments and profile-role assignments
   */
  async remove(id: string, userId: string) {
    try {
      const before = await this.get(id);

      // Remove all profile assignments
      await db.profileRole.deleteMany({ where: { roleId: id } });

      // Remove all permissions
      await db.rolePermission.deleteMany({ where: { roleId: id } });

      const role = await db.role.delete({ where: { id } });

      console.log(`[RoleService] Deleted: ${id} (${before.name})`, { userId });
      return role;
    } catch (error) {
      console.error("[RoleService] Remove failed:", error);
      throw error;
    }
  },

  /**
   * Assign permissions to role (replaces existing)
   * Validates permissions exist first
   */
  async assignPermissions(roleId: string, permissionIds: string[], userId: string) {
    try {
      // Verify role exists
      await this.get(roleId);

      // Verify all permissions exist
      const permissions = await db.permission.findMany({
        where: { id: { in: permissionIds } },
        select: { id: true },
      });

      if (permissions.length !== permissionIds.length) {
        throw new Error("One or more permissions do not exist");
      }

      // Replace permissions
      await db.rolePermission.deleteMany({ where: { roleId } });
      await db.rolePermission.createMany({
        data: permissionIds.map((pid) => ({ roleId, permissionId: pid })),
        skipDuplicates: true,
      });

      const role = await this.get(roleId);
      console.log(`[RoleService] Assigned permissions to: ${roleId}`, {
        count: permissionIds.length,
        userId,
      });

      return role;
    } catch (error) {
      console.error("[RoleService] AssignPermissions failed:", error);
      throw error;
    }
  },

  /**
   * Check if role has specific permission
   */
  async hasPermission(roleId: string, permissionId: string): Promise<boolean> {
    try {
      const permission = await db.rolePermission.findFirst({
        where: { roleId, permissionId },
      });
      return !!permission;
    } catch (error) {
      console.error("[RoleService] HasPermission failed:", error);
      return false;
    }
  },

  /**
   * Get all profiles assigned to role
   */
  async getProfilesByRole(roleId: string) {
    try {
      const profileRoles = await db.profileRole.findMany({
        where: { roleId },
        include: { profile: { select: { id: true, name: true, userId: true } } },
      });
      return profileRoles.map((pr) => pr.profile);
    } catch (error) {
      console.error("[RoleService] GetProfilesByRole failed:", error);
      throw error;
    }
  },
};

}

