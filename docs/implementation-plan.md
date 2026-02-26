# Poker Planning App — PR-Driven Implementation Plan

## Overview

This document defines the complete, incremental, production-grade implementation plan for the Poker Planning web application (React 19 + MUI 5 frontend, Firebase backend). Each Pull Request is independently functional, reviewable, and safe to merge. PRs are ordered to minimize blocked work; PRs within a phase can be developed in parallel where noted.

**Key architectural decisions (pre-locked):**
- Timer: hardcoded 3 minutes per story (MVP)
- Vote reveal: automatic when story ends (no manual reveal button)
- WebRTC: peer-limited full mesh (≤8 peers), SFU deferred to post-MVP
- Average calculation: enabled only when master sets `isNumericScale: true` at session creation; non-numeric (T-shirt) scales show vote distribution only

---

## PR 01 — Project Foundation: Dependencies, Folder Structure & Theme

### Goal
Replace the Vite/React boilerplate with a production-ready scaffold: install all required libraries, establish a feature-based folder structure, set up the MUI 5 theme, and wire environment variable handling. No application logic yet.

### Scope
**Files created/modified:**
- `package.json` — add all dependencies
- `vite.config.ts` — add path aliases (`@/` → `src/`)
- `src/main.tsx` — wrap App in `ThemeProvider`, `CssBaseline`
- `src/App.tsx` — clear boilerplate, render router root placeholder
- `src/theme/theme.ts` — MUI 5 custom theme (neutral palette, typography)
- `src/types/index.ts` — all shared TypeScript interfaces (see Data Model below)
- `src/lib/firebase.ts` — Firebase app initialization (reads from `.env`)
- `.env.example` — document required env vars
- `.gitignore` — ensure `.env` is ignored
- `src/assets/` — remove demo SVGs, add app icon placeholder
- `index.html` — update title to "Poker Planning"
- `tsconfig.app.json` — add path alias resolution (`@/*`)

**Folders created:**
```
src/
  components/       # shared/presentational components
  features/         # feature modules (auth, session, dashboard, conference)
  hooks/            # shared custom hooks
  lib/              # third-party integrations (firebase.ts)
  pages/            # top-level route pages
  theme/            # MUI theme
  types/            # global TypeScript types
  utils/            # pure utility functions
```

### Architecture Decisions
- Feature-based folder structure per `reactjs.instructions.md`
- Firebase app initialized once in `src/lib/firebase.ts`, services exported individually (`auth`, `db`)
- MUI `CssBaseline` applied globally; theme injected via `ThemeProvider` at root
- Path alias `@/` configured in both `vite.config.ts` and `tsconfig.app.json`
- No barrel index files at root of features (causes circular deps); import directly from file

### Firebase / Data Model Changes
No Firestore writes yet. Define all shared TypeScript interfaces in `src/types/index.ts`:

```
Session {
  id: string
  title: string
  pointScale: string[]       // e.g. ["1","2","3","5","8"] or ["XS","S","M","L","XL"]
  isNumericScale: boolean    // master sets at creation
  conferenceEnabled: boolean
  masterId: string           // Firebase Auth UID
  status: 'active' | 'ended'
  createdAt: Timestamp
}

Story {
  id: string
  sessionId: string
  title: string
  description?: string
  status: 'pending' | 'active' | 'ended'
  timerStart?: Timestamp     // set when story.status → 'active'
  timerDurationSeconds: 180  // hardcoded constant
  average?: number | null    // null if isNumericScale=false or no votes
  createdAt: Timestamp
}

Vote {
  userId: string
  displayName: string
  value: string              // raw string from pointScale[]
  submittedAt: Timestamp
}

UserProfile {
  uid: string
  email: string
  displayName?: string
}
```

**Firestore path structure:**
```
/sessions/{sessionId}
/sessions/{sessionId}/stories/{storyId}
/sessions/{sessionId}/stories/{storyId}/votes/{userId}
```

### Security Rules Changes
None yet (rules introduced in PR 09).

### UI Changes
- `index.html` title updated
- White screen with "Poker Planning" heading as placeholder (App.tsx)
- MUI theme applied; verify CssBaseline resets baseline styles

### Testing Strategy
- **Manual:** `npm run dev` renders without errors; MUI styles apply; no TypeScript errors via `npm run build`
- **Automated:** `npm run lint` passes clean; `tsc --noEmit` passes

### Definition of Done
- [ ] `npm install` succeeds with zero peer-dep warnings
- [ ] `npm run dev` renders a blank themed page with no console errors
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `tsc --noEmit` passes
- [ ] `.env.example` committed; `.env` gitignored
- [ ] All TypeScript interfaces defined and compiling

### Rollback Strategy
Git revert PR 01. No Firebase resources touched; no user impact.

### Post-Merge Validation
- Checkout main, run `npm ci && npm run build`
- Confirm no TypeScript errors in CI

---

## PR 02 — Firebase Auth: Email / OTP Flow

### Goal
Implement full Firebase Email/OTP (Email Link / passwordless) authentication. Users can sign in, sign out. An `AuthContext` provides auth state throughout the app. Unauthenticated users are blocked from all routes except `/login`.

