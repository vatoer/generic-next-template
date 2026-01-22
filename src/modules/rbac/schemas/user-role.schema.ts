import { z } from "zod";

export const assignRoleToUserSchema = z.object({
  userId: z.string().cuid(),
  roleId: z.string().cuid(),
});

export const removeRoleFromUserSchema = z.object({
  userId: z.string().cuid(),
  roleId: z.string().cuid(),
});

export const getUserRolesSchema = z.object({
  userId: z.string().cuid(),
});

export const getUsersWithRoleSchema = z.object({
  roleId: z.string().cuid(),
});

export type AssignRoleToUserInput = z.infer<typeof assignRoleToUserSchema>;
export type RemoveRoleFromUserInput = z.infer<typeof removeRoleFromUserSchema>;
export type GetUserRolesInput = z.infer<typeof getUserRolesSchema>;
export type GetUsersWithRoleInput = z.infer<typeof getUsersWithRoleSchema>;
