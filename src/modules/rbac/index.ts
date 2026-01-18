/**
 * RBAC (Role-Based Access Control) Module
 *
 * Complete role and permission management system following clean architecture.
 *
 * Architecture:
 * - schema.ts: Zod validation and DTOs
 * - services/: Business logic layer (Permission, Role, Profile, ProfileRole)
 * - actions.ts: Server-side actions for client interaction
 * - components/: React components for UI (TBD)
 *
 * Data Model:
 * User (1) → Profiles (N) → ProfileRoles (N) ← Roles (N) ← Permissions (N)
 *
 * Features:
 * ✓ Permission management (CRUD)
 * ✓ Role creation with permission assignment
 * ✓ Multiple profiles per user
 * ✓ Flexible role assignment via profiles
 * ✓ Permission aggregation across roles
 * ✓ Audit logging (userId tracking)
 * ✓ Error handling and validation
 * ✓ Duplicate prevention
 * ✓ Cascade deletion
 *
 * Usage:
 * // Server-side (in Server Components or Actions)
 * import { permissionService, roleService } from '@/modules/rbac/services'
 * const permissions = await permissionService.list()
 * const role = await roleService.get(roleId)
 *
 * // Client-side (in Client Components)
 * 'use client'
 * import { createRoleAction } from '@/modules/rbac/actions'
 * const result = await createRoleAction({ name: 'Admin', ... })
 */

export * from "./schema";
export * from "./services";
export * from "./actions";
