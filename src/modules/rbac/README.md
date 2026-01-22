# RBAC Module

A comprehensive Role-Based Access Control (RBAC) system for managing users, roles, and permissions.

## Features

- ✅ Full CRUD operations for Roles and Permissions
- ✅ Role-Permission assignment
- ✅ User-Role assignment
- ✅ Permission checking utilities
- ✅ Protected component wrappers
- ✅ Server-side permission validation
- ✅ Admin UI for RBAC management
- ✅ Functional programming approach (no classes)
- ✅ Type-safe with Zod schemas

## Database Schema

### Models
- **Role**: Represents a role (e.g., Admin, User, Moderator)
- **Permission**: Represents a permission (e.g., users:create, posts:read)
- **RolePermission**: Junction table linking roles to permissions
- **UserRole**: Junction table linking users to roles

## Directory Structure

```
src/modules/rbac/
├── actions/                   # Server actions
│   ├── role.actions.ts
│   ├── permission.actions.ts
│   ├── user-role.actions.ts
│   └── index.ts
├── components/                # UI components
│   ├── create-role-dialog.tsx
│   ├── create-permission-dialog.tsx
│   ├── assign-permissions.tsx
│   ├── roles-table.tsx
│   ├── permissions-table.tsx
│   ├── protected.tsx
│   └── index.ts
├── schemas/                   # Zod validation schemas
│   ├── role.schema.ts
│   ├── permission.schema.ts
│   ├── user-role.schema.ts
│   └── index.ts
├── services/                  # Data access layer
│   ├── role.service.ts
│   ├── permission.service.ts
│   ├── user-role.service.ts
│   └── index.ts
└── lib/                       # Utilities
    └── permission-helper.ts
```

## Usage

### 1. Admin UI

Access the RBAC management interface at `/rbac`:

```tsx
// Navigate to http://localhost:3000/rbac
// - Manage roles
// - Manage permissions
// - Assign permissions to roles
```

### 2. Server-Side Permission Checking

```typescript
import { requirePermission, requireRole } from "@/modules/rbac/lib/permission-helper";

// In a server action or API route
export async function deleteUser(userId: string) {
  // Check if user has permission
  await requirePermission("users", "delete");
  
  // Your logic here
  await db.user.delete({ where: { id: userId } });
}

// Check for a specific role
export async function adminOnlyAction() {
  await requireRole("Admin");
  
  // Your admin logic here
}
```

### 3. Client-Side Protected Components

```tsx
"use client";

import { Protected, ProtectedByPermission, ProtectedByRole } from "@/modules/rbac/components";

function MyComponent({ userPermissions, userRoles }) {
  return (
    <div>
      {/* Simple protection */}
      <Protected hasPermission={true} fallback={<div>Access Denied</div>}>
        <button>Protected Action</button>
      </Protected>

      {/* Permission-based protection */}
      <ProtectedByPermission
        userPermissions={userPermissions}
        resource="users"
        action="create"
        fallback={<div>You cannot create users</div>}
      >
        <button>Create User</button>
      </ProtectedByPermission>

      {/* Role-based protection */}
      <ProtectedByRole
        userRoles={userRoles}
        role="Admin"
        fallback={<div>Admin only</div>}
      >
        <button>Admin Panel</button>
      </ProtectedByRole>
    </div>
  );
}
```

### 4. Using Actions

```typescript
import {
  createRoleAction,
  assignPermissionsToRoleAction,
  assignRoleToUserAction,
} from "@/modules/rbac/actions";

// Create a new role
const result = await createRoleAction({
  name: "Editor",
  description: "Can edit content",
  isSystem: false,
});

// Assign permissions to role
await assignPermissionsToRoleAction({
  roleId: "role_id",
  permissionIds: ["perm1", "perm2", "perm3"],
});

// Assign role to user
await assignRoleToUserAction({
  userId: "user_id",
  roleId: "role_id",
});
```

### 5. Using Services (Server-Side)

```typescript
import { getUserPermissions, checkUserHasPermission } from "@/modules/rbac/services";

// Get all permissions for a user
const permissions = await getUserPermissions("user_id");

// Check if user has specific permission
const canCreate = await checkUserHasPermission("user_id", "users", "create");

if (canCreate) {
  // Allow action
}
```

## Seeding

Run the RBAC seed to populate initial data:

```bash
pnpm db:seed:rbac
```

This creates:
- **Roles**: Admin, User, Moderator
- **Permissions**: CRUD operations for users, roles, permissions, and dashboard access
- **Assignments**: Appropriate permissions for each role

## Permission Naming Convention

Format: `Resource:Action`

Examples:
- `users:create` - Create users
- `users:read` - View users
- `users:update` - Edit users
- `users:delete` - Delete users
- `posts:publish` - Publish posts
- `dashboard:read` - View dashboard

## Best Practices

1. **Always validate on the server**: Never trust client-side permission checks alone
2. **Use descriptive permission names**: Make it clear what each permission allows
3. **Group related permissions**: Use resources to organize permissions logically
4. **Protect system roles**: Set `isSystem: true` for roles that shouldn't be deleted
5. **Use the Protected component**: Hide UI elements users don't have access to
6. **Check permissions early**: Validate permissions at the start of actions/routes

## API Reference

### Actions

All actions return `{ success: boolean, data?: any, error?: string }`

#### Role Actions
- `createRoleAction(input)` - Create a new role
- `updateRoleAction(input)` - Update a role
- `deleteRoleAction(input)` - Delete a role
- `getRoleByIdAction(input)` - Get role details
- `getAllRolesAction()` - List all roles
- `assignPermissionsToRoleAction(input)` - Assign permissions to a role

#### Permission Actions
- `createPermissionAction(input)` - Create a new permission
- `updatePermissionAction(input)` - Update a permission
- `deletePermissionAction(input)` - Delete a permission
- `getPermissionByIdAction(input)` - Get permission details
- `getAllPermissionsAction()` - List all permissions

#### User Role Actions
- `assignRoleToUserAction(input)` - Assign a role to a user
- `removeRoleFromUserAction(input)` - Remove a role from a user
- `getUserRolesAction(input)` - Get user's roles
- `getUserPermissionsAction(userId)` - Get user's permissions
- `checkUserHasPermissionAction(userId, resource, action)` - Check permission
- `checkUserHasRoleAction(userId, roleName)` - Check role

## Examples

### Example: Protecting a Page

```tsx
// app/(modules)/admin/page.tsx
import { requireRole } from "@/modules/rbac/lib/permission-helper";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  try {
    await requireRole("Admin");
  } catch {
    redirect("/unauthorized");
  }

  return <div>Admin Content</div>;
}
```

### Example: Conditional Rendering

```tsx
"use client";

import { useEffect, useState } from "react";
import { getUserPermissionsAction } from "@/modules/rbac/actions";
import { ProtectedByPermission } from "@/modules/rbac/components";

export function UserManagement({ userId }: { userId: string }) {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    getUserPermissionsAction(userId).then((result) => {
      if (result.success) {
        setPermissions(result.data);
      }
    });
  }, [userId]);

  return (
    <div>
      <ProtectedByPermission
        userPermissions={permissions}
        resource="users"
        action="create"
      >
        <button>Add User</button>
      </ProtectedByPermission>

      <ProtectedByPermission
        userPermissions={permissions}
        resource="users"
        action="delete"
      >
        <button>Delete User</button>
      </ProtectedByPermission>
    </div>
  );
}
```

## License

MIT