### Scope
**Files created/modified:**
- `src/lib/firebase.ts` — export `auth` instance
- `src/features/auth/AuthContext.tsx` — `AuthProvider`, `useAuth` hook
- `src/features/auth/useAuth.ts` — re-export with typed return
- `src/features/auth/LoginPage.tsx` — email input form → OTP sent state → OTP input form
- `src/features/auth/authService.ts` — `sendOTP(email)`, `verifyOTP(email, otp)` wrappers
- `src/components/ProtectedRoute.tsx` — redirect to `/login` if unauthenticated
- `src/App.tsx` — wrap `RouterProvider` inside `AuthProvider`
- `src/pages/LoginPage.tsx` — thin page wrapper for `features/auth/LoginPage`

### Architecture Decisions
- Firebase Email Link (magic link / OTP) used. `actionCodeSettings.url` must point to the deployed domain; for dev, use `localhost:5173`
- Auth state persisted via Firebase's default `browserLocalPersistence`
- `AuthContext` exposes: `user: User | null`, `loading: boolean`, `signOut: () => Promise<void>`
- `ProtectedRoute` wraps all non-auth routes; shows loading spinner during auth initialization
- No session-storage fallback; rely on Firebase SDK persistence

### Firebase / Data Model Changes
- Enable **Email/Link Sign-In** provider in Firebase Console
- No Firestore writes yet

### Security Rules Changes
None.

### UI Changes
**LoginPage layout:**
- Centered `Card` (max-width 400px)
- App logo/name at top
- Step 1: Email `TextField` + "Send Code" `Button`
- Step 2: 6-digit OTP `TextField` + "Verify" `Button` + "Resend" link
- Error `Alert` for invalid OTP / expired link
- Loading `CircularProgress` during Firebase calls
- Accessible: labels, focus management between steps

### Testing Strategy
- **Manual:** Sign in with real email in dev environment; verify redirect to `/dashboard` after OTP; refresh retains session; sign out redirects to `/login`
- **Manual:** Access `/dashboard` without auth → redirected to `/login`

### Definition of Done
- [ ] Email/OTP sign-in works end-to-end in dev
- [ ] `ProtectedRoute` blocks unauthenticated navigation
- [ ] `useAuth()` returns correct `user` and `loading` state
- [ ] Sign out clears session and redirects to `/login`
- [ ] No TypeScript errors; lint passes

### Rollback Strategy
Git revert PR 02. Disable Email Link Sign-In provider in Firebase Console if needed.

### Post-Merge Validation
- Manual sign-in test on deployed preview URL
- Verify Firebase Console → Authentication → Users shows new test user entry

---

## PR 03 — Routing & App Shell

### Goal
Establish the full React Router v6 route tree, top navigation bar, and responsive app shell. All routes are placeholders at this stage; focus is correct routing, layout, and navigation.

### Scope
**Files created/modified:**
- `src/App.tsx` — define `createBrowserRouter` with all routes
- `src/components/layout/AppShell.tsx` — top nav bar + main content outlet
- `src/components/layout/TopNav.tsx` — app name, profile menu (display name, sign out)
- `src/pages/DashboardPage.tsx` — placeholder
- `src/pages/SessionPage.tsx` — placeholder
- `src/pages/NotFoundPage.tsx` — 404 page

**Route tree:**
```
/login                          → LoginPage (no AppShell)
/ (ProtectedRoute + AppShell)
  /dashboard                    → DashboardPage
  /session/:sessionId           → SessionPage
  *                             → NotFoundPage
```

### Architecture Decisions
- `createBrowserRouter` (not `HashRouter`); Firebase Hosting rewrites required in PR 11
- `AppShell` uses MUI `Box` flex layout: fixed `AppBar` + scrollable main area
- `TopNav` uses `useAuth()` for display name and sign-out action
- `React.lazy` + `Suspense` wrapping for `DashboardPage`, `SessionPage` for code splitting
- Default redirect from `/` to `/dashboard`

### Firebase / Data Model Changes
None.

### Security Rules Changes
None.

### UI Changes
- `AppBar` with app name (left) and profile `IconButton` + `Menu` (right)
- Profile menu: shows user email, "Sign Out" item
- Main content area: padded, scrollable, full-height
- Responsive: `AppBar` stacks on mobile

### Testing Strategy
- **Manual:** Navigate to each route; verify correct component renders; `404` on unknown paths; profile menu sign-out works

### Definition of Done
- [ ] All routes navigate correctly
- [ ] AppBar visible on all protected routes
- [ ] `React.lazy` split confirmed in build output (separate chunk per page)
- [ ] Sign-out from nav works

### Rollback Strategy
Git revert PR 03. No data changes.

### Post-Merge Validation
- `npm run build` — verify code-split chunks appear in `dist/`
- Manual nav test on preview deploy

---

## PR 04 — Dashboard: Session List & Create Session Modal

### Goal
Implement the Poker Master dashboard: display the list of sessions the authenticated user has created (real-time), and allow creation of a new poker session via a modal form.

### Scope
**Files created/modified:**
- `src/features/dashboard/DashboardPage.tsx` — full implementation
- `src/features/dashboard/SessionListItem.tsx` — single row component (title, date, status, Open button)
- `src/features/dashboard/CreateSessionModal.tsx` — modal form (title, point scale, isNumericScale checkbox, conference toggle)
- `src/features/dashboard/useSessions.ts` — Firestore real-time query hook for master's sessions
- `src/features/dashboard/sessionService.ts` — `createSession(data): Promise<string>` (returns sessionId)
- `src/utils/dateUtils.ts` — `formatDate(timestamp): string`

