# Layout Module

A comprehensive layout system with dynamic, permission-based sidebar navigation and a sticky topbar for authenticated users.

## Features

- ✅ Sticky topbar (always visible on top)
- ✅ App identity/logo on topbar left
- ✅ Notifications popover with badge counter
- ✅ User profile dropdown menu
- ✅ Minimal action menu (more options)
- ✅ Collapsible sidebar navigation
- ✅ Dynamic menu and submenu based on user permissions
- ✅ Programmatic menu configuration
- ✅ Permission-based menu visibility
- ✅ Nested menu support with cascading permissions
- ✅ Iconify support for menu icons
- ✅ Counter badges for menu items
- ✅ Active state highlighting
- ✅ Smooth animations and transitions
- ✅ Mobile-responsive design
- ✅ Theme toggle (light/dark/system)

## Directory Structure

```
src/modules/layout/
├── components/                # React components
│   ├── topbar.tsx             # Main topbar component
│   ├── app-identity.tsx       # App logo and branding
│   ├── notification-popover.tsx # Notification system
│   ├── profile-menu.tsx       # User profile dropdown
│   ├── topbar-menu.tsx        # Additional menu options
│   ├── sidebar.tsx            # Main sidebar component
│   ├── sidebar-menu-item.tsx  # Recursive menu item component
│   ├── authenticated-layout.tsx # Main layout wrapper
│   ├── auth-layout-provider.tsx # Client-side permission loader
│   └── index.ts
├── config/                    # Configuration files
│   ├── menu.ts                # Menu configuration
│   └── index.ts
├── lib/                       # Utility functions
│   ├── menu-utils.ts          # Menu processing utilities
│   └── index.ts
├── types/                     # TypeScript types
│   ├── navigation.ts          # Navigation types
│   └── index.ts
└── README.md
```

## Types

### RouteItem

Represents a menu item or route.

```typescript
interface RouteItem {
  name: string;                    // Unique identifier
  title: string;                   // Display title
  href: string;                    // Route path
  iconName: string;                // Iconify icon name (e.g., "lucide:home")
  order?: number;                  // Menu order (default: 999)
  counter?: number;                // Badge counter display
  permissions?: string[];          // Required permissions (e.g., ["users:read"])
  displayAsMenu?: boolean;         // Whether to display in menu (default: true)
  cascadePermissions?: boolean;    // Inherit parent permissions to children
  resources?: string[];            // Associated resources
  subs?: RouteItem[];              // Submenu items
}
```

### UserPermissionContext

```typescript
type UserPermissionContext = {
  permissions: Array<{ resource: string; action: string }>;
  roles: Array<{ id: string; name: string }>;
};
```

## Menu Configuration

Define your menu in `src/modules/layout/config/menu.ts`:

```typescript
export const navigationMenus: RouteItem[] = [
  {
    name: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    iconName: "lucide:layout-dashboard",
    order: 1,
    permissions: ["dashboard:read"],
  },
  {
    name: "users",
    title: "Users",
    href: "/users",
    iconName: "lucide:users",
    order: 2,
    permissions: ["users:read"],
    cascadePermissions: true,
    subs: [
      {
        name: "users-list",
        title: "All Users",
        href: "/users",
        iconName: "lucide:list",
        permissions: ["users:read"],
      },
      {
        name: "users-create",
        title: "Create User",
        href: "/users/create",
        iconName: "lucide:user-plus",
        permissions: ["users:create"],
      },
    ],
  },
];
```

## Usage

### 1. Setup Application Layout

Wrap your authenticated pages with the layout provider:

```tsx
// app/(modules)/layout.tsx
import { auth } from "@/utils/auth";
import { AuthLayoutProvider } from "@/modules/layout/components";
import { redirect } from "next/navigation";

export default async function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    id: session.user.id || "",
    name: session.user.name,
    email: session.user.email || "",
    image: session.user.image,
  };

  return (
    <AuthLayoutProvider user={user}>
      {children}
    </AuthLayoutProvider>
  );
}
```

