# NeoNHS Mobile Codebase Index

## Snapshot

- Project: Expo + React Native + TypeScript
- Entry point: `index.tsx` -> `app/App.tsx`
- Source files indexed: 255 (under `app`, `components`, `features`, `services`, `hooks`, `utils`, `lib`, `types`)
- Architecture: feature-first + shared app layers
- Styling: NativeWind (`className`) + shared primitives in `components/ui`
- API: shared client in `services/api/client.ts` + endpoint builders in `services/api/endpoints`

## Run and Quality Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Android: `npm run android`
- iOS: `npm run ios`
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Tests (watch): `npm test`
- Tests (single run): `npx jest --watchAll=false`

## Runtime Flow

1. `index.tsx` boots app.
2. `app/App.tsx` mounts `app/providers/Providers.tsx`.
3. Provider stack composes global app state and services.
4. Navigation starts in `app/navigations/RootNavigator.tsx`.
5. Screens call feature hooks/services; services call shared `apiClient`.

## Top-Level Map

- `app/`: app shell (navigators, providers)
- `features/`: feature modules (auth, map, home, event, profile, ...)
- `components/`: shared UI and composed common components
- `services/`: shared services (`api`, `cloudinary`)
- `hooks/`: shared hooks (`useApi`)
- `utils/`: constants, logger, date, storage
- `lib/`: theme and helper utilities
- `types/`: shared TS types
- `docs/`: architecture and usage guides

## App Layer Details

### Navigation (`app/navigations`)

- `NavigationParamTypes.ts`: route param source of truth
- `AuthNavigator.tsx`: auth stack screens
- `TabsNavigator.tsx`: main tab routes
- `MainNavigator.tsx`: stack over tabs + detail flows
- `RootNavigator.tsx`: root container for `Auth` and `Main`

### Providers (`app/providers`)

- `Providers.tsx`: provider composition root
- `ThemeProvider.tsx`: theme and dark mode class toggle
- `GoogleLoginProvider.tsx`: Google auth integration
- `ModalProvider.tsx`: modal state host
- `LoadingProvider.tsx`: global loading overlay state
- `AuthProvider` (in feature auth) + `ApiProvider.tsx`: auth state and API auth wiring

## Feature Inventory

Feature file counts (indexed files under each `features/<name>`):

- `auth`: 14
- `blog`: 20
- `bookings`: 2
- `cart`: 6
- `discover`: 9
- `event`: 14
- `home`: 31
- `map`: 37
- `panorama`: 4
- `point`: 19
- `profile`: 17
- `workshops`: 22

## Key Feature Anchors

- Auth state and token lifecycle: `features/auth/context/AuthContext.tsx`
- Map flows (camera, check-in, location): `features/map/`
- Home composition patterns: `features/home/components/sections/`
- Event detail/catalog patterns: `features/event/`
- Profile account/history flows: `features/profile/screens/`

## Shared Layer Anchors

- API client and transforms: `services/api/client.ts`
- Endpoint builders: `services/api/endpoints/`
- Query client setup: `services/api/tanstack/queryClient.ts`
- Shared hook wrapper: `hooks/useApi.ts`
- Theme tokens: `lib/theme.ts`
- Storage/constants/logger: `utils/storage.ts`, `utils/constants.ts`, `utils/logger.ts`
- UI primitives: `components/ui/`

## Conventions That Matter

- Keep feature logic inside feature folders.
- No direct API calls inside components.
- Flow should be: Screen -> feature hook -> feature service -> shared api client.
- Use alias imports (`@/...`) instead of deep relative paths.
- Update navigation param types before wiring new screens.
- Prefer NativeWind classes and shared UI primitives over ad-hoc styles.

## Documentation Pointers

- API usage: `docs/API_CLIENT.md`
- Auth system: `docs/AUTH_SYSTEM.md`
- Navigation guide: `docs/NAVIGATION_GUIDE.md`
- Folder structure: `docs/FOLDER_STRUCTURE.md`
- Environment setup: `docs/ENVIRONMENT_SETUP.md`
