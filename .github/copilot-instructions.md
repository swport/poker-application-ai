
# Copilot Instructions for Poker Planning MVP

## Big Picture Architecture
- **Frontend:** React (client-only, no SSR), MUI 5 for UI, Vite for build tooling. All rendering is client-side; no backend-for-frontend layer.
- **Backend:** Firebase (Authentication via Email/OTP, Firestore for real-time session/story/vote sync, supporting services).
- **Conference:** Optional WebRTC audio/video, enabled per session. Peer-limiting or SFU required for scalability.

## Major Components & Data Flow
- **Session Lifecycle:**
  - Poker master creates session (title, point scale, conference toggle).
  - Followers join via shareable link (must authenticate).
  - Stories are managed by master only (add/start/end).
  - Voting is real-time, one vote per user per story, can change before timer ends.
  - Session and story state sync via Firestore listeners.
- **Voting:**
  - Votes stored per story, per user. No vote = no estimate for that user.
  - Aggregation avoids rewriting entire collections (see `docs/specs.md`).
- **Conference:**
  - WebRTC initialized only if enabled for session. Must handle peer scaling.

## Developer Workflows
- **Build:**
  - Use `npm run build` (runs `tsc -b` then `vite build`).
- **Dev Server:**
  - Use `npm run dev` for local development (Vite HMR).
- **Lint:**
  - Use `npm run lint` (ESLint, see `eslint.config.js`).
- **Debug:**
  - Use React DevTools and Firebase Emulator Suite for local development.
- **Deploy:**
  - Deploy via Firebase Hosting (if configured).
- **Testing:**
  - (No test scripts present; add if/when needed.)

## Project-Specific Conventions
- **Session isolation:** All Poker sessions are independent (no cross-session data leaks).
- **Role-based actions:** Only master can start/end stories or sessions; followers can only vote.
- **Minimal UI:** Prioritize UX and responsiveness over visual complexity (see `docs/design.md`).
- **No persistent chat:** Chat is ephemeral, not stored long-term.
- **No SSR:** All rendering is client-side.
- **TypeScript strictness:** See `tsconfig.app.json` and `tsconfig.node.json` for strict settings and bundler mode.
- **Linting:** ESLint config uses recommended, React Hooks, and Vite-specific rules. Expand with type-aware rules as needed (see `README.md`).

## Integration Points & Patterns
- **Firebase:**
  - Auth: Email/OTP only.
  - Firestore: Real-time updates for sessions, stories, votes.
  - Security: Enforce access rules (one vote per user per story, master-only actions).
- **WebRTC:**
  - Only initialized if conference is enabled for session.
  - Must handle peer scaling (avoid mesh explosion).
- **UI/UX:**
  - See `docs/design.md` for layout, role-based views, and minimal design patterns.

## Examples & References
- **Session logic:** See `docs/specs.md` for edge cases and acceptance criteria.
- **UI/UX:** See `docs/design.md` for screen layouts and interaction patterns.
- **Build/Lint:** See `package.json` scripts and `eslint.config.js` for commands and config.

---

**Update this file if major architecture or workflow changes occur.**
