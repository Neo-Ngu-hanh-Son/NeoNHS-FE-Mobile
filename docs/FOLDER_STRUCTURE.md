# Project Folder Structure

## Overview

The project follows a feature-based architecture with clear separation of concerns.

## Root Structure

```
NeoNHS/
├── app/                    # Application core
│   ├── navigations/       # Navigation configuration
│   └── providers/         # Context providers
│
├── components/            # Shared UI components
│   ├── Buttons/          # Button components
│   ├── Loader/           # Loading indicators
│   ├── Navigator/        # Navigation helpers
│   ├── Text/             # Text components
│   └── ui/               # Reusable UI primitives (button, input, card, etc.)
│
├── features/              # Feature modules
│   ├── auth/             # Authentication feature
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── screens/
│   │   └── services/
│   ├── home/             # Home feature
│   │   ├── components/
│   │   ├── hooks/
│   │   └── screens/
│   └── profile/           # Profile feature
│       └── screens/
│
├── services/             # API and external services
│   └── api/             # API client
│
├── hooks/                # Shared React hooks
│
├── lib/                  # Library utilities (theme, utils)
│
├── utils/                # Utility functions
│
├── types/                # TypeScript type definitions
│
├── theme/                # Theming configuration
│
├── assets/               # Static assets
│   ├── fonts/
│   └── images/
│
└── docs/                 # Documentation and guides
```

## Directory Descriptions

### `app/`

Application core files including navigation setup and providers.

### `app/navigations/`

Navigation configuration files for React Navigation.

### `app/providers/`

React Context providers (Auth, API, SafeAreaProvider).

### `components/`

Shared UI components used across multiple features.

### `components/ui/`

Reusable UI primitives built with NativeWind/Tailwind styling:
- `button.tsx` - Button component
- `input.tsx` - Text input component
- `card.tsx` - Card container component
- `checkbox.tsx` - Checkbox component
- `select.tsx` - Select/dropdown component
- `text.tsx` - Text component
- And more...

### `features/`

Feature modules following a consistent structure:

- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks
- `screens/` - Feature screens
- `services/` - Feature API services
- `context/` - Feature context (if needed)

### `services/api/`

API client configuration, endpoints, and types.

### `hooks/`

Shared React hooks used across the application.

### `lib/`

Library utilities including theme configuration and common utility functions.

### `utils/`

Utility functions (logger, storage, constants, date helpers).

### `types/`

Shared TypeScript type definitions.

### `theme/`

Theme configuration (colors, typography, spacing).

### `assets/`

Static assets (images, fonts, icons).

### `docs/`

Documentation and guides for developers.

## Feature Module Structure

Each feature in `features/` follows this structure:

```
feature-name/
├── components/      # Feature-specific UI components
├── hooks/          # Feature-specific React hooks
├── screens/        # Feature screens
├── services/       # Feature API services
├── context/        # Feature context (optional)
├── types.ts        # Feature type definitions
└── index.ts        # Module exports (barrel exports)
```

## Best Practices

1. **Feature Isolation**: Each feature should be self-contained
2. **Shared Code**: Put reusable code in `components/`, `hooks/`, or `utils/`
3. **Barrel Exports**: Use `index.ts` files for clean imports
4. **Consistent Naming**: Follow the same structure across features
5. **Type Safety**: Define types in `types.ts` files
