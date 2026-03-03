# NeoNHS Mobile Codebase Index

## Snapshot

- **Project**: Expo + React Native + TypeScript mobile app
- **Entry point**: `index.tsx` -> `app/App.tsx`
- **Architecture**: Feature-first modules under `features/*` + shared app layers
- **Styling**: NativeWind + shared UI primitives in `components/ui/*`
- **Navigation**: React Navigation stacks/tabs configured in `app/navigations/*`
- **API**: Shared Axios client in `services/api/client.ts` with endpoint builders under `services/api/endpoints/*`

---

## Startup & Runtime Flow

1. `index.tsx` bootstraps the app.
2. `app/App.tsx` mounts provider composition from `app/providers/Providers.tsx`.
3. Providers compose app-wide concerns (safe area, theme, auth, api wiring, loading/modal).
4. `RootNavigator` renders auth/main route containers and downstream navigators.
5. Feature screens call feature services, which use shared `apiClient`.

---

## Top-Level Map

- `app.config.js` — Expo app configuration
- `index.tsx` — application entrypoint
- `app/` — app shell (root app, navigation, providers)
- `features/` — domain modules (auth, discover, event, map, etc.)
- `components/` — shared cross-feature components + UI primitives
- `services/` — shared services (`api/`, `cloudinary.ts`)
- `hooks/` — shared hooks (`useApi.ts`)
- `utils/` — shared utilities (storage, constants, logger, date)
- `lib/` — theme and shared library helpers
- `types/` — shared type definitions
- `docs/` — architecture and usage docs
- `__tests__/`, `__mocks__/` — testing support
- `android/` — native Android project

---

## Core App Layer (`app/`)

### `app/App.tsx`

Root app component.

### `app/navigations/`

- `NavigationParamTypes.ts` — typed route params (source of truth)
- `RootNavigator.tsx` — root-level route composition
- `AuthNavigator.tsx` — authentication flow stack
- `TabsNavigator.tsx` — bottom tab navigation
- `MainNavigator.tsx` — stack flows layered over tab routes

### `app/providers/`

- `Providers.tsx` — provider composition root
- `ThemeProvider.tsx` — theme mode + persistence integration
- `GoogleLoginProvider.tsx` — Google auth provider setup
- `ModalProvider.tsx` — modal host/state
- `LoadingProvider.tsx` — global loading overlay state
- `ApiProvider.tsx` — API client auth token/refresh/logout wiring

---

## Feature Modules (`features/`)

Each feature generally follows this pattern:

- `screens/` — route-level UI
- `components/` — feature-specific presentational pieces
- `services/` — feature API wrappers / domain service logic
- `hooks/` — feature hooks
- `types.ts` or `types/` — feature types
- `index.ts` — barrel exports (where present)

### Current feature directories

- `features/auth/` — auth context, screens, service layer
- `features/blog/` — blog module (components/hooks/screens/services/styles/types)
- `features/bookings/` — bookings screens
- `features/cart/` — cart screens/services/types
- `features/discover/` — discover screens/services
- `features/event/` — event module (components/screens/services/types/utils)
- `features/home/` — home UI/screens/services
- `features/map/` — map module (components, data, screens, services, hooks)
- `features/profile/` — profile screens/services/types

---

## Shared Components (`components/`)

- `components/ui/` — reusable UI primitives (`button`, `input`, `text`, `card`, `select`, etc.)
- `components/Buttons/` — shared button variants
- `components/Loader/` — loading overlay/components
- `components/Navigator/` — navigation helper UI
- `components/common/` — generic reusable components

---

## Shared Services & Utilities

### `services/api/`

- `client.ts` — Axios wrapper + interceptors + request helpers
- `types.ts` — API response/error typing
- `endpoints/` — endpoint builder groups
- `common/` — shared API helpers
- `examples.ts` — usage examples
- `index.ts` — API module exports

### Other shared services

- `services/cloudinary.ts` — Cloudinary-related helpers

### Utility layer

- `utils/constants.ts` — constants and storage keys
- `utils/storage.ts` — persistence wrappers
- `utils/logger.ts` — app logging helper
- `utils/date.ts` — date helpers

### Library layer

- `lib/theme.ts` — theme tokens + navigation theme mapping
- `global.css` — CSS variables for NativeWind theming

---

## Testing & Quality

- `__tests__/` — Jest tests
- `__mocks__/` — global and test mocks
- `jest.setup.ts`, `jest.env.mocks.ts` — Jest runtime setup
- `coverage/` — generated coverage output

Useful scripts (from `package.json`):

- `npm run dev` — Expo dev server with cache clear
- `npm run android` / `npm run ios` — platform launch
- `npm run typecheck` — TypeScript checks
- `npm test` — Jest

---

## Developer Notes

- Prefer import alias paths (`@/...`) over deep relative paths.
- Keep API access inside feature services; delegate HTTP to `services/api/client.ts`.
- For public endpoints, pass `{ requiresAuth: false }` where applicable.
- Update `app/navigations/NavigationParamTypes.ts` first when adding screens.
- Use shared theme tokens/primitives instead of ad-hoc styling.