### Architecture Decisions
- Sessions queried with `where('masterId', '==', user.uid)` + `orderBy('createdAt', 'desc')`; requires composite index (document it)
- `onSnapshot` listener in `useSessions` for real-time updates; unsubscribed on unmount
- `createSession` writes to `/sessions/{auto-id}` and returns the new document ID
- Shareable link = `${window.location.origin}/session/${sessionId}` — copied to clipboard via `navigator.clipboard` after creation
- `CreateSessionModal` uses React Hook Form for validation
- Point scale input: comma-separated string → trimmed and split into `string[]` on save
- Validation: title required, point scale min 2 values, no duplicates

### Firebase / Data Model Changes
**Firestore write — session creation:**
```
/sessions/{sessionId} {
  title: string,
  pointScale: string[],
  isNumericScale: boolean,
  conferenceEnabled: boolean,
  masterId: uid,
  status: 'active',
  createdAt: serverTimestamp()
}
```
**Firestore index required:**
- Collection: `sessions`, fields: `masterId ASC, createdAt DESC`

### Security Rules Changes
None yet (open rules in dev). Rules added in PR 09.

### UI Changes
- Dashboard: MUI `Typography` heading "My Poker Sessions", primary `Button` "Create New Poker"
- Sessions table/list: `masterId` filter, shows title, formatted date, status `Chip` (green=Active, grey=Ended), "Open" `Button`
- `CreateSessionModal`:
  - MUI `Dialog` (full-screen on mobile)
  - Title `TextField`
  - Point scale `TextField` (placeholder: "1, 2, 3, 5, 8, 13")
  - "Numeric scale" `Checkbox` with tooltip: "Enable to calculate average score"
  - "Enable video conference" `Switch`
  - "Create" `Button` (primary), "Cancel" `Button`
  - Snackbar on success with shareable link + copy-to-clipboard
- Empty state: "No sessions yet. Create your first Poker session."
- Loading skeleton during initial Firestore fetch

### Testing Strategy
- **Manual:** Create session; verify it appears in list immediately; verify shareable link is correct; open link in incognito → must reach `/session/:id`
- **Manual:** Submit with empty title → validation error; single point value → validation error

### Definition of Done
- [ ] Sessions list loads real-time
- [ ] Create modal validates and writes to Firestore
- [ ] Shareable link copies to clipboard
- [ ] Ended sessions show grey "Ended" chip
- [ ] No TypeScript errors

### Rollback Strategy
Git revert PR 04. Delete test sessions from Firestore console manually if needed.

### Post-Merge Validation
- Verify Firestore console shows session document with correct fields
- Verify composite index created and active

---

## PR 05 — Session Page Shell & Real-Time Session/Story Hooks

### Goal
Build the session page layout and real-time data hooks for sessions and stories. No voting or story management yet — focus on data binding, role detection, and layout.

### Scope
**Files created/modified:**
- `src/features/session/SessionPage.tsx` — 3-panel layout (MUI `Grid`)
- `src/features/session/useSession.ts` — real-time `onSnapshot` for `/sessions/{sessionId}`
- `src/features/session/useStories.ts` — real-time `onSnapshot` for `/sessions/{sessionId}/stories` ordered by `createdAt`
- `src/features/session/useSessionRole.ts` — derives `isMaster: boolean` from `session.masterId === user.uid`
- `src/features/session/SessionStatusBanner.tsx` — "Session Ended" banner overlay
- `src/features/session/StoryList.tsx` — left panel, lists stories with status indicators
- `src/features/session/ActiveStoryPanel.tsx` — center panel placeholder
- `src/features/session/ConferencePanel.tsx` — right panel placeholder (only renders if `session.conferenceEnabled`)
- `src/pages/SessionPage.tsx` — thin wrapper importing feature component

### Architecture Decisions
- `useSession` returns `{ session: Session | null, loading: boolean, error: string | null }`; navigates to `/dashboard` if session not found
- `useStories` returns stories array sorted by `createdAt ASC`
- Role detection: purely client-side derived from `masterId` field — no separate Firestore role document
- Layout: MUI `Grid` — `StoryList` (3 cols), `ActiveStoryPanel` (6 cols), `ConferencePanel` (3 cols, hidden if conf disabled); collapses to single column on mobile
- `SessionStatusBanner` renders as sticky top alert when `session.status === 'ended'`

### Firebase / Data Model Changes
None (reads only).

### Security Rules Changes
None yet.

### UI Changes
- Session page: 3-panel grid layout
- Story list: scrollable, each item shows title + status dot (grey=pending, yellow=active, green=ended)
- Responsive: on mobile, panels stack vertically (story list → active story → conference)
- Active story panel: "No active story" placeholder
- Conference panel: hidden when disabled (zero markup rendered)
- Session title in `AppBar` (overrides global nav subtitle)

### Testing Strategy
- **Manual:** Open session as master; open same session in another browser as follower; verify both see the same story list in real-time; verify conference panel hidden when disabled

### Definition of Done
- [ ] 3-panel layout renders correctly on desktop
- [ ] `useSession` and `useStories` listeners update in real-time
- [ ] `isMaster` correctly detected
- [ ] Conference panel absent when `conferenceEnabled: false`
- [ ] `SessionStatusBanner` shows when session is ended

