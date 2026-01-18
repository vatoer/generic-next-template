"use server";

import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import {
  permissionService,
  roleService,
  profileService,
  profileRoleService,
} from "@/modules/rbac/services";
import type { PermissionDTO, RoleDTO, ProfileDTO, ProfileRoleDTO } from "@/modules/rbac/schema";

/**
 * Server Actions for RBAC Module
 * All actions require authentication
 * Future: Add role-based access control for specific operations
 */

// Helper to get current user
async function getCurrentUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: {
      cookie: (await import("next/headers")).cookies().toString(),
    },
  } as any);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}


/**
 * Server Actions for RBAC Module
 * All actions require authentication
 * Future: Add role-based access control for specific operations
 */

// ============================================================================
// Permission Actions
// ============================================================================

export async function createPermissionAction(input: PermissionDTO) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const permission = await permissionService.create(input, userId);
    return { success: true, data: permission };
  } catch (error) {
    console.error("[createPermissionAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create permission",
    };
  }
}

export async function updatePermissionAction(id: string, input: PermissionDTO) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const permission = await permissionService.update(id, input, userId);
    return { success: true, data: permission };
  } catch (error) {
    console.error("[updatePermissionAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update permission",
    };
  }
}

export async function deletePermissionAction(id: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const permission = await permissionService.remove(id, userId);
    return { success: true, data: permission };
  } catch (error) {
    console.error("[deletePermissionAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete permission",
    };
  }
}

// ============================================================================
// Role Actions
// ============================================================================

export async function createRoleAction(input: RoleDTO) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const role = await roleService.create(input, userId);
    return { success: true, data: role };
  } catch (error) {
    console.error("[createRoleAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create role",
    };
  }
}

export async function updateRoleAction(id: string, input: RoleDTO) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const role = await roleService.update(id, input, userId);
    return { success: true, data: role };
  } catch (error) {
    console.error("[updateRoleAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}

export async function deleteRoleAction(id: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const role = await roleService.remove(id, userId);
    return { success: true, data: role };
  } catch (error) {
    console.error("[deleteRoleAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete role",
    };
  }
}

export async function assignRolePermissionsAction(roleId: string, permissionIds: string[]) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const role = await roleService.assignPermissions(roleId, permissionIds, userId);
    return { success: true, data: role };
  } catch (error) {
    console.error("[assignRolePermissionsAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign permissions",
    };
  }
}

// ============================================================================
// Profile Actions
// ============================================================================

export async function createProfileAction(input: ProfileDTO) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const profile = await profileService.create(input, userId);
    return { success: true, data: profile };
  } catch (error) {
    console.error("[createProfileAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create profile",
    };
  }
}

export async function updateProfileAction(id: string, input: ProfileDTO) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const profile = await profileService.update(id, input, userId);
    return { success: true, data: profile };
  } catch (error) {
    console.error("[updateProfileAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function deleteProfileAction(id: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const profile = await profileService.remove(id, userId);
    return { success: true, data: profile };
  } catch (error) {
    console.error("[deleteProfileAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete profile",
    };
  }
}

// ============================================================================
// ProfileRole Actions
// ============================================================================

export async function assignRoleToProfileAction(input: ProfileRoleDTO) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const profileRole = await profileRoleService.assign(input, userId);
    return { success: true, data: profileRole };
  } catch (error) {
    console.error("[assignRoleToProfileAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign role",
    };
  }
}

export async function revokeRoleFromProfileAction(profileId: string, roleId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const result = await profileRoleService.revoke(profileId, roleId, userId);
    return { success: true, data: result };
  } catch (error) {
    console.error("[revokeRoleFromProfileAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revoke role",
    };
  }
}

export async function replaceProfileRolesAction(profileId: string, roleIds: string[]) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const profileRoles = await profileRoleService.replaceRoles(profileId, roleIds, userId);
    return { success: true, data: profileRoles };
  } catch (error) {
    console.error("[replaceProfileRolesAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to replace roles",
    };
  }
}

// ============================================================================
// Query Actions (Read-only)
// ============================================================================

export async function getPermissionsAction() {
  try {
    const permissions = await permissionService.list();
    return { success: true, data: permissions };
  } catch (error) {
    console.error("[getPermissionsAction]", error);
    return {
      success: false,
      error: "Failed to fetch permissions",
    };
  }
}

export async function getRolesAction() {
  try {
    const roles = await roleService.list();
    return { success: true, data: roles };
  } catch (error) {
    console.error("[getRolesAction]", error);
    return {
      success: false,
      error: "Failed to fetch roles",
    };
  }
}

export async function getProfilesAction() {
  try {
    const profiles = await profileService.list();
    return { success: true, data: profiles };
  } catch (error) {
    console.error("[getProfilesAction]", error);
    return {
      success: false,
      error: "Failed to fetch profiles",
    };
  }
}

export async function getUserProfilesAction(userId: string) {
  try {
    const profiles = await profileService.getByUser(userId);
    return { success: true, data: profiles };
  } catch (error) {
    console.error("[getUserProfilesAction]", error);
    return {
      success: false,
      error: "Failed to fetch user profiles",
    };
  }
}

export async function getProfileRolesAction(profileId: string) {
  try {
    const profileRoles = await profileRoleService.getByProfile(profileId);
    return { success: true, data: profileRoles };
  } catch (error) {
    console.error("[getProfileRolesAction]", error);
    return {
      success: false,
      error: "Failed to fetch profile roles",
    };
  }
}
