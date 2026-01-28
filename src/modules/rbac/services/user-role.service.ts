import { db } from "@/shared/db";
import type {
  AssignRoleToUserInput,
  RemoveRoleFromUserInput,
  GetUserRolesInput,
  GetUsersWithRoleInput,
} from "../schemas";

export const assignRoleToUser = async ({ userId, roleId }: AssignRoleToUserInput) => {
  // Check if user already has this role
  const existing = await db.userRole.findUnique({
    where: {
      userId_roleId: {
        userId,
        roleId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return await db.userRole.create({
    data: {
      userId,
      roleId,
    },
    include: {
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const removeRoleFromUser = async ({
  userId,
  roleId,
}: RemoveRoleFromUserInput) => {
  return await db.userRole.delete({
    where: {
      userId_roleId: {
        userId,
        roleId,
      },
    },
  });
};

export const getUserRoles = async ({ userId }: GetUserRolesInput) => {
  const userRoles = await db.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  return userRoles.map((ur) => ur.role);
};

export const getUsersWithRole = async ({ roleId }: GetUsersWithRoleInput) => {
  const userRoles = await db.userRole.findMany({
    where: { roleId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return userRoles.map((ur) => ur.user);
};

export const getUserPermissions = async (userId: string) => {
  const userRoles = await db.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const permissions = userRoles.flatMap((ur) =>
    ur.role.permissions.map((rp) => rp.permission)
  );

  // Remove duplicates
  const uniquePermissions = Array.from(
    new Map(permissions.map((p) => [p.id, p])).values()
  );

  return uniquePermissions;
};

export const checkUserHasPermission = async (
  userId: string,
  resource: string,
  action: string
) => {
  const permissions = await getUserPermissions(userId);
  return permissions.some(
    (p) => p.resource === resource && p.action === action
  );
};

export const checkUserHasRole = async (userId: string, roleName: string) => {
  const userRole = await db.userRole.findFirst({
    where: {
      userId,
      role: {
        name: roleName,
      },
    },
  });

  return !!userRole;
};

export const assignMultipleRolesToUser = async (
  userId: string,
  roleIds: string[]
) => {
  const data = roleIds.map((roleId) => ({
    userId,
    roleId,
  }));

  await db.userRole.createMany({
    data,
    skipDuplicates: true,
  });

  return await getUserRoles({ userId });
};

export const removeAllRolesFromUser = async (userId: string) => {
  return await db.userRole.deleteMany({
    where: { userId },
  });
};
