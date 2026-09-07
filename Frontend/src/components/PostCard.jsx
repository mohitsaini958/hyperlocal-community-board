import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

/* ─────────────────────────────────────────
   Badge colour map
───────────────────────────────────────── */
const BADGE_STYLES = {
  "alert":      { bg: "#FCEBEB", color: "#791F1F" },
  "lost-pet":   { bg: "#FAEEDA", color: "#633806" },
  "free-stuff": { bg: "#E1F5EE", color: "#085041" },
  "event":      { bg: "#EEEDFE", color: "#3C3489" },
  "question":   { bg: "#E6F1FB", color: "#0C447C" },
  "general":    { bg: "#F1F1EE", color: "#555555" },
  // legacy casing from old backend enum — fall through to same styles
  "Alert":      { bg: "#FCEBEB", color: "#791F1F" },
  "Lost":       { bg: "#FAEEDA", color: "#633806" },
  "Event":      { bg: "#EEEDFE", color: "#3C3489" },
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
   ImageBlock
───────────────────────────────────────── */
const ImageBlock = ({ images }) => {
  if (!images?.length) return null;

  if (images.length === 1) {
    return (
      <div style={imgStyles.single} onClick={e => e.stopPropagation()}>
        <img src={images[0]} alt="Post image" style={imgStyles.singleImg} loading="lazy"/>
      </div>
    );
  }

  const visible    = images.slice(0, 4);
  const extraCount = images.length - 4;

  return (
    <div
      style={{ ...imgStyles.grid, gridTemplateColumns: "1fr 1fr" }}
      onClick={e => e.stopPropagation()}>
      {visible.map((url, i) => {
        const isLastSlot = i === 3 && extraCount > 0;
        if (isLastSlot) {
          return (
            <div key={i} style={imgStyles.moreWrap}>
              <img src={url} alt="" style={imgStyles.moreImg}/>
              <div style={imgStyles.moreOverlay}>+{extraCount + 1}</div>
            </div>
          );
        }
        return (
          <img key={i} src={url} alt="Post image"
            style={imgStyles.thumb} loading="lazy"/>
        );
      })}
    </div>
  );
};

const imgStyles = {
  single:      { width: "100%", maxHeight: 420, borderRadius: 10, overflow: "hidden", marginBottom: 10, background: "#f5f5f0" },
  singleImg:   { width: "100%", maxHeight: 420, objectFit: "cover", display: "block" },
  grid:        { display: "grid", gap: 4, marginBottom: 10, borderRadius: 10, overflow: "hidden" },
  thumb:       { width: "100%", aspectRatio: "16/10", objectFit: "cover", display: "block", background: "#f5f5f0" },
  moreWrap:    { aspectRatio: "16/10", position: "relative", overflow: "hidden", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" },
  moreImg:     { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 },
  moreOverlay: { position: "relative", zIndex: 1, fontSize: 20, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" },
};

/* ─────────────────────────────────────────
   PostCard
   Props:
     post     — post object from API
     userLat  — viewer's latitude
     userLng  — viewer's longitude
───────────────────────────────────────── */
const PostCard = ({ post, userLat, userLng , voteCount: socketVoteCount}) => {
  const navigate = useNavigate();

  // read current user id — used to determine initial voted state
  const currentUserId = localStorage.getItem("userId");

  // ── vote state — initialised from the post object
const [voteCount, setVoteCount] = useState(
  socketVoteCount ?? post.upvotes?.length ?? 0
);

  const [hasVoted,  setHasVoted]  = useState(
    post.upvotes?.some(id => id.toString() === currentUserId) ?? false
  );
  const [voting, setVoting] = useState(false); // prevent double-tap

  // ── optimistic vote handler
  const handleVote = async (e) => {
    e.stopPropagation(); // don't navigate to post detail on click

    if (!currentUserId) {
      navigate("/login");
      return;
    }

    if (voting) return;

    // flip UI immediately — don't wait for server
    const prevCount  = voteCount;
    const prevVoted  = hasVoted;
    setHasVoted(!hasVoted);
    setVoteCount(hasVoted ? voteCount - 1 : voteCount + 1);
    setVoting(true);

    try {
      const { data } = await axios.post(`/posts/${post._id}/vote`);
      // reconcile with actual server count
      // backend returns { success, action, voteCount }
      setVoteCount(data.voteCount);
      setHasVoted(data.action === "added");
    } catch (err) {
      // revert on failure
      setVoteCount(prevCount);
      setHasVoted(prevVoted);
      console.error("Vote failed:", err.message);
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
  if (socketVoteCount !== undefined) {
    setVoteCount(socketVoteCount);
  }
}, [socketVoteCount]);

  const badge        = BADGE_STYLES[post.category] || BADGE_STYLES.general;
  const commentCount = post.commentCount ?? 0;
  const age          = timeAgo(post.createdAt);
  const categoryLabel = post.category.replace(/-/g, " ");

  const dist =
    userLat != null && userLng != null &&
    post.location?.coordinates?.length === 2
      ? calcDist(
          userLat, userLng,
          post.location.coordinates[1], // MongoDB stores [lng, lat]
          post.location.coordinates[0]
        )
      : null;

  return (
    <div
      style={cardStyles.card}
      onClick={() => navigate(`/posts/${post._id}`)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#9FE1CB";
        e.currentTarget.style.boxShadow   = "0 4px 16px rgba(29,158,117,0.08)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#eeeeea";
        e.currentTarget.style.boxShadow   = "none";
      }}
      onMouseDown={e => { e.currentTarget.style.transform = "scale(0.99)"; }}
      onMouseUp={e =>   { e.currentTarget.style.transform = "scale(1)"; }}>

      {/* ── TOP ROW ── */}
      <div style={cardStyles.topRow}>
        <div style={cardStyles.topLeft}>
          <span style={{ ...cardStyles.badge, background: badge.bg, color: badge.color }}>
            {categoryLabel}
          </span>
          {post.isAnonymous && (
            <span style={cardStyles.anonLabel}>anonymous</span>
          )}
        </div>
        <div style={cardStyles.meta}>
          {dist && (
            <>
              <i className="ti ti-map-pin" style={{ fontSize: 11 }} aria-hidden="true"/>
              {dist}
              <span style={cardStyles.dot}>·</span>
            </>
          )}
          <span>{age}</span>
        </div>
      </div>

      {/* ── TITLE ── */}
      <div style={cardStyles.title}>{post.title}</div>

      {/* ── IMAGES ── */}
      <ImageBlock images={post.images}/>

      {/* ── BODY PREVIEW — only when no images ── */}
      {post.body && !post.images?.length && (
        <div style={cardStyles.body}>{post.body}</div>
      )}

      {/* ── FOOTER ── */}
      <div style={cardStyles.footer}>

        {/* ── VOTE BUTTON — filled teal when voted, outline when not ── */}
        <button
          onClick={handleVote}
          disabled={voting}
          aria-label={hasVoted ? "Remove upvote" : "Upvote"}
          style={{
            ...cardStyles.voteBtn,
            background:   hasVoted ? "#1D9E75"  : "transparent",
            color:        hasVoted ? "#fff"      : "#888",
            border:       hasVoted ? "none"      : "1.5px solid #e5e5e5",
            opacity:      voting   ? 0.7         : 1,
            cursor:       voting   ? "not-allowed" : "pointer",
          }}
          onMouseEnter={e => {
            if (!hasVoted && !voting) e.currentTarget.style.borderColor = "#1D9E75";
          }}
          onMouseLeave={e => {
            if (!hasVoted && !voting) e.currentTarget.style.borderColor = "#e5e5e5";
          }}>
          <i className="ti ti-arrow-up" style={{ fontSize: 14 }} aria-hidden="true"/>
          <span style={{ fontWeight: 600 }}>{voteCount}</span>
        </button>

        {/* ── COMMENT COUNT — tapping navigates to post detail ── */}
        <div style={cardStyles.stat}>
          <i className="ti ti-message" style={{ fontSize: 14 }} aria-hidden="true"/>
          <span>{commentCount}</span>
        </div>

        {/* ── DISTANCE — right aligned ── */}
        {dist && (
          <div style={cardStyles.distBadge}>
            <i className="ti ti-map-pin" style={{ fontSize: 11 }} aria-hidden="true"/>
            {dist}
          </div>
        )}

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Styles
───────────────────────────────────────── */
const cardStyles = {
  card: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#fff",
    borderRadius: 14,
    padding: "1rem 1.1rem",
    border: "1px solid #eeeeea",
    cursor: "pointer",
    transition: "border-color .15s, box-shadow .15s, transform .1s",
    marginBottom: 0,
  },
  topRow: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 8,
  },
  topLeft: { display: "flex", alignItems: "center", gap: 7 },
  badge: {
    fontSize: 10, fontWeight: 600,
    padding: "3px 9px", borderRadius: 20,
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "capitalize", whiteSpace: "nowrap",
  },
  anonLabel: { fontSize: 10, color: "#bbb", fontStyle: "italic" },
  meta: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#bbb", whiteSpace: "nowrap" },
  dot:  { color: "#ddd" },
  title: { fontSize: 14.5, fontWeight: 600, color: "#111", marginBottom: 6, lineHeight: 1.35 },
  body: {
    fontSize: 13, color: "#777", lineHeight: 1.6, marginBottom: 10,
    display: "-webkit-box", WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  footer: {
    display: "flex", alignItems: "center", gap: 12,
    paddingTop: 8, borderTop: "1px solid #f5f5f2",
  },
  // vote button — the key new style
  voteBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "5px 12px", borderRadius: 20,
    fontSize: 12, fontFamily: "'DM Sans', sans-serif",
    transition: "all .15s",
    outline: "none",
  },
  stat: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#bbb" },
  distBadge: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#ccc" },
};

export default PostCard;