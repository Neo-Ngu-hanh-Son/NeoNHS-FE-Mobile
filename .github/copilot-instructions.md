# NeoNHS Mobile — Copilot Instructions

## Project shape (read this first)
- Expo + React Native + TypeScript app, entrypoint is `index.tsx` -> `app/App.tsx`.
- Uses feature-first structure in `features/*` (screen/components/services/types per domain), plus shared layers: `app/`, `components/`, `services/`, `hooks/`, `utils/`, `lib/`.
- Import alias `@/*` is enabled in `tsconfig.json`; prefer `@/features/...` style imports.

## Runtime architecture and data flow
- Provider composition is centralized in `app/providers/Providers.tsx` (SafeArea -> Theme -> GoogleLogin -> Modal -> Loading -> Auth -> Api).
- Auth state lives in `features/auth/context/AuthContext.tsx`; token/user persistence goes through `utils/storage.ts` keys in `utils/constants.ts`.
- API calls should go through `services/api/client.ts` (`apiClient`) and endpoint builders from `services/api/endpoints/endpoints.ts`.
- `ApiProvider` wires auth into the client (`getAuthToken`, `getRefreshToken`, refresh callback, logout on unauthorized).
- Public endpoints must pass `{ requiresAuth: false }` (see `features/auth/services/authService.ts`).
- API response shape is normalized in `ApiClient.transformResponse`; expect `ApiResponse<T>` wrappers from service methods.

## Navigation patterns
- Navigation types are source-of-truth in `app/navigations/NavigationParamTypes.ts`.
- When adding a screen: update param list first, then register in `AuthNavigator.tsx`, `MainNavigator.tsx`, or `TabsNavigator.tsx`.
- Main app tabs are in `TabsNavigator.tsx`; stack-only flows (checkout/profile details/etc.) are in `MainNavigator.tsx`.
- Note: `RootNavigator.tsx` currently defines both `Main` and `Auth` routes directly; do not assume auth-gated branching exists unless you add it explicitly.

## UI and theming conventions
- Styling is NativeWind (`className`) + reusable primitives in `components/ui/*`.
- Theme tokens are in `lib/theme.ts` and mirrored as CSS variables in `global.css`; prefer tokens over ad-hoc colors.
- Dark mode is class-based (`dark`) and controlled by `ThemeProvider` (`app/providers/ThemeProvider.tsx`).

## Service/module conventions
- Keep feature API wrappers inside that feature (example: `features/auth/services/authService.ts`) and delegate HTTP to shared `apiClient`.
- Shared cross-feature API endpoint groups live under `services/api/endpoints/` and are re-exported via `services/api/index.ts`.
- Use `utils/logger.ts` (`react-native-logs`) for diagnostics instead of direct `console.*` in app code.

## Developer workflow (repo-specific)
- Install: `npm install`
- Dev server (recommended): `npm run dev` (clears Expo cache)
- Run Android: `npm run android`
- Run iOS: `npm run ios` (macOS only)
- Type check: `npm run typecheck`
- Tests: `npm test` (configured as watch mode); for one-off CI-like run use `npx jest --watchAll=false`.

## Testing gotchas in this repo
- Jest setup depends on NativeWind globals initialized in `jest.env.mocks.ts` and `jest.setup.ts`.
- `@react-native-async-storage/async-storage` and `@expo/vector-icons` are mocked globally; avoid duplicating those mocks unless test-specific behavior is needed.

## What to trust when docs conflict
- Prefer current implementation files over older docs for API paths and navigation details (e.g., endpoints are under `services/api/endpoints/`, not a flat `endpoints.ts`).