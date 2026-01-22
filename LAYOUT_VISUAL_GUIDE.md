# Layout System - Visual Guide

## Page Structure

```
┌──────────────────────────────────────────────────────────┐
│                        TOPBAR                             │
│  Logo + App Name    Theme     Notifications    Profile    │
├──────────────────────────────────────────────────────────┤
│             │                                             │
│  SIDEBAR    │                                             │
│  (Collapse) │                     CONTENT AREA            │
│             │                                             │
│  • Dashboard│  Dashboard                                  │
│  • RBAC     │  ┌─────────────────────────────────────┐   │
│    - Roles  │  │ Welcome back, John!                 │   │
│    - Perms  │  │                                     │   │
│  • Users    │  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ │   │
│    - List   │  │ │Users │ │Roles │ │Perms │ │   │ │   │
│    - Create │  │ │ 2543 │ │  8   │ │ 42   │ │...│ │   │
│  • Settings │  │ └──────┘ └──────┘ └──────┘ └────┘ │   │
│             │  │                                     │   │
│             │  │ Getting Started                     │   │
│             │  │ [Content Cards]                     │   │
│             │  │                                     │   │
│             │  └─────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
(modules)/layout.tsx
    ├─ Auth Validation
    ├─ User Extraction
    │
    └─ AuthLayoutProvider
        │
        ├─ Load Permissions
        ├─ Load Roles
        │
        └─ AuthenticatedLayout
            │
            ├─ Topbar
            │   ├─ AppIdentity (Logo, Name, Theme)
            │   ├─ NotificationPopover
            │   ├─ TopbarMenu (More Options)
            │   └─ ProfileMenu
            │
            ├─ Main Content Wrapper
            │   ├─ Sidebar (Collapsible)
            │   │   └─ SidebarMenuItem (Recursive)
            │   │       └─ SubMenu Items
            │   │
            │   └─ Page Content
            │       └─ {children}
```

## Data Flow

```
User Request
    │
    ▼
(modules)/layout.tsx
    │
    ├─ Validate Session
    ├─ Get User Info
    │
    └─► AuthLayoutProvider (Client)
        │
        ├─ useQuery: getUserRoles
        ├─ useQuery: getUserPermissions
        │
        └─► AuthenticatedLayout
            │
            ├─ processMenus()
            │   ├─ filterByPermissions()
            │   ├─ sortByOrder()
            │   └─ removeEmpty()
            │
            └─► Render with Sidebar + Content
```

## Topbar Components

### Left Side (App Identity)
```
┌─────────────────────────┐
│ [Logo] App Name         │
│        Version          │
└─────────────────────────┘
```

### Right Side (User Actions)
```
┌──────────────────────────────────────┐
│ [🔔] [⋯] [Profile Menu ▼]           │
│      │    │ Profile                 │
│      │    │ Settings                │
│      │    │ Help                    │
│      │    │ ─────────               │
│      │    │ Sign Out                │
│      │    └────────────             │
│      │                              │
│      └─ More Actions                │
└──────────────────────────────────────┘
```

## Sidebar Navigation

### Collapsed
```
┌─────┐
│ ▶   │  ← Click to expand
│ [D] │  Dashboard
│ [R] │  RBAC
│ [U] │  Users
│ [S] │  Settings
└─────┘
```

### Expanded
```
┌──────────────────────┐
│ Menu           [◀]   │  ← Click to collapse
├──────────────────────┤
│ 📊 Dashboard         │
│ 🔐 RBAC Management   │
│   ├─ 👥 Roles       │
│   └─ 🔑 Permissions │
│ 👤 Users            │
│   ├─ 📋 All Users   │
│   └─ ➕ Create User │
│ ⚙️  Settings        │
│   ├─ 👤 Profile    │
│   └─ 🔒 Security   │
└──────────────────────┘
```

## Permission-Based Menu Filtering

