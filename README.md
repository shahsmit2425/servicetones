# ServiceTones

A home-services marketplace for the web, iOS, and Android, in one repository. Customers can find professionals, request projects, exchange private messages, and make foreground audio/video calls.

## Explore the complete demo

The app now opens an interactive preview with **25 page types, three roles, and 14 guided scenarios**. No signup is required. Use the top-bar role selector to explore Customer, Provider, or Admin, and choose **Explore all pages** for the directory. Demo actions update shared fictional data and are saved in this browser. Payments, calls, account recovery, support, and moderation in this preview are clearly labeled simulations.

The original backend-connected application is available through **Open live app** (`/#live`). See [the preview guide](docs/PREVIEW.md) for the full page list and end-to-end walkthroughs.

## Included

- Responsive React interface with service search, ZIP filtering, saved professionals and profile details.
- Customer/pro signup, password login and expiring, revocable sessions.
- Public professional profiles with business details, service category and starting hourly rate.
- Project requests, professional acceptance, completion and customer cancellation.
- Private, persistent conversations with live Socket.IO delivery.
- WebRTC audio/video calling with incoming acceptance, decline, hangup, mute and camera controls.
- Capacitor iOS and Android projects, app icons, splash screens and media permissions.
- Node/SQLite backend, Docker deployment, integration tests and GitHub Actions checks.

This is an initial functional MVP, not a production launch or an App Store release. Sample professionals and sample reviews are clearly labeled and cannot be contacted. Create real pro accounts to populate the live directory. Production hosting, TURN relay configuration, native compilation/signing and physical-device call testing remain deployment steps.

## Run locally

Requires Node 22.13 or later and npm.

```sh
npm ci
npm start
```

In a second terminal:

```sh
npm run dev
```

Open http://127.0.0.1:5173. The development server proxies `/api` and `/socket.io` to port 3001. SQLite data is stored in the ignored `data/` folder.

Register a professional in one browser session and a customer in another. From the customer account, open the professional's profile and send a message or request a project. Both participants must be signed in with their apps open for incoming calls. Camera and microphone require the user's permission and a secure context (localhost or HTTPS).

## Production bundle

```sh
npm test
npm run build
npm start
```

The Node server serves the built website and API together at http://localhost:3001. For container hosting, use `docker compose up --build`; its named volume preserves data. Public deployments need HTTPS and an explicit origin allowlist.

## iOS and Android

Set `VITE_API_URL` to your deployed HTTPS API origin before building native apps, then:

```sh
npm run mobile:sync
npm run mobile:android
# On macOS with Xcode and CocoaPods:
npm run mobile:ios
```

The native projects bundle the same React code; they do not point to a remotely hosted webpage. An unset API URL is suitable for same-origin web deployments but cannot connect a native app to your backend.

## Repository guide

| Path | Purpose |
| --- | --- |
| `components/marketplace.tsx` | Customer/pro interface and core workflows |
| `hooks/use-calls.ts` | WebRTC call lifecycle |
| `lib/api.ts`, `shared/` | Shared API client and data types |
| `server/` | Authentication, projects, chat, signaling and tests |
| `android/`, `ios/` | Native application projects |
| `docs/DEPLOYMENT.md` | Hosting, TURN, native builds and store preparation |
| `docs/ARCHITECTURE.md` | Data ownership, security model and current limits |
| `docs/VALIDATION.md` | Verified checks and remaining device tests |

The backend does not yet include payments, review submissions, email verification/password recovery, moderation, attachments, or push/background calling. Messages are stored durably, while the inbox currently displays the latest 200 per conversation.

Interior photo: [Clay Banks on Unsplash](https://unsplash.com/photos/nL2CbhdingE), used under the [Unsplash License](https://unsplash.com/license). Sample profile names, rates and review counts are illustrative.
