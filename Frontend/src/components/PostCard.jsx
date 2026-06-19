import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────
   Badge colour map — one per category
───────────────────────────────────────── */
const BADGE_STYLES = {
  "alert":      { bg: "#FCEBEB", color: "#791F1F" },
  "lost-pet":   { bg: "#FAEEDA", color: "#633806" },
  "free-stuff": { bg: "#E1F5EE", color: "#085041" },
  "event":      { bg: "#EEEDFE", color: "#3C3489" },
  "question":   { bg: "#E6F1FB", color: "#0C447C" },
  "general":    { bg: "#F1F1EE", color: "#555555" },
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

// Haversine formula — returns "340m" or "1.4km"
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
  return d < 1
    ? `${Math.round(d * 1000)}m`
    : `${d.toFixed(1)}km`;
};

/* ─────────────────────────────────────────
   ImageBlock
   Handles 1 / 2 / 3 / 4+ images
───────────────────────────────────────── */
const ImageBlock = ({ images }) => {
  // nothing to render
  if (!images?.length) return null;

  // single image — full width, capped height
  if (images.length === 1) {
    return (
      <div style={imgStyles.single} onClick={e => e.stopPropagation()}>
        <img
          src={images[0]}
          alt="Post image"
          style={imgStyles.singleImg}
          loading="lazy"
        />
      </div>
    );
  }

  // 2 – 4+ images — CSS grid
  const visible    = images.slice(0, 4);
  const extraCount = images.length - 4; // how many hidden beyond 4th
  const cols       = visible.length >= 3 ? "1fr 1fr" : "1fr 1fr";

  return (
    <div
      style={{ ...imgStyles.grid, gridTemplateColumns: cols }}
      onClick={e => e.stopPropagation()}>
      {visible.map((url, i) => {
        const isLastSlot = i === 3 && extraCount > 0;

        if (isLastSlot) {
          // 4th cell — show overlay with remaining count
          return (
            <div key={i} style={imgStyles.moreWrap}>
              <img src={url} alt="" style={imgStyles.moreImg}/>
              <div style={imgStyles.moreOverlay}>
                +{extraCount + 1}
              </div>
            </div>
          );
        }

        return (
          <img
            key={i}
            src={url}
            alt="Post image"
            style={imgStyles.thumb}
            loading="lazy"
          />
        );
      })}
    </div>
  );
};

// inline styles for ImageBlock
// keeps PostCard self-contained without needing a global CSS class
const imgStyles = {
  single: {
    width: "100%",
    maxHeight: 420,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
    background: "#f5f5f0",
  },
  singleImg: {
    width: "100%",
    maxHeight: 420,
    objectFit: "cover",
    display: "block",
  },
  grid: {
    display: "grid",
    gap: 4,
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    aspectRatio: "16/10",
    objectFit: "cover",
    display: "block",
    background: "#f5f5f0",
  },
  moreWrap: {
    aspectRatio: "16/10",
    position: "relative",
    overflow: "hidden",
    background: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  moreImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.4,
  },
  moreOverlay: {
    position: "relative",
    zIndex: 1,
    fontSize: 20,
    fontWeight: 600,
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
  },
};

/* ─────────────────────────────────────────
   PostCard
   Props:
     post     — post object from API
     userLat  — viewer's latitude
     userLng  — viewer's longitude
───────────────────────────────────────── */
const PostCard = ({ post, userLat, userLng }) => {
  const navigate = useNavigate();

  // resolve badge style — fallback to general if unknown category
  const badge = BADGE_STYLES[post.category] || BADGE_STYLES.general;

  // distance from viewer to post — null if coords unavailable
  const dist =
    userLat != null &&
    userLng != null &&
    post.location?.coordinates?.length === 2
      ? calcDist(
          userLat,
          userLng,
          post.location.coordinates[1], // MongoDB: [lng, lat] — lat is index 1
          post.location.coordinates[0]  // MongoDB: [lng, lat] — lng is index 0
        )
      : null;

  // display values
  const voteCount    = post.upvotes?.length ?? 0;
  const commentCount = post.commentCount ?? 0;
  const age          = timeAgo(post.createdAt);
  const categoryLabel = post.category.replace(/-/g, " ");

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

      {/* ── TOP ROW — badge + optional anonymous tag + meta ── */}
      <div style={cardStyles.topRow}>

        <div style={cardStyles.topLeft}>
          {/* category badge */}
          <span style={{
            ...cardStyles.badge,
            background: badge.bg,
            color: badge.color,
          }}>
            {categoryLabel}
          </span>

          {/* anonymous label */}
          {post.isAnonymous && (
            <span style={cardStyles.anonLabel}>anonymous</span>
          )}
        </div>

        {/* distance + time */}
        <div style={cardStyles.meta}>
          {dist && (
            <>
              <i
                className="ti ti-map-pin"
                style={{ fontSize: 11 }}
                aria-hidden="true"
              />
              {dist}
              <span style={cardStyles.dot}>·</span>
            </>
          )}
          <span>{age}</span>
        </div>

      </div>

      {/* ── TITLE ── */}
      <div style={cardStyles.title}>{post.title}</div>

      {/* ── IMAGES — shown before body when present ── */}
      <ImageBlock images={post.images} />

      {/* ── BODY PREVIEW — only when no images ── */}
      {post.body && !post.images?.length && (
        <div style={cardStyles.body}>{post.body}</div>
      )}

      {/* ── FOOTER — vote count + comment count + distance ── */}
      <div style={cardStyles.footer}>

        {/* upvote count — display only in Phase 3 */}
        <div style={cardStyles.stat}>
          <i
            className="ti ti-arrow-up"
            style={{ fontSize: 14 }}
            aria-hidden="true"
          />
          <span>{voteCount}</span>
        </div>

        {/* comment count */}
        <div style={cardStyles.stat}>
          <i
            className="ti ti-message"
            style={{ fontSize: 14 }}
            aria-hidden="true"
          />
          <span>{commentCount}</span>
        </div>

        {/* distance — right aligned */}
        {dist && (
          <div style={cardStyles.distBadge}>
            <i
              className="ti ti-map-pin"
              style={{ fontSize: 11 }}
              aria-hidden="true"
            />
            {dist}
          </div>
        )}

      </div>

    </div>
  );
};

/* ─────────────────────────────────────────
   Card inline styles
   Self-contained — no external CSS needed
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
    marginBottom: 0, // gap handled by parent
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  topLeft: {
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    padding: "3px 9px",
    borderRadius: 20,
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },
  anonLabel: {
    fontSize: 10,
    color: "#bbb",
    fontStyle: "italic",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    color: "#bbb",
    whiteSpace: "nowrap",
  },
  dot: {
    color: "#ddd",
  },
  title: {
    fontSize: 14.5,
    fontWeight: 600,
    color: "#111",
    marginBottom: 6,
    lineHeight: 1.35,
  },
  body: {
    fontSize: 13,
    color: "#777",
    lineHeight: 1.6,
    marginBottom: 10,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    paddingTop: 8,
    borderTop: "1px solid #f5f5f2",
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: "#bbb",
  },
  distBadge: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    color: "#ccc",
  },
};

export default PostCard;