import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters").max(50),
  description: z.string().optional(),
  isSystem: z.boolean().default(false),
});

export const updateRoleSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2, "Role name must be at least 2 characters").max(50).optional(),
  description: z.string().optional(),
});

export const deleteRoleSchema = z.object({
  id: z.string().cuid(),
});

export const getRoleSchema = z.object({
  id: z.string().cuid(),
});

export const assignPermissionsSchema = z.object({
  roleId: z.string().cuid(),
  permissionIds: z.array(z.string().cuid()),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type DeleteRoleInput = z.infer<typeof deleteRoleSchema>;
export type GetRoleInput = z.infer<typeof getRoleSchema>;
export type AssignPermissionsInput = z.infer<typeof assignPermissionsSchema>;
