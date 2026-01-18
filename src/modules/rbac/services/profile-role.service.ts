import { db } from "@/utils/db";
import { profileRoleSchema, type ProfileRoleDTO } from "../schema";

/**
 * ProfileRole Service - Manages profile-to-role assignments
 * Junction table handler for N-to-N relationship between profiles and roles
 * Enables flexible role assignment: One profile can have multiple roles
 */
export class ProfileRoleService {
  /**
   * Get all role assignments for a profile
   */
  async getByProfile(profileId: string) {
    try {
      const profileRoles = await db.profileRole.findMany({
        where: { profileId },
        include: {
          role: {
            include: { permissions: { include: { permission: true } } },
          },
        },
        orderBy: { role: { name: "asc" } },
      });

      return profileRoles;
    } catch (error) {
      console.error("[ProfileRoleService] GetByProfile failed:", error);
      throw error;
    }
  }

  /**
   * Get all profiles assigned to a role
   */
  async getByRole(roleId: string) {
    try {
      const profileRoles = await db.profileRole.findMany({
        where: { roleId },
        include: {
          profile: { select: { id: true, name: true, userId: true } },
        },
        orderBy: { profile: { name: "asc" } },
      });

      return profileRoles;
    } catch (error) {
      console.error("[ProfileRoleService] GetByRole failed:", error);
      throw error;
    }
  }

  /**
   * Assign role to profile
   * Checks for duplicates to prevent assigning same role twice
   */
  async assign(input: ProfileRoleDTO, userId: string) {
    try {
      const data = profileRoleSchema.parse(input);

      // Verify profile exists
      const profile = await db.profile.findUnique({
        where: { id: data.profileId },
      });
      if (!profile) {
        throw new Error("Profile not found");
      }

      // Verify role exists
      const role = await db.role.findUnique({
        where: { id: data.roleId },
      });
      if (!role) {
        throw new Error("Role not found");
      }

      // Check if already assigned
      const existing = await db.profileRole.findFirst({
        where: {
          profileId: data.profileId,
          roleId: data.roleId,
        },
      });

      if (existing) {
        throw new Error(`Role "${role.name}" is already assigned to profile "${profile.name}"`);
      }

      const profileRole = await db.profileRole.create({
        data: {
          profileId: data.profileId,
          roleId: data.roleId,
          assignedBy: userId,
        },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
          profile: true,
        },
      });

      console.log(
        `[ProfileRoleService] Assigned: Profile ${data.profileId} ← Role ${data.roleId}`,
        {
          assignedBy: userId,
        }
      );

      return profileRole;
    } catch (error) {
      console.error("[ProfileRoleService] Assign failed:", error);
      throw error;
    }
  }

  /**
   * Remove role from profile
   * Can remove specific profile-role relationship
   */
  async revoke(profileId: string, roleId: string, userId: string) {
    try {
      // Verify relationship exists
      const profileRole = await db.profileRole.findFirst({
        where: { profileId, roleId },
        include: { profile: true, role: true },
      });

      if (!profileRole) {
        throw new Error("Role is not assigned to this profile");
      }

      // Check if profile has other roles (optional validation)
      const roleCount = await db.profileRole.count({
        where: { profileId },
      });

      if (roleCount <= 1) {
        console.warn(
          `[ProfileRoleService] Warning: Removing last role from profile ${profileId}`
        );
      }

      const deleted = await db.profileRole.delete({
        where: {
          profileId_roleId: {
            profileId,
            roleId,
          },
        },
      });

      console.log(
        `[ProfileRoleService] Revoked: Profile ${profileId} → Role ${roleId}`,
        {
          revokedBy: userId,
        }
      );

      return deleted;
    } catch (error) {
      console.error("[ProfileRoleService] Revoke failed:", error);
      throw error;
    }
  }

  /**
   * Replace all roles for a profile
   * Removes old roles and assigns new ones
   */
  async replaceRoles(profileId: string, roleIds: string[], userId: string) {
    try {
      // Verify profile exists
      const profile = await db.profile.findUnique({
        where: { id: profileId },
      });
      if (!profile) {
        throw new Error("Profile not found");
      }

      // Verify all roles exist
      const roles = await db.role.findMany({
        where: { id: { in: roleIds } },
        select: { id: true },
      });

      if (roles.length !== roleIds.length) {
        throw new Error("One or more roles do not exist");
      }

      // Remove all existing role assignments
      await db.profileRole.deleteMany({
        where: { profileId },
      });

      // Assign new roles
      const profileRoles = await Promise.all(
        roleIds.map((roleId) =>
          db.profileRole.create({
            data: {
              profileId,
              roleId,
              assignedBy: userId,
            },
            include: { role: true },
          })
        )
      );

      console.log(
        `[ProfileRoleService] Replaced roles for profile ${profileId}`,
        {
          count: profileRoles.length,
          replacedBy: userId,
        }
      );

      return profileRoles;
    } catch (error) {
      console.error("[ProfileRoleService] ReplaceRoles failed:", error);
      throw error;
    }
  }

  /**
   * Get role assignment history for a profile
   * Useful for audit trail
   */
  async getAssignmentHistory(profileId: string) {
    try {
      const assignments = await db.profileRole.findMany({
        where: { profileId },
        include: {
          role: { select: { id: true, name: true } },
          profile: { select: { id: true, name: true } },
        },
        orderBy: { assignedAt: "desc" },
      });

      return assignments;
    } catch (error) {
      console.error("[ProfileRoleService] GetAssignmentHistory failed:", error);
      throw error;
    }
  }

  /**
   * Batch check permissions for profile
   * Returns array of permission statuses
   */
  async checkPermissions(profileId: string, permissionIds: string[]) {
    try {
      const results: Record<string, boolean> = {};

      for (const permId of permissionIds) {
        const hasPermission = await db.profileRole.findFirst({
          where: {
            profileId,
            role: {
              permissions: {
                some: { permissionId: permId },
              },
            },
          },
        });
        results[permId] = !!hasPermission;
      }

      return results;
    } catch (error) {
      console.error("[ProfileRoleService] CheckPermissions failed:", error);
      throw error;
    }
  }
}

export const profileRoleService = new ProfileRoleService();