## Topbar Components

### 1. AppIdentity

Displays app logo, name, and theme toggle.

```tsx
<AppIdentity 
  appName="My App"
  appLogo={<CustomLogo />}
  showBrand={true}
/>
```

**Props:**
- `appName?: string` - Application name
- `appLogo?: React.ReactNode` - Custom logo component
- `showBrand?: boolean` - Show brand text

### 2. NotificationPopover

Displays notifications with badge counter.

```tsx
<NotificationPopover
  notifications={[
    {
      id: "1",
      title: "Welcome",
      description: "You have a new message",
      timestamp: new Date(),
      read: false,
      type: "info",
      action: {
        label: "View",
        onClick: () => {}
      }
    }
  ]}
  onDismiss={(id) => console.log("Dismissed:", id)}
  onViewAll={() => navigate("/notifications")}
/>
```

**Notification Types:**
- `id: string` - Unique identifier
- `title: string` - Notification title
- `description?: string` - Optional description
- `timestamp: Date` - Timestamp
- `read: boolean` - Read status
- `type?: "info" | "success" | "warning" | "error"` - Type
- `action?: { label, onClick }` - Optional action button

### 3. ProfileMenu

User profile dropdown with logout, settings, and help.

```tsx
<ProfileMenu
  user={{
    name: "John Doe",
    email: "john@example.com",
    image: "/avatar.jpg"
  }}
  onLogout={async () => await signOut()}
  onSettings={() => navigate("/settings")}
  onHelp={() => navigate("/help")}
/>
```

### 4. TopbarMenu

Custom menu for additional actions.

```tsx
<TopbarMenu 
  actions={[
    {
      id: "export",
      label: "Export",
      icon: <Download />,
      onClick: () => {}
    },
    {
      id: "print",
      label: "Print",
      onClick: () => {}
    }
  ]}
/>
```

### 5. Topbar

Complete topbar component with all elements.

```tsx
<Topbar
  user={user}
  appName="Dashboard"
  notifications={notifications}
  onNotificationDismiss={(id) => {}}
  onNotificationViewAll={() => {}}
  onLogout={async () => {}}
  onSettings={() => {}}
  onHelp={() => {}}
  topbarActions={[]}
/>
```

## Customizing the Topbar

Pass custom props to `AuthenticatedLayout`:

```tsx
<AuthLayoutProvider 
  user={user}
  appName="My Custom App"
  appLogo={<MyLogo />}
  notifications={notifications}
  onNotificationViewAll={() => navigate("/notifications")}
  topbarMenuActions={[
    {
      id: "feedback",
      label: "Send Feedback",
      onClick: () => {}
    }
  ]}
>
  {children}
</AuthLayoutProvider>
```
    image: session.user.image,
  };

  return (
    <AuthLayoutProvider user={user}>
      {children}
    </AuthLayoutProvider>
  );
}
```

### 2. Add Icons

The layout uses Iconify for icons. Install the Iconify library:

```bash
npm install @iconify/react
```

Alternatively, add the Iconify CDN to your HTML:

```html
<script src="https://code.iconify.design/iconify-icon/1.0.8/iconify-icon.min.js"></script>
```

### 3. Use Specific Layouts

For pages that shouldn't use the sidebar layout:

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

### 4. Customize Menu

Update `src/modules/layout/config/menu.ts` to add your own menu items:

```typescript
{
  name: "settings",
  title: "Settings",
  href: "/settings",
  iconName: "lucide:settings",
  order: 100,
  subs: [
    {
      name: "profile",
      title: "Profile",
      href: "/settings/profile",
      iconName: "lucide:user",
      permissions: [],
    },
  ],
}
```

## Permission System

Menus are automatically filtered based on user permissions:

1. **Permission Format**: `resource:action` (e.g., `users:create`)
2. **Multiple Permissions**: All permissions must be satisfied
3. **Cascade Permissions**: If enabled, child items inherit parent permissions
4. **No Permissions**: Menu item is always visible if `permissions` is empty

### Example:

```typescript
{
  name: "admin",
  title: "Admin",
  href: "/admin",
  iconName: "lucide:shield",
  permissions: ["admin:access"], // Only visible to admin
  cascadePermissions: true,       // Children require this permission
  subs: [
    {
      name: "users",
      title: "Users",
      href: "/admin/users",
      iconName: "lucide:users",
      permissions: ["users:manage"],
    },
  ],
}
```

## Utility Functions

### filterMenuByPermissions

Filter menus based on user permissions:

```typescript
import { filterMenuByPermissions } from "@/modules/layout/lib";