### Rollback Strategy
Git revert PR 05. No Firestore writes.

### Post-Merge Validation
- Open two browser tabs on same session; update session in Firestore console; verify both tabs update

---

## PR 06 — Story Management (Master Controls)

### Goal
Master can add new stories, start a story (timer auto-starts), and end a story manually. Timer auto-ends the story after 3 minutes. Only the master sees these controls.

### Scope
**Files created/modified:**
- `src/features/session/storyService.ts` — `addStory()`, `startStory()`, `endStory()`, `endSession()`
- `src/features/session/StoryList.tsx` — add "Add Story" input + button (master only); "Start" button per story
- `src/features/session/ActiveStoryPanel.tsx` — story title display, `CountdownTimer`, "End Story" button (master only), "End Session" button
- `src/features/session/CountdownTimer.tsx` — visual countdown from 3:00; auto-calls `endStory()` at 00:00
- `src/hooks/useCountdown.ts` — `useCountdown(timerStart: Timestamp, durationSeconds: number)` → `{ secondsRemaining, isExpired }`
- `src/utils/timerUtils.ts` — `getRemainingSeconds(timerStart, durationSeconds): number`

### Architecture Decisions
- `timerStart` is a `Timestamp` written to Firestore when story starts; timer state derived from `timerStart` on every client independently (no server-side timer)
- `CountdownTimer` uses `setInterval` (1s tick) + `useEffect` cleanup; calls `endStory()` only when `isMaster` to avoid duplicate Firestore writes from multiple clients
- `startStory()` sets `story.status = 'active'` and `story.timerStart = serverTimestamp()`. Only one story can be `active` at a time — enforced by checking in `startStory()` before writing (no transaction needed for MVP; server-side enforcement in security rules in PR 09)
- `endStory()` sets `story.status = 'ended'` and calculates + writes `story.average` (if `isNumericScale`) from all votes in subcollection (see PR 08 for aggregation)
- `addStory()` appends with `status: 'pending'`
- `endSession()` sets `session.status = 'ended'`; `CountdownTimer` confirms story ended, conference terminated in PR 10

### Firebase / Data Model Changes
**Firestore writes:**
```
// addStory
/sessions/{sessionId}/stories/{auto-id} {
  title: string,
  description: string | null,
  status: 'pending',
  createdAt: serverTimestamp()
}

// startStory
story.status = 'active', story.timerStart = serverTimestamp()

// endStory
story.status = 'ended', story.average = number | null

// endSession
session.status = 'ended'
```

### Security Rules Changes
None yet (PR 09). Note: without rules, any client can call these. Acceptable for development phase.

### UI Changes
- "Add Story" form: `TextField` (title) + optional `TextField` (description) + "Add" `Button`; master only
- Each pending story: "Start" `Button` (enabled only if no story currently active)
- Active story highlighted in list (yellow left border)
- `CountdownTimer`: large MM:SS display, color shifts red below 30s
- "End Story" `Button` (master only, visible when story active)
- "End Session" `Button` (master only, destructive red, confirmation `Dialog`)
- Ended stories in list: strikethrough title + green check icon

### Testing Strategy
- **Manual:** Add story, start it, verify timer counts down across two browser tabs simultaneously; let timer expire, verify story auto-ends; verify master can end story manually before timer expires
- **Manual:** "End Session" confirmation dialog; session ends and voting disabled

### Definition of Done
- [ ] Stories add in real-time across clients
- [ ] Timer counts down and auto-ends story at 00:00 (only master writes)
- [ ] Manual end story works
- [ ] End session disables all story controls
- [ ] Only master sees management buttons

### Rollback Strategy
Git revert PR 06. No schema changes; Firestore document updates are soft (reversible by console).

### Post-Merge Validation
- End-to-end story lifecycle test (add → start → timer expires → verify `status: 'ended'` in Firestore)

---

## PR 07 — Voting (Follower + Master)

### Goal
Followers (and master) can vote on the active story. Votes are stored per user. Users can change their vote while the story is active. Voting is disabled once story ends.

### Scope
**Files created/modified:**
- `src/features/session/VotingPanel.tsx` — card deck UI rendered in `ActiveStoryPanel`
- `src/features/session/VotingCard.tsx` — single point card component (selected, disabled, hover states)
- `src/features/session/voteService.ts` — `submitVote(sessionId, storyId, userId, value)` — upserts `/votes/{userId}`
- `src/features/session/useVotes.ts` — real-time `onSnapshot` for `/votes` subcollection of active story; returns `Vote[]`
- `src/features/session/VoteProgressIndicator.tsx` — shows "X of Y participants voted" (count, not values, until story ends)

### Architecture Decisions
- Vote document path: `/sessions/{sessionId}/stories/{storyId}/votes/{userId}` — document ID is `userId`, so re-voting is a `setDoc` (upsert), not `addDoc`; this natively enforces one-vote-per-user
- `useVotes` only subscribes when a story is `active`; unsubscribes when story ends to avoid unnecessary reads post-reveal
- Participant count is derived from `useVotes` (vote collection length) for MVP; total session participants not tracked separately (acceptable for MVP with auto-reveal)
- `VotingPanel` disabled when `story.status !== 'active'`; selected card stored in local `useState`, initialized from existing vote if user already voted (handles rejoin scenario)
- Master can also vote (per spec: everyone votes)

