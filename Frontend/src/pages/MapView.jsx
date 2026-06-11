import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useGeolocation from "../hooks/useGeolocation";
import axios from "../api/axios";

/* ─────────────────────────────────────────
   Fix Leaflet's default icon paths
   (broken with Vite by default)
───────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─────────────────────────────────────────
   Category → pin colour
───────────────────────────────────────── */
const CAT_COLOR = {
  "alert":      "#ef4444",
  "lost-pet":   "#f97316",
  "free-stuff": "#1D9E75",
  "event":      "#8b5cf6",
  "question":   "#3b82f6",
  "general":    "#6b7280",
};

const BADGE_STYLES = {
  "alert":      { bg: "#FCEBEB", color: "#791F1F" },
  "lost-pet":   { bg: "#FAEEDA", color: "#633806" },
  "free-stuff": { bg: "#E1F5EE", color: "#085041" },
  "event":      { bg: "#EEEDFE", color: "#3C3489" },
  "question":   { bg: "#E6F1FB", color: "#0C447C" },
  "general":    { bg: "#F1F1EE", color: "#555555" },
};

/* ─────────────────────────────────────────
   Build a coloured SVG pin icon per category
───────────────────────────────────────── */
const makePinIcon = (color) =>
  L.divIcon({
    className: "",
    html: `
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 9.625 14 22 14 22S28 23.625 28 14
                 C28 6.268 21.732 0 14 0z"
              fill="${color}"/>
        <circle cx="14" cy="14" r="6" fill="white"/>
      </svg>`,
    iconSize:   [28, 36],
    iconAnchor: [14, 36],
    popupAnchor:[0, -36],
  });

