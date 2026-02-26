# Copilot Instructions for Poker Planning MVP

## Architecture Overview
- **Frontend:** React 19, client-only (no SSR), MUI 7 (`@mui/material` ^7), Vite 7, TypeScript 5.9
- **Backend:** Firebase 12 — Auth (Email/OTP passwordless), Firestore (real-time sync)
- **Conference:** Optional WebRTC audio/video per session, full-mesh ≤8 peers
- **Routing:** React Router v7 (`react-router-dom` ^7), `createBrowserRouter`
- **Forms:** React Hook Form for validation

## Project Structure
```
src/
  components/       # Shared/presentational components (layout, ErrorBoundary, etc.)
  features/         # Feature modules: auth/, dashboard/, session/, conference/
  hooks/            # Shared custom hooks
  lib/firebase.ts   # Single Firebase init — exports `auth`, `db`, default `app`
  pages/            # Thin route-level page wrappers
  theme/theme.ts    # MUI createTheme (primary #1976d2, Inter font, borderRadius 8)
  types/index.ts    # All shared TypeScript interfaces (Session, Story, Vote, UserProfile)
  utils/            # Pure utility functions
```
Feature modules are self-contained: each has its own components, hooks, and services. Import directly from files — no barrel `index.ts` re-exports (avoids circular deps).

## Code Conventions
- **Path alias:** Use `@/` for `src/` imports (configured in `vite.config.ts` and `tsconfig.app.json`)
- **`verbatimModuleSyntax: true`** — always use `import type { X }` for type-only imports
- **Components:** Function declarations with default export (not arrow functions or `React.FC`)
- **Styling:** MUI `sx` prop and `styled()` — no CSS modules or external CSS for components
- **Strict TS:** `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` enabled

## Firestore Data Model
```
/sessions/{sessionId}              → Session (masterId, pointScale, status, ...)
  /stories/{storyId}               → Story (title, status, timerStart, average)
    /votes/{userId}                → Vote (value, displayName) — doc ID = userId (one vote per user)
  /signaling/{userId}              → WebRTC signaling (conference only)
  /chat/{messageId}                → Ephemeral chat messages (conference only)
```
Role detection is client-side: `session.masterId === user.uid` (no separate roles collection). Timer state derived from `story.timerStart` Timestamp — no server-side timer.

## Developer Workflows
- `npm run dev` — Vite HMR dev server
- `npm run build` — `tsc -b && vite build` (must pass with zero TS errors)
- `npm run lint` — ESLint 9 flat config (`eslint.config.js`)
- No test runner configured yet

## Key Design Rules
- **Session isolation:** No cross-session data. All queries scoped to `sessionId`
- **Master-only actions:** Only `masterId` can add/start/end stories, end session
- **Timer:** Hardcoded 3 min (`TIMER_DURATION_SECONDS = 180` in `src/types/index.ts`). Master's client auto-ends story on expiry
- **Vote reveal:** Automatic on story end (no manual reveal button)
- **Average:** Only computed when `session.isNumericScale === true`; non-numeric scales show distribution only

## Implementation Plan
See `docs/implementation-plan.md` for the full PR-by-PR build plan (PR 01–12). Current state: PR 01 (foundation scaffold) is complete. Feature directories exist but contain only `.gitkeep` placeholders.

## Reference Docs
- `docs/specs.md` — Functional requirements, edge cases, NFRs
- `docs/design.md` — UI layouts, role-based views, screen flows
- `.github/instructions/reactjs.instructions.md` — General React/TS best practices (applied automatically to source files)
