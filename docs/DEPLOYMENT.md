# Deploy web, API and mobile apps

## Full-stack web deployment

Use a Node 22.13+ host with a durable volume and WebSocket support. The Dockerfile builds the frontend and serves it from the same process as the API. `docker compose up --build` serves the application on port 3001 with a persistent named volume. Put an HTTPS reverse proxy in front of it for public access and camera/microphone APIs. Configure the exact public web origin and the two native origins in `ALLOWED_ORIGINS`. CORS is an allowlist, not authentication.

The API process reads its configuration from environment variables. For direct local Node use, `node --env-file=.env server/index.mjs` loads a copied `.env.example`. `npm start` uses the current process environment. Vite loads `.env` automatically for build-time `VITE_API_URL`.

Only a single application replica is supported by this SQLite setup. Provision backups and monitoring before collecting customer data. Never deploy with an ephemeral database directory.

## TURN for reliable calls

Run coturn with `use-auth-secret` and a private shared secret. Configure `TURN_URL` (e.g. `turns:turn.your-domain.com:5349`) and `TURN_SECRET` on the server. The authenticated `/api/ice` endpoint generates expiring credentials; the secret never goes into the web/native bundle. Without TURN, some network pairs cannot connect. Verify audio and video across cellular, Wi-Fi and restrictive NATs before launch.

## Native builds

1. Copy `.env.example` to `.env` and set `VITE_API_URL=https://your-api-domain.example` to your actual deployed API origin. Do not include an `/api` suffix.
2. Run `npm ci` and `npm run mobile:sync`.
3. iOS: on macOS, install Xcode and CocoaPods, run `npx cap sync ios`, then `npm run mobile:ios`. Select your Apple team, verify the bundle identifier, and build/archive. The checked-in project has camera/microphone usage descriptions. Pod installation and compilation were not available on Windows.
4. Android: install Android Studio, Android SDK and the JDK supported by the generated Gradle project. Run `npm run mobile:android`, let Gradle sync, and build. The manifest declares camera/microphone access and allows devices without a camera.
5. Verify on physical devices. Complete signing, app metadata, screenshots, privacy disclosures, account-deletion support and store review before submitting.

The generated defaults target Android SDK 35 and iOS 14. Store target requirements change: update to the currently required SDKs and compatible Capacitor version before submission. This repository does not contain signed release binaries or signing keys.

The apps use the shared web UI inside Capacitor. Calls are foreground-only; push notifications and background/native calling integrations are future work.

## Sites browsing preview

`.openai/hosting.json` identifies the registered private Sites frontend. The preview bundle can show sample profiles without a server, with explicit labels. It must be rebuilt with `VITE_API_URL` and a reachable API to enable accounts/chat/projects/calls. The Node/SQLite backend is deployed separately or with the Docker stack above. No customer records or credentials are included in the static bundle.
