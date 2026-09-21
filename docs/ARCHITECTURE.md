# Architecture

ServiceTones is a shared React application bundled as a responsive website and as Capacitor iOS/Android applications. The native directories are real Xcode and Gradle projects; the UI is a WebView application, not separate SwiftUI or Kotlin screens.

## Code map

- `components/marketplace.tsx`: discovery, signup/sign-in, project workflow, inbox, profile dialogs.
- `hooks/use-calls.ts`: consent, device capture, WebRTC negotiation, ICE buffering, mute/camera controls and cleanup.
- `components/call-panel.tsx`: incoming, outgoing, connected call presentation.
- `shared/catalog.ts`: shared application types, services, clearly labeled sample listings.
- `lib/api.ts`: authenticated API client. Session tokens are kept in tab session storage, not persistent local storage. Saved professionals are device-local preferences.
- `server/app.mjs`: Express API, SQLite schema, authentication and Socket.IO signaling.
- `server/test/integration.test.mjs`: real HTTP and WebSocket integration checks with isolated databases.
- `android/`, `ios/`: generated native projects, media permissions and app configuration.
- `vite.app.config.ts`: shared production bundle and local API proxy.

## Data and access

Users register as a customer or professional. Professional signup creates a public business profile. Each project belongs to one customer and optionally one professional. Only the assigned professional can accept or complete it, and only its customer can cancel it before completion. Customers can later assign an unassigned request to a professional in the matching service category.

Conversations are unique per customer/pro pair. HTTP reads and writes check membership. WebSocket connections authenticate with the same expiring session. Messages are stored in SQLite and sent only to participant user rooms. The inbox currently loads the latest 200 messages per conversation; older messages remain stored but are not paginated in this version.

Passwords use a random salt and asynchronous scrypt. Random 256-bit session tokens are hashed in the database, expire after 24 hours, and are revoked on logout. The API has input validation, size limits, rate limits, security headers and configurable CORS origins. Production must use HTTPS. No credentials are committed.

## Calls

Signaling authenticates both participants and checks conversation membership. An invitation must be accepted by its recipient before SDP/ICE signaling is permitted. Ringing expires after 60 seconds; an active signaling session expires after four hours. One call per participant is permitted. WebRTC sends media between devices, with a TURN relay when configured. The application does not record media.

Both apps must remain open. This version does not include push notifications, CallKit, Android foreground services or background/lock-screen calling. Mobile WebView media handling needs physical-device testing. Production networks generally require a TURN server; configure coturn REST shared-secret authentication with `TURN_URL` and `TURN_SECRET` for one-hour credentials.

## Deployment boundaries

The Node server serves both `dist` and `/api` and handles WebSockets on a single origin. SQLite requires a durable local volume. Run one application instance; multiple replicas need shared storage and a Socket.IO adapter before scaling. Back up SQLite using its backup API or a consistent stopped-server volume snapshot, not a live copy of only the `.sqlite` file while WAL is active.

The private Sites deployment contains only the browsing frontend. It has no Node process or SQLite volume. To connect it to a separately deployed API, set `VITE_API_URL` before rebuilding and add that Site origin to `ALLOWED_ORIGINS`. The repository's Docker deployment supports the complete application on a Node host.

## Deliberately outside this first release

Payments, quotes, public review submissions, identity/license verification, email verification, password reset, account deletion/export, attachment uploads, moderation/blocking, appointment calendars, push notifications and admin tooling are not implemented. Do not present sample ratings as real customer reviews. Before a public commercial release, add the operational and account-management features appropriate to the service and complete security, accessibility and physical-device QA.
