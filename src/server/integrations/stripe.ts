import Stripe from "stripe";
import { env } from "../config.js";
import { requireValue } from "../errors.js";
let client: Stripe | undefined;
export function stripe() {
  requireValue(
    env.STRIPE_SECRET_KEY,
    "Payments and verification are not configured yet.",
  );
  return (client ??= new Stripe(env.STRIPE_SECRET_KEY, {
    maxNetworkRetries: 2,
    timeout: 20000,
  }));
}
