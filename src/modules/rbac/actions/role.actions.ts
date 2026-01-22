"use server";

import {
  createRoleSchema,
  updateRoleSchema,
  deleteRoleSchema,
  getRoleSchema,
  assignPermissionsSchema,
  type CreateRoleInput,
  type UpdateRoleInput,
  type DeleteRoleInput,
  type GetRoleInput,
  type AssignPermissionsInput,
} from "../schemas";
import * as roleService from "../services/role.service";

export const createRoleAction = async (input: CreateRoleInput) => {
  try {
    const validatedInput = createRoleSchema.parse(input);

    const exists = await roleService.checkRoleExists(validatedInput.name);
    if (exists) {
      return {
        success: false,
        error: "A role with this name already exists",
      };
    }

    const role = await roleService.createRole(validatedInput);

    return {
      success: true,
      data: role,
    };
  } catch (error) {
    console.error("Error creating role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create role",
    };
  }
};

export const updateRoleAction = async (input: UpdateRoleInput) => {
  try {
    const validatedInput = updateRoleSchema.parse(input);

    if (validatedInput.name) {
      const exists = await roleService.checkRoleExists(
        validatedInput.name,
        validatedInput.id
      );
      if (exists) {
        return {
          success: false,
          error: "A role with this name already exists",
        };
      }
    }

    const role = await roleService.updateRole(validatedInput);

    return {
      success: true,
      data: role,
    };
  } catch (error) {
    console.error("Error updating role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
};

export const deleteRoleAction = async (input: DeleteRoleInput) => {
  try {
    const validatedInput = deleteRoleSchema.parse(input);

    await roleService.deleteRole(validatedInput);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete role",
    };
  }
};

export const getRoleByIdAction = async (input: GetRoleInput) => {
  try {
    const validatedInput = getRoleSchema.parse(input);

    const role = await roleService.getRoleById(validatedInput);

    if (!role) {
      return {
        success: false,
        error: "Role not found",
      };
    }

    return {
      success: true,
      data: role,
    };
  } catch (error) {
    console.error("Error getting role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get role",
    };
  }
};

export const getAllRolesAction = async () => {
  try {
    const roles = await roleService.getAllRoles();

    return {
      success: true,
      data: roles,
    };
  } catch (error) {
    console.error("Error getting roles:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get roles",
    };
  }
};

export const assignPermissionsToRoleAction = async (input: AssignPermissionsInput) => {
  try {
    const validatedInput = assignPermissionsSchema.parse(input);

    const role = await roleService.assignPermissionsToRole(validatedInput);

    return {
      success: true,
      data: role,
    };
  } catch (error) {
    console.error("Error assigning permissions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to assign permissions",
    };
  }
};

export const getRolePermissionsAction = async (roleId: string) => {
  try {
    const permissions = await roleService.getRolePermissions(roleId);

    return {
      success: true,
      data: permissions,
    };
  } catch (error) {
    console.error("Error getting role permissions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get permissions",
    };
  }
};