### Firebase / Data Model Changes
**Firestore write — vote upsert:**
```
/sessions/{sessionId}/stories/{storyId}/votes/{userId} {
  userId: string,
  displayName: string,
  value: string,       // e.g. "5" or "M"
  submittedAt: serverTimestamp()
}
```

### Security Rules Changes
None yet (PR 09).

### UI Changes
- `VotingPanel`: responsive flexbox grid of `VotingCard` components
- `VotingCard`: MUI `Card` variant, 60×80px, centered number/text, hover elevation, selected state (colored border + background), disabled state (opacity + pointer-events: none)
- Cards disabled when `story.status !== 'active'`
- Selected card persists if user has already voted (pre-selected on load)
- `VoteProgressIndicator`: `LinearProgress` bar + "X voted" text; visible during active story
- After story ends: vote values hidden until results panel (PR 08) replaces them

### Testing Strategy
- **Manual:** Open session in 3 browser tabs (different users); all vote; verify vote count indicator increments in real-time
- **Manual:** Change vote before story ends; verify latest value is stored in Firestore
- **Manual:** Join session after story started; can vote; cards disabled after story ends

### Definition of Done
- [ ] Voting cards render from `session.pointScale`
- [ ] Vote upserted to Firestore on card click
- [ ] Vote change before story end works (overwrites)
- [ ] Cards disabled after story ends
- [ ] Vote progress indicator updates in real-time

### Rollback Strategy
Git revert PR 07. Vote documents in Firestore are harmless; can be deleted via console.

### Post-Merge Validation
- Verify in Firestore console that `/votes/{userId}` documents are created with correct values

---

## PR 08 — Results Display & Vote Aggregation

### Goal
After a story ends, automatically reveal all votes and display the calculated average (for numeric scales). Implement the Ended Session read-only view showing all stories with results.

### Scope
**Files created/modified:**
- `src/features/session/ResultsPanel.tsx` — replaces `VotingPanel` when story is ended; shows all votes + average
- `src/features/session/VoteResultRow.tsx` — single vote: avatar/name + selected value chip
- `src/utils/aggregationUtils.ts` — `calculateAverage(votes: Vote[], isNumericScale: boolean): number | null`
- `src/features/session/storyService.ts` — update `endStory()` to read votes subcollection, compute average, write to `story.average`
- `src/features/session/EndedSessionView.tsx` — full read-only session view rendered when `session.status === 'ended'`
- `src/features/session/StoryResultCard.tsx` — collapsible card per story: title, average, vote list

### Architecture Decisions
- `endStory()` reads all docs from `/votes` subcollection, computes average client-side (master only), and writes result to `story.average`. This avoids Cloud Functions for MVP. Race condition risk is minimal since only master triggers `endStory`
- Average formula: `sum(parseFloat(v.value)) / count` for all votes where `parseFloat` is not `NaN`, when `isNumericScale: true`. Returns `null` otherwise
- `ResultsPanel` uses the existing `useVotes` hook (already subscribed); no extra reads at reveal
- `EndedSessionView` queries all stories with `status: 'ended'`, fetches vote subcollections lazily (on expand) to avoid over-reading
- Reveal is **automatic** (no button): `ResultsPanel` renders whenever `story.status === 'ended'`

### Firebase / Data Model Changes
- `story.average: number | null` — written by master when calling `endStory()`
- No new collections

### Security Rules Changes
None yet.

### UI Changes
- `ResultsPanel`: shown in `ActiveStoryPanel` when story is ended
  - Average displayed prominently: large `Typography` (e.g., "Average: 5.0") or "N/A" for non-numeric
  - Scrollable list of `VoteResultRow`: user avatar (initials) + value `Chip`
  - "No votes submitted" state
- `EndedSessionView`: full-page read-only view (replaces panels layout)
  - "Session Ended" header with end date
  - List of `StoryResultCard` components in chronological order
  - Each `StoryResultCard`: expandable (MUI `Accordion`), shows title + average summary collapsed, full vote breakdown expanded
  - No voting controls, no timer, no add-story input

### Testing Strategy
- **Manual:** End story with 3 votes; verify all votes appear immediately; verify average calculated correctly
- **Manual:** End story with 0 votes; verify "No votes submitted" shown, average = N/A
- **Manual:** End session; verify `EndedSessionView` renders with all stories
- **Manual:** From dashboard, open an ended session; verify read-only view

### Definition of Done
- [ ] Results auto-reveal on story end
- [ ] Average correct for numeric scales
- [ ] Non-numeric scales show "N/A" average
- [ ] Ended session read-only view complete
- [ ] No voting controls visible in ended state

### Rollback Strategy
Git revert PR 08. No schema changes (only `story.average` field added, backward-compatible).

### Post-Merge Validation
- Verify `story.average` written to Firestore on `endStory()`
- Verify dashboard shows ended sessions with "Ended" chip, openable as read-only

---

## PR 09 — Firestore Security Rules

### Goal
Implement and deploy production-grade Firestore security rules enforcing all access control requirements: authentication required, master-only writes, one vote per user, session isolation.

