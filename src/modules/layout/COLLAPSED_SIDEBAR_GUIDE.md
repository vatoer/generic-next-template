# Collapsed Sidebar Menu - Implementation Guide

## Overview

The sidebar now displays icons when collapsed, replacing the full menu text with icon buttons and tooltips for better UX.

## Features

### Expanded View (w-64)
```
┌──────────────────┐
│ Menu        [◀]  │  ← Click to collapse
├──────────────────┤
│ 📊 Dashboard     │
│ 🔐 RBAC          │
│   ├─ 👥 Roles   │
│   └─ 🔑 Permissions
│ 👤 Users        │
│   ├─ 📋 All Users
│   └─ ➕ Create User
│ ⚙️  Settings    │
└──────────────────┘
```

### Collapsed View (w-16)
```
┌──┐
│[◀]│  ← Click to expand
├──┤
│📊│  ← Hover for tooltip: "Dashboard"
│🔐│  ← Hover for tooltip: "RBAC Management" + submenu items
│👤│  ← Hover for tooltip: "Users" + submenu items
│⚙️ │  ← Hover for tooltip: "Settings"
└──┘
```

## Behavior

### Main Menu Items

**Expanded**:
- Full text label with icon
- Clickable to navigate directly
- Collapsible if has submenus (shows chevron)

**Collapsed**:
- Icon only button centered in sidebar
- Hover shows tooltip with full menu name
- Links directly to href if no submenus
- Shows tooltip with submenu names if has submenus

### Submenu Items

**Expanded**:
- Indented with proper hierarchy
- Full text labels with icons
- Nested under parent menu with expand/collapse arrow

**Collapsed** (Parent Collapsed):
- Parent items show icons with tooltip listing all submenus
- Submenus not visible until parent expanded
- Parent still navigable if it has an href

## Components Updated

### Sidebar Component
**Location**: `src/modules/layout/components/sidebar.tsx`

**Changes**:
- Added `Icon` import from `@iconify/react`
- Added `Tooltip` wrapper for menu items
- Updated collapsed view to use `TooltipProvider`
- Passes `isCollapsed` state to `SidebarMenuItem`

**Key Code**:
```tsx
{internalCollapsed ? (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" className="h-9 w-9 mx-auto">
        <Icon icon={menu.iconName} className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="right" className="ml-2">
      {menu.title}
    </TooltipContent>
  </Tooltip>
) : (
  <SidebarMenuItem ... isCollapsed={isCollapsed} />
)}
```

### SidebarMenuItem Component
**Location**: `src/modules/layout/components/sidebar-menu-item.tsx`

**Changes**:
- Added `isCollapsed` prop
- Added `Tooltip` import
- New logic branches for collapsed vs expanded states
- Tooltips show menu name and submenu names when collapsed

**Key Logic**:
```tsx
// Collapsed with submenus - show tooltip listing subs
if (isCollapsed && hasSubs) {
  return (
    <Tooltip>
      <TooltipContent>
        <div>{item.title}</div>
        <div>{item.subs.map(s => s.title).join(", ")}</div>
      </TooltipContent>
    </Tooltip>
  );
}

// Collapsed without submenus - simple icon
if (isCollapsed && !hasSubs) {
  return <Tooltip with icon link />
}

// Expanded - full menu rendering
if (hasSubs) { /* render Collapsible */ }
```

## Tooltip Behavior

### Delay
- 300ms delay before tooltip appears
- Prevents tooltip spam while scrolling

### Position
- `side="right"` - Tooltip appears to the right of icon
- `className="ml-2"` - Small margin between icon and tooltip

### Content

**Single Menu Item**:
```
Dashboard
```

**Menu with Submenus**:
```
RBAC Management
Roles, Permissions
```

## Styling

### Collapsed Buttons
- `h-9 w-9` - Square icon button
- `mx-auto` - Center horizontally in sidebar
- `variant="ghost"` - Transparent background, shows on hover

### Sidebar Width
- Expanded: `w-64` (256px)
- Collapsed: `w-16` (64px)
- Transition: `duration-300` for smooth animation

## Accessibility

- ✅ Tooltips provide context for icon-only buttons
- ✅ Semantic Link elements for navigation
- ✅ Button components for interactive elements
- ✅ Proper ARIA labels via Radix UI components
- ✅ Keyboard navigation support (Tab, Enter, Space)

## Testing

### Test Cases

1. **Collapse/Expand Toggle**
   - Click chevron button
   - Sidebar width should animate from w-64 to w-16
   - Menu text disappears, only icons show

2. **Collapsed Icon Tooltips**
   - Collapse sidebar
   - Hover over each icon
   - Tooltip should appear after 300ms
   - Tooltip should show menu name
   - For items with submenus, show submenu names

3. **Navigation from Collapsed**
   - Click an icon without submenus
   - Should navigate to that page
   - Sidebar stays collapsed

4. **Submenu with Collapsed Sidebar**
   - Hover over submenu item icon
   - Tooltip shows parent and all children
   - Cannot expand submenus while sidebar collapsed
   - Clicking should navigate to parent href if available

5. **Persistence**
   - Collapse sidebar
   - Navigate to different pages
   - Sidebar should remain collapsed
   - Refresh page - collapsed state persists (if stored in state)

### Manual Testing Steps

1. Visit `/dashboard` (authenticated page)
2. Click the collapse button (chevron) in topbar sidebar header
3. Verify:
   - Sidebar width animates to narrow (w-16)
   - Only icons visible
   - Collapse button changes to expand chevron
4. Hover over each icon
5. Verify tooltips appear with correct content
6. Click an icon without submenu (e.g., Dashboard)
7. Verify navigation works
8. Click expand button
9. Verify sidebar expands back to full width with menu text

## Future Enhancements

1. **Persistent State**: Save collapsed state to localStorage
2. **Keyboard Shortcut**: Add Ctrl+B to toggle collapse
3. **Menu Badges**: Show badge counts in collapsed view (counter tooltip)
4. **Active Indicator**: Show active menu item with highlight border on collapsed view
5. **Drag-to-Expand**: Allow drag from edge to expand temporarily
6. **Mobile Support**: Auto-collapse on mobile devices

## Performance Notes

- Tooltip Provider has 300ms delay (prevents tooltip spam)
- No re-renders on tooltip hover
- CSS transitions on Sidebar width (GPU accelerated)
- Memoization on active state calculations
