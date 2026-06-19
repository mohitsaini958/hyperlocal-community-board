import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGeolocation from "../hooks/useGeolocation";
import axios from "../api/axios";
import PostCard from "../components/PostCard";
import NotificationBell from "../components/NotificationBell";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .feed-root {
    font-family: 'DM Sans', sans-serif;
    background: #f5f5f0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── TOP BAR ── */
  .feed-topbar {
    height: 56px;
    background: #fff;
    border-bottom: 1px solid #eeeeea;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.25rem;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .feed-topbar-left { display: flex; align-items: center; gap: 8px; }

  .feed-loc-icon {
    width: 30px; height: 30px;
    background: #E1F5EE;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .feed-loc-name { font-size: 13px; font-weight: 600; color: #064534; }
  .feed-loc-sub  { font-size: 11px; color: #bbb; }

  .feed-logo {
    display: flex; align-items: center; gap: 7px;
    text-decoration: none;
  }

  .feed-logo-mark {
    width: 30px; height: 30px;
    background: #1D9E75; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
  }

  .feed-logo-name {
    font-size: 16px; font-weight: 600;
    color: #064534; letter-spacing: -0.3px;
  }

  .feed-bell {
    width: 36px; height: 36px; border-radius: 10px;
    background: #f5f5f0; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s; position: relative;
  }

  .feed-bell:hover { background: #E1F5EE; }

  /* ── FILTERS ── */
  .feed-filters {
    background: #fff;
    border-bottom: 1px solid #eeeeea;
    padding: 10px 1.25rem;
    display: flex; gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .feed-filters::-webkit-scrollbar { display: none; }

  .feed-pill {
    font-size: 12px; font-weight: 500;
    padding: 5px 14px; border-radius: 20px;
    border: 1.5px solid #e5e5e5;
    background: #fafafa; color: #666;
    cursor: pointer; white-space: nowrap;
    transition: all .15s; flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
  }

  .feed-pill:hover { border-color: #1D9E75; color: #1D9E75; }

  .feed-pill.active {
    background: #064534; color: #fff;
    border-color: #064534;
  }

  /* ── BODY ── */
  .feed-body {
    flex: 1;
    padding: 1rem 1.25rem 5rem;
    max-width: 680px; width: 100%;
    margin: 0 auto;
    display: flex; flex-direction: column; gap: 10px;
  }

  /* ── SKELETON ── */
  .feed-skel {
    background: #fff;
    border-radius: 14px;
    padding: 1rem 1.1rem;
    border: 1px solid #eeeeea;
  }

  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }

  .skel {
    background: linear-gradient(90deg,#f0f0ee 25%,#e8e8e4 50%,#f0f0ee 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 6px;
  }

  .skel-badge  { height: 18px; width: 64px; margin-bottom: 10px; }
  .skel-title  { height: 14px; width: 75%;  margin-bottom: 8px; }
  .skel-line   { height: 11px; width: 100%; margin-bottom: 5px; }
  .skel-line2  { height: 11px; width: 55%;  margin-bottom: 12px; }
  .skel-foot   { height: 10px; width: 45%; }

  /* ── CARD ── */
  .feed-card {
    background: #fff;
    border-radius: 14px;
    padding: 1rem 1.1rem;
    border: 1px solid #eeeeea;
    cursor: pointer;
    transition: border-color .15s, box-shadow .15s, transform .1s;
    animation: cardIn .3s ease;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .feed-card:hover {
    border-color: #9FE1CB;
    box-shadow: 0 4px 16px rgba(29,158,117,0.08);
  }

  .feed-card:active { transform: scale(0.99); }

  .feed-card-top {
    display: flex; align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .feed-badge {
    font-size: 10px; font-weight: 600;
    padding: 3px 9px; border-radius: 20px;
    font-family: 'DM Sans', sans-serif;
    text-transform: capitalize;
  }

  .feed-meta {
    font-size: 11px; color: #bbb;
    display: flex; align-items: center; gap: 5px;
  }

  .feed-card-title {
    font-size: 14px; font-weight: 600;
    color: #111; margin-bottom: 5px;
    line-height: 1.35;
  }

  .feed-card-body {
    font-size: 13px; color: #777;
    line-height: 1.6; margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .feed-card-footer {
    display: flex; align-items: center; gap: 14px;
    padding-top: 8px;
    border-top: 1px solid #f5f5f2;
    font-size: 12px; color: #bbb;
  }

  .feed-card-stat {
    display: flex; align-items: center; gap: 5px;
  }

  .feed-card-dist { margin-left: auto; font-size: 11px; }

  .feed-anon {
    font-size: 10px; color: #bbb;
    font-style: italic; margin-left: 4px;
  }

  /* ── EMPTY STATE ── */
  .feed-empty {
    display: flex; flex-direction: column;
    align-items: center; text-align: center;
    padding: 4rem 1rem;
  }

  .feed-empty-icon {
    width: 64px; height: 64px; border-radius: 20px;
    background: #E1F5EE;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.25rem;
  }

  .feed-empty h3 {
    font-size: 17px; font-weight: 600;
    color: #111; margin-bottom: 6px;
  }

  .feed-empty p {
    font-size: 13px; color: #999;
    line-height: 1.7; margin-bottom: 1.5rem;
    max-width: 260px;
  }

  .feed-empty-btn {
    font-size: 13px; font-weight: 600; color: #fff;
    background: #1D9E75; border: none;
    border-radius: 12px; padding: 10px 24px;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: background .15s;
    display: flex; align-items: center; gap: 7px;
  }

  .feed-empty-btn:hover { background: #0F6E56; }

  /* ── LOCATION ERROR ── */
  .feed-loc-err {
    margin: 1.5rem;
    background: #fff; border-radius: 14px;
    padding: 1.75rem; border: 1px solid #eeeeea;
    text-align: center;
  }

  .feed-loc-err-icon {
    width: 52px; height: 52px; border-radius: 16px;
    background: #fff5f5;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem;
  }

  .feed-loc-err h3 { font-size: 15px; font-weight: 600; color: #111; margin-bottom: 6px; }
  .feed-loc-err p  { font-size: 13px; color: #888; line-height: 1.65; margin-bottom: 1rem; }

  .feed-retry {
    font-size: 13px; font-weight: 500; color: #fff;
    background: #1D9E75; border: none;
    border-radius: 10px; padding: 8px 20px;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: background .15s;
  }

  .feed-retry:hover { background: #0F6E56; }

  /* ── FAB ── */
  .feed-fab {
    position: fixed; bottom: 1.5rem; right: 1.25rem;
    width: 52px; height: 52px; border-radius: 50%;
    background: #1D9E75; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 20px rgba(29,158,117,0.4);
    transition: background .15s, transform .1s; z-index: 40;
  }

  .feed-fab:hover { background: #0F6E56; transform: scale(1.06); }
  .feed-fab:active { transform: scale(0.97); }

  /* ── LOAD MORE / END ── */
  .feed-loading-more {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; padding: .75rem;
    font-size: 12px; color: #aaa;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin-icon { animation: spin .7s linear infinite; display: inline-block; }

  .feed-end {
    text-align: center; font-size: 12px;
    color: #ccc; padding: 1.5rem 0 .5rem;
  }

  @media (min-width: 680px) {
    .feed-topbar { padding: 0 calc((100% - 680px) / 2 + 1.25rem); }
    .feed-filters { padding: 10px calc((100% - 680px) / 2 + 1.25rem); }
  }
`;

/* ─────────────────────────────────── */
/*  Constants                          */
/* ─────────────────────────────────── */

const CATEGORIES = [
  { label: "All",         value: ""           },
  { label: "🚨 Alert",    value: "Alert"      },
  { label: "🐾 Lost pet", value: "Lost"   },
  { label: "📦 Free",     value: "free-stuff" },
  { label: "🗓 Event",    value: "event"      },
  { label: "❓ Question", value: "question"   },
  { label: "💬 General",  value: "general"    },
];

const BADGE = {
  "alert":      { bg: "#FCEBEB", color: "#791F1F" },
  "lost-pet":   { bg: "#FAEEDA", color: "#633806" },
  "free-stuff": { bg: "#E1F5EE", color: "#085041" },
  "event":      { bg: "#EEEDFE", color: "#3C3489" },
  "question":   { bg: "#E6F1FB", color: "#0C447C" },
  "general":    { bg: "#F1F1EE", color: "#555555" },
};

/* ─────────────────────────────────── */
/*  Helpers                            */
/* ─────────────────────────────────── */

const timeAgo = (date) => {
  const s = (Date.now() - new Date(date)) / 1000;
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const calcDist = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
};
 
 const NookMark = () => (
  <svg width="16" height="16" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <circle cx="11" cy="8" r="4.5" stroke="white" strokeWidth="2.2"/>
    <circle cx="11" cy="8" r="1.8" fill="white"/>
    <line x1="11" y1="12.5" x2="11" y2="19.5"
      stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

/* ─────────────────────────────────── */
/*  SkeletonCard                       */
/* ─────────────────────────────────── */

const SkeletonCard = () => (
  <div className="feed-skel">
    <div className="skel skel-badge"/>
    <div className="skel skel-title"/>
    <div className="skel skel-line"/>
    <div className="skel skel-line2"/>
    <div className="skel skel-foot"/>
  </div>
);

/* ─────────────────────────────────── */
/*  PostCard                           */
/* ─────────────────────────────────── */

// const PostCard = ({ post, userLat, userLng }) => {
//   const navigate = useNavigate();
//   const badge    = BADGE[post.category] || BADGE.general;

//   const dist = userLat && userLng && post.location?.coordinates
//     ? calcDist(userLat, userLng,
//         post.location.coordinates[1],
//         post.location.coordinates[0])
//     : null;

//   return (
//     <div
//       className="feed-card"
//       onClick={() => navigate(`/posts/${post._id}`)}>

//       {/* top row — badge + meta */}
//       <div className="feed-card-top">
//         <div style={{display:"flex",alignItems:"center",gap:6}}>
//           <span
//             className="feed-badge"
//             style={{background: badge.bg, color: badge.color}}>
//             {post.category.replace("-", " ")}
//           </span>
//           {post.isAnonymous && (
//             <span className="feed-anon">anonymous</span>
//           )}
//         </div>
//         <div className="feed-meta">
//           {dist && (
//             <>
//               <i className="ti ti-map-pin" style={{fontSize:11}} aria-hidden="true"/>
//               {dist}
//               <span>·</span>
//             </>
//           )}
//           <span>{timeAgo(post.createdAt)}</span>
//         </div>
//       </div>

//       {/* title */}
//       <div className="feed-card-title">{post.title}</div>

//       {/* body preview — 2 lines max */}
//       {post.body && (
//         <div className="feed-card-body">{post.body}</div>
//       )}

//       {/* footer — vote count + comment count + distance */}
//       <div className="feed-card-footer">
//         <div className="feed-card-stat">
//           <i className="ti ti-arrow-up" style={{fontSize:14}} aria-hidden="true"/>
//           {post.upvotes?.length ?? 0}
//         </div>
//         <div className="feed-card-stat">
//           <i className="ti ti-message" style={{fontSize:14}} aria-hidden="true"/>
//           {post.commentCount ?? 0}
//         </div>
//         {dist && (
//           <div className="feed-card-dist">
//             <i className="ti ti-map-pin" style={{fontSize:11}} aria-hidden="true"/>
//             {" "}{dist}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

/* ─────────────────────────────────── */
/*  LocationError                      */
/* ─────────────────────────────────── */

const LOC_MESSAGES = {
  PERMISSION_DENIED:    { title: "Location access blocked",    body: "Nook needs your location to show nearby posts. Please enable it in your browser settings." },
  POSITION_UNAVAILABLE: { title: "Location unavailable",       body: "We couldn't detect your location. Make sure your device's location services are on." },
  TIMEOUT:              { title: "Location request timed out", body: "This took too long. Check your connection and try again." },
  UNKNOWN:              { title: "Location error",             body: "Something went wrong detecting your location. Please try again." },
};

const LocationError = ({ error, onRetry }) => {
  const msg = LOC_MESSAGES[error] || LOC_MESSAGES.UNKNOWN;
  return (
    <div className="feed-loc-err">
      <div className="feed-loc-err-icon">
        <i className="ti ti-map-pin-off"
          style={{fontSize:22, color:"#ef4444"}} aria-hidden="true"/>
      </div>
      <h3>{msg.title}</h3>
      <p>{msg.body}</p>
      <button className="feed-retry" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
};

/* ─────────────────────────────────── */
/*  Feed — main page                   */
/* ─────────────────────────────────── */

export default function Feed() {
  const navigate = useNavigate();

  // location
  const {
    lat, lng, neighborhood,
    error: locError,
    loading: locLoading,
    refetch,
  } = useGeolocation();

  // feed state
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [category,  setCategory]  = useState("");
  const [page,      setPage]      = useState(1);
  const [hasMore,   setHasMore]   = useState(true);

  /* ── fetch posts ── */
  const fetchPosts = async (reset = false) => {
    if (!lat || !lng) return;
    setLoading(true);

    try {
      const currentPage = reset ? 1 : page;
      const { data } = await axios.get("/posts/nearby", {
        params: {
          page:     currentPage,
          category: category || undefined,
        },
      });

      if (reset) {
        setPosts(data.posts);
        setPage(2);
      } else {
        setPosts(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      }

      setHasMore(data.length === 20);
    } catch (err) {
      console.error("Failed to fetch posts:", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── re-fetch when location or category changes ── */
  useEffect(() => {
    if (lat && lng) {
      setPage(1);
      setHasMore(true);
      fetchPosts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, category]);

  /* ── infinite scroll ── */
  useEffect(() => {
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300;

      if (nearBottom && hasMore && !loading) {
        fetchPosts(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, lat, lng, category, page]);

  /* ── location loading — show topbar + skeletons ── */
  if (locLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="feed-root">
          <div className="feed-topbar">
            <a href="/" className="feed-logo">
              <div className="feed-logo-mark"><NookMark /></div>
              <span className="feed-logo-name">nook</span>
            </a>
          </div>
          <div className="feed-body">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i}/>)}
          </div>
        </div>
      </>
    );
  }

  /* ── location denied/error ── */
  if (locError) {
    return (
      <>
        <style>{styles}</style>
        <div className="feed-root">
          <div className="feed-topbar">
            <a href="/" className="feed-logo">
              <div className="feed-logo-mark"><NookMark /></div>
              <span className="feed-logo-name">nook</span>
            </a>
          </div>
          <LocationError error={locError} onRetry={refetch}/>
        </div>
      </>
    );
  }

  /* ── main render ── */
  return (
    <>
      <style>{styles}</style>
      <div className="feed-root">

        {/* TOP BAR */}
        <div className="feed-topbar">
          <div className="feed-topbar-left">
            <div className="feed-loc-icon">
              <i className="ti ti-map-pin"
                style={{fontSize:14, color:"#1D9E75"}} aria-hidden="true"/>
            </div>
            <div>
              <div className="feed-loc-name">
                {neighborhood || "Detecting..."}
              </div>
              <div className="feed-loc-sub">2km radius</div>
            </div>
          </div>

          {/* <button
            className="feed-bell"
            onClick={() => navigate("/notifications")}
            aria-label="Notifications">
            <i className="ti ti-bell"
              style={{fontSize:18, color:"#555"}} aria-hidden="true"/>
          </button> */}
          <NotificationBell/>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="feed-filters">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              className={`feed-pill${category === c.value ? " active" : ""}`}
              onClick={() => setCategory(c.value)}>
              {c.label}
            </button>
          ))}
        </div>

        {/* FEED BODY */}
        <div className="feed-body">

          {/* skeleton — first load only */}
          {loading && posts.length === 0 && (
            [...Array(5)].map((_, i) => <SkeletonCard key={i}/>)
          )}

          {/* empty state */}
          {!loading && posts.length === 0 && (
            <div className="feed-empty">
              <div className="feed-empty-icon">
                <i className="ti ti-map-pin"
                  style={{fontSize:28, color:"#1D9E75"}} aria-hidden="true"/>
              </div>
              <h3>Nothing nearby yet</h3>
              <p>
                {category
                  ? `No ${CATEGORIES.find(c => c.value === category)
                      ?.label.replace(/^\S+\s/, "")} posts within 2km.`
                  : "Be the first to post something in your neighbourhood."
                }
              </p>
              <button
                className="feed-empty-btn"
                onClick={() => category
                  ? setCategory("")
                  : navigate("/create")}>
                <i className="ti ti-plus" style={{fontSize:14}} aria-hidden="true"/>
                {category ? "Show all posts" : "Post something"}
              </button>
            </div>
          )}

          {/* post cards */}
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              userLat={lat}
              userLng={lng}
            />
          ))}
          

          {/* loading more indicator */}
          {loading && posts.length > 0 && (
            <div className="feed-loading-more">
              <i className="ti ti-refresh spin-icon"
                style={{fontSize:15}} aria-hidden="true"/>
              Loading more...
            </div>
          )}

          {/* end of feed */}
          {!hasMore && posts.length > 0 && (
            <div className="feed-end">
              You've seen all posts within 2km
            </div>
          )}

        </div>

        {/* FAB — create post */}
        <button
          className="feed-fab"
          onClick={() => navigate("/create")}
          aria-label="Create post">
          <i className="ti ti-plus"
            style={{fontSize:22, color:"#fff"}} aria-hidden="true"/>
        </button>

      </div>
    </>
  );
}