/* ─────────────────────────────────────────
   Green "you are here" dot icon
───────────────────────────────────────── */
const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:18px; height:18px; border-radius:50%;
      background:#1D9E75;
      border:3px solid #fff;
      box-shadow:0 2px 8px rgba(29,158,117,0.5);">
    </div>`,
  iconSize:   [18, 18],
  iconAnchor: [9, 9],
});

/* ─────────────────────────────────────────
   FlyToUser — re-centres map when coords arrive
───────────────────────────────────────── */
const FlyToUser = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 14, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
};

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const timeAgo = (date) => {
  const s = (Date.now() - new Date(date)) / 1000;
  if (s < 60)    return `${Math.floor(s)}s ago`;
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

/* ─────────────────────────────────────────
   BottomSheet — slides up when a pin is tapped
───────────────────────────────────────── */
const BottomSheet = ({ post, userLat, userLng, onClose, onView }) => {
  if (!post) return null;

  const badge = BADGE_STYLES[post.category] || BADGE_STYLES.general;
  const color = CAT_COLOR[post.category]    || CAT_COLOR.general;
  const dist  =
    userLat != null && userLng != null && post.location?.coordinates?.length === 2
      ? calcDist(userLat, userLng,
          post.location.coordinates[1],
          post.location.coordinates[0])
      : null;

  return (
    <>
      {/* backdrop — tap to close */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.25)",
          zIndex: 200,
        }}
      />

      {/* sheet */}
      <div style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        background: "#fff",
        borderRadius: "16px 16px 0 0",
        padding: "0 0 env(safe-area-inset-bottom)",
        zIndex: 201,
        boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
        animation: "sheetUp .25s ease",
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: 680,
        margin: "0 auto",
      }}>

        {/* drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: "#e0e0e0",
          margin: "12px auto 0",
        }}/>

        {/* coloured top strip per category */}
        <div style={{
          height: 4, background: color,
          marginTop: 12,
        }}/>

        <div style={{ padding: "14px 16px 16px" }}>

          {/* badge + meta */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 600,
                padding: "3px 10px", borderRadius: 20,
                background: badge.bg, color: badge.color,
                textTransform: "capitalize",
              }}>
                {post.category.replace(/-/g, " ")}
              </span>
              {post.isAnonymous && (
                <span style={{ fontSize: 11, color: "#bbb", fontStyle: "italic" }}>
                  anonymous
                </span>
              )}
            </div>

            <div style={{
              display: "flex", alignItems: "center",
              gap: 5, fontSize: 11, color: "#bbb",
            }}>
              {dist && (
                <>
                  <i className="ti ti-map-pin" style={{ fontSize: 11 }} aria-hidden="true"/>
                  {dist}
                  <span>·</span>
                </>
              )}
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>

          {/* title */}
          <div style={{
            fontSize: 16, fontWeight: 600,
            color: "#111", marginBottom: 6, lineHeight: 1.35,
          }}>
            {post.title}
          </div>

          {/* body preview */}
          {post.body && (
            <div style={{
              fontSize: 13, color: "#777",
              lineHeight: 1.6, marginBottom: 14,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {post.body}
            </div>
          )}

          {/* thumbnail if image exists */}
          {post.images?.[0] && (
            <div style={{
              width: "100%", height: 140,
              borderRadius: 10, overflow: "hidden",
              marginBottom: 14, background: "#f5f5f0",
            }}>
              <img
                src={post.images[0]}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          {/* stats row */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: 14, marginBottom: 14,
            paddingTop: 10, borderTop: "1px solid #f5f5f2",
            fontSize: 12, color: "#bbb",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <i className="ti ti-arrow-up" style={{ fontSize: 14 }} aria-hidden="true"/>
              {post.upvotes?.length ?? 0}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <i className="ti ti-message" style={{ fontSize: 14 }} aria-hidden="true"/>
              {post.commentCount ?? 0}
            </div>
          </div>

          {/* actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onView}
              style={{
                flex: 1, height: 44, borderRadius: 12,
                background: "#1D9E75", color: "#fff",
                border: "none", fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 7,
                transition: "background .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#0F6E56"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1D9E75"; }}>
              <i className="ti ti-eye" style={{ fontSize: 16 }} aria-hidden="true"/>
              View post
            </button>

            <button
              onClick={onClose}
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: "#f5f5f0", color: "#555",
                border: "1px solid #eeeeea", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#eeeeea"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f5f5f0"; }}>
              <i className="ti ti-x" style={{ fontSize: 18 }} aria-hidden="true"/>
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

/* ─────────────────────────────────────────
   MapView — main page
───────────────────────────────────────── */
export default function MapView() {
  const navigate = useNavigate();

  const {
    lat, lng, neighborhood,
    error: locError,
    loading: locLoading,
    refetch,
  } = useGeolocation();

  const [posts,         setPosts]         = useState([]);
  const [selectedPost,  setSelectedPost]  = useState(null);
  const [loadingPosts,  setLoadingPosts]  = useState(false);

  /* fetch nearby posts when location ready */
  useEffect(() => {
    if (!lat || !lng) return;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const { data } = await axios.get("/api/posts/nearby", {
          params: { lat, lng, radius: 2 },
        });
        setPosts(data);
      } catch (err) {
        console.error("MapView fetch failed:", err.message);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [lat, lng]);

  /* ── location loading ── */
  if (locLoading) {
    return (
      <div style={pageStyles.root}>
        <TopBar
          neighborhood="Detecting location..."
          navigate={navigate}
          showLoader
        />
        <div style={pageStyles.loadingMap}>
          <i className="ti ti-map" style={{ fontSize: 36, color: "#ccc" }} aria-hidden="true"/>
          <p style={{ marginTop: 12, fontSize: 14, color: "#aaa" }}>
            Getting your location...
          </p>
        </div>
      </div>
    );
  }

  /* ── location error ── */
  if (locError) {
    return (
      <div style={pageStyles.root}>
        <TopBar neighborhood="Location error" navigate={navigate}/>
        <div style={pageStyles.errorWrap}>
          <div style={pageStyles.errorBox}>
            <i className="ti ti-map-pin-off"
              style={{ fontSize: 28, color: "#ef4444", marginBottom: 12, display: "block" }}
              aria-hidden="true"/>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#111" }}>
              {locError === "PERMISSION_DENIED" ? "Location access blocked" : "Location unavailable"}
            </h3>
            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 16 }}>
              {locError === "PERMISSION_DENIED"
                ? "Nook needs your location to show the map. Please enable it in browser settings."
                : "We couldn't detect your location. Please try again."}
            </p>
            <button onClick={refetch} style={pageStyles.retryBtn}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── main render ── */
  return (
    <div style={pageStyles.root}>

      {/* top bar */}
      <TopBar
        neighborhood={neighborhood}
        postCount={posts.length}
        navigate={navigate}
        loading={loadingPosts}
      />

      {/* map fills remaining space */}
      <div style={pageStyles.mapWrap}>
        <MapContainer
          center={[lat || 20.5937, lng || 78.9629]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}>

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />

          {/* fly to user when coords arrive */}
          <FlyToUser lat={lat} lng={lng}/>

          {/* 2km radius circle */}
          {lat && lng && (
            <Circle
              center={[lat, lng]}
              radius={2000}
              pathOptions={{
                color:       "#1D9E75",
                fillColor:   "#1D9E75",
                fillOpacity: 0.06,
                weight:      1.5,
                dashArray:   "6 4",
              }}
            />
          )}

          {/* user's position — green dot */}
          {lat && lng && (
            <Marker
              position={[lat, lng]}
              icon={userIcon}
              zIndexOffset={1000}
            />
          )}

          {/* post markers */}
          {posts.map(post => {
            if (!post.location?.coordinates?.length) return null;
            const [pLng, pLat] = post.location.coordinates;
            const color        = CAT_COLOR[post.category] || CAT_COLOR.general;

            return (
              <Marker
                key={post._id}
                position={[pLat, pLng]}
                icon={makePinIcon(color)}
                eventHandlers={{
                  click: () => setSelectedPost(post),
                }}
              />
            );
          })}

        </MapContainer>

        {/* post count pill */}
        {posts.length > 0 && (
          <div style={pageStyles.countPill}>
            <i className="ti ti-map-pin" style={{ fontSize: 12 }} aria-hidden="true"/>
            {posts.length} post{posts.length !== 1 ? "s" : ""} nearby
          </div>
        )}

        {/* empty state overlay */}
        {!loadingPosts && posts.length === 0 && (
          <div style={pageStyles.emptyOverlay}>
            <div style={pageStyles.emptyBox}>
              <i className="ti ti-map-pin"
                style={{ fontSize: 24, color: "#1D9E75", marginBottom: 8, display: "block" }}
                aria-hidden="true"/>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#111", marginBottom: 4 }}>
                Nothing nearby yet
              </p>
              <p style={{ fontSize: 12, color: "#888" }}>
                Be the first to post something
              </p>
            </div>
          </div>
        )}

      </div>

      {/* bottom sheet — appears when a pin is tapped */}
      <BottomSheet
        post={selectedPost}
        userLat={lat}
        userLng={lng}
        onClose={() => setSelectedPost(null)}
        onView={() => navigate(`/post/${selectedPost._id}`)}
      />

    </div>
  );
}

/* ─────────────────────────────────────────
   TopBar
───────────────────────────────────────── */
const TopBar = ({ neighborhood, postCount, navigate, loading, showLoader }) => (
  <div style={pageStyles.topbar}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={pageStyles.locIcon}>
        <i className="ti ti-map-pin"
          style={{ fontSize: 14, color: "#1D9E75" }} aria-hidden="true"/>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#064534" }}>
          {neighborhood || "Nearby"}
        </div>
        <div style={{ fontSize: 11, color: "#bbb" }}>
          {showLoader ? "Detecting..."
            : loading    ? "Loading posts..."
            : postCount != null ? `${postCount} posts within 2km`
            : "2km radius"}
        </div>
      </div>
    </div>

    <div style={{ display: "flex", gap: 8 }}>
      <button
        style={pageStyles.iconBtn}
        onClick={() => navigate("/feed")}
        aria-label="Switch to feed view">
        <i className="ti ti-list" style={{ fontSize: 18 }} aria-hidden="true"/>
      </button>
      <button
        style={pageStyles.iconBtn}
        onClick={() => navigate("/notifications")}
        aria-label="Notifications">
        <i className="ti ti-bell" style={{ fontSize: 18 }} aria-hidden="true"/>
      </button>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Page styles
───────────────────────────────────────── */
const pageStyles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#f5f5f0",
  },
  topbar: {
    height: 56,
    background: "#fff",
    borderBottom: "1px solid #eeeeea",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1.25rem",
    flexShrink: 0,
    zIndex: 50,
  },
  locIcon: {
    width: 30, height: 30,
    background: "#E1F5EE",
    borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    background: "#f5f5f0", border: "none",
    cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center",
    color: "#555", transition: "background .15s",
  },
  mapWrap: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  countPill: {
    position: "absolute",
    top: 12, left: "50%",
    transform: "translateX(-50%)",
    background: "#064534",
    color: "#5DCAA5",
    fontSize: 12, fontWeight: 500,
    padding: "6px 14px",
    borderRadius: 20,
    display: "flex", alignItems: "center", gap: 6,
    boxShadow: "0 2px 10px rgba(6,69,52,0.25)",
    zIndex: 100,
    fontFamily: "'DM Sans', sans-serif",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },
  emptyOverlay: {
    position: "absolute",
    bottom: 32, left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
  },
  emptyBox: {
    background: "#fff",
    borderRadius: 14,
    padding: "16px 24px",
    textAlign: "center",
    border: "1px solid #eeeeea",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    fontFamily: "'DM Sans', sans-serif",
  },
  loadingMap: {
    flex: 1, display: "flex",
    flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
  errorWrap: {
    flex: 1, display: "flex",
    alignItems: "center", justifyContent: "center",
    padding: 24,
  },
  errorBox: {
    background: "#fff", borderRadius: 14,
    padding: "32px 24px", textAlign: "center",
    border: "1px solid #eeeeea",
    maxWidth: 360, width: "100%",
    fontFamily: "'DM Sans', sans-serif",
  },
  retryBtn: {
    fontSize: 13, fontWeight: 600, color: "#fff",
    background: "#1D9E75", border: "none",
    borderRadius: 10, padding: "8px 20px",
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    transition: "background .15s",
  },
};