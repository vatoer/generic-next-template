import { db } from "@/utils/db";
import { permissionSchema, type PermissionDTO } from "../schema";

/**
 * Permission Service - Manages system permissions
 * Follows RBAC principle: Permissions define what actions can be done on resources
 * Pattern: Resource + Action = Permission (e.g., "users:create", "posts:delete")
 */
export const permissionService = {
  /**
   * List all permissions grouped by resource
   */
  async list() {
    try {
      return await db.permission.findMany({
        orderBy: [{ resource: "asc" }, { action: "asc" }],
      });
    } catch (error) {
      console.error("[PermissionService] List failed:", error);
      throw new Error("Failed to fetch permissions");
    }
  },

  /**
   * Get single permission by ID
   */
  async get(id: string) {
    try {
      const permission = await db.permission.findUnique({ where: { id } });
      if (!permission) {
        throw new Error("Permission not found");
      }
      return permission;
    } catch (error) {
      console.error("[PermissionService] Get failed:", error);
      throw error;
    }
  },

  /**
   * Create new permission
   * Validates input and ensures resource:action uniqueness
   */
  async create(input: PermissionDTO, userId: string) {
    try {
      const data = permissionSchema.parse(input);

      // Check for duplicate resource:action
      const existing = await db.permission.findFirst({
        where: {
          resource: data.resource,
          action: String(data.action),
        },
      });

      if (existing) {
        throw new Error(`Permission "${data.resource}:${data.action}" already exists`);
      }

      const permission = await db.permission.create({
        data: {
          name: data.name,
          resource: data.resource,
          action: String(data.action),
          description: data.description,
          createdBy: userId,
        },
      });

      console.log(`[PermissionService] Created: ${permission.id}`, { userId });
      return permission;
    } catch (error) {
      console.error("[PermissionService] Create failed:", error);
      throw error;
    }
  },

  /**
   * Update permission
   * Cannot change resource:action (immutable)
   */
  async update(id: string, input: PermissionDTO, userId: string) {
    try {
      const before = await this.get(id);
      const data = permissionSchema.partial().parse(input);

      const permission = await db.permission.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          updatedBy: userId,
        },
      });

      console.log(`[PermissionService] Updated: ${id}`, { userId });
      return permission;
    } catch (error) {
      console.error("[PermissionService] Update failed:", error);
      throw error;
    }
  },

  /**
   * Delete permission (soft delete would be better for audit)
   * Removes all role assignments first
   */
  async remove(id: string, userId: string) {
    try {
      // Verify exists
      await this.get(id);

      // Remove from all roles
      await db.rolePermission.deleteMany({ where: { permissionId: id } });

      const permission = await db.permission.delete({ where: { id } });

      console.log(`[PermissionService] Deleted: ${id}`, { userId });
      return permission;
    } catch (error) {
      console.error("[PermissionService] Remove failed:", error);
      throw error;
    }
  },

  /**
   * Get all permissions for a specific resource
   */
  async getByResource(resource: string) {
    try {
      return await db.permission.findMany({
        where: { resource },
        orderBy: { action: "asc" },
      });
    } catch (error) {
      console.error("[PermissionService] GetByResource failed:", error);
      throw error;
    }
  },

  /**
   * Get all unique resources
   * Useful for permission matrix/UI
   */
  async getResources() {
    try {
      const permissions = await db.permission.findMany({
        select: { resource: true },
        distinct: ["resource"],
        orderBy: { resource: "asc" },
      });
      return permissions.map((p) => p.resource);
    } catch (error) {
      console.error("[PermissionService] GetResources failed:", error);
      throw error;
    }
  },
};

export const permissionService = new PermissionService();





