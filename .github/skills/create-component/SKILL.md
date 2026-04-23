---
name: create-component
description: 'Create reusable React Native components with NativeWind, rn-primitives, and CVA. Use when: building UI components, adding new shared components, creating feature-specific components, wrapping rn-primitives, or setting up variant-based component APIs.'
argument-hint: "Describe the component to create (e.g., 'avatar component with size variants')"
---

# Create Reusable Component

## Checklist

### 1. Decide placement

| Component type                   | Location                                   | Example                   |
| -------------------------------- | ------------------------------------------ | ------------------------- |
| UI primitive (headless + styled) | `components/ui/<name>.tsx`                 | button, input, card       |
| Composed / higher-level          | `components/<Category>/<Name>.tsx`         | IconButton, ScreenLayout  |
| Feature-specific                 | `features/<feature>/components/<Name>.tsx` | BlogCard, PointDetailHero |

### 2. Pick the right base

- **Has an `@rn-primitives/*` package?** → Wrap it (checkbox, switch, select, label, separator, radio-group, slot, portal)
- **Needs variants?** → Use `cva` from `class-variance-authority`
- **Simple styled wrapper?** → Extend RN core (`View`, `Text`, `Pressable`, `TextInput`)

### 3. Scaffold the component

Required imports:

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
// + rn-primitives root if wrapping headless primitive
// + cva, VariantProps if using variants
```

Structure rules:

- **Named exports** only (no default exports)
- **Export types** alongside components: `export type { MyComponentProps }`
- **Forward refs** when wrapping native elements
- **Merge classNames** with `cn('base-classes', className)`
- **Platform-specific styles** via `Platform.select({ web: '...', native: '...' })`

### 4. Apply NativeWind styling

- Use `className` prop — never inline `style` for colors/spacing/layout
- Use theme tokens from `global.css` variables: `bg-primary`, `text-foreground`, `border-border`, etc.
- Dark mode handled automatically via class-based `dark:` prefix
- For imperative theme access (animations, charts): use `useTheme()` from `@/app/providers/ThemeProvider`

### 5. Add variants (when needed)

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const myVariants = cva('base-classes here', {
  variants: {
    variant: { default: '...', outline: '...' },
    size: { default: '...', sm: '...', lg: '...' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});
```

Props type: `ComponentProps & VariantProps<typeof myVariants>`

### 6. Support composition (when needed)

- **Slot pattern**: Accept `asChild` prop, swap root for `Slot` from `@rn-primitives/slot`
- **Text context**: Wrap children in `TextClassContext.Provider` if component needs to style nested `Text`
- **Subcomponents**: Export from same file as named exports (e.g., `Card`, `CardHeader`, `CardTitle`)

### 7. Final checks

- [ ] Uses `cn()` for className merging
- [ ] Named exports with type exports
- [ ] Theme tokens instead of hardcoded colors
- [ ] No `console.*` — use `logger` from `@/utils/logger` if needed
- [ ] Import via `@/components/ui/...` or `@/components/...` alias
