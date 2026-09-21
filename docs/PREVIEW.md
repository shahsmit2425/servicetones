# Interactive product preview

Open `http://127.0.0.1:5173/` after `npm run dev`. The website now opens a complete, fictional marketplace preview. **No signup or backend is required to explore it.** The existing live account/chat application remains available at `/#live`.

## Explore now

- Customer dashboard: `/#/customer/dashboard`
- Provider dashboard: `/#/pro/dashboard`
- Admin dashboard: `/#/admin/dashboard`
- Page directory and guided scenarios: `/#/customer/scenarios`

Use the role selector in the top bar or “Explore all pages” in navigation. On smaller screens, the menu button opens navigation. Hash routes support direct links, browser back/forward, and refresh.

## Page inventory

The preview has 25 page types, with customer/provider/admin variations where relevant:

1. Role-specific dashboard
2. Professional discovery and search
3. Saved professionals
4. Professional profile, services, portfolio presentation, and reviews
5. Project/job list with status and text filters
6. Project details, timeline, and next actions
7. Estimates
8. Provider opportunities
9. Monthly schedule and appointment details
10. Customer payments and receipts
11. Provider earnings
12. Reviews and provider replies
13. Inbox and call-state previews
14. Notifications
15. Help center and support cases
16. Account settings, preferences, and blocked conversations
17. Provider business-profile editor
18. Provider availability
19. Provider onboarding checklist
20. Admin professional moderation
21. Admin support/dispute handling
22. Page directory and 14 guided scenarios
23. Sign-in screen preview
24. Signup screen preview
25. Password-recovery screen preview

Dialogs cover project creation, quoting, booking confirmation, rescheduling, cancellation, completion, demo checkout, receipts/downloads, reviews, support cases, refunds, conversation blocking, listing suspension, privacy, demo reset, and simulated calling.

## Fictional personas and data

- Customer: Olivia Parker
- Provider: Marcus Johnson / The Handy Neighbor
- Administrator: Alex Morgan
- Six sample service professionals and eleven initial projects
- Seeded estimates, appointments, messages, reviews, payments, notifications, and a dispute

Example dates are relative to the day the demo is initialized. “Reset demo” generates a fresh set of relative dates and replaces only preview changes.

## Try a complete workflow

1. Open the customer's entryway project and accept Marcus's estimate.
2. Use “View as provider” on that project and start the job.
3. Mark the work complete, then switch back to the customer.
4. Simulate payment and inspect the receipt in Payments.
5. Leave a review, then switch to the provider Reviews page to reply.

Other scenarios include sending an estimate for an unassigned lead, declining an estimate, rescheduling, cancellation, an in-progress job, empty lists, blocking/unblocking messages, and admin resolution/refund of the seeded cabinet dispute. Calls can simulate ringing, connected, declined, missed, and failed states; mute/camera toggles only change the preview UI.

## Persistence and boundaries

`demo/model.ts` owns the fictional state and validated transitions. The preview stores this state under `servicetones-preview-v1` in localStorage. It does not call the live API or alter actual user accounts. It runs in the current browser/device; changes do not synchronize across devices or separate browser profiles. The separate live application retains its original authenticated backend behavior.

All added marketplace financial, review, recovery, moderation, and support workflows are **interactive simulations**, not newly deployed production services. Demo messages contact nobody; simulated checkout collects no card data; calls request no media access; account preview forms do not send credentials or recovery emails. Availability is a preference, not a scheduling-conflict engine. The portfolio uses an explicitly labeled illustrative image.

Tests: `npm run test:demo` checks shared customer/provider transitions, invalid actions, duplicate-payment/review prevention, cancellations, refunds, messaging/blocking, and moderation. `npm test` includes both backend and demo tests.
