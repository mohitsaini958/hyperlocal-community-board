import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";
import ReportModal from "../components/ReportModal";
import { showToast } from "../components/Toast";
import { useEffect } from "react";
import socket from "../socket";


/* ─────────────────────────────────────────
   Styles
───────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pd-root {
    font-family: 'DM Sans', sans-serif;
    background: #f5f5f0;
    min-height: 100vh;
    display: flex; flex-direction: column;
  }

  /* TOP BAR */
  .pd-topbar {
    height: 52px; background: #fff;
    border-bottom: 1px solid #eeeeea;
    display: flex; align-items: center; gap: 10px;
    padding: 0 1.25rem;
    position: sticky; top: 0; z-index: 50; flex-shrink: 0;
  }

  .pd-back {
    width: 34px; height: 34px; border-radius: 10px;
    background: #f5f5f0; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #555; transition: background .15s; flex-shrink: 0;
  }

  .pd-back:hover { background: #eeeeea; }

  .pd-topbar-title {
    font-size: 15px; font-weight: 600; color: #111;
    flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
    text-transform: capitalize;
  }

  .pd-menu-btn {
    width: 34px; height: 34px; border-radius: 10px;
    background: none; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #888; transition: background .15s; position: relative;
    flex-shrink: 0;
  }

  .pd-menu-btn:hover { background: #f5f5f0; }

  /* DROPDOWN */
  .pd-dropdown {
    position: absolute; top: 40px; right: 0;
    background: #fff; border-radius: 12px;
    border: 1px solid #eeeeea;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    overflow: hidden; min-width: 164px; z-index: 100;
    animation: dropIn .15s ease;
  }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .pd-menu-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; font-size: 13px; color: #333;
    cursor: pointer; transition: background .1s;
    border: none; background: none; width: 100%;
    text-align: left; font-family: 'DM Sans', sans-serif;
  }

  .pd-menu-item:hover { background: #f5f5f0; }
  .pd-menu-item.danger { color: #ef4444; }
  .pd-menu-item.danger:hover { background: #fff5f5; }

  /* SCROLL */
  .pd-scroll { flex: 1; overflow-y: auto; padding-bottom: 80px; }
  .pd-content { max-width: 680px; width: 100%; margin: 0 auto; }

  /* POST */
  .pd-post { background: #fff; border-bottom: 1px solid #eeeeea; padding: 1.25rem; }

  .pd-sub {
    display: flex; align-items: center;
    justify-content: space-between;
    margin-bottom: 10px; flex-wrap: wrap; gap: 6px;
  }

  .pd-sub-left { display: flex; align-items: center; gap: 8px; }

  .pd-badge {
    font-size: 11px; font-weight: 600;
    padding: 3px 10px; border-radius: 20px;
    font-family: 'DM Sans', sans-serif;
    text-transform: capitalize;
  }

  .pd-anon   { font-size: 11px; color: #bbb; font-style: italic; }
  .pd-author { font-size: 12px; color: #888; }

  .pd-meta {
    display: flex; align-items: center;
    gap: 5px; font-size: 11px; color: #bbb;
  }

  .pd-title {
    font-size: 20px; font-weight: 700; color: #111;
    line-height: 1.3; margin-bottom: 10px; letter-spacing: -0.3px;
  }

  .pd-body-text {
    font-size: 14px; color: #444;
    line-height: 1.75; margin-bottom: 14px;
  }

  /* images */
  .pd-img-single {
    width: 100%; max-height: 480px;
    border-radius: 10px; overflow: hidden;
    margin-bottom: 14px; background: #f5f5f0;
  }

  .pd-img-single img {
    width: 100%; max-height: 480px;
    object-fit: cover; display: block;
  }

  .pd-img-grid {
    display: grid; gap: 4px;
    margin-bottom: 14px;
    border-radius: 10px; overflow: hidden;
  }

  .pd-img-grid.two   { grid-template-columns: 1fr 1fr; }
  .pd-img-grid.three { grid-template-columns: 1fr 1fr; }
  .pd-img-grid.four  { grid-template-columns: 1fr 1fr; }

  .pd-img-thumb {
    width: 100%; aspect-ratio: 16/10;
    object-fit: cover; display: block;
    background: #f5f5f0; cursor: zoom-in;
  }

  .pd-img-more {
    aspect-ratio: 16/10; position: relative;
    overflow: hidden; background: #1a1a1a;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
  }

  .pd-img-more img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; opacity: .4;
  }

  .pd-img-more span {
    position: relative; z-index: 1;
    font-size: 20px; font-weight: 700; color: #fff;
  }

  /* stats row */
  .pd-stats {
    display: flex; align-items: center;
    gap: 12px; padding-top: 12px;
    border-top: 1px solid #f5f5f2;
    flex-wrap: wrap;
  }

  .pd-upvote {
    display: flex; align-items: center; gap: 7px;
    padding: 7px 16px; border-radius: 20px;
    font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all .15s;
  }

  .pd-upvote.voted { background: #1D9E75; color: #fff; border: none; }
  .pd-upvote.unvoted { background: transparent; color: #888; border: 1.5px solid #e5e5e5; }
  .pd-upvote.unvoted:hover { border-color: #1D9E75; color: #1D9E75; }

  .pd-stat {
    display: flex; align-items: center;
    gap: 6px; font-size: 13px; color: #aaa;
  }

  /* LIGHTBOX */
  .pd-lightbox {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.92);
    z-index: 300; display: flex;
    align-items: center; justify-content: center;
    animation: fadeIn .2s ease;
  }

  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

  .pd-lightbox img {
    max-width: 94vw; max-height: 90vh;
    object-fit: contain; border-radius: 6px;
  }

  .pd-lb-close {
    position: absolute; top: 16px; right: 16px;
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: none; color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; transition: background .15s;
  }

  .pd-lb-close:hover { background: rgba(255,255,255,0.25); }

  /* COMMENTS HEADER */
  .pd-comments-header {
    background: #fff;
    padding: 12px 1.25rem;
    border-bottom: 1px solid #eeeeea;
    font-size: 13px; font-weight: 600; color: #555;
    display: flex; align-items: center; gap: 8px;
  }

  /* COMMENTS LIST */
  .pd-comments-list { background: #fff; display: flex; flex-direction: column; }

  .pd-comment {
    padding: 12px 1.25rem;
    border-bottom: 1px solid #f5f5f2;
    animation: cardIn .25s ease;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .pd-comment:last-child { border-bottom: none; }

  .pd-comment-top {
    display: flex; align-items: center;
    gap: 8px; margin-bottom: 6px;
  }

  .pd-comment-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; color: #fff; flex-shrink: 0;
  }

  .pd-comment-author { font-size: 12px; font-weight: 600; color: #111; }
  .pd-comment-time   { font-size: 11px; color: #bbb; margin-left: auto; }
  .pd-comment-body   { font-size: 13.5px; color: #333; line-height: 1.65; padding-left: 36px; margin-bottom: 6px; }

  /* comment action row — reply / delete */
  .pd-comment-actions {
    display: flex; align-items: center; gap: 14px;
    padding-left: 36px;
  }

  .pd-comment-action {
    display: flex; align-items: center; gap: 4px;
    font-size: 11.5px; font-weight: 500; color: #aaa;
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: color .15s; padding: 2px 0;
  }

  .pd-comment-action:hover { color: #1D9E75; }
  .pd-comment-action.delete:hover { color: #ef4444; }

  /* REPLIES — nested under parent */
  .pd-replies {
    padding-left: 36px;
    margin-top: 10px;
    display: flex; flex-direction: column; gap: 12px;
    border-left: 2px solid #f0f0ee;
    margin-left: 14px;
  }

  .pd-reply {
    padding-left: 14px;
  }

  /* REPLY INPUT — inline, appears under comment when "Reply" tapped */
  .pd-reply-input-wrap {
    padding-left: 36px;
    margin-top: 10px;
    display: flex; align-items: flex-end; gap: 8px;
  }

  .pd-reply-box {
    flex: 1; display: flex; align-items: flex-end;
    background: #f5f5f0; border-radius: 12px;
    border: 1.5px solid #eeeeea;
    padding: 7px 10px; gap: 6px;
    transition: border-color .15s;
  }

  .pd-reply-box:focus-within { border-color: #1D9E75; background: #fff; }

  .pd-reply-textarea {
    flex: 1; border: none; outline: none; background: transparent;
    font-size: 13px; font-family: 'DM Sans', sans-serif; color: #111;
    resize: none; max-height: 80px; line-height: 1.4;
  }

  .pd-reply-textarea::placeholder { color: #bbb; }

  .pd-reply-send {
    width: 28px; height: 28px; border-radius: 8px;
    background: #1D9E75; color: #fff; border: none;
    cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s, opacity .15s;
  }

  .pd-reply-send:hover:not(:disabled) { background: #0F6E56; }
  .pd-reply-send:disabled { background: #9FE1CB; cursor: not-allowed; opacity: .7; }

  .pd-reply-cancel {
    width: 28px; height: 28px; border-radius: 8px;
    background: #f5f5f0; color: #888; border: none;
    cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s;
  }

  .pd-reply-cancel:hover { background: #eeeeea; }

  /* SKELETON */
  .pd-post-skel    { background: #fff; padding: 1.25rem; border-bottom: 1px solid #eeeeea; }
  .pd-comment-skel { padding: 12px 1.25rem; border-bottom: 1px solid #f5f5f2; }

  @keyframes shimmer {
    0%  { background-position: -600px 0; }
    100%{ background-position:  600px 0; }
  }

  .skel {
    background: linear-gradient(90deg,#f0f0ee 25%,#e8e8e4 50%,#f0f0ee 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 6px;
  }

  .skel-badge  { height: 20px; width: 70px; border-radius: 10px; margin-bottom: 12px; }
  .skel-title  { height: 22px; width: 70%; margin-bottom: 12px; }
  .skel-body1  { height: 14px; width: 100%; margin-bottom: 7px; }
  .skel-body2  { height: 14px; width: 80%; margin-bottom: 7px; }
  .skel-body3  { height: 14px; width: 55%; margin-bottom: 16px; }
  .skel-foot   { height: 12px; width: 40%; }
  .skel-avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; }
  .skel-name   { height: 12px; width: 100px; }
  .skel-line1  { height: 12px; width: 100%; margin-bottom: 5px; }
  .skel-line2  { height: 12px; width: 70%; }

  /* EMPTY COMMENTS */
  .pd-no-comments { background: #fff; padding: 2.5rem 1.25rem; text-align: center; }
  .pd-no-comments p { font-size: 13px; color: #bbb; line-height: 1.6; }

  /* INPUT BAR */
  .pd-input-bar {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: #fff; border-top: 1px solid #eeeeea;
    padding: 10px 1.25rem;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
    display: flex; align-items: flex-end; gap: 10px;
    z-index: 60; max-width: 680px; margin: 0 auto;
  }

  @media (max-width: 680px) { .pd-input-bar { left:0; right:0; max-width:100%; } }

  .pd-input-wrap {
    flex: 1; display: flex; align-items: flex-end;
    background: #f5f5f0; border-radius: 14px;
    border: 1.5px solid #eeeeea;
    padding: 8px 12px; gap: 8px;
    transition: border-color .15s;
  }

  .pd-input-wrap:focus-within { border-color: #1D9E75; background: #fff; }

  .pd-textarea {
    flex: 1; border: none; outline: none; background: transparent;
    font-size: 14px; font-family: 'DM Sans', sans-serif; color: #111;
    resize: none; max-height: 100px; line-height: 1.5; overflow-y: auto;
  }

  .pd-textarea::placeholder { color: #bbb; }

  .pd-send-btn {
    width: 34px; height: 34px; border-radius: 10px;
    background: #1D9E75; color: #fff; border: none;
    cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s, opacity .15s;
  }

  .pd-send-btn:hover:not(:disabled) { background: #0F6E56; }
  .pd-send-btn:disabled { background: #9FE1CB; cursor: not-allowed; opacity: .7; }

  /* ERROR */
  .pd-error-wrap { display: flex; align-items: center; justify-content: center; padding: 3rem 1.25rem; }

  .pd-error-box {
    background: #fff; border-radius: 14px; border: 1px solid #eeeeea;
    padding: 2rem 1.5rem; text-align: center; max-width: 340px; width: 100%;
  }

  .pd-error-box h3 { font-size: 16px; font-weight: 600; color: #111; margin-bottom: 8px; }
  .pd-error-box p  { font-size: 13px; color: #888; line-height: 1.6; margin-bottom: 16px; }

  .pd-go-back {
    font-size: 13px; font-weight: 600; color: #fff;
    background: #1D9E75; border: none; border-radius: 10px;
    padding: 9px 20px; cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: background .15s;
  }

  .pd-go-back:hover { background: #0F6E56; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin .7s linear infinite; display: inline-block; }
`;

/* ─────────────────────────────────────────
   Constants + helpers
───────────────────────────────────────── */
const BADGE_STYLES = {
  "alert":      { bg: "#FCEBEB", color: "#791F1F" },
  "lost-pet":   { bg: "#FAEEDA", color: "#633806" },
  "free-stuff": { bg: "#E1F5EE", color: "#085041" },
  "event":      { bg: "#EEEDFE", color: "#3C3489" },
  "question":   { bg: "#E6F1FB", color: "#0C447C" },
  "general":    { bg: "#F1F1EE", color: "#555555" },
};

const AVATAR_COLORS = ["#1D9E75","#534AB7","#854F0B","#185FA5","#A32D2D","#0F6E56"];

const timeAgo = (date) => {
  const s = (Date.now() - new Date(date)) / 1000;
  if (s < 60)    return `${Math.floor(s)}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const avatarColor = (str = "") => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

const initials = (name = "") =>
  name.split(/[\s_]/).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

// build a 2-level tree: top-level comments with their replies nested under them
const buildCommentTree = (flatComments) => {
  const topLevel = flatComments.filter(c => !c.parentComment);
  const replies  = flatComments.filter(c => c.parentComment);

  return topLevel
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(c => ({
      ...c,
      replies: replies
        .filter(r => (r.parentComment._id || r.parentComment) === c._id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }));
};

/* ─────────────────────────────────────────
   ImageBlock
───────────────────────────────────────── */
const ImageBlock = ({ images, onImageClick }) => {
  if (!images?.length) return null;

  if (images.length === 1) {
    return (
      <div className="pd-img-single">
        <img src={images[0]} alt="Post image"
          onClick={() => onImageClick(0)}
          style={{ cursor: "zoom-in" }} loading="lazy"/>
      </div>
    );
  }

  const visible    = images.slice(0, 4);
  const extraCount = images.length - 4;
  const cls = { 2:"two", 3:"three", 4:"four" }[Math.min(visible.length, 4)] || "two";

  return (
    <div className={`pd-img-grid ${cls}`}>
      {visible.map((url, i) => {
        const isLast = i === 3 && extraCount > 0;
        return isLast ? (
          <div key={i} className="pd-img-more" onClick={() => onImageClick(i)}>
            <img src={url} alt=""/><span>+{extraCount + 1}</span>
          </div>
        ) : (
          <img key={i} src={url} alt="Post image"
            className="pd-img-thumb"
            onClick={() => onImageClick(i)} loading="lazy"/>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────
   CommentItem — renders a single comment (and its replies)
   Handles its own reply-box open state
───────────────────────────────────────── */
const CommentItem = ({
  comment, isReply, currentUserId,
  onReply, onDelete, replyingTo, setReplyingTo,
  replyText, setReplyText, submittingReply,
}) => {
  const authorName = comment.isAnonymous
    ? "anonymous"
    : (comment.author?.username ?? "neighbour");
  const color = comment.isAnonymous ? "#e0e0e0" : avatarColor(authorName);

  const isOwner =
    comment.author?._id === currentUserId ||
    comment.author === currentUserId;

  const isReplyBoxOpen = replyingTo === comment._id;

  return (
    <div className={isReply ? "pd-reply" : "pd-comment"}>

      <div className="pd-comment-top">
        <div className="pd-comment-avatar" style={{ background: color }}>
          {comment.isAnonymous
            ? <i className="ti ti-user-off" style={{ fontSize: 12, color: "#999" }} aria-hidden="true"/>
            : initials(authorName)
          }
        </div>
        <span className="pd-comment-author">
          {comment.isAnonymous
            ? <span style={{ color: "#bbb", fontStyle: "italic" }}>Anonymous</span>
            : authorName
          }
        </span>
        <span className="pd-comment-time">{timeAgo(comment.createdAt)}</span>
      </div>

      <div className="pd-comment-body">{comment.body}</div>

      {/* action row — Reply / Delete */}
      <div className="pd-comment-actions">
        {!isReply && (
          <button
            className="pd-comment-action"
            onClick={() => {
              setReplyingTo(isReplyBoxOpen ? null : comment._id);
              setReplyText("");
            }}>
            <i className="ti ti-corner-up-left" style={{ fontSize: 13 }} aria-hidden="true"/>
            Reply
          </button>
        )}

        {isOwner && (
          <button
            className="pd-comment-action delete"
            onClick={() => onDelete(comment._id)}>
            <i className="ti ti-trash" style={{ fontSize: 13 }} aria-hidden="true"/>
            Delete
          </button>
        )}
      </div>

      {/* inline reply input */}
      {isReplyBoxOpen && (
        <div className="pd-reply-input-wrap">
          <div className="pd-reply-box">
            <textarea
              className="pd-reply-textarea"
              placeholder={`Reply to ${authorName}…`}
              rows={1}
              value={replyText}
              autoFocus
              onChange={e => {
                setReplyText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (replyText.trim()) onReply(comment._id, replyText.trim());
                }
              }}
            />
          </div>
          <button
            className="pd-reply-send"
            disabled={!replyText.trim() || submittingReply}
            onClick={() => onReply(comment._id, replyText.trim())}
            aria-label="Send reply">
            {submittingReply
              ? <i className="ti ti-refresh spin" style={{ fontSize: 13 }} aria-hidden="true"/>
              : <i className="ti ti-send" style={{ fontSize: 13 }} aria-hidden="true"/>
            }
          </button>
          <button
            className="pd-reply-cancel"
            onClick={() => { setReplyingTo(null); setReplyText(""); }}
            aria-label="Cancel reply">
            <i className="ti ti-x" style={{ fontSize: 14 }} aria-hidden="true"/>
          </button>
        </div>
      )}

      {/* nested replies */}
      {!isReply && comment.replies?.length > 0 && (
        <div className="pd-replies">
          {comment.replies.map(r => (
            <CommentItem
              key={r._id}
              comment={r}
              isReply
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              submittingReply={submittingReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   PostDetail
───────────────────────────────────────── */
export default function PostDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const textareaRef = useRef(null);
  const menuRef     = useRef(null);

  const [commentText,   setCommentText]   = useState("");
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showReport,    setShowReport]    = useState(false);
  const [voteCount,     setVoteCount]     = useState(null);
  const [hasVoted,      setHasVoted]      = useState(false);
  const [replyingTo,    setReplyingTo]    = useState(null); // comment id being replied to
  const [replyText,     setReplyText]     = useState("");

  useEffect(() => {

  socket.emit(
    "join_post",
    id
  );

  return () => {

    socket.emit(
      "leave_post",
      id
    );

  };

}, [id]);

useEffect(() => {

  socket.on(
    "new_comment",
    (comment) => {

      queryClient.setQueryData(
        ["comments", id],
        (oldComments = []) => {

          const exists =
            oldComments.some(
              c => c._id === comment._id
            );

          if (exists)
            return oldComments;

          return [
            ...oldComments,
            comment,
          ];
        }
      );

    }
  );

  return () => {

    socket.off(
      "new_comment"
    );

  };

}, [id, queryClient]);

useEffect(() => {

  socket.on(
    "vote_update",
    (data) => {

      if (
        data.postId !== id
      ) {
        return;
      }

      setVoteCount(
        data.voteCount
      );

    }
  );

  return () => {

    socket.off(
      "vote_update"
    );

  };

}, [id]);

   const userId=localStorage.getItem("userId");
  let currentUserId = "";
  if(userId)currentUserId=userId;

  /* ── fetch post ── */
  const { data: post, isLoading: loadingPost, error: postError } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data } = await axios.get(`/posts/${id}`);
      setVoteCount(data.post.upvotes?.length ?? 0);
      setHasVoted(data.post.upvotes?.includes(currentUserId) ?? false);
      return data.post;
    },
  });

  const badge   = BADGE_STYLES[post?.category] || BADGE_STYLES.general;
  const isOwner = post?.author?._id === currentUserId || post?.author === currentUserId;

  /* ── fetch comments ── */
  const { data: flatComments = [], isLoading: loadingComments } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data } = await axios.get(`/comments/post/${id}`);
      return data.comments;
    },
    enabled: !!post,
  });

  // build nested tree (top-level + 1 level of replies)
  const commentTree   = buildCommentTree(flatComments);
  const totalComments = flatComments.length;

  /* ── add comment / reply mutation ── */
  const addComment = useMutation({
    mutationFn: ({ body, parentComment }) =>
      axios.post(`/comments/post/${id}`, { postId: id, body ,parentComment}),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      if (variables.parentComment) {
        setReplyingTo(null);
        setReplyText("");
      } else {
        setCommentText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      }
    },
    onError: () => showToast("Failed to post comment", "error"),
  });

  /* ── delete comment mutation ── */
  const deleteComment = useMutation({
    mutationFn: (commentId) => axios.delete(`/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      showToast("Comment deleted");
    },
    onError: () => showToast("Could not delete comment", "error"),
  });

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Delete this comment?")) {
      deleteComment.mutate(commentId);
    }
  };

  const handleReply = (parentId, text) => {
    if (!text.trim()) return;
    addComment.mutate({ body: text.trim(), parentComment: parentId });
  };

  /* ── delete post mutation ── */
  const deletePost = useMutation({
    mutationFn: () => axios.delete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/feed");
      showToast("Post removed");
    },
    onError: () => showToast("Could not delete post", "error"),
  });

  /* ── optimistic vote ── */
  const handleVote = async () => {
    const prevCount = voteCount;
    const prevVoted = hasVoted;
    setHasVoted(!hasVoted);
    setVoteCount(hasVoted ? voteCount - 1 : voteCount + 1);
    try {
      const { data } = await axios.post(`/posts/${id}/vote`);
       setVoteCount(data.voteCount);
      if(data.action=="added")setHasVoted(true);
      else setHasVoted(false)
    } catch {
      setVoteCount(prevCount);
      setHasVoted(prevVoted);
      showToast("Vote failed", "error");
    }
  };

  /* ── main comment textarea ── */
  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (commentText.trim()) {
        addComment.mutate({ body: commentText.trim(), parentComment: null });
      }
    }
  };

  const handleMenuBlur = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.relatedTarget)) setMenuOpen(false);
  };

  /* ── loading ── */
  if (loadingPost) {
    return (
      <>
        <style>{styles}</style>
        <div className="pd-root">
          <div className="pd-topbar">
            <button className="pd-back" onClick={() => navigate(-1)} aria-label="Back">
              <i className="ti ti-arrow-left" style={{ fontSize:18 }} aria-hidden="true"/>
            </button>
            <span className="pd-topbar-title">Post</span>
          </div>
          <div className="pd-scroll">
            <div className="pd-content">
              <div className="pd-post-skel">
                <div className="skel skel-badge"/>
                <div className="skel skel-title"/>
                <div className="skel skel-body1"/>
                <div className="skel skel-body2"/>
                <div className="skel skel-body3"/>
                <div className="skel skel-foot"/>
              </div>
              {[...Array(3)].map((_,i) => (
                <div key={i} className="pd-comment-skel">
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div className="skel skel-avatar"/>
                    <div className="skel skel-name"/>
                  </div>
                  <div style={{ paddingLeft:36 }}>
                    <div className="skel skel-line1"/>
                    <div className="skel skel-line2"/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── error / 404 ── */
  if (postError) {
    return (
      <>
        <style>{styles}</style>
        <div className="pd-root">
          <div className="pd-topbar">
            <button className="pd-back" onClick={() => navigate(-1)} aria-label="Back">
              <i className="ti ti-arrow-left" style={{ fontSize:18 }} aria-hidden="true"/>
            </button>
            <span className="pd-topbar-title">Post</span>
          </div>
          <div className="pd-error-wrap">
            <div className="pd-error-box">
              <i className="ti ti-file-off"
                style={{ fontSize:32, color:"#ccc", marginBottom:12, display:"block" }}
                aria-hidden="true"/>
              <h3>Post not found</h3>
              <p>
                {postError.response?.status === 404
                  ? "This post has expired or been removed."
                  : "Failed to load post. Please try again."}
              </p>
              <button className="pd-go-back" onClick={() => navigate("/feed")}>
                Back to feed
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── main render ── */
  return (
    <>
      <style>{styles}</style>
      <div className="pd-root">

        {/* TOP BAR */}
        <div className="pd-topbar">
          <button className="pd-back" onClick={() => navigate(-1)} aria-label="Back">
            <i className="ti ti-arrow-left" style={{ fontSize:18 }} aria-hidden="true"/>
          </button>

          <span className="pd-topbar-title">
            {post?.category?.replace(/-/g, " ")}
          </span>

          <div ref={menuRef} onBlur={handleMenuBlur} style={{ position:"relative" }}>
            <button className="pd-menu-btn"
              onClick={() => setMenuOpen(p => !p)}
              aria-label="More options">
              <i className="ti ti-dots" style={{ fontSize:18 }} aria-hidden="true"/>
            </button>

            {menuOpen && (
              <div className="pd-dropdown">
                <button className="pd-menu-item" onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  setMenuOpen(false);
                  showToast("Link copied");
                }}>
                  <i className="ti ti-link" style={{ fontSize:16 }} aria-hidden="true"/>
                  Copy link
                </button>

                <button className="pd-menu-item" onClick={() => {
                  setMenuOpen(false);
                  setShowReport(true);
                }}>
                  <i className="ti ti-flag" style={{ fontSize:16 }} aria-hidden="true"/>
                  Report post
                </button>

                {isOwner && (
                  <button className="pd-menu-item danger" onClick={() => {
                    setMenuOpen(false);
                    if (window.confirm("Delete this post?")) deletePost.mutate();
                  }}>
                    <i className="ti ti-trash" style={{ fontSize:16 }} aria-hidden="true"/>
                    Delete post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SCROLL */}
        <div className="pd-scroll">
          <div className="pd-content">

            {/* POST */}
            <div className="pd-post">
              <div className="pd-sub">
                <div className="pd-sub-left">
                  <span className="pd-badge"
                    style={{ background: badge.bg, color: badge.color }}>
                    {post.category.replace(/-/g, " ")}
                  </span>
                  {post.isAnonymous
                    ? <span className="pd-anon">anonymous</span>
                    : post.author?.username && (
                        <span className="pd-author">
                          by <strong style={{ color:"#064534" }}>{post.author.username}</strong>
                        </span>
                      )
                  }
                </div>
                <div className="pd-meta">
                  <i className="ti ti-clock" style={{ fontSize:11 }} aria-hidden="true"/>
                  {timeAgo(post.createdAt)}
                </div>
              </div>

              <div className="pd-title">{post.title}</div>

              <ImageBlock
                images={post.images}
                onImageClick={(i) => setLightboxIndex(i)}
              />

              {post.body && <div className="pd-body-text">{post.body}</div>}

              <div className="pd-stats">
                <button
                  className={`pd-upvote ${hasVoted ? "voted" : "unvoted"}`}
                  onClick={handleVote}
                  aria-label={hasVoted ? "Remove upvote" : "Upvote"}>
                  <i className="ti ti-arrow-up" style={{ fontSize:16 }} aria-hidden="true"/>
                  <span>{voteCount ?? post.upvotes?.length ?? 0}</span>
                  <span style={{ fontWeight:400, opacity:.85 }}>
                    {(voteCount ?? post.upvotes?.length ?? 0) === 1 ? "upvote" : "upvotes"}
                  </span>
                </button>

                <div className="pd-stat">
                  <i className="ti ti-message" style={{ fontSize:16 }} aria-hidden="true"/>
                  <span>{totalComments} {totalComments === 1 ? "comment" : "comments"}</span>
                </div>
              </div>
            </div>

            {/* COMMENTS HEADER */}
            <div className="pd-comments-header">
              <i className="ti ti-message" style={{ fontSize:15 }} aria-hidden="true"/>
              {loadingComments
                ? "Loading comments..."
                : `${totalComments} ${totalComments === 1 ? "comment" : "comments"}`
              }
            </div>

            {/* COMMENTS LIST — nested tree */}
            <div className="pd-comments-list">

              {loadingComments && [...Array(3)].map((_,i) => (
                <div key={i} className="pd-comment-skel">
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div className="skel skel-avatar"/>
                    <div className="skel skel-name"/>
                  </div>
                  <div style={{ paddingLeft:36 }}>
                    <div className="skel skel-line1"/>
                    <div className="skel skel-line2"/>
                  </div>
                </div>
              ))}

              {!loadingComments && commentTree.length === 0 && (
                <div className="pd-no-comments">
                  <i className="ti ti-message-off"
                    style={{ fontSize:28, color:"#ddd", marginBottom:10, display:"block" }}
                    aria-hidden="true"/>
                  <p>No comments yet. Be the first to reply.</p>
                </div>
              )}

              {commentTree.map(c => (
                <CommentItem
                  key={c._id}
                  comment={c}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onDelete={handleDeleteComment}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  submittingReply={addComment.isPending}
                />
              ))}

            </div>
          </div>
        </div>

        {/* MAIN COMMENT INPUT BAR */}
        <div className="pd-input-bar">
          <div className="pd-input-wrap">
            <textarea
              ref={textareaRef}
              className="pd-textarea"
              placeholder="Add a comment…"
              rows={1}
              value={commentText}
              onChange={handleCommentChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            className="pd-send-btn"
            onClick={() => {
              if (commentText.trim()) {
                addComment.mutate({ body: commentText.trim(), parentComment: null });
              }
            }}
            disabled={!commentText.trim() || addComment.isPending}
            aria-label="Send comment">
            {addComment.isPending
              ? <i className="ti ti-refresh spin" style={{ fontSize:16 }} aria-hidden="true"/>
              : <i className="ti ti-send" style={{ fontSize:16 }} aria-hidden="true"/>
            }
          </button>
        </div>

        {/* LIGHTBOX */}
        {lightboxIndex !== null && post.images?.[lightboxIndex] && (
          <div className="pd-lightbox" onClick={() => setLightboxIndex(null)}>
            <img src={post.images[lightboxIndex]} alt="Full size"
              onClick={e => e.stopPropagation()}/>
            <button className="pd-lb-close" onClick={() => setLightboxIndex(null)}>
              <i className="ti ti-x" aria-hidden="true"/>
            </button>
          </div>
        )}

        {/* REPORT MODAL */}
        {showReport && (
          <ReportModal
            targetType="post"
            targetId={id}
            onClose={() => setShowReport(false)}
            onSuccess={() => showToast("Thanks for reporting")}
          />
        )}

      </div>
    </>
  );
}