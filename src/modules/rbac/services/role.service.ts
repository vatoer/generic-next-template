import { db } from "@/utils/db";
import type {
  CreateRoleInput,
  UpdateRoleInput,
  DeleteRoleInput,
  GetRoleInput,
  AssignPermissionsInput,
} from "../schemas";

export const createRole = async (data: CreateRoleInput) => {
  return await db.role.create({
    data,
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

export const updateRole = async ({ id, ...data }: UpdateRoleInput) => {
  return await db.role.update({
    where: { id },
    data,
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

export const deleteRole = async ({ id }: DeleteRoleInput) => {
  // Check if role is system role
  const role = await db.role.findUnique({
    where: { id },
  });

  if (role?.isSystem) {
    throw new Error("System roles cannot be deleted");
  }

  return await db.role.delete({
    where: { id },
  });
};

export const getRoleById = async ({ id }: GetRoleInput) => {
  return await db.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      userRoles: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

export const getAllRoles = async () => {
  return await db.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          userRoles: true,
          permissions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const assignPermissionsToRole = async ({
  roleId,
  permissionIds,
}: AssignPermissionsInput) => {
  // Remove existing permissions
  await db.rolePermission.deleteMany({
    where: { roleId },
  });

  // Add new permissions
  const rolePermissions = permissionIds.map((permissionId) => ({
    roleId,
    permissionId,
  }));

  await db.rolePermission.createMany({
    data: rolePermissions,
    skipDuplicates: true,
  });

  return await getRoleById({ id: roleId });
};

export const getRolePermissions = async (roleId: string) => {
  const rolePermissions = await db.rolePermission.findMany({
    where: { roleId },
    include: {
      permission: true,
    },
  });

  return rolePermissions.map((rp) => rp.permission);
};

export const checkRoleExists = async (name: string, excludeId?: string) => {
  const role = await db.role.findUnique({
    where: { name },
  });

  if (excludeId && role?.id === excludeId) {
    return false;
  }

  return !!role;
};
