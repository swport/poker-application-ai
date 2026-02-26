**Application Description for UI/UX Mockup Generation**

Design a clean, production-ready MVP web application for real-time Poker planning sessions. The application is browser-based, desktop-first, and optimized for clarity and speed over visual decoration. Use a minimal, modern interface with strong hierarchy, clear spacing, and distraction-free layouts. Prioritize usability, legibility, and real-time interaction feedback.

---

## Core Concept

A Poker session platform where:

* A **Poker Master** creates and manages estimation sessions.
* **Followers** join via a shared link.
* Stories are estimated using selectable point cards (e.g., Fibonacci or T-shirt sizes).
* Optional WebRTC audio/video conference and chat can be enabled.
* Sessions can be ended and later reviewed in read-only mode.

---

## User Roles

### 1. Poker Master

* Creates and configures sessions
* Adds and manages stories
* Starts and ends story timers
* Ends entire session
* Reviews past sessions

### 2. Follower

* Joins session via link
* Views stories
* Votes using point cards
* Can change vote before timer ends

---

## Primary Screens

### 1. Authentication Screen

* Minimal layout
* Email input
* OTP flow
* Clean centered card layout
* No visual noise

---

### 2. Dashboard (Poker Master Home)

**Purpose:** Manage sessions

Layout:

* Top navigation bar (App name + Profile menu)
* Main section:

  * “Create New Poker” button (primary CTA)
  * List of past sessions in card or table format

    * Title
    * Date
    * Status (Active / Ended)
    * Open button

Simple, professional, structured.

---

### 3. Create Poker Modal / Page

Fields:

* Title input
* Point scale input (comma-separated)
* Conference toggle (checkbox or switch)
* Create button (primary action)

Clean form layout. No unnecessary decoration.

---

### 4. Active Poker Session (Master View)

Layout structured in 3 main areas:

**Top Bar**

* Session title
* Session status indicator (Active / Ended)
* End Session button (visible only to master)

**Left Panel**

* Story list
* Add story input
* Start story button
* Active story highlighted
* Past stories visually differentiated

**Main Center Panel**

* Active story title (large, bold)
* Countdown timer (prominent)
* Voting progress indicator
* Reveal results section (after story ends)
* Display average result clearly

**Right Panel (Optional)**

* Conference video grid (if enabled)
* Chat panel below video

Layout must adapt if conference is disabled (center panel expands).

---

### 5. Active Poker Session (Follower View)

Similar layout to master but:

* No session controls
* No add story
* Voting card deck displayed prominently
* Selected card visually locked
* Cards disabled after story ends
* Results shown after reveal

Cards should be large, tappable, evenly spaced.

---

### 6. Ended Session View (Read-Only)

* Stories listed chronologically
* Each story shows:

  * Final average
  * All individual votes (optional collapsible section)
* No voting controls
* No timer
* No conference

Clear indication: “Session Ended”

---

## UI/UX Characteristics

* Use neutral color palette (light theme default).
* High contrast text.
* Clear spacing and padding.
* Subtle elevation for cards.
* Real-time updates visually indicated (e.g., smooth updates, not flashy animations).
* Avoid clutter.
* Avoid unnecessary gradients or decorative effects.
* Functional, not playful.

---

## Voting Interaction Design

* Card grid layout for point values.
* Hover effect.
* Selected card clearly highlighted.
* Disabled state visually obvious.
* Real-time vote count indicator (optional).

---

## Conference UI

When enabled:

* Grid layout for participants.
* Responsive resizing.
* Mute/unmute and camera toggle controls.
* Minimal UI chrome.

When disabled:

* Conference section completely removed.
* No empty placeholders.

---

## Scalability Considerations (for UI)

* Layout must remain usable with:

  * Up to 200 participants in one session.
* Voting re