# Hyperlocal App: Code Review and Token Refresh Fix

A senior-engineer review of the "hyperlocal" repository that finds and fixes its errors. The main focus is the sign-in token problem: requests start failing once the access token expires.

## Who it's for
- The owner and developers of the hyperlocal app.
- End users who are currently hitting errors when their session times out.

## Core features and experience
- **Silent token renewal:** when the access token expires, the app gets a new one in the background and retries the failed request. The user sees no error and does not have to sign in again.
- **One refresh at a time:** if several requests fail together, they all wait for a single refresh and then retry. This stops repeated or competing refresh calls.
- **30-day sign-in:** the refresh token lasts 30 days. After that, or if it is invalid or revoked, the user is logged out cleanly and sent to the login page with a short message. No broken pages.
- **Correct backend checks:** the server tells expired, invalid and missing tokens apart, returns the right error codes, and issues fresh tokens correctly when refreshing.
- **General bug sweep:** the rest of the repo is reviewed for crashes, broken API calls, configuration mistakes and security problems in how tokens are handled. Each fix is listed in a short report of what was wrong and what changed.

## User flow
1. The user signs in and receives an access token and a 30-day refresh token.
2. The user keeps using the app. When the access token expires, the next request quietly renews it and continues.
3. The user comes back within 30 days and is still signed in.
4. After 30 days, or after logout, the next request ends the session and shows the login page.

## UI/UX feel
- The existing design stays as it is. Only fixes are made, with no redesign.
- Session expiry shows one clear "Session expired, please sign in again" message instead of raw errors.

## Implementation phases
- **Phase 1 (MVP, built now):** Load the hyperlocal repo, get it running, and confirm the token-expiry failure happens. Fix refresh on both the frontend and the backend, set the 30-day refresh lifetime, and handle clean logout on expiry. Fix any other errors that stop the app from running. Test the whole sign-in → expiry → refresh → logout flow. Deliver a summary of the issues found and fixed.
- **Phase 2:** Further hardening: issue a new refresh token on each use and reject old ones, add a "log out on all devices" option, and store tokens more safely in the browser if the current method is weak.
- **Phase 3:** Wider quality pass: cleanup of non-critical issues, performance problems and lower-priority bugs found during the review.

## Assumptions
- The repo will be brought into this workspace from GitHub ("Save/Import from GitHub") or as a zip before work starts. It is not downloaded automatically.
- The app's current login method and tech stack are kept. Fixes stay inside the existing structure.
- The access token keeps its current short lifetime. Only the refresh token is set to 30 days.
- Users who are signed in when the fix goes live may need to sign in once more.
- Changes are limited to bugs and the token flow. No new features are added in Phase 1.
