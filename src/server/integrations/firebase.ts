import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { env } from "../config.js";
import { requireValue, fail } from "../errors.js";
export async function verifyToken(token: string): Promise<DecodedIdToken> {
  requireValue(
    env.FIREBASE_PROJECT_ID &&
      env.FIREBASE_CLIENT_EMAIL &&
      env.FIREBASE_PRIVATE_KEY,
    "Sign-in is not configured yet.",
  );
  const app =
    getApps()[0] ||
    initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  try {
    const decoded = await getAuth(app).verifyIdToken(token, true);
    if (!decoded.email || !decoded.email_verified)
      fail(403, "Verify your email before continuing.");
    return decoded;
  } catch (e) {
    if ((e as { status?: number }).status) throw e;
    fail(401, "Please sign in again.");
  }
}
