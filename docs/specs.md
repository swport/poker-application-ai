# Problem

Build a production-ready MVP web application for Poker planning sessions.  
Users can create and join Poker sessions, estimate stories using predefined point values, and optionally conduct WebRTC-based audio/video conferences with chat.

The system must support real-time story updates, voting, result calculation, and session lifecycle management.

---

# Constraints

- Front-end:
  - React (pure client-side, no BFF layer)
  - MUI 5 for UI components
  - UX prioritized over visual complexity
- Back-end:
  - Firebase (Authentication + supporting services)
- Authentication:
  - Firebase Authentication (Email / OTP)
- Conference:
  - WebRTC-based
  - Optional per Poker session
- MVP excludes:
  - Call recording
  - Long-term chat persistence

---

# Inputs / Outputs

## Inputs

### Poker Master
- Poker title (string)
- Point scale (comma-separated values)
- Enable/disable conference (boolean)
- Story title/description
- Start story action
- End story action
- End Poker session action
- Update Poker metadata (title, point scale, conference toggle before session start)

### Follower
- Authentication credentials (email/OTP)
- Point selection (single value per story)

---

## Outputs

- Shareable Poker link
- Real-time story list updates
- Active story with countdown timer (~3 minutes default)
- Locked user vote
- Aggregated average of submitted points
- Session status (active / ended)
- Historical Poker sessions list (for master)
- Optional real-time audio/video conference
- Optional real-time chat (non-persistent)

---

# Edge Cases

- User joins after story has started
  - Can view story
  - Can vote only if timer not expired and story not ended
- User changes vote before timer ends
  - Latest vote replaces previous
- No votes submitted
  - Average result = null / no estimate
- Conference disabled
  - No WebRTC initialization
- Network interruption during vote
  - Vote should sync upon reconnection if within allowed time
- Poker master disconnects
  - Session remains active
  - No new story can be started unless master reconnects
- Poker session ended
  - No further stories can be added
  - No voting allowed
  - Conference (if enabled) is terminated
- High traffic across many simultaneous Poker sessions
  - System must remain stable and responsive

---

# Non-functional Requirements

## Scalability

- System must support at least 10,000 concurrent authenticated users across multiple Poker sessions.
- Individual Poker session should support at least 200 concurrent participants.
- Real-time voting updates must remain under 1 second latency under peak load.
- Data model must avoid write hotspots (e.g., avoid single-document high-frequency writes).
- Vote aggregation should not require re-writing entire collections per vote.
- WebRTC connections must use peer-limiting or SFU strategy to prevent mesh explosion.
- Firebase quotas, connection limits, and concurrent listener limits must be evaluated and respected.
- Horizontal scalability must rely on managed Firebase infrastructure (no single-node bottlenecks).
- System must degrade gracefully (e.g., disable conference before impacting core voting).

## General

- Secure access rules (users can only vote once per story).
- Session isolation between different Poker links.
- Only Poker master can update or end a session.
- Historical sessions must be queryable by master.
- Responsive UI (desktop-first, mobile-compatible).
- High availability (Firebase SLA dependent).
- Clean, minimal UI.
- WebRTC initialized only when enabled.
- No server-side rendering.

---

# Acceptance Criteria

- User can authenticate using Firebase Email/OTP.
- Poker master can create a new Poker with:
  - Title
  - Custom point scale
  - Optional conference toggle.
- System generates a shareable link.
- Any user accessing link must authenticate before joining.
- Poker master can:
  - Add stories.
  - Start a story (timer auto-starts).
  - End story manually.
  - End the entire Poker session.
  - View list of past Poker sessions they created.
  - Open past session in read-only mode.
- Followers can:
  - View all stories.
  - Vote on active story.
  - Change vote before story ends.
- Timer auto-ends story after defined duration.
- System calculates and displays average vote.
- After session ends:
  - Voting is disabled.
  - Stories are read-only.
  - Conference is terminated.
- Conference initializes only when enabled.
- System supports required concurrency targets without data loss or failure.