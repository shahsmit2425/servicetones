# ServiceTones

A shared React/TypeScript home-services marketplace for the web, iOS, and Android. Public pages are server-rendered for search engines. Authenticated screens use a PostgreSQL API and Firebase Authentication. Native apps bundle the same client through Capacitor.

**There are no seeded users, sample projects, simulated transactions, or role-switching controls.** A new database is empty. Service categories and marketing copy are product content, not fabricated marketplace activity. Automated tests generate isolated fixtures only.

## Start here

- [All environment variables](docs/ENVIRONMENT_VARIABLES.md) — Render groups, GitHub secrets, public vs private configuration.
- [Deployment and branch workflow](docs/DEPLOYMENT.md) — development → stagging → main.
- [Architecture and code map](docs/ARCHITECTURE.md).
- [Provider setup](docs/INTEGRATIONS.md) — Firebase/Google/Apple, Stripe, Daily, R2, Maps, Upstash, Microsoft 365, Sentry, Cloudflare.
- [Validation and remaining launch work](docs/VALIDATION.md).

## Local development

Use Node 22. Always start from `development`.

```sh
git switch development
git pull --ff-only
npm ci
# Copy .env.example to .env and enter your development credentials.
npm run db:migrate
npm run dev
```

The default local URL is http://127.0.0.1:5173. Without credentials, public pages still render; authenticated services report that setup is required. There is no fallback to fictional data or SQLite.

For local Postgres, set `POSTGRES_PASSWORD` in your shell and run `docker compose up -d`; use the matching connection URL in `.env` with `DATABASE_SSL=disable`. Start the email outbox worker separately with `npm run worker`.

```sh
npm test
npm run build
npm run config:check   # validates deployed configuration; expects HTTPS and all services
```

## One source, three environments

| Branch | Environment | Website | iOS | Android |
| --- | --- | --- | --- | --- |
| development | development | Dedicated Render service | Dev app → TestFlight | Dev app → internal testing |
| stagging | stagging | Dedicated Render service | Staging app → TestFlight | Staging app → internal testing |
| main | production | Production Render service | Production app → TestFlight | Production track **draft** |

The spelling `stagging` intentionally matches the requested branch name. Each environment has a distinct database, Firebase project, application ID, credentials, and file bucket. Merge code forward; do not copy environment values between branches.

Workflows are supplied, but publishing requires the environment credentials and native signing/store setup in the deployment guide. Mobile distribution does not bypass Apple/Google processing or review.
