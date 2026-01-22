"use server";

import {
  assignRoleToUserSchema,
  removeRoleFromUserSchema,
  getUserRolesSchema,
  getUsersWithRoleSchema,
  type AssignRoleToUserInput,
  type RemoveRoleFromUserInput,
  type GetUserRolesInput,
  type GetUsersWithRoleInput,
} from "../schemas";
import * as userRoleService from "../services/user-role.service";

export const assignRoleToUserAction = async (input: AssignRoleToUserInput) => {
  try {
    const validatedInput = assignRoleToUserSchema.parse(input);

    const userRole = await userRoleService.assignRoleToUser(validatedInput);

    return {
      success: true,
      data: userRole,
    };
  } catch (error) {
    console.error("Error assigning role to user:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to assign role to user",
    };
  }
};

export const removeRoleFromUserAction = async (input: RemoveRoleFromUserInput) => {
  try {
    const validatedInput = removeRoleFromUserSchema.parse(input);

    await userRoleService.removeRoleFromUser(validatedInput);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error removing role from user:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove role from user",
    };
  }
};

export const getUserRolesAction = async (input: GetUserRolesInput) => {
  try {
    const validatedInput = getUserRolesSchema.parse(input);

    const roles = await userRoleService.getUserRoles(validatedInput);

    return {
      success: true,
      data: roles,
    };
  } catch (error) {
    console.error("Error getting user roles:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get user roles",
    };
  }
};

export const getUsersWithRoleAction = async (input: GetUsersWithRoleInput) => {
  try {
    const validatedInput = getUsersWithRoleSchema.parse(input);

    const users = await userRoleService.getUsersWithRole(validatedInput);

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error("Error getting users with role:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get users with role",
    };
  }
};

export const getUserPermissionsAction = async (userId: string) => {
  try {
    const permissions = await userRoleService.getUserPermissions(userId);

    return {
      success: true,
      data: permissions,
    };
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get user permissions",
    };
  }
};

export const checkUserHasPermissionAction = async (
  userId: string,
  resource: string,
  action: string
) => {
  try {
    const hasPermission = await userRoleService.checkUserHasPermission(
      userId,
      resource,
      action
    );

    return {
      success: true,
      data: hasPermission,
    };
  } catch (error) {
    console.error("Error checking user permission:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check user permission",
    };
  }
};

export const checkUserHasRoleAction = async (userId: string, roleName: string) => {
  try {
    const hasRole = await userRoleService.checkUserHasRole(userId, roleName);

    return {
      success: true,
      data: hasRole,
    };
  } catch (error) {
    console.error("Error checking user role:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to check user role",
    };
  }
};

export const assignMultipleRolesToUserAction = async (
  userId: string,
  roleIds: string[]
) => {
  try {
    const roles = await userRoleService.assignMultipleRolesToUser(userId, roleIds);

    return {
      success: true,
      data: roles,
    };
  } catch (error) {
    console.error("Error assigning roles to user:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to assign roles to user",
    };
  }
};

export const removeAllRolesFromUserAction = async (userId: string) => {
  try {
    await userRoleService.removeAllRolesFromUser(userId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error removing roles from user:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove roles from user",
    };
  }
};
