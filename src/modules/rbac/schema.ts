import { z } from "zod";

/**
 * RBAC Schema Definitions
 * Zod schemas for validation and type inference
 */

// ============================================================================
// Permission Schema
// ============================================================================
export const permissionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Permission name must be at least 2 characters"),
  resource: z.string().min(1, "Resource is required"),
  action: z
    .enum(["create", "read", "update", "delete"])
    .or(z.string().min(1, "Action is required")),
  description: z.string().optional(),
});

export type PermissionDTO = z.infer<typeof permissionSchema>;

// ============================================================================
// Role Schema
// ============================================================================
export const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).default([]),
});

export type RoleDTO = z.infer<typeof roleSchema>;

// ============================================================================
// Profile Schema
// ============================================================================
export const profileSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(2, "Profile name must be at least 2 characters"),
  description: z.string().optional(),
});

export type ProfileDTO = z.infer<typeof profileSchema>;

// ============================================================================
// ProfileRole Schema (Junction Table)
// ============================================================================
export const profileRoleSchema = z.object({
  profileId: z.string().min(1, "Profile ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
});

export type ProfileRoleDTO = z.infer<typeof profileRoleSchema>;

// ============================================================================
// Response Types
// ============================================================================
export type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
