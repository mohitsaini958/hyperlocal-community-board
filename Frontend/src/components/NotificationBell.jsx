import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";
import socket from "../socket";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; }

  .nb-wrap { position: relative; font-family: 'DM Sans', sans-serif; }

  .nb-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: #f5f5f0; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #555; transition: background .15s; position: relative;
  }

  .nb-btn:hover { background: #E1F5EE; }

  .nb-badge {
    position: absolute; top: 3px; right: 3px;
    min-width: 16px; height: 16px;
    background: #ef4444; color: #fff;
    border-radius: 8px; border: 2px solid #fff;
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    padding: 0 3px;
  }

  .nb-dropdown {
    position: absolute; top: 46px; right: 0;
    width: 340px; max-height: 420px;
    background: #fff; border-radius: 14px;
    border: 1px solid #eeeeea;
    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
    overflow: hidden; z-index: 200;
    animation: nbDropIn .18s ease;
    display: flex; flex-direction: column;
  }

  @keyframes nbDropIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .nb-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-bottom: 1px solid #f5f5f2;
    flex-shrink: 0;
  }

  .nb-title { font-size: 14px; font-weight: 600; color: #111; }

  .nb-mark-read {
    font-size: 12px; color: #1D9E75; font-weight: 500;
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  .nb-mark-read:hover { text-decoration: underline; }
  .nb-mark-read:disabled { color: #ccc; cursor: not-allowed; }

  .nb-list {
    overflow-y: auto; flex: 1;
  }

  .nb-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid #f5f5f2;
    cursor: pointer; transition: background .12s;
    text-align: left; width: 100%; border-left: 3px solid transparent;
  }

  .nb-item:hover { background: #fafafa; }
  .nb-item.unread { background: #f0fbf7; border-left-color: #1D9E75; }
  .nb-item:last-child { border-bottom: none; }

  .nb-icon {
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .nb-content { flex: 1; min-width: 0; }

  .nb-text {
    font-size: 13px; color: #333; line-height: 1.4;
    margin-bottom: 2px;
  }

  .nb-text b { color: #111; font-weight: 600; }

  .nb-post-title {
    font-size: 12px; color: #888;
    overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
    margin-bottom: 3px;
  }

  .nb-time { font-size: 11px; color: #bbb; }

  .nb-unread-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #1D9E75; flex-shrink: 0; margin-top: 5px;
  }

  /* loading skeleton */
  @keyframes nbShimmer {
    0%  { background-position: -300px 0; }
    100%{ background-position:  300px 0; }
  }

  .nb-skel {
    background: linear-gradient(90deg,#f0f0ee 25%,#e8e8e4 50%,#f0f0ee 75%);
    background-size: 300px 100%;
    animation: nbShimmer 1.4s infinite linear;
    border-radius: 6px;
  }

  .nb-skel-row { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #f5f5f2; }
  .nb-skel-icon { width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; }
  .nb-skel-line1 { height: 12px; width: 90%; margin-bottom: 6px; }
  .nb-skel-line2 { height: 10px; width: 50%; }

  /* empty */
  .nb-empty {
    padding: 40px 16px; text-align: center;
  }

  .nb-empty p { font-size: 13px; color: #bbb; line-height: 1.6; }

  @keyframes nbSpin { to { transform: rotate(360deg); } }
  .nb-spin { animation: nbSpin .7s linear infinite; display: inline-block; }

  @media (max-width: 480px) {
    .nb-dropdown {
      position: fixed; top: 56px; left: 8px; right: 8px;
      width: auto;
    }
  }
`;

/* ── icon + colour per notification type ── */
const TYPE_CONFIG = {
  comment:     { icon: "ti-message",   bg: "#E1F5EE", color: "#0F6E56" },
  upvote:      { icon: "ti-arrow-up",  bg: "#E6F1FB", color: "#185FA5" },
  nearby_post: { icon: "ti-map-pin",   bg: "#FAEEDA", color: "#854F0B" },
  alert:       { icon: "ti-alert-triangle", bg: "#FCEBEB", color: "#791F1F" },
};

const timeAgo = (date) => {
  const s = (Date.now() - new Date(date)) / 1000;
  if (s < 60)    return `${Math.floor(s)}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const buildMessage = (n) => {
  const sender = n.sender?.username ?? "Someone";
  switch (n.type) {
    case "comment":     return <><b>{sender}</b> commented on your post</>;
    case "upvote":      return <><b>{sender}</b> upvoted your post</>;
    case "nearby_post": return <>A new post was shared near you</>;
    case "alert":       return <>New alert in your neighbourhood</>;
    default:             return <>New notification</>;
  }
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const wrapRef         = useRef(null);
  const navigate         = useNavigate();
  const queryClient      = useQueryClient();

  /* ── fetch notifications — GET on mount, poll every 30s for freshness ── */
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await axios.get("/notifications");
      return data.notifications;
    },
    refetchInterval: 30000, // poll every 30s
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  /* ── mark all read mutation ── */
  const markAllRead = useMutation({
    mutationFn: () => axios.put("/notifications/read-all"),
    onSuccess: () => {
      queryClient.setQueryData(["notifications"], (old = []) =>
        old.map(n => ({ ...n, isRead: true }))
      );
    },
  });

  /* ── mark single read + navigate ── */
  const handleItemClick = async (n) => {
    if (!n.isRead) {
      // optimistic mark as read
      queryClient.setQueryData(["notifications"], (old = []) =>
        old.map(item => item._id === n._id ? { ...item, isRead: true } : item)
      );
      try {
        await axios.put(`/notifications/${n._id}/read`);
      } catch {
        // non-critical — ignore failure
      }
    }
    setOpen(false);
    if (n.post) navigate(`/posts/${n.post._id || n.post}`);
  };

  /* ── close on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="nb-wrap" ref={wrapRef}>

        <button
          className="nb-btn"
          onClick={() => setOpen(p => !p)}
          aria-label="Notifications">
          <i className="ti ti-bell" style={{ fontSize: 18 }} aria-hidden="true"/>
          {unreadCount > 0 && (
            <span className="nb-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="nb-dropdown">

            <div className="nb-header">
              <span className="nb-title">Notifications</span>
              <button
                className="nb-mark-read"
                onClick={() => markAllRead.mutate()}
                disabled={unreadCount === 0 || markAllRead.isPending}>
                {markAllRead.isPending
                  ? <i className="ti ti-refresh nb-spin" style={{ fontSize: 13 }} aria-hidden="true"/>
                  : "Mark all read"
                }
              </button>
            </div>

            <div className="nb-list">

              {/* loading skeleton */}
              {isLoading && [...Array(4)].map((_, i) => (
                <div key={i} className="nb-skel-row">
                  <div className="nb-skel nb-skel-icon"/>
                  <div style={{ flex: 1 }}>
                    <div className="nb-skel nb-skel-line1"/>
                    <div className="nb-skel nb-skel-line2"/>
                  </div>
                </div>
              ))}

              {/* empty */}
              {!isLoading && notifications.length === 0 && (
                <div className="nb-empty">
                  <i className="ti ti-bell-off"
                    style={{ fontSize: 26, color: "#ddd", marginBottom: 8, display: "block" }}
                    aria-hidden="true"/>
                  <p>You're all caught up</p>
                </div>
              )}

              {/* notification items */}
              {notifications.map(n => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.comment;
                return (
                  <button
                    key={n._id}
                    className={`nb-item${!n.isRead ? " unread" : ""}`}
                    onClick={() => handleItemClick(n)}>

                    <div className="nb-icon" style={{ background: cfg.bg }}>
                      <i className={`ti ${cfg.icon}`}
                        style={{ fontSize: 15, color: cfg.color }} aria-hidden="true"/>
                    </div>

                    <div className="nb-content">
                      <div className="nb-text">{buildMessage(n)}</div>
                      {n.post?.title && (
                        <div className="nb-post-title">"{n.post.title}"</div>
                      )}
                      <div className="nb-time">{timeAgo(n.createdAt)}</div>
                    </div>

                    {!n.isRead && <div className="nb-unread-dot"/>}
                  </button>
                );
              })}

            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default NotificationBell;