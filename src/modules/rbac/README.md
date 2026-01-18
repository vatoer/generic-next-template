# RBAC Module Documentation

## Overview

Complete Role-Based Access Control (RBAC) system following clean architecture principles with four service layers for managing permissions, roles, profiles, and their relationships.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Components                         │
│              (TanStack Table, React Hook Form)               │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Server Actions (actions.ts)               │
│         ├─ createPermissionAction                            │
│         ├─ createRoleAction                                  │
│         ├─ assignRoleToProfileAction                         │
│         └─ getPermissionsAction (read-only)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Service Layer (services/)                  │
│         ├─ PermissionService                                 │
│         ├─ RoleService                                       │
│         ├─ ProfileService                                    │
│         └─ ProfileRoleService                                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Prisma ORM                                │
│              (Database Operations)                           │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

```
User (1:N) → Profile (1:N) → ProfileRole (N:N) ← Role (1:N) ← Permission
  ├─ id                 ├─ id            ├─ profileId        ├─ id
  ├─ email              ├─ userId        ├─ roleId           ├─ name
  ├─ name               ├─ name          ├─ assignedAt       ├─ resource
  └─ ...                ├─ description   ├─ assignedBy       ├─ action
                        ├─ createdBy     └─ ...              └─ description
                        └─ ...
```

### Key Relationships

- **User → Profile**: One user can have multiple profiles (e.g., "Admin", "Developer", "Reviewer")
- **Profile → ProfileRole**: One profile can have multiple roles
- **ProfileRole → Role**: Many profiles can share the same role
- **Role → Permission**: One role can have multiple permissions
- **Permission**: Atomic units like "users:create", "posts:delete"

## Services

### PermissionService

Manages system permissions with resource:action pattern.

```typescript
// Create permission
const permission = await permissionService.create(
  {
    name: "Create User",
    resource: "users",
    action: "create",
    description: "Allows creating new users"
  },
  userId
);

// List permissions
const permissions = await permissionService.list();

// Get by resource
const userPermissions = await permissionService.getByResource("users");

// Get all resources
const resources = await permissionService.getResources();
```

### RoleService

Manages roles and their permission assignments.

```typescript
// Create role with permissions
const role = await roleService.create(
  {
    name: "Admin",
    description: "Full system access",
    permissionIds: [perm1Id, perm2Id]
  },
  userId
);

// Assign permissions to role
const updated = await roleService.assignPermissions(
  roleId,
  [perm1Id, perm2Id, perm3Id],
  userId
);

// Check permission
const hasAccess = await roleService.hasPermission(roleId, permId);

// Get profiles with role
const profiles = await roleService.getProfilesByRole(roleId);
```

### ProfileService

Manages user profiles and role set contexts.

```typescript
// Create profile
const profile = await profileService.create(
  {
    userId: "user-123",
    name: "Admin Profile",
    description: "Full system access profile"
  },
  creatorId
);

// Get user's profiles
const profiles = await profileService.getByUser(userId);

// Get all permissions for profile
const permissions = await profileService.getPermissions(profileId);

// Check role in profile
const hasRole = await profileService.hasRole(profileId, roleId);

// Check permission in profile
const hasPermission = await profileService.hasPermission(profileId, permId);
```

### ProfileRoleService

Manages profile-to-role assignments (junction table).

```typescript
// Assign role to profile
const assignment = await profileRoleService.assign(
  { profileId, roleId },
  userId
);

// Revoke role from profile
await profileRoleService.revoke(profileId, roleId, userId);

// Replace all roles (bulk update)
const roles = await profileRoleService.replaceRoles(
  profileId,
  [roleId1, roleId2],
  userId
);

// Check multiple permissions
const permissions = await profileRoleService.checkPermissions(
  profileId,
  [perm1Id, perm2Id, perm3Id]
);
// Returns: { [permId]: boolean, ... }
```

## Server Actions

All server actions require authentication (session). They follow the pattern:

```typescript
export async function actionName(params) {
  try {
    const session = await getSession();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    const result = await service.method(params, session.user.id);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Available Actions

**Permission Actions:**
- `createPermissionAction(input: PermissionDTO)`
- `updatePermissionAction(id, input)`
- `deletePermissionAction(id)`

**Role Actions:**
- `createRoleAction(input: RoleDTO)`
- `updateRoleAction(id, input)`
- `deleteRoleAction(id)`
- `assignRolePermissionsAction(roleId, permissionIds)`

**Profile Actions:**
- `createProfileAction(input: ProfileDTO)`
- `updateProfileAction(id, input)`
- `deleteProfileAction(id)`

**ProfileRole Actions:**
- `assignRoleToProfileAction(input: ProfileRoleDTO)`
- `revokeRoleFromProfileAction(profileId, roleId)`
- `replaceProfileRolesAction(profileId, roleIds)`

**Query Actions:**
- `getPermissionsAction()`
- `getRolesAction()`
- `getProfilesAction()`
- `getUserProfilesAction(userId)`
- `getProfileRolesAction(profileId)`

## Usage Examples

### In Server Components

```typescript
import { permissionService, roleService } from "@/modules/rbac/services";

export default async function RolesPage() {
  const roles = await roleService.list();
  const permissions = await permissionService.list();

  return <RolesList roles={roles} permissions={permissions} />;
}
```

### In Client Components

```typescript
"use client";
import { createRoleAction } from "@/modules/rbac/actions";
import { useTransition } from "react";

export function CreateRoleForm() {
  const [pending, startTransition] = useTransition();

  async function handleSubmit(data) {
    startTransition(async () => {
      const result = await createRoleAction(data);
      if (result.success) {
        // Success
      } else {
        // Handle error
        console.error(result.error);
      }
    });
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### In Middleware (Future)

```typescript
import { profileService } from "@/modules/rbac/services";

export async function checkPermission(profileId, permissionId) {
  return await profileService.hasPermission(profileId, permissionId);
}
```

## Error Handling

All services include:
- **Validation**: Zod schema validation at entry points
- **Existence Checks**: Verify resources exist before operations
- **Duplicate Prevention**: Check for name/constraint duplicates
- **Cascade Handling**: Safe deletion with relationship cleanup
- **Console Logging**: Structured logging for debugging
- **Error Propagation**: Meaningful error messages

## Best Practices

### ✓ DO

- Use server actions for mutations from client
- Validate input with Zod schemas
- Check session before operations
- Log important actions with userId
- Use transactions for multi-step operations
- Aggregate permissions from profiles for display

### ✗ DON'T

- Call services directly from client components
- Skip authentication checks
- Create circular role references
- Delete users' only profiles
- Assume database state without verification

## Future Enhancements

- [ ] Permission matrix UI component (role ↔ permissions grid)
- [ ] Role hierarchy (parent/child roles)
- [ ] Permission inheritance
- [ ] Audit log table with full history
- [ ] Soft deletes for compliance
- [ ] Batch operations (import/export)
- [ ] Role templates
- [ ] Time-based role assignments
- [ ] API keys with permission scoping

## Testing

```typescript
// Mock service for testing
const mockPermissionService = {
  create: jest.fn(),
  list: jest.fn(),
  // ...
};

// Test server action
await createRoleAction({
  name: "Test Role",
  permissionIds: ["perm-1", "perm-2"]
});
```

## See Also

- [/docs/agent-context/instruction.md](../../docs/agent-context/instruction.md) - Architecture guide
- [/src/modules/iam](../iam) - Authentication module
- [/prisma/schema.prisma](../../prisma/schema.prisma) - Database schema
