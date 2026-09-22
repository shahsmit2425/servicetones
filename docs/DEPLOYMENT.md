# Deployment and promotion

## Branch policy

Always start work on `development` (or a feature branch created from it and merged back into it). Promote with a PR from `development` to `stagging`, then from `stagging` to `main`. The CI promotion check rejects other PR sources into the latter two branches.

A development push only selects the development GitHub environment and its Render service IDs. No workflow merges, force-pushes, or deploys a second environment automatically. Code changes reach all three only when deliberately promoted. This gives staging a useful review step and preserves production stability.

Require the `Validate` check on promotion branches, disallow force pushes/deletions, and require pull requests. GitHub plan/permissions determine whether repository branch protections can be enabled. Configure these repository settings if they are not already applied. A workflow by itself cannot stop an administrator from bypassing repository controls.

## First-time Render setup

1. Connect this GitHub repository to Render.
2. Create a Blueprint from `render.yaml`. It defines three web services, three email workers and three Postgres databases. These use paid plans; inspect Render's resource/cost summary before applying.
3. Populate each environment group with its own values from [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md). The Blueprint provides non-secret defaults; secrets are deliberately entered manually in environment groups because Render does not support `sync: false` there.
4. Leave service auto deploy **off**. The GitHub workflow owns deployment timing. The web pre-deploy command validates configuration and runs migrations. The worker is deployed afterward.
5. Each Render web service provides an actual `https://...onrender.com` URL. Put that exact URL in its `SITE_URL` initially; do not assume a hostname based on the service name. Update it after configuring a custom domain.
6. In GitHub, create environments `development`, `stagging`, and `production`. Add the per-environment variables and secrets below.
7. Run the workflow on `development` after credentials are entered. It checks the Render service's linked branch, deploys the validated commit SHA, waits for the deployment, checks release/environment via `/api/health`, and then deploys the mail worker.
8. Test the development environment before promoting to staging and production.

No external database migration/import from the old local SQLite store runs. Keep a copy of any real historical data and plan an explicit migration separately if needed.

## GitHub configuration

Each environment needs these **variables**:

| Name | Value |
| --- | --- |
| SITE_URL | Actual HTTPS URL for this environment |
| RENDER_SERVICE_ID | Its web service ID, `srv-...` |
| RENDER_WORKER_SERVICE_ID | Its email-worker service ID |
| MOBILE_RELEASES_ENABLED | `true` once native signing and store entries are configured |

Each environment needs `RENDER_API_KEY` as a **secret**. Use an account with access to the intended services; keep IDs environment-scoped. Do not put Render deploy credentials in the app's public config.

The following **GitHub secrets** are also required for native releases. They cannot be replaced by Render runtime variables because Xcode and Android signing run on GitHub runners.

| Secret | Purpose |
| --- | --- |
| GOOGLE_SERVICES_JSON_BASE64 | Base64 of the environment's Android Firebase config |
| GOOGLE_SERVICE_INFO_PLIST_BASE64 | Base64 of the environment's iOS Firebase config |
| ANDROID_KEYSTORE_BASE64 | Base64 of the Android upload keystore |
| ANDROID_KEYSTORE_PASSWORD | Keystore password |
| ANDROID_KEY_ALIAS | Upload key alias |
| ANDROID_KEY_PASSWORD | Upload key password |
| GOOGLE_PLAY_SERVICE_ACCOUNT_JSON | Raw Google Play API service-account JSON |
| APPLE_TEAM_ID | Apple Developer team ID |
| ASC_KEY_ID | App Store Connect API key ID |
| ASC_ISSUER_ID | App Store Connect API issuer |
| ASC_KEY_BASE64 | Base64 of the App Store Connect .p8 private key |
| IOS_CERTIFICATE_BASE64 | Base64 of the Apple Distribution .p12 certificate |
| IOS_CERTIFICATE_PASSWORD | .p12 password |
| IOS_PROFILE_BASE64 | Base64 of an App Store distribution provisioning profile |
| IOS_PROFILE_NAME | Exact provisioning-profile name |
| KEYCHAIN_PASSWORD | Random password for the ephemeral CI signing keychain |

Use separate app records and Firebase native applications for:
- `com.servicetones.app.dev`
- `com.servicetones.app.staging`
- `com.servicetones.app`

The Firebase files must match the selected application's package/bundle ID and Firebase project. The mobile preparation script validates those relationships. Enable Google and Apple sign-in, register the Android certificate fingerprints, and enable the iOS Sign In with Apple capability on the provisioning profiles.

Google Play typically requires first-time console/app setup before API uploads. Create each app listing, configure Play App Signing, grant the service account release access, and finish the initial upload/required forms in Play Console. Android testing uploads use internal testing; production uploads are **drafts**, awaiting your release review.

Create matching iOS App Store Connect records and internal TestFlight tester groups. TestFlight uploads do not automatically add testers or bypass processing, export-compliance questions, or external-beta review. Production iOS builds also go to TestFlight before App Store submission.

## Cloudflare domains

Suggested names are `dev.yourdomain.com`, `staging.yourdomain.com`, and your production domain. Add each custom domain in the matching Render web service, then create its DNS record in Cloudflare using the exact target Render supplies. Complete certificate validation, use Full (strict) TLS, and avoid caching `/api/*` or `/app/*`. Never cache responses containing user data.

Update `SITE_URL`, `ALLOWED_ORIGINS`, Firebase authorized domains, Stripe webhook endpoints and GitHub environment `SITE_URL`. Rebuild native apps if their API URL changes. The repository does not require a Cloudflare global API key for DNS; R2 uses a separate bucket-scoped credential.

## Configuration changes and rollback

Web runtime config changes take effect after redeployment. Mobile public config is bundled at build time, so changes to the endpoint/Firebase public config need a new build. Do not solve a configuration change with branch-specific edits.

Use a reviewed revert on `development`, then promote it. For urgent rollback, Render can redeploy a previously good commit, but keep database migrations backward-compatible. Never automatically reverse a migration or restore a production database from development data.

## Current release boundary

The workflow and source are configured; external accounts, service URLs, credentials and signing files must be supplied before a deployment can complete. No Render domain, signed IPA/AAB, TestFlight upload or Play release is claimed merely because code was pushed.
