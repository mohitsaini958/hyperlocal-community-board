# Hyperlocal (Nook) – Code review & token refresh fix
Problem: "check the mistake and error in this repo; problem in refresh token and access after access token expires"
Stack: Express 5 + Mongoose + Socket.io (Backend/), React 19 + Vite + axios + react-query (Frontend/)

## Done (Phase 1, Oct 2026)
- Backend: utils/tokens.js (30-day refresh cookie, path /api/auth, secure in prod), refresh returns 401 w/ codes instead of 500, /auth/logout, protect() returns TOKEN_EXPIRED/TOKEN_INVALID/NO_TOKEN, /posts/nearby now uses protect (was crashing 500 on expired token), errorHandler maps Cast/Validation/duplicate/multer errors, upvote self-notify bug (toString), comment self-notify, 404s instead of 400/401, PUT /notifications/:id/read added, accurate totalPosts, reset URL from CLIENT_URL, case-insensitive login, no user enumeration.
- Frontend: axios single-flight refresh queue, separate refresh client (no infinite loop), skip auth routes, stale-token retry, session-expired event -> AuthContext clears + toast; user persisted; logout calls backend; MapView URL (/api/api) + data.posts fix.
- Verified manually with ACCESS_TOKEN_EXPIRES=5s (curl + Playwright).

## Backlog
- P1: refresh-token rotation + reuse detection, logout all devices
- P2: config/redis.js imports uninstalled "redis" (unused), ReportModal for comments has no route, bundle code-splitting, lint fast-refresh warning
