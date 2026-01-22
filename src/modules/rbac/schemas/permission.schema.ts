import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z.string().min(2, "Permission name must be at least 2 characters").max(100),
  description: z.string().optional(),
  resource: z.string().min(1, "Resource is required"),
  action: z.string().min(1, "Action is required"),
});

export const updatePermissionSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2, "Permission name must be at least 2 characters").max(100).optional(),
  description: z.string().optional(),
  resource: z.string().min(1, "Resource is required").optional(),
  action: z.string().min(1, "Action is required").optional(),
});

export const deletePermissionSchema = z.object({
  id: z.string().cuid(),
});

export const getPermissionSchema = z.object({
  id: z.string().cuid(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type DeletePermissionInput = z.infer<typeof deletePermissionSchema>;
export type GetPermissionInput = z.infer<typeof getPermissionSchema>;
