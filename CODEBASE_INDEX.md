# NeoNHS Mobile - Codebase Index

> Last updated: 2026-04-04
> Stack: Expo 54, React Native 0.81, TypeScript 5.9, NativeWind 4, React Navigation 7, TanStack Query 5
> Architecture: Feature-first mobile app with shared app shell

---

## Snapshot

- Total indexed source files (`app`, `components`, `features`, `hooks`, `lib`, `services`, `types`, `utils`): **287**
- Top-level source distribution:
  - `features`: 225
  - `components`: 25
  - `app`: 13
  - `services`: 13
  - `utils`: 6
  - `hooks`: 2
  - `lib`: 2
  - `types`: 1

## Quick Commands

| Command                     | Purpose                  |
| --------------------------- | ------------------------ |
| `npm install`               | Install dependencies     |
| `npm run dev`               | Start Expo Dev Client    |
| `npm run android`           | Run Android native build |
| `npm run ios`               | Run iOS native build     |
| `npm run typecheck`         | Run TypeScript check     |
| `npm run lint`              | Run Expo lint            |
| `npm test`                  | Run Jest in watch mode   |
| `npx jest --watchAll=false` | One-off Jest run         |

---

## Runtime Boot Flow

```text
index.tsx
  -> app/App.tsx
       -> Providers
            -> SafeAreaProvider
            -> QueryClientProvider
            -> ThemeProvider
            -> GoogleLoginProvider
            -> ModalProvider
            -> LoadingProvider
            -> AuthProvider
            -> ApiProvider
              -> ChatProvider
       -> ThemedStatusBar
       -> RootNavigator
            -> NavigationContainer
            -> PanoramaProvider
            -> Root Stack (Main, Auth)
       -> PortalHost
```

Notes:

- Query cache is persisted with MMKV through `persistQueryClient` in `services/api/tanstack/queryClient.ts`.
- Auth + API wiring is centralized in `features/auth/context/AuthContext.tsx` and `app/providers/ApiProvider.tsx`.

---

## Navigation Map

Type source of truth: `app/navigations/NavigationParamTypes.ts`

### Root Stack

- `Main` -> `MainNavigator`
- `Auth` -> `AuthNavigator`

### Auth Stack

- `Login`
- `Register`
- `ForgotPassword`
- `EnterOtp` (`{ email: string }`)
- `ForgotPasswordOtp` (`{ email: string }`)
- `VerifyEmail` (`{ email?: string; fromRegister?: boolean }`)

### Tabs Stack

- `Home`
- `Discover`
- `Map` (`{ pointId?, targetNavigationPointId?, userCheckedInPointId? } | undefined`)
- `Bookings`
- `Profile`
- `TestCart`
- `Chat`

### Main Stack (registered)

- `Tabs`
- `UpdateAccount`
- `ChangePassword`
- `KycVerification`
- `Withdraw`
- `TransactionHistory`
- `TransactionDetails` (`{ transactionId: string }`)
- `TicketVerification`
- `PreCheckout` (`{ selectedIds: string[] }`)
- `Payment` (`{ cartItemIds: string[]; voucherIds: string[]; amount: number; orderCode: string }`)
- `AllDestinations`
- `PointDetail`
- `PointMapSelection`
- `ActiveNavigation`
- `ArrivalConfirmation`
- `PointHistoryAudio`
- `EventDetail`
- `WorkshopList`
- `WorkshopDetail`
- `WorkshopAllReviews`
- `BlogList`
- `BlogDetails`
- `Panorama`
- `CheckinCamera`
- `CheckinComplete`
- `CheckinGallery`
- `ChatRoom`

Note: `AudioGuide` exists in route types but is not currently registered in `MainNavigator.tsx`.

---

## Top-Level Modules

- `app/`: App shell (`App.tsx`), navigation, global providers
- `components/`: Shared UI and primitives (`components/ui/*`, loaders, shared layouts)
- `features/`: Domain modules (auth, map, home, profile, etc.)
- `services/`: Shared integrations (`services/api/*`, `services/cloudinary.ts`)
- `hooks/`: Shared hooks (`useApi`, barrel index)
- `lib/`: Theme and utility helpers (`theme.ts`, `utils.ts`)
- `types/`: Shared cross-feature types (`common.ts`)
- `utils/`: constants, logging, formatting, storage helpers

---

## Feature Inventory

File counts shown are source files within each feature folder.

| Feature              | Files | Primary Responsibilities                                                     |
| -------------------- | ----: | ---------------------------------------------------------------------------- |
| `features/map`       |    47 | Map rendering, clustering, filters, user location, check-in flow, directions |
| `features/home`      |    32 | Home dashboard sections, overview data, featured content                     |
| `features/workshops` |    29 | Workshop list/detail/session browsing and APIs                               |
| `features/blog`      |    20 | Blog list/detail, filtering, HTML rendering                                  |
| `features/point`     |    19 | Point detail pages and history-audio playback UI                             |
| `features/profile`   |    18 | Account management, KYC, transactions, gallery                               |
| `features/auth`      |    14 | Authentication screens, auth context, auth services                          |
| `features/event`     |    14 | Event detail and ticket catalog querying                                     |
| `features/chat`      |    11 | Chat room list, real-time messaging flows, floating chat entry               |
| `features/discover`  |     9 | Destination browsing and navigation setup screens                            |
| `features/cart`      |     6 | Cart list, pre-checkout, payment flow                                        |
| `features/panorama`  |     4 | Panorama rendering and panorama API service                                  |
| `features/bookings`  |     2 | Bookings placeholder screen                                                  |

---

## API Layer Index

### Core

- `services/api/client.ts`: Axios wrapper with token injection, refresh retry, response transformation, error normalization
- `services/api/types.ts`: `ApiResponse`, `ApiError`, paging and request config types
- `services/api/index.ts`: central exports

### Endpoint Builders

- `services/api/endpoints/endpoints.ts`: aggregates endpoint groups
- Group files:
  - `map.api.ts`
  - `discover.api.ts`
  - `events.api.ts`
  - `blog.api.ts`
  - `workshops.api.ts`

### Other Shared Services

- `services/cloudinary.ts`: image/video upload helpers
- `services/api/common/statsService.ts`: shared stats requests

---

## Shared UI Index

- Buttons: `components/Buttons/*`
- Layout/skeleton utilities: `components/common/*`
- Loading states: `components/Loader/*`
- Navigation helper: `components/Navigator/AppLink.tsx`
- Primitives: `components/ui/*`
  - includes `button`, `input`, `card`, `text`, `switch`, `checkbox`, `radio-group`, `select`, `separator`, `skeleton`, `smart-image`

---

## State, Theme, and Storage

- Theme system: `app/providers/ThemeProvider.tsx`, `lib/theme.ts`, `global.css`
- Auth state: `features/auth/context/AuthContext.tsx`
- API wiring for auth/refresh/logout: `app/providers/ApiProvider.tsx`
- Query caching: `services/api/tanstack/queryClient.ts`
- Persistent key/value storage: `utils/storage.ts`

---

## Project Conventions (Enforced by Current Structure)

1. Feature-first separation (`features/<feature>/screens|hooks|services|components|types`)
2. API flow should remain: screen -> feature hook -> feature service -> shared `apiClient`
3. Public endpoints must explicitly pass `requiresAuth: false`
4. Navigation changes must start in `NavigationParamTypes.ts`
5. Prefer alias imports (`@/...`) over deep relative imports
6. Prefer NativeWind `className` + shared primitives before ad-hoc styles
