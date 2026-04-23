You are generating code for the NeoNHS mobile application.

The project uses Expo + React Native + TypeScript with a feature-first architecture. All code must strictly follow the existing project structure and conventions described below. Never invent new patterns that conflict with this architecture.

---

## GENERAL RULES

- Always write TypeScript.
- Follow clean architecture and separation of concerns.
- Prefer composition over large components.
- Avoid monolithic files.
- Prefer reusable abstractions over duplicated logic.
- Ensure code is production-ready.

---

## PROJECT STRUCTURE (STRICT)

The project structure must always be respected.

app/
features/
components/
services/
hooks/
utils/
lib/
types/

Never place feature logic in shared folders.

Rules:

- Screen UI → features/{feature}/screens
- Feature components → features/{feature}/components
- Feature hooks → features/{feature}/hooks
- Feature API logic → features/{feature}/services
- Shared components → components/
- Shared UI primitives → components/ui/
- Global hooks → hooks/
- Shared services → services/
- Utility functions → utils/
- Theme or library helpers → lib/
- Shared types → types/

---

## COMPONENT DESIGN RULES

Always break UI into small reusable components.

Bad:

- One large 400+ line screen file
- Inline JSX blocks repeated

Good:

- Screen orchestrates layout
- Feature components handle UI pieces
- Hooks handle logic

Example pattern:

Screen
-> Feature Components
-> Custom Hooks
-> Services

Rules:

- Screens should stay thin.
- Business logic must live in hooks or services.
- Reusable UI must be extracted.

---

## STYLING RULES

This project uses **NativeWind + shared UI primitives**.

Styling priority order:

1. NativeWind className styling
2. components/ui primitives
3. StyleSheet only when absolutely necessary

Rules:

- Prefer Tailwind classes via NativeWind.
- Avoid inline styles unless dynamic.
- Use theme tokens from `lib/theme.ts`.
- Reuse UI primitives from `components/ui`.

Bad:
<View style={{ padding: 10 }} />

Good:
<View className="p-3" />

---

## API RULES

All HTTP calls must go through the shared API client.

services/api/client.ts

Feature services must wrap API calls.

Example flow:

Screen
-> feature hook
-> feature service
-> api client

Never call Axios directly inside components.

Example location:

features/event/services/eventService.ts

Use endpoint builders from:

services/api/endpoints/

---

## NAVIGATION RULES

Navigation types must always come from:

app/navigations/NavigationParamTypes.ts

Rules:

- Never create inline navigation param types.
- Always update NavigationParamTypes.ts when adding screens.

Navigation structure:

RootNavigator
-> AuthNavigator
-> TabsNavigator
-> MainNavigator

---

## STATE MANAGEMENT

Use appropriate scope for state.

Local UI state:
useState

Server state:
React Query or API hooks

Global app state:
Context providers in app/providers

Avoid prop drilling when possible.

---

## HOOK RULES

Reusable logic must be extracted into hooks.

Locations:

features/{feature}/hooks
hooks/

Rules:

- Hooks never contain JSX
- Hooks handle side effects, data fetching, and logic

---

## PERFORMANCE RULES

- Use FlatList for large lists.
- Use React.memo for pure components when needed.
- Avoid unnecessary re-renders.
- Use useCallback/useMemo appropriately.

---

## CODE STYLE

- Use descriptive variable names.
- Avoid deeply nested JSX.
- Keep functions small.
- Remove unused imports.

---

## OUTPUT FORMAT

When generating code:

1. Prefer multiple files instead of one large file.
2. Show file paths for each file.
3. Follow the exact project structure.
4. Ensure imports use alias paths like:

@/features/...
@/components/...
@/services/...

Never use deep relative paths like ../../../.

---

## NEVER BREAK THESE RULES

- No API calls inside components.
- No giant screens.
- No manual styling when NativeWind works.
- No logic mixed with UI.
- No new architecture outside the existing project structure.