### Scope
**Files created/modified:**
- `firestore.rules` — full security rules implementation
- `firebase.json` — add `"firestore": { "rules": "firestore.rules" }` section
- `.firebaserc` — project alias configuration
- `firestore.indexes.json` — declare composite indexes:
  - `sessions`: `masterId ASC, createdAt DESC`
  - `sessions/{id}/stories`: `sessionId ASC, createdAt ASC` (if needed)

### Architecture Decisions
- All rules require `request.auth != null` as baseline
- Master verification: `request.auth.uid == resource.data.masterId`
- Vote write: `request.auth.uid == request.resource.data.userId` AND document ID must equal `request.auth.uid` (preventing vote spoofing)
- Session read: any authenticated user (to allow follower join via link)
- Story read: any authenticated user
- Vote read: any authenticated user in the session (to show results)
- Session write (create): any authenticated user (to allow session creation) — note: masterId must equal `request.auth.uid`
- Story write (create/update): only master (`get(/sessions/{sessionId}).data.masterId == request.auth.uid`)
- Session update (status): only master
- Vote write: only the vote owner (`request.auth.uid == documentId`)

**Full rules outline:**
```
service cloud.firestore {
  match /databases/{database}/documents {
    // Sessions
    match /sessions/{sessionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.masterId == request.auth.uid;
      allow update: if request.auth != null
        && resource.data.masterId == request.auth.uid;
      allow delete: if false;

      // Stories
      match /stories/{storyId} {
        allow read: if request.auth != null;
        allow create, update: if request.auth != null
          && get(/databases/$(database)/documents/sessions/$(sessionId)).data.masterId
             == request.auth.uid;
        allow delete: if false;

        // Votes
        match /votes/{userId} {
          allow read: if request.auth != null;
          allow create, update: if request.auth != null
            && request.auth.uid == userId
            && request.resource.data.userId == request.auth.uid;
          allow delete: if false;
        }
      }
    }
  }
}
```

### Firebase / Data Model Changes
No new collections. All prior writes must conform to these rules — verify each PR's write patterns are compatible.

### Security Rules Changes
**Full rules as above.** Deploy via `firebase deploy --only firestore:rules`.

### UI Changes
None. If rules are misconfigured, errors will surface as Firestore permission-denied errors (handle in existing error states from previous PRs).

### Testing Strategy
- **Manual:** Attempt to vote as wrong user (modify userId in devtools) → expect permission denied
- **Manual:** Attempt to end story as non-master → expect permission denied
- **Manual:** Unauthenticated fetch to Firestore → expect permission denied
- **Automated:** Firebase Emulator + `@firebase/rules-unit-testing` — write at minimum:
  - `test('master can create session')`
  - `test('non-master cannot update session')`
  - `test('voter can write own vote')`
  - `test('voter cannot write another user's vote')`
  - `test('unauthenticated access denied')`

### Definition of Done
- [ ] Rules deployed to Firebase
- [ ] All existing manual flows still work (no regressions)
- [ ] Unit tests for rules pass
- [ ] No `permission-denied` errors in normal usage

### Rollback Strategy
Redeploy previous `firestore.rules` (or permissive dev rules). Firebase Console → Firestore → Rules → edit and publish.

### Post-Merge Validation
- Deploy to staging; run full manual test suite
- Verify Firebase Console shows rules published timestamp updated

---

## PR 10 — WebRTC Conference (Peer-Limited, Optional)

### Goal
Implement optional WebRTC audio/video conference with ephemeral chat. Peer-limited full mesh (≤8 active video participants). Conference only initializes when `session.conferenceEnabled: true`. Conference terminates when session ends.

### Scope
**Files created/modified:**
- `src/features/conference/ConferenceContext.tsx` — `ConferenceProvider`, `useConference` hook
- `src/features/conference/useWebRTC.ts` — manages `RTCPeerConnection` instances, ICE negotiation, stream management
- `src/features/conference/signalingService.ts` — Firestore-based signaling: writes offer/answer/ICE to `/sessions/{sessionId}/signaling/{peerId}`
- `src/features/conference/ConferencePanel.tsx` — full implementation: video grid + chat
- `src/features/conference/VideoGrid.tsx` — responsive grid of `VideoTile` components (max 8 shown)
- `src/features/conference/VideoTile.tsx` — single peer video: `<video>` element, mute indicator, name label
- `src/features/conference/ChatPanel.tsx` — ephemeral message list + input (Firestore subcollection, deleted on session end)
- `src/features/conference/MediaControls.tsx` — mute mic, toggle camera buttons
- `src/features/session/storyService.ts` — `endSession()` updated to delete `/signaling` subcollection + `/chat` subcollection

### Architecture Decisions
- **Signaling:** Firestore subcollection `/sessions/{sessionId}/signaling/{userId}` used as signaling channel (no dedicated WebSocket server needed for MVP)
- **Peer limit:** Maximum 8 video participants. When ≥8 active peers, additional joiners enter "audio-only" mode (camera disabled, mic still works) — shown with avatar tile
- **Mesh topology:** Each peer establishes `RTCPeerConnection` with every other peer (full mesh). Safe for ≤8 peers (28 connections max)
- **ICE servers:** Use public STUN servers (Google) for MVP; TURN server deferred (note: will fail for symmetric NAT users)
- **Chat:** Stored in `/sessions/{sessionId}/chat/{messageId}`. Ephemeral: entire subcollection written to but wiped on session end. Not paginated (MVP)
- **Conference teardown:** `useConference` listens to `session.status`; on `'ended'`, closes all `RTCPeerConnection` instances and stops media tracks
- **No conference when disabled:** `ConferenceProvider` and `useWebRTC` do not initialize (`getUserMedia` not called) when `session.conferenceEnabled: false`

