# Theme System Documentation

## Overview

The application implements a complete dark/light theme system using:
- **next-themes**: Handles theme switching with localStorage persistence
- **Tailwind CSS**: Dark mode styling with CSS variables
- **React Context**: Theme state management across the application

## Components

### AppThemeProvider
**Location**: `src/modules/layout/components/theme-provider.tsx`

Wraps the entire application to enable theme switching functionality.

**Props**:
- `attribute`: CSS class attribute to watch (default: "class")
- `defaultTheme`: Initial theme - "light", "dark", or "system" (default: "system")
- `enableSystem`: Allow system preference detection (default: true)
- `storageKey`: localStorage key for theme preference (default: "app-theme")

**Usage**:
```tsx
import { AppThemeProvider } from "@/modules/layout/components";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppThemeProvider>
          {children}
        </AppThemeProvider>
      </body>
    </html>
  );
}
```

### AppIdentity Theme Toggle
**Location**: `src/modules/layout/components/app-identity.tsx`

The topbar's app identity section includes the theme toggle button.

**Features**:
- Three theme options: Light, Dark, System
- Icon animation: Sun (light) → Moon (dark)
- Hidden on mobile, visible on desktop (sm:)
- Dropdown menu for easy selection

**Usage**: Already integrated in the AppIdentity component - no setup needed.

## Theme Implementation

### Root HTML Attribute
The `<html>` element gets the `dark` class when dark mode is active:
```html
<!-- Light Mode -->
<html lang="en">

<!-- Dark Mode -->
<html lang="en" class="dark">
```

### CSS Variables
Theme colors are defined as CSS variables in `src/app/globals.css`:

**Light Mode** (`:root`):
- `--background`: White (`oklch(1 0 0)`)
- `--foreground`: Almost black (`oklch(0.145 0 0)`)
- `--primary`: Dark neutral (`oklch(0.205 0 0)`)
- etc.

**Dark Mode** (`.dark`):
- `--background`: Almost black (`oklch(0.145 0 0)`)
- `--foreground`: White (`oklch(0.985 0 0)`)
- `--primary`: Light (`oklch(0.922 0 0)`)
- etc.

### Color Spaces
All colors use **OKLch color space** for:
- Better perceptual uniformity
- Accessible contrast ratios
- Smooth transitions between themes

Format: `oklch(lightness saturation hue)`
- Lightness: 0-1 (0=black, 1=white)
- Saturation: 0-0.4 (0=gray, 0.4=full saturation)
- Hue: 0-360 (color wheel angle)

## Using Theme in Components

### With useTheme Hook
```tsx
"use client";

import { useTheme } from "next-themes";

export function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      Current theme: {theme}
      <button onClick={() => setTheme("dark")}>Dark Mode</button>
      <button onClick={() => setTheme("light")}>Light Mode</button>
      <button onClick={() => setTheme("system")}>System</button>
    </div>
  );
}
```

### With Tailwind CSS Classes
```tsx
// Automatically switches between light and dark
<div className="bg-white dark:bg-slate-900">
  Content that changes on theme switch
</div>

<span className="text-black dark:text-white">
  Text color based on theme
</span>

// Icon animations
<Sun className="rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
<Moon className="rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
```

## Custom CSS
For components requiring custom dark mode styles:

```css
/* Light mode (default) */
.custom-element {
  background-color: var(--background);
  color: var(--foreground);
}

/* Dark mode */
.dark .custom-element {
  background-color: var(--background);
  color: var(--foreground);
}
```

## Storage Behavior

### localStorage Key
Theme preference is saved to `app-theme` key:
```javascript
// User selects "dark"
localStorage.setItem("app-theme", "dark");

// User selects "system"
localStorage.setItem("app-theme", "system");

// User selects "light"
localStorage.setItem("app-theme", "light");
```

### Theme Resolution Order
1. Check localStorage for saved preference
2. If "system" is selected, use OS preference (prefers-color-scheme)
3. Fall back to browser's system theme
4. Default to light mode

## Available Theme Colors

All colors defined in `:root` and `.dark`:

| Variable | Light | Dark |
|----------|-------|------|
| `--background` | White | Almost black |
| `--foreground` | Almost black | White |
| `--card` | White | Dark gray |
| `--primary` | Dark | Light |
| `--secondary` | Very light | Dark |
| `--muted` | Very light | Dark gray |
| `--accent` | Very light | Dark gray |
| `--destructive` | Red | Salmon |
| `--border` | Light gray | Semi-transparent white |

## Testing Theme

### Manual Testing
1. Click theme toggle in topbar (sun/moon icon)
2. Select Light, Dark, or System
3. Verify colors update smoothly
4. Refresh page - theme should persist
5. Close browser, reopen - theme should restore

### System Theme
1. Change OS theme settings
2. With "system" selected, app should follow OS preference
3. Changing OS theme should reflect in app instantly

### localStorage Verification
```javascript
// In browser console
localStorage.getItem("app-theme"); // Returns: "dark", "light", or "system"
```

## Troubleshooting

### Hydration Mismatch Warning
**Error**: "Hydration failed because the initial UI does not match what was rendered"

**Solution**: Add `suppressHydrationWarning` to `<html>`:
```tsx
<html lang="en" suppressHydrationWarning>
```

### Theme Not Persisting
**Issue**: Theme resets after refresh

**Solution**: Ensure `AppThemeProvider` wraps app at root level with correct storage key

### CSS Variables Not Applied
**Issue**: Colors don't change on theme switch

**Solution**:
1. Check `:root` and `.dark` variables are defined in globals.css
2. Verify `<html class="dark">` is applied correctly
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Icons Not Animating
**Issue**: Sun/Moon icon doesn't rotate/scale

**Solution**: Ensure `AppIdentity` component has:
- `rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0` (Sun)
- `rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100` (Moon)

## Best Practices

1. **Always use CSS variables** - Don't hardcode colors
   ```tsx
   // ❌ Bad
   <div style={{ backgroundColor: "#ffffff" }}>

   // ✅ Good
   <div className="bg-background text-foreground">
   ```

2. **Use semantic names** - Prefer `bg-background` over `bg-slate-50`
   ```tsx
   // ✅ Good - Automatically adapts to theme
   <Card className="bg-card text-card-foreground">

   // ❌ Less flexible - Needs dark: prefix
   <Card className="bg-white dark:bg-slate-900">
   ```

3. **Test both themes** - Before deploying, verify dark mode
   ```tsx
   // In development
   setTheme("light");  // Verify light mode
   setTheme("dark");   // Verify dark mode
   setTheme("system"); // Verify system follows OS
   ```

4. **Consider contrast** - Ensure 4.5:1 contrast ratio for WCAG AA
   - Use tools like WebAIM Contrast Checker
   - OKLch color space helps maintain contrast

## Performance

- **Client-side**: Theme toggle is instant (100ms or less)
- **Hydration**: Safe with `suppressHydrationWarning`
- **Storage**: Minimal (~10 bytes in localStorage)
- **Bundle**: next-themes adds ~2KB gzipped

## Future Enhancements

1. **Custom Themes** - Allow users to create custom color schemes
2. **Theme Scheduling** - Auto-switch based on time of day
3. **Per-Component Themes** - Override theme for specific sections
4. **Theme Preview** - Live preview before saving preference
