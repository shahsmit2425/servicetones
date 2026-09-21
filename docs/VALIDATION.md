# Validation

Automated checks exercised real HTTP endpoints and authenticated Socket.IO clients:

- Signup validation, strong password length, login failure, session authentication.
- Public professional listing excludes passwords.
- Projects visible only to their customer and assigned professional.
- Customers cannot accept work; pros cannot complete before acceptance; completed work cannot be cancelled.
- Conversation creation is idempotent and outsiders cannot read or send messages.
- Whitespace-only messages are rejected; valid messages are delivered live and returned in history.
- Call invitations require membership, only the recipient can accept, and media signaling is rejected before acceptance and after ending.
- Logout revokes the HTTP session and disconnects its sockets.

`npm run build` runs TypeScript and the Vite production build. `npx cap sync` copies the bundle into Android and iOS projects.

Browser checks covered desktop/mobile layouts, service search, input rejection for the WebMCP search tool, and the sample-profile disclosure. The native platform folders have been generated and synced; APK/IPA compilation, signing, physical-device microphone/camera behavior, actual two-device media exchange, TURN relay traversal, and App Store/Play Store submission are not verified in this Windows environment.

To test real communications locally, register one customer and one pro using separate browser sessions. Find the registered pro from the customer session, open a conversation, send a message, and call with the other session open. Accept microphone/camera permission yourself, verify both directions, then test decline, cancel, mute, camera toggle, logout and dropped-network recovery. Use headphones to prevent feedback. A localhost session on each device is not the same server; cross-device tests require a shared HTTPS server.