### Firebase / Data Model Changes
**New Firestore paths:**
```
/sessions/{sessionId}/signaling/{userId} {
  offer?: RTCSessionDescriptionInit,
  answer?: RTCSessionDescriptionInit,
  iceCandidates: ICECandidate[]
}

/sessions/{sessionId}/chat/{messageId} {
  userId: string,
  displayName: string,
  text: string,
  sentAt: Timestamp
}
```
Both subcollections deleted when session ends.

### Security Rules Changes
Add to `firestore.rules`:
```
match /signaling/{userId} {
  allow read, write: if request.auth != null;
}
match /chat/{messageId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid;
  allow delete: if resource.data.userId == request.auth.uid
    || get(/sessions/{sessionId}).data.masterId == request.auth.uid;
}
```
Deploy updated rules.

### UI Changes
- `ConferencePanel` (right column, 3/12 grid cols):
  - `VideoGrid`: 2-col grid, each `VideoTile` 160px tall; scrollable if > 4 tiles
  - `VideoTile`: `<video autoPlay muted={isSelf}>`, name overlay, mic-muted icon
  - "Audio only" tile for 9+ participants (avatar + name)
  - `MediaControls`: mic mute `IconButton`, camera toggle `IconButton`
  - `ChatPanel` below video grid: scrollable message list + `TextField` + send `Button`
  - Completely absent (no DOM) when `conferenceEnabled: false`

### Testing Strategy
- **Manual (LAN):** Open session with `conferenceEnabled: true` in 2 browser tabs on localhost; verify video/audio streams connect; verify chat messages appear
- **Manual:** Open with `conferenceEnabled: false`; verify no `getUserMedia` call (check browser permissions prompt absent)
- **Manual:** End session; verify streams stop and chat input disabled

### Definition of Done
- [ ] Video conference works between 2 peers in local test
- [ ] Peer limit enforced (9th peer goes audio-only)
- [ ] Conference completely absent when disabled
- [ ] Chat messages appear in real-time
- [ ] Conference terminates on session end
- [ ] `getUserMedia` never called when conference disabled

### Rollback Strategy
Git revert PR 10. Conference is entirely opt-in and isolated to `ConferencePanel` + `ConferenceContext`. Reverting has zero impact on voting/session functionality.

### Post-Merge Validation
- Cross-browser test (Chrome + Firefox) for WebRTC compatibility
- Verify Firestore signaling documents cleaned up after session end

---

## PR 11 — Firebase Hosting & Deployment Configuration

### Goal
Configure Firebase Hosting for deployment, set up environment-specific builds, add SPA rewrite rules, and document the deployment process.

### Scope
**Files created/modified:**
- `firebase.json` — hosting config: `public: "dist"`, SPA rewrite `"**" → "/index.html"`, cache headers
- `.firebaserc` — project aliases: `default` (production), `staging` (if applicable)
- `.env.production` — production Firebase config (never committed; document in `.env.example`)
- `.env.development` — dev Firebase config (never committed)
- `vite.config.ts` — verify `base: "/"` set for Hosting
- `README.md` — add deployment instructions
- `.github/workflows/deploy.yml` (optional) — CI/CD with `firebase deploy` on merge to main

### Architecture Decisions
- Firebase Hosting serves `dist/` directory from `vite build`
- SPA rewrite rule ensures React Router routes work on direct URL access
- Cache strategy: `index.html` → `no-cache`; JS/CSS chunks → `max-age=31536000, immutable` (content-hashed by Vite)
- Environment variables injected via Vite's `import.meta.env` (prefixed `VITE_`)
- Never store Firebase config in source; use CI secrets or `.env` files (gitignored)

### Firebase / Data Model Changes
None.

### Security Rules Changes
None.

### UI Changes
None.

### Testing Strategy
- **Manual:** `npm run build && firebase serve` — verify app loads at `localhost:5000`; verify direct navigation to `/session/test-id` works (not 404)
- **Manual:** Deploy to staging Firebase project; verify production build works

### Definition of Done
- [ ] `firebase deploy` succeeds
- [ ] Production URL loads app
- [ ] Direct URL navigation works (SPA rewrite)
- [ ] Firestore rules deployed alongside hosting
- [ ] No Firebase config in committed files

### Rollback Strategy
Firebase Hosting: `firebase hosting:rollback` reverts to previous release. Zero code changes needed.

### Post-Merge Validation
- Access production URL
- Verify all routes accessible via direct URL
- Confirm Firebase Console → Hosting shows active deployment

---

## PR 12 — Error Handling, Loading States, Accessibility & Polish

### Goal
Harden the application with comprehensive error boundaries, meaningful loading/empty states, accessibility improvements, and responsive layout polish. This is the final PR before v1.0.

