# Complete environment-variable reference

## Where values live

Private application settings live in Render groups `servicetones-development-api`, `servicetones-stagging-api`, and `servicetones-production-api`. Link each group only to its API and mail worker. Never link them to either frontend.

| Service | Variables |
| --- | --- |
| Customer Web Service | NODE_ENV=production, NODE_VERSION=22.16.0, APP_ENV, SITE_URL, API_URL |
| Admin Static Site | NODE_VERSION=22.16.0, VITE_APP_ENV, VITE_API_URL |
| API and worker | Server/provider variables below; database URL injected separately by Blueprint |

`API_URL` is the HTTPS backend origin, without /api or a trailing slash. `SITE_URL` is the customer website origin. `VITE_API_URL` must equal the environment's API_URL; `VITE_APP_ENV` is development, stagging or production. VITE values are public build-time settings and require rebuilding admin when changed.

Add `ADMIN_ALLOWED_UIDS` to the **API group only**: a comma-separated list of explicitly approved Firebase user IDs. An empty list disables all admin API access. This setting does not grant access alone; follow [ADMIN_SECURITY.md](ADMIN_SECURITY.md).

`ALLOWED_ORIGINS` must include the customer origin, admin origin, capacitor://localhost and https://localhost. CORS is not the admin authorization boundary.

The same variable names apply in all environments with isolated credentials. The Blueprint supplies only non-secret defaults. Add real values manually; never commit them.

## Core and database

| Variable | Required / default | Value or source |
| --- | --- | --- |
| NODE_ENV | Render: `production`; local: `development` | Controls optimized server execution, independent of APP_ENV |
| APP_ENV | Required | `development`, `stagging`, or `production` |
| NODE_VERSION | Blueprint sets `22.16.0` | Render build/runtime Node version; maintain within Node 22 |
| PORT | Render supplies; local defaults to `5173` | HTTP listening port |
| SITE_URL | Required HTTPS on Render | Exact canonical website URL, no trailing slash |
| ALLOWED_ORIGINS | Required for your domain setup | Comma-separated site origin plus `capacitor://localhost,https://localhost`; local origins only in development |
| DATABASE_URL | Required; Blueprint injects | Matching Render Postgres **internal** connection string. Never expose publicly |
| DATABASE_SSL | Blueprint: `render-internal`; default: `require` | `require` validates certificates; `render-internal` encrypts to Render's private dpg host with its self-signed certificate; `disable` only for local Postgres |
| DATABASE_CA_CERT | Optional | PEM CA for certificate-validated external Postgres connections |
| RENDER_GIT_COMMIT | Render automatically supplies | Deployed commit ID; used to match web/mobile releases |
| RENDER | Render automatically supplies | The private-host TLS policy requires `true`; do not set this locally to bypass checks |
| SUPPORT_EMAIL | Required | Your actual support mailbox |

The Blueprint disables external database access. Internal TLS uses Render's documented self-signed-certificate behavior; the special mode is rejected outside Render or for an unrelated hostname. Do not set `NODE_TLS_REJECT_UNAUTHORIZED=0`.

## Firebase and Google/Apple authentication

Use a **separate Firebase project per environment**. Enable Email/Password, Google, and Apple in Firebase Authentication.

| Variable | Visibility | Value or source |
| --- | --- | --- |
| FIREBASE_PROJECT_ID | Public project identifier | Firebase project ID |
| FIREBASE_CLIENT_EMAIL | Server only | Service-account client_email |
| FIREBASE_PRIVATE_KEY | Secret | Service-account private_key PEM; literal `\\n` is accepted and converted to newlines |
| FIREBASE_WEB_API_KEY | Public, restricted | Firebase web app apiKey; restrict API usage appropriately |
| FIREBASE_AUTH_DOMAIN | Public | Firebase authDomain; authorize your website domain in Firebase |
| FIREBASE_APP_ID | Public | Firebase web app appId |
| FIREBASE_MESSAGING_SENDER_ID | Public, optional for current auth | Firebase messagingSenderId |

A Firebase web API key identifies the project; it is not an Admin service-account secret. The public config endpoint exposes only the web fields, never `FIREBASE_PRIVATE_KEY` or `FIREBASE_CLIENT_EMAIL`.

Google OAuth web client configuration is managed in Firebase/Google Cloud. Android signing fingerprints and iOS reversed-client-ID URL schemes are needed for native sign-in. Native Firebase config files belong in GitHub environment secrets, described below.

## Upstash Redis

| Variable | Required | Value or source |
| --- | --- | --- |
| UPSTASH_REDIS_REST_URL | Yes on Render | Upstash database REST endpoint |
| UPSTASH_REDIS_REST_TOKEN | Yes, secret | Upstash REST token |

Use a distinct database per environment. Rate-limit keys are additionally prefixed by APP_ENV. Local development can omit Redis; deployed environments fail config validation if it is missing.

## Stripe payments, payouts and document verification

| Variable | Required | Value or source |
| --- | --- | --- |
| STRIPE_SECRET_KEY | Yes, secret | `sk_test_...` in development/stagging; `sk_live_...` in production |
| STRIPE_WEBHOOK_SECRET | Yes, secret | Signing secret for this environment's `/api/webhooks/stripe` endpoint |
| STRIPE_CONNECT_WEBHOOK_SECRET | Yes, secret | Signing secret for the connected-account `/api/webhooks/stripe-connect` endpoint |
| STRIPE_PLATFORM_FEE_PERCENT | Default `10` | Platform fee, 0–30; confirm your business pricing before live payments |

Checkout is Stripe-hosted, so there is no browser publishable key in this implementation. Enable Stripe Identity and Connect in the account. Identity and Connect serve different purposes; both are required for professional onboarding.

Register `identity.verification_session.verified`, `identity.verification_session.requires_input`, `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `charge.refunded` at `/api/webhooks/stripe`. Configure a separate connected-account destination for `account.updated` at `/api/webhooks/stripe-connect`, with its own `STRIPE_CONNECT_WEBHOOK_SECRET`.

## Daily calls

| Variable | Required | Value or source |
| --- | --- | --- |
| DAILY_API_KEY | Yes, secret | Daily account REST API key |

“Saily.io” was interpreted as Daily.co / Daily calling. The implementation uses the official `api.daily.co` REST API. Use distinct Daily domains/accounts for isolation where available. No Daily API key is shipped to clients; only short-lived, room-scoped participant tokens.

## Cloudflare R2 file storage

| Variable | Required | Value or source |
| --- | --- | --- |
| R2_ACCOUNT_ID | Yes | Cloudflare account ID |
| R2_ACCESS_KEY_ID | Yes, secret | Bucket-scoped R2 S3 access key |
| R2_SECRET_ACCESS_KEY | Yes, secret | Matching R2 secret key |
| R2_BUCKET | Yes | Private bucket for this environment |

Create three private buckets. Grant the credential access only to its intended bucket. Configure bucket CORS for the website and native origins; allow PUT/GET/HEAD and Content-Type. The app generates signed upload/download URLs. Do not set a public bucket URL or use a Cloudflare global API key.

Cloudflare DNS/custom-domain management needs no application environment variable when configured in its dashboard.

## Google Maps

| Variable | Required | Value or source |
| --- | --- | --- |
| GOOGLE_MAPS_SERVER_KEY | Yes, secret | Server-side Geocoding API key with billing enabled |

Restrict to the Geocoding API and, where possible, Render's outbound addresses. Location lookup currently resolves US ZIP codes. No unrestricted browser Maps key is included.

## Microsoft 365 SMTP alerts

| Variable | Required / default | Value or source |
| --- | --- | --- |
| SMTP_HOST | `smtp.office365.com` | Microsoft 365 SMTP endpoint |
| SMTP_PORT | `587` | STARTTLS port |
| SMTP_USER | Yes | Licensed/authorized sending mailbox |
| SMTP_FROM | Yes | Sender, e.g. `ServiceTones <notifications@yourdomain.com>` |
| MICROSOFT_TENANT_ID | Yes | Microsoft Entra tenant ID |
| MICROSOFT_CLIENT_ID | Yes | Entra app client ID |
| MICROSOFT_CLIENT_SECRET | Yes, secret | Entra app client secret |

This uses OAuth client credentials, **not SMTP username/password basic authentication**. Configure `SMTP.SendAsApp`, admin consent, Exchange service-principal registration, mailbox permissions, and SMTP AUTH for the sending mailbox. Firebase handles authentication verification/recovery emails; Microsoft 365 sends project/account activity alerts.

## Sentry monitoring

| Variable | Required | Value or source |
| --- | --- | --- |
| SENTRY_DSN | Optional, recommended before launch | Server Sentry project DSN |
| PUBLIC_SENTRY_DSN | Optional, intentionally public | Browser/mobile Sentry project DSN |

APP_ENV and RENDER_GIT_COMMIT label errors automatically. Default PII collection is disabled; requests, users, and breadcrumbs are stripped from sent events. Session replay and source-map uploads are not enabled. No Sentry auth token is required unless you later add source-map publishing.

## GitHub-only deployment and signing values

Keep these in **GitHub Settings → Environments → development / stagging / production**, not Render. The build runners require them before any app process exists.

Variables: `SITE_URL`, `API_URL`, `ADMIN_URL`, `RENDER_WEB_SERVICE_ID`, `RENDER_API_SERVICE_ID`, `RENDER_ADMIN_SERVICE_ID`, `RENDER_WORKER_SERVICE_ID`, `MOBILE_RELEASES_ENABLED`. The old `RENDER_SERVICE_ID` is no longer used.

Secrets: `RENDER_API_KEY`, `GOOGLE_SERVICES_JSON_BASE64`, `GOOGLE_SERVICE_INFO_PLIST_BASE64`, `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`, `APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_BASE64`, `IOS_CERTIFICATE_BASE64`, `IOS_CERTIFICATE_PASSWORD`, `IOS_PROFILE_BASE64`, `IOS_PROFILE_NAME`, `KEYCHAIN_PASSWORD`.

Generated by the pipeline, not manually entered: `APP_ENV`, `MOBILE_APP_ID`, `ANDROID_TRACK`, `BUILD_NUMBER`, `ANDROID_KEYSTORE_PATH`, `PLAY_JSON_PATH`, `IOS_CERTIFICATE_PATH`, `IOS_PROFILE_PATH`, `BUNDLE_GEMFILE`, GitHub's `GITHUB_SHA/GITHUB_REF_NAME/GITHUB_RUN_NUMBER/GITHUB_RUN_ATTEMPT`.

See [DEPLOYMENT.md](DEPLOYMENT.md) for each signing secret's format. Mobile packaging fetches public config from the matching API_URL, avoiding a second set of Firebase web values in GitHub.

## Validation

Run `npm run config:check` after configuring an environment. It prints missing variable **names**, never secret values. Production processes run the same check at startup. Development/stagging reject Stripe live keys; production rejects Stripe test keys.

Application values are validated centrally in `src/server/config.ts`; public exposure is an explicit allowlist. Never add a private credential to that public object.

References: [Render environment groups](https://render.com/docs/blueprint-spec#environment-groups), [Render Postgres TLS](https://render.com/docs/postgresql-creating-connecting#ssl-modes-for-internal-connections), [Microsoft SMTP OAuth](https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth).