### User with "admin:access"
```
✓ Dashboard (dashboard:read)
✓ RBAC Management (roles:read)
  ✓ Roles (roles:read)
  ✓ Permissions (permissions:read)
✓ Users (users:read)
  ✓ All Users (users:read)
  ✓ Create User (users:create)
✓ Settings (no permission required)
```

### User with "users:read" only
```
✗ Dashboard (requires dashboard:read)
✗ RBAC Management (requires roles:read)
✗ Users (filtered out - no create permission)
  ✗ All Users (filtered out)
  ✗ Create User (requires users:create)
✓ Settings (no permission required)
```

## State Management

```
AuthLayoutProvider
│
├─ State: permissions
│   └─ Array<{ resource: string, action: string }>
│
├─ State: roles
│   └─ Array<{ id: string, name: string }>
│
├─ State: isCollapsed
│   └─ boolean
│
└─ Effect: processMenus()
    ├─ filterByPermissions()
    ├─ sortByOrder()
    └─ setProcessedMenus()
```

## Request Flow: User Navigates to Dashboard

```
1. User clicks browser to /dashboard
   │
2. Route handler: (modules)/layout.tsx
   ├─ Validate session
   ├─ Extract user data
   └─ Pass to AuthLayoutProvider
   │
3. AuthLayoutProvider (Client)
   ├─ Query: getUserRolesAction(userId)
   ├─ Query: getUserPermissionsAction(userId)
   └─ Build permissionContext
   │
4. AuthenticatedLayout
   ├─ processMenus(navigationMenus, permissionContext)
   ├─ filterMenuByPermissions()
   └─ Generate sidebar menus
   │
5. Render Page
   ├─ Topbar: AppIdentity + Notifications + Profile
   ├─ Sidebar: Filtered menu items
   └─ Content: Dashboard page content
   │
6. Page Interactive
   ├─ Click menu item → Navigate
   ├─ Click collapse → Toggle sidebar width
   ├─ Click notifications → View popover
   ├─ Click profile → Show dropdown
   └─ Click theme → Change theme
```

## Responsive Behavior

### Desktop (lg+)
```
┌────────────────────────────────┐
│ Topbar (full width)            │
├──────────┬─────────────────────┤
│ Sidebar  │ Content             │
│ (w-64)   │ (flex-1)            │
│          │                     │
└──────────┴─────────────────────┘
```

### Tablet (md)
```
┌──────────────────────┐
│ Topbar               │
├──┬───────────────────┤
│ S│ Content           │
│ │ (Sidebar w-64)    │
│ │                   │
└──┴───────────────────┘
```

### Mobile (sm)
```
┌──────────────────┐
│ Topbar [≡]       │  ← Menu toggle
├──────────────────┤
│ Content          │
│ (fullwidth)      │
│                  │
└──────────────────┘
```

## Colors & Theme

### Light Mode
- Background: White (#FFFFFF)
- Sidebar: Light Gray (#F3F4F6)
- Topbar: White with subtle border
- Text: Dark Gray (#1F2937)

### Dark Mode
- Background: Dark (#0F172A)
- Sidebar: Slightly lighter (#1E293B)
- Topbar: Dark with subtle border
- Text: Light Gray (#E2E8F0)

## Animation Timings

- Sidebar collapse/expand: 300ms
- Menu item hover: 150ms
- Notification popover: 200ms
- Profile dropdown: 150ms
- Transitions: smooth ease-in-out

## Accessibility

- ✓ Semantic HTML structure
- ✓ ARIA labels on buttons
- ✓ Keyboard navigation support
- ✓ Focus indicators
- ✓ Color contrast ratios meet WCAG AA
- ✓ Screen reader friendly menus

## Performance Optimizations

1. **Memoized menu processing** - Only recalculate when permissions change
2. **Lazy loading** - Submenus expand on demand
3. **React Query caching** - Permissions cached with automatic invalidation
4. **Code splitting** - Components loaded separately
5. **Image optimization** - Avatar images optimized
6. **CSS-in-JS** - Tailwind for minimal bundle size
