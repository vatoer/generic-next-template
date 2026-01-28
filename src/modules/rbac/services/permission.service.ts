import { db } from "@/shared/db";
import type {
  CreatePermissionInput,
  UpdatePermissionInput,
  DeletePermissionInput,
  GetPermissionInput,
} from "../schemas";

export const createPermission = async (data: CreatePermissionInput) => {
  return await db.permission.create({
    data,
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
};

export const updatePermission = async ({ id, ...data }: UpdatePermissionInput) => {
  return await db.permission.update({
    where: { id },
    data,
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
};

export const deletePermission = async ({ id }: DeletePermissionInput) => {
  return await db.permission.delete({
    where: { id },
  });
};

export const getPermissionById = async ({ id }: GetPermissionInput) => {
  return await db.permission.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
};

export const getAllPermissions = async () => {
  return await db.permission.findMany({
    include: {
      _count: {
        select: {
          roles: true,
        },
      },
    },
    orderBy: [
      { resource: "asc" },
      { action: "asc" },
    ],
  });
};

export const getPermissionsByResource = async (resource: string) => {
  return await db.permission.findMany({
    where: { resource },
    orderBy: {
      action: "asc",
    },
  });
};

export const checkPermissionExists = async (
  resource: string,
  action: string,
  excludeId?: string
) => {
  const permission = await db.permission.findUnique({
    where: {
      resource_action: {
        resource,
        action,
      },
    },
  });

  if (excludeId && permission?.id === excludeId) {
    return false;
  }

  return !!permission;
};

export const getResources = async () => {
  const permissions = await db.permission.findMany({
    select: {
      resource: true,
    },
    distinct: ["resource"],
    orderBy: {
      resource: "asc",
    },
  });

  return permissions.map((p) => p.resource);
};
