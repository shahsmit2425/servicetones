# Administrator setup and access boundary

The administrator UI is a separately deployed static application. Its HTML/JavaScript and login screen are public files; sensitive data and actions are protected by the API. A separate domain is not authorization, and no system can promise that unauthorized access is impossible.

Every `/api/admin/*` request requires all of the following:

1. A valid Firebase ID token for this environment, verified with revocation checking and a verified email.
2. A Firebase UID explicitly listed in server-only `ADMIN_ALLOWED_UIDS`.
3. A server-issued boolean `admin: true` custom claim.
4. The same UID recorded with role `admin` in PostgreSQL.
5. A Firebase token recording TOTP as the sign-in second factor.
6. Authentication within the last hour. Refreshing an ID token does not extend this period.

Missing configuration denies access. Public registration accepts only customer/pro roles and cannot provision an admin, even when a caller submits extra fields. Admin identities are refused by customer workspace/account endpoints; admin data is available only through the protected admin namespace. Admins do not receive private conversation messages or attachments. Suspension, case resolution/refunds, and access provisioning are audited.

## Provision your first administrator

1. Enable **Firebase Authentication with Identity Platform** and TOTP MFA for the environment. Follow [Firebase TOTP setup](https://firebase.google.com/docs/auth/web/totp-mfa). This prerequisite is separate from deploying the code.
2. Create a dedicated Firebase email/password identity for the administrator. Verify the mailbox. You can use the customer site's email verification screen, but **do not complete customer/pro account registration** for this identity. Never reuse an existing marketplace account as an admin.
3. Copy its UID into the API environment's `ADMIN_ALLOWED_UIDS`. Multiple UIDs are comma-separated. Redeploy the API after changing this setting.
4. From a trusted API service shell with that environment's credentials and database connection, run:

   ```sh
   npm run admin:access -- grant FIREBASE_UID
   ```

   This command creates the database admin record and sets the Firebase custom claim. It refuses existing customer/pro accounts, disabled identities, unverified emails and UIDs absent from the allowlist. It prints no credentials. No web endpoint exposes this capability.

5. Open your admin domain, sign in with that account and enroll an authenticator using the displayed setup key. The key is kept only in memory. Enrollment alone does not grant access.
6. Sign in again and enter the authenticator code. The API now checks every access condition before returning any admin workspace data.

The admin app uses in-memory Firebase persistence: reloading/closing it requires signing in again. It provides no registration or role-switching controls. There is no default admin password or seeded administrator.

## Revoke access and recover MFA

```sh
npm run admin:access -- revoke FIREBASE_UID
```

Remove the UID from `ADMIN_ALLOWED_UIDS` too and redeploy the API. Revocation clears the Firebase claim and revokes refresh tokens; existing ID tokens are checked for revocation by the API. Keep the database record for audit history. For a compromised identity, also disable it in Firebase.

Lost authenticator recovery is an operator process: revoke access, verify the administrator's identity outside the app, reset the enrolled factor through trusted Firebase administration, then repeat provisioning/enrollment. There is no public MFA-bypass endpoint.

## Hosting and validation

Do not attach backend environment groups, Firebase private keys or database credentials to the admin static site. It needs only `VITE_API_URL`, `VITE_APP_ENV` and the Node build version. Authorize the admin domain in Firebase and include it in API `ALLOWED_ORIGINS`.

Automated tests exercise allowlist, role, claim, identity, MFA and session-age denial paths. Actual Firebase/Identity Platform enrollment, revoked-token behavior and two-device sign-in must also be tested with configured service accounts before public launch.
