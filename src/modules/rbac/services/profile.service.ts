import { db } from "@/utils/db";
import { profileSchema, type ProfileDTO } from "../schema";

/**
 * Profile Service - Manages user profiles
 * Profile allows one user to have multiple role sets
 * Example: User can be both "Admin" for System and "Manager" for Sales
 * Pattern: User (1) → Profiles (N) → Roles (N)
 */
export class ProfileService {
  /**
   * List all profiles with their roles
   */
  async list() {
    try {
      return await db.profile.findMany({
        orderBy: { name: "asc" },
        include: {
          roles: {
            include: {
              role: {
                include: { permissions: { include: { permission: true } } },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("[ProfileService] List failed:", error);
      throw new Error("Failed to fetch profiles");
    }
  }

  /**
   * Get profiles for specific user
   */
  async getByUser(userId: string) {
    try {
      return await db.profile.findMany({
        where: { userId },
        include: {
          roles: {
            include: {
              role: {
                include: { permissions: { include: { permission: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    } catch (error) {
      console.error("[ProfileService] GetByUser failed:", error);
      throw error;
    }
  }

  /**
   * Get single profile by ID
   */
  async get(id: string) {
    try {
      const profile = await db.profile.findUnique({
        where: { id },
        include: {
          roles: {
            include: {
              role: {
                include: { permissions: { include: { permission: true } } },
              },
            },
          },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      if (!profile) {
        throw new Error("Profile not found");
      }

      return profile;
    } catch (error) {
      console.error("[ProfileService] Get failed:", error);
      throw error;
    }
  }

  /**
   * Create new profile for user
   * One user can have multiple profiles for different contexts
   */
  async create(input: ProfileDTO, userId: string) {
    try {
      const data = profileSchema.parse(input);

      // Verify user exists
      const user = await db.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check for duplicate profile name within user's profiles
      const existing = await db.profile.findFirst({
        where: {
          userId: data.userId,
          name: data.name,
        },
      });

      if (existing) {
        throw new Error(`Profile "${data.name}" already exists for this user`);
      }

      const profile = await db.profile.create({
        data: {
          userId: data.userId,
          name: data.name,
          description: data.description,
        },
        include: {
          roles: {
            include: { role: true },
          },
        },
      });

      console.log(`[ProfileService] Created: ${profile.id} (${profile.name}) for user ${data.userId}`, {
        creator: userId,
      });

      return profile;
    } catch (error) {
      console.error("[ProfileService] Create failed:", error);
      throw error;
    }
  }

  /**
   * Update profile
   * Name must be unique within user's profiles
   */
  async update(id: string, input: ProfileDTO, userId: string) {
    try {
      const before = await this.get(id);
      const data = profileSchema.partial().parse(input);

      // If changing name, check for duplicates
      if (data.name && data.name !== before.name) {
        const existing = await db.profile.findFirst({
          where: {
            userId: before.userId,
            name: data.name,
            id: { not: id },
          },
        });

        if (existing) {
          throw new Error(`Profile "${data.name}" already exists for this user`);
        }
      }

      const profile = await db.profile.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
        include: {
          roles: {
            include: { role: true },
          },
        },
      });

      console.log(`[ProfileService] Updated: ${id} (${profile.name})`, { userId });

      return profile;
    } catch (error) {
      console.error("[ProfileService] Update failed:", error);
      throw error;
    }
  }

  /**
   * Delete profile
   * Cascades: removes all role assignments and related data
   */
  async remove(id: string, userId: string) {
    try {
      const before = await this.get(id);

      // Check if this is the only profile for the user
      const userProfiles = await db.profile.count({
        where: { userId: before.userId },
      });

      if (userProfiles <= 1) {
        throw new Error("Cannot delete user's only profile. Create another profile first.");
      }

      // Delete profile (Prisma will cascade delete roles due to onDelete: Cascade)
      const profile = await db.profile.delete({ where: { id } });

      console.log(`[ProfileService] Deleted: ${id} (${before.name})`, { userId });

      return profile;
    } catch (error) {
      console.error("[ProfileService] Remove failed:", error);
      throw error;
    }
  }

  /**
   * Check if profile has specific role
   */
  async hasRole(profileId: string, roleId: string): Promise<boolean> {
    try {
      const profileRole = await db.profileRole.findFirst({
        where: { profileId, roleId },
      });
      return !!profileRole;
    } catch (error) {
      console.error("[ProfileService] HasRole failed:", error);
      return false;
    }
  }

  /**
   * Check if profile has specific permission
   * Checks all roles assigned to this profile
   */
  async hasPermission(profileId: string, permissionId: string): Promise<boolean> {
    try {
      const permission = await db.profileRole.findFirst({
        where: {
          profileId,
          role: {
            permissions: {
              some: { permissionId },
            },
          },
        },
      });
      return !!permission;
    } catch (error) {
      console.error("[ProfileService] HasPermission failed:", error);
      return false;
    }
  }

  /**
   * Get all roles assigned to profile
   */
  async getRoles(profileId: string) {
    try {
      const profileRoles = await db.profileRole.findMany({
        where: { profileId },
        include: {
          role: {
            include: { permissions: { include: { permission: true } } },
          },
        },
      });
      return profileRoles.map((pr) => pr.role);
    } catch (error) {
      console.error("[ProfileService] GetRoles failed:", error);
      throw error;
    }
  }

  /**
   * Get all permissions for profile (aggregated from all roles)
   */
  async getPermissions(profileId: string) {
    try {
      const profileRoles = await db.profileRole.findMany({
        where: { profileId },
        include: {
          role: {
            include: { permissions: { include: { permission: true } } },
          },
        },
      });

      // Aggregate unique permissions from all roles
      const permissionMap = new Map();
      profileRoles.forEach((pr) => {
        pr.role.permissions.forEach((rp) => {
          permissionMap.set(rp.permission.id, rp.permission);
        });
      });

      return Array.from(permissionMap.values());
    } catch (error) {
      console.error("[ProfileService] GetPermissions failed:", error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