### Scope
**Files created/modified:**
- `src/components/ErrorBoundary.tsx` — React Error Boundary with fallback UI
- `src/components/LoadingSpinner.tsx` — centered MUI `CircularProgress` wrapper
- `src/components/SkeletonLoader.tsx` — MUI `Skeleton` variants for list/card loading states
- All page/feature components — wrap with `ErrorBoundary`, replace ad-hoc loading with `SkeletonLoader`
- `src/features/session/SessionPage.tsx` — handle `session` not found: redirect + user-friendly message
- `src/features/auth/LoginPage.tsx` — a11y: focus management, ARIA live regions for OTP errors
- `src/features/session/VotingCard.tsx` — a11y: keyboard navigation (`onKeyDown`), `role="radio"`, `aria-checked`
- `src/features/session/CountdownTimer.tsx` — a11y: `role="timer"`, `aria-live="polite"` for last-30s warning
- `src/App.css` / `src/index.css` — responsive breakpoint tweaks, mobile layout fixes
- `src/utils/errorUtils.ts` — `parseFirebaseError(code: string): string` — user-friendly error messages

### Architecture Decisions
- One top-level `ErrorBoundary` wraps `RouterProvider`; feature-level boundaries around `SessionPage` and `ConferencePanel`
- Network errors from Firestore listeners are caught in hooks and surfaced via `error` state; displayed as `Alert` banners (not thrown to boundary)
- `parseFirebaseError` maps common Firebase error codes (`auth/invalid-otp`, `permission-denied`, etc.) to human-readable strings
- Voting card keyboard nav: `Tab` to focus deck, arrow keys to navigate, `Space`/`Enter` to select

### Firebase / Data Model Changes
None.

### Security Rules Changes
None.

### UI Changes
- All async operations show `Skeleton` or `CircularProgress` during load
- Firestore errors show inline `Alert` (not blank screen)
- Voting cards keyboard-navigable with visible focus ring
- Mobile: bottom sheet pattern for story list on small screens
- Empty states: meaningful copy + illustrative icon (MUI icons, no external images)
- `document.title` updated dynamically to session title when on session page

### Testing Strategy
- **Manual a11y:** Tab through login form and voting deck with keyboard only; verify all interactive elements reachable
- **Manual:** Simulate Firestore permission denied error; verify user-friendly message shown
- **Manual:** Open on 375px mobile viewport; verify all panels usable
- **Automated:** Integrate `axe-core` via `jest-axe` for snapshot a11y tests on `LoginPage`, `VotingPanel`

### Definition of Done
- [ ] Error boundaries prevent white-screen crashes
- [ ] All loading states use Skeleton/Spinner
- [ ] Keyboard navigation works for voting
- [ ] Mobile layout tested at 375px, 768px, 1280px
- [ ] `axe-core` reports zero critical violations
- [ ] `npm run build` and `npm run lint` pass

### Rollback Strategy
Git revert PR 12. All changes are defensive/additive; no data or functional impact.

### Post-Merge Validation
- Accessibility audit via Chrome DevTools / Lighthouse
- Full end-to-end manual test of complete user journey (sign in → create session → add story → vote → end → review)

---

## Dependency Installation Reference

Install all required packages in PR 01:

**Production:**
```bash
npm install firebase @mui/material @mui/icons-material @emotion/react @emotion/styled react-router-dom react-hook-form
```

**Dev:**
```bash
npm install --save-dev @firebase/rules-unit-testing jest jest-axe @testing-library/react @testing-library/jest-dom
```

---

## PR Sequence Summary

| PR | Title | Blocks |
|----|-------|--------|
| 01 | Foundation: Dependencies, Folder Structure & Theme | All |
| 02 | Firebase Auth: Email / OTP Flow | 03, 04 |
| 03 | Routing & App Shell | 04, 05 |
| 04 | Dashboard: Session List & Create Session Modal | 05 |
| 05 | Session Page Shell & Real-Time Hooks | 06, 07 |
| 06 | Story Management (Master Controls) | 07, 08 |
| 07 | Voting (Follower + Master) | 08 |
| 08 | Results Display & Vote Aggregation | 09 |
| 09 | Firestore Security Rules | 10, 11 |
| 10 | WebRTC Conference | 11 |
| 11 | Firebase Hosting & Deployment | 12 |
| 12 | Error Handling, Accessibility & Polish | — |

PRs 10 and 11 can be developed in parallel after PR 09 merges.

---

## Firestore Data Model Summary

```
/sessions/{sessionId}
  title: string
  pointScale: string[]
  isNumericScale: boolean
  conferenceEnabled: boolean
  masterId: string
  status: 'active' | 'ended'
  createdAt: Timestamp

  /stories/{storyId}
    title: string
    description?: string
    status: 'pending' | 'active' | 'ended'
    timerStart?: Timestamp
    average?: number | null
    createdAt: Timestamp

    /votes/{userId}
      userId: string
      displayName: string
      value: string
      submittedAt: Timestamp

  /signaling/{userId}          ← conference only
    offer?: object
    answer?: object
    iceCandidates: object[]

  /chat/{messageId}            ← conference only
    userId: string
    displayName: string
    text: string
    sentAt: Timestamp
```

---

## Required Firebase Console Setup (Pre-Development)

1. Create Firebase project (or use existing)
2. Enable **Firestore** in production mode
3. Enable **Authentication** → Email/Password + Email Link (passwordless) providers
4. Enable **Firebase Hosting**
5. Record `firebaseConfig` object → add to `.env.development` and CI secrets
6. Create Firestore composite index: `sessions` collection, `masterId ASC + createdAt DESC`
