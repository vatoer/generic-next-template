"use server";

import {
  createPermissionSchema,
  updatePermissionSchema,
  deletePermissionSchema,
  getPermissionSchema,
  type CreatePermissionInput,
  type UpdatePermissionInput,
  type DeletePermissionInput,
  type GetPermissionInput,
} from "../schemas";
import * as permissionService from "../services/permission.service";

export const createPermissionAction = async (input: CreatePermissionInput) => {
  try {
    const validatedInput = createPermissionSchema.parse(input);

    const exists = await permissionService.checkPermissionExists(
      validatedInput.resource,
      validatedInput.action
    );
    if (exists) {
      return {
        success: false,
        error: "A permission with this resource and action already exists",
      };
    }

    const permission = await permissionService.createPermission(validatedInput);

    return {
      success: true,
      data: permission,
    };
  } catch (error) {
    console.error("Error creating permission:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create permission",
    };
  }
};

export const updatePermissionAction = async (input: UpdatePermissionInput) => {
  try {
    const validatedInput = updatePermissionSchema.parse(input);

    if (validatedInput.resource && validatedInput.action) {
      const exists = await permissionService.checkPermissionExists(
        validatedInput.resource,
        validatedInput.action,
        validatedInput.id
      );
      if (exists) {
        return {
          success: false,
          error: "A permission with this resource and action already exists",
        };
      }
    }

    const permission = await permissionService.updatePermission(validatedInput);

    return {
      success: true,
      data: permission,
    };
  } catch (error) {
    console.error("Error updating permission:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update permission",
    };
  }
};

export const deletePermissionAction = async (input: DeletePermissionInput) => {
  try {
    const validatedInput = deletePermissionSchema.parse(input);

    await permissionService.deletePermission(validatedInput);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting permission:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete permission",
    };
  }
};

export const getPermissionByIdAction = async (input: GetPermissionInput) => {
  try {
    const validatedInput = getPermissionSchema.parse(input);

    const permission = await permissionService.getPermissionById(validatedInput);

    if (!permission) {
      return {
        success: false,
        error: "Permission not found",
      };
    }

    return {
      success: true,
      data: permission,
    };
  } catch (error) {
    console.error("Error getting permission:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get permission",
    };
  }
};

export const getAllPermissionsAction = async () => {
  try {
    const permissions = await permissionService.getAllPermissions();

    return {
      success: true,
      data: permissions,
    };
  } catch (error) {
    console.error("Error getting permissions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get permissions",
    };
  }
};

export const getPermissionsByResourceAction = async (resource: string) => {
  try {
    const permissions = await permissionService.getPermissionsByResource(resource);

    return {
      success: true,
      data: permissions,
    };
  } catch (error) {
    console.error("Error getting permissions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get permissions",
    };
  }
};

export const getResourcesAction = async () => {
  try {
    const resources = await permissionService.getResources();

    return {
      success: true,
      data: resources,
    };
  } catch (error) {
    console.error("Error getting resources:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get resources",
    };
  }
};