const visibleMenus = filterMenuByPermissions(
  navigationMenus,
  permissionContext
);
```

### shouldDisplayMenu

Check if a single menu item should be displayed:

```typescript
import { shouldDisplayMenu } from "@/modules/layout/lib";

const show = shouldDisplayMenu(menuItem, permissionContext);
```

### hasRequiredPermissions

Check if user has all required permissions:

```typescript
import { hasRequiredPermissions } from "@/modules/layout/lib";

const canAccess = hasRequiredPermissions(
  ["users:read", "users:create"],
  userPermissions
);
```

### sortMenuByOrder

Sort menus by order property:

```typescript
import { sortMenuByOrder } from "@/modules/layout/lib";

const sortedMenus = sortMenuByOrder(menus);
```

### processMenus

Complete menu processing (filter + sort):

```typescript
import { processMenus } from "@/modules/layout/lib";

const finalMenus = processMenus(navigationMenus, permissionContext);
```

## Styling

The layout uses shadcn/ui components. Customize by modifying:

- Sidebar width: `w-64` (collapsed: `w-16`)
- Colors: Update Tailwind config
- Spacing: Modify padding values

## Performance

- Menus are processed on the client-side in `AuthLayoutProvider`
- React Query caches permission data with automatic invalidation
- Lazy loading of submenu items on expand
- Memoized processing to prevent unnecessary re-renders

## Examples

### Dynamic Menu with Counters

```typescript
{
  name: "notifications",
  title: "Notifications",
  href: "/notifications",
  iconName: "lucide:bell",
  counter: unreadCount, // Shows badge
  permissions: ["notifications:read"],
}
```

### Hidden Menu Item

```typescript
{
  name: "debug",
  title: "Debug",
  href: "/debug",
  iconName: "lucide:bug",
  displayAsMenu: false, // Won't appear in menu
}
```

### Multi-level Nesting

```typescript
{
  name: "settings",
  title: "Settings",
  href: "/settings",
  iconName: "lucide:settings",
  subs: [
    {
      name: "account",
      title: "Account",
      href: "/settings/account",
      iconName: "lucide:user",
      subs: [
        {
          name: "profile",
          title: "Profile",
          href: "/settings/account/profile",
          iconName: "lucide:id-card",
        },
      ],
    },
  ],
}
```

## Best Practices

1. **Define permissions clearly**: Use consistent resource:action naming
2. **Keep menu structure flat**: Avoid deep nesting (2-3 levels max)
3. **Use meaningful icons**: Choose icons that represent the feature
4. **Test permissions**: Verify menu filtering with different user roles
5. **Cache strategically**: React Query handles permission caching
6. **Mobile consideration**: Sidebar collapses on small screens

## Troubleshooting

### Menus not showing
- Check user permissions: `console.log(permissionContext)`
- Verify permission format: `resource:action`
- Ensure menu has `displayAsMenu: true`

### Icons not displaying
- Verify Iconify is loaded
- Check icon name format: `lucide:icon-name`
- Use [Iconify search](https://iconify.design/) to find icons

### Permission not working
- Ensure permission is granted to user's role
- Check RBAC module: `/rbac` admin page
- Verify cascadePermissions logic

## License

MIT
