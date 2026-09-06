# Nook — Hyperlocal Community Board

A geo-fenced neighbourhood feed where posts are only visible to people within **2km** of where they were created. Built as a full-stack portfolio project to demonstrate real-world MERN development — geospatial queries, real-time communication, and production-ready auth.

---

## Live Demo

> **Frontend:** [your-app.vercel.app](https://your-app.vercel.app)  
> **API:** [your-api.onrender.com](https://your-api.onrender.com)

📹 [60-second walkthrough — real-time update demo](https://loom.com/your-link)

---

## Screenshots

<!-- Replace these with your actual screenshots -->

| Feed | Post Detail | Map View |
|------|-------------|----------|
| ![Feed](./screenshots/feed.png) | ![Post](./screenshots/post.png) | ![Map](./screenshots/map.png) |

---

## What it does

- **Geo-filtered feed** — `$near` query on a `2dsphere` index returns only posts within 2km of the signed-in user's saved coordinates. The radius is enforced at the database level, not in application code.
- **Real-time updates** — new posts, comments, and upvotes appear live using Socket.io geo-rooms. Users join a room derived from their grid cell (`geo_<lat>_<lng>`), so broadcasts are scoped to the right neighbourhood without fan-out to everyone.
- **Post expiry** — MongoDB TTL index automatically deletes posts after 30 days. No cron job needed.
- **Image uploads** — Multer streams files directly to Cloudinary (memory storage, no disk writes).
- **JWT auth** — short-lived access token (15 min) + httpOnly refresh token cookie. Axios interceptor silently refreshes on 401.
- **Anonymous posting** — users can post without their name being shown, controlled per-post.
- **Category filtering** — alert, lost-pet, free-stuff, event, question, general.
- **Nested comments** — single level of replies using a `parentComment` self-reference on the Comment model.
- **Report system** — users can report posts and comments with a reason; stored for moderation.

---

## Tech stack

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express 5 | API server |
| MongoDB + Mongoose | Database with 2dsphere geospatial index |
| Socket.io | Real-time geo-rooms and notifications |
| JWT + bcryptjs | Auth — access + refresh tokens |
| Cloudinary + Multer | Image upload pipeline |
| Nodemailer | Password reset emails |
| express-rate-limit | Post creation rate limiting |
| Redis (ioredis) | Rate limiter store |
| cookie-parser | httpOnly refresh token handling |

### Frontend
| Package | Purpose |
|---|---|
| React 19 + Vite | UI framework |
| React Router v7 | Client-side routing |
| Axios | HTTP client with interceptors |
| Socket.io-client | Real-time connection |
| React Query (@tanstack) | Server state, caching, mutations |
| React Leaflet + Leaflet | Interactive map with custom pins |
| DM Sans (Google Fonts) | Typography |

### Infrastructure
| Service | What it hosts |
|---|---|
| MongoDB Atlas | Database (2dsphere index enabled) |
| Cloudinary | Image storage and CDN |
| Render | Backend API |
| Vercel | Frontend |

---

## The interesting technical bit

The geo query that powers the whole app:

```js
// postController.js
Post.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [userLng, userLat] },
      $maxDistance: 10000, // metres
    },
  },
  expiresAt: { $gt: new Date() },
})
```

This requires a `2dsphere` index on the `location` field — without it, MongoDB throws an error. The index is declared in the Post schema:

```js
postSchema.index({ location: "2dsphere" });
```

MongoDB stores coordinates as `[longitude, latitude]` (GeoJSON order), which is the opposite of what browsers return from `navigator.geolocation`. Every coordinate pair in the codebase is deliberately swapped.

Socket.io rooms are named using a grid-cell formula so that only users in the same approximate area receive new-post broadcasts:

```js
// utils/getGeoRoom.js
const getGeoRoom = (lat, lng) => `geo_${Math.floor(lat * 10)}_${Math.floor(lng * 10)}`;
```

---

## Project structure

```
hyperlocal-community-board/
├── Backend/
│   ├── controllers/       authController, postController, commentController...
│   ├── models/            User, Post, Comment, Notification, Report
│   ├── routes/            auth, posts, comments, users, upload, notifications
│   ├── middlewares/       authMiddlewares, postLimiter, upload (multer)
│   ├── sockets/           geoSockets — join_area, join_post, join_user
│   ├── utils/             getGeoRoom, sendEmail
│   └── server.js
│
└── Frontend/
    └── src/
        ├── pages/         Feed, PostDetail, CreatePost, MapView, SignUp, Login...
        ├── components/    PostCard, NotificationBell, ReportModal, Toast, Logo...
        ├── hooks/         useGeolocation, useSocket
        ├── context/       AuthContext
        └── api/           axios (with interceptors)
```

---

## Run locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

### Backend

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
JWT_REFRESH_SECRET=another_long_random_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
REDIS_URL=your_redis_url
```

```bash
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
```

Create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Key decisions explained

**Why TTL index instead of a cron job for post expiry?**  
MongoDB's TTL index deletes expired documents automatically every 60 seconds at the database level. It works even when the server is down or restarting, which a cron job wouldn't. Less code, more reliable.

**Why store votes as an array of user IDs instead of a separate Vote collection?**  
For a neighbourhood-scale app, the upvotes array on the Post document is simpler and the query is a single document read. A separate collection would need a join for every post render. The array approach also makes "has the current user voted" a trivial `.includes(userId)` check on the frontend.

**Why httpOnly cookie for refresh token instead of localStorage?**  
httpOnly cookies are not accessible to JavaScript, so XSS attacks can't steal the refresh token. The short-lived access token lives in memory (via React state / localStorage) and is refreshed silently by the Axios interceptor on 401.

---

## Author

**Mohit Saini**  
Self-taught MERN stack developer · [GitHub](https://github.com/mohitsaini958) · [LinkedIn](your-linkedin-url)
