import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGeolocation from "../hooks/useGeolocation.js";
import axios from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .cp-root {
    font-family: 'DM Sans', sans-serif;
    background: #f5f5f0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── TOP BAR ── */
  .cp-topbar {
    height: 52px;
    background: #fff;
    border-bottom: 1px solid #eeeeea;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.25rem;
    position: sticky;
    top: 0;
    z-index: 50;
    flex-shrink: 0;
  }

  .cp-topbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .cp-cancel {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: #f5f5f0; border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #555; transition: background .15s;
  }

  .cp-cancel:hover { background: #eeeeea; }

  .cp-topbar-title {
    font-size: 15px;
    font-weight: 600;
    color: #111;
  }

  .cp-share-btn {
    height: 36px;
    padding: 0 20px;
    border-radius: 12px;
    background: #1D9E75;
    color: #fff;
    border: none;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    transition: background .15s, opacity .15s;
  }

  .cp-share-btn:hover:not(:disabled) { background: #0F6E56; }
  .cp-share-btn:disabled {
    background: #9FE1CB;
    cursor: not-allowed;
    opacity: .7;
  }

  /* ── BODY ── */
  .cp-body {
    flex: 1;
    padding: 1.25rem;
    max-width: 680px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── SECTION CARD ── */
  .cp-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #eeeeea;
    overflow: hidden;
  }

  .cp-card-label {
    font-size: 11px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: .06em;
    padding: 12px 14px 6px;
  }

  /* ── CATEGORY PILLS ── */
  .cp-cats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 14px 14px;
  }

  .cp-cat {
    font-size: 12px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 20px;
    border: 1.5px solid #e5e5e5;
    background: #fafafa;
    color: #666;
    cursor: pointer;
    transition: all .15s;
    font-family: 'DM Sans', sans-serif;
  }

  .cp-cat:hover { border-color: #1D9E75; color: #1D9E75; }

  .cp-cat.selected {
    border-color: transparent;
    color: #fff;
    font-weight: 600;
  }

  .cp-cat-required {
    font-size: 11px;
    color: #ef4444;
    padding: 0 14px 10px;
    display: none;
  }

  .cp-cat-required.show { display: block; }

  /* ── INPUTS ── */
  .cp-field { padding: 0 14px 14px; }

  .cp-input {
    width: 100%;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #111;
    border: none;
    outline: none;
    background: transparent;
    resize: none;
    line-height: 1.6;
  }

  .cp-input::placeholder { color: #bbb; }

  .cp-title-input {
    font-size: 18px;
    font-weight: 600;
    padding: 14px 14px 4px;
    width: 100%;
    border: none; outline: none;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    color: #111;
    line-height: 1.3;
  }

  .cp-title-input::placeholder { color: #bbb; font-weight: 400; }

  .cp-char-count {
    font-size: 11px;
    color: #ccc;
    text-align: right;
    padding: 0 14px 10px;
  }

  .cp-char-count.warn { color: #f97316; }
  .cp-char-count.over { color: #ef4444; }

  .cp-divider {
    height: 1px;
    background: #f5f5f2;
    margin: 0 14px;
  }

  /* ── IMAGE UPLOAD ── */
  .cp-img-upload-area {
    padding: 0 14px 14px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .cp-img-add {
    width: 76px; height: 76px;
    border-radius: 10px;
    border: 1.5px dashed #ddd;
    background: #fafafa;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: border-color .15s, background .15s;
    flex-shrink: 0;
  }

  .cp-img-add:hover { border-color: #1D9E75; background: #E1F5EE; }

  .cp-img-add span {
    font-size: 10px;
    color: #aaa;
    font-family: 'DM Sans', sans-serif;
  }

  .cp-img-add:hover span { color: #1D9E75; }

  .cp-img-thumb-wrap {
    position: relative;
    width: 76px; height: 76px;
    flex-shrink: 0;
  }

  .cp-img-thumb {
    width: 76px; height: 76px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid #eeeeea;
  }

  .cp-img-remove {
    position: absolute;
    top: -6px; right: -6px;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #ef4444;
    border: 2px solid #fff;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 11px;
  }

  .cp-uploading {
    width: 76px; height: 76px;
    border-radius: 10px;
    background: #f5f5f0;
    border: 1px solid #eeeeea;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 4px; font-size: 10px; color: #aaa;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin .7s linear infinite; display: inline-block; }

  /* ── LOCATION BLOCK ── */
  .cp-location {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
  }

  .cp-loc-icon {
    width: 36px; height: 36px;
    background: #E1F5EE;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .cp-loc-name {
    font-size: 13px;
    font-weight: 500;
    color: #064534;
  }

  .cp-loc-sub {
    font-size: 11px;
    color: #aaa;
    margin-top: 2px;
  }

  /* ── ANONYMOUS TOGGLE ── */
  .cp-anon {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-top: 1px solid #f5f5f2;
  }

  .cp-anon-left { display: flex; flex-direction: column; gap: 2px; }
  .cp-anon-label { font-size: 13px; font-weight: 500; color: #111; }
  .cp-anon-sub   { font-size: 11px; color: #aaa; }

  .cp-toggle {
    width: 44px; height: 26px;
    border-radius: 13px;
    border: none; cursor: pointer;
    position: relative;
    transition: background .2s;
    flex-shrink: 0;
  }

  .cp-toggle-thumb {
    position: absolute;
    top: 3px;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    transition: left .2s;
  }

  /* ── ERROR BANNER ── */
  .cp-error {
    background: #fff5f5;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12.5px;
    color: #dc2626;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 480px) {
    .cp-body { padding: 1rem; }
    .cp-title-input { font-size: 16px; }
  }
`;

const CATEGORIES = [
  { value: "Alert",      label: "🚨 Alert",     bg: "#ef4444" },
  { value: "Lost",   label: "🐾 Lost pet",  bg: "#f97316" },
  { value: "free-stuff", label: "📦 Free stuff", bg: "#1D9E75" },
  { value: "Event",      label: "🗓 Event",      bg: "#8b5cf6" },
  { value: "question",   label: "❓ Question",   bg: "#3b82f6" },
  { value: "general",    label: "💬 General",    bg: "#6b7280" },
];

const TITLE_MAX = 100;
const BODY_MAX  = 2000;

export default function CreatePost() {
  const navigate   = useNavigate();
  const { lat, lng, neighborhood, loading: locLoading } = useGeolocation();

  const [category,    setCategory]    = useState("");
  const [title,       setTitle]       = useState("");
  const [body,        setBody]        = useState("");
  const [images,      setImages]      = useState([]); // Cloudinary URLs
  const [previews,    setPreviews]    = useState([]); // local blob URLs
  const [uploading,   setUploading]   = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");
  const [showCatErr,  setShowCatErr]  = useState(false);

  const fileInputRef = useRef(null);

  // share button is active only when category + title are filled
  const canSubmit = category && title.trim().length > 0 && !submitting && !uploading;

  /* ── image pick + upload to Cloudinary ── */
  const handleImagePick = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // max 4 images total
    const remaining = 4 - images.length;
    const toUpload  = files.slice(0, remaining);

    // show local previews immediately
    const localUrls = toUpload.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...localUrls]);
    setUploading(true);

    try {
      const formData = new FormData();
      toUpload.forEach(f => formData.append("images", f));

      const { data } = await axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImages(prev => [...prev, ...data.urls]);
    } catch (err) {
      setError("Image upload failed. Please try again.");
      // remove failed previews
      setPreviews(prev => prev.slice(0, prev.length - toUpload.length));
    } finally {
      setUploading(false);
      // reset file input so same file can be picked again
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setImages(prev   => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    setError("");

    if (!category) { setShowCatErr(true); return; }
    if (!title.trim()) return;
    if (!lat || !lng) { setError("Location not available yet. Please wait a moment."); return; }

    setSubmitting(true);
    try {
      await axios.post("/posts", {
        title:       title.trim(),
        body:        body.trim(),
        category,
        latitude:lat,
        longitude:lng,
        images,
        isAnonymous,
      });
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const titleCharsLeft = TITLE_MAX - title.length;
  const bodyCharsLeft  = BODY_MAX  - body.length;

  return (
    <>
      <style>{styles}</style>
      <div className="cp-root">

        {/* ── TOP BAR ── */}
        <div className="cp-topbar">
          <div className="cp-topbar-left">
            <button
              className="cp-cancel"
              onClick={() => navigate(-1)}
              aria-label="Cancel">
              <i className="ti ti-x" style={{ fontSize: 18 }} aria-hidden="true"/>
            </button>
            <span className="cp-topbar-title">New post</span>
          </div>

          <button
            className="cp-share-btn"
            onClick={handleSubmit}
            disabled={!canSubmit}>
            {submitting
              ? <><i className="ti ti-refresh spin" style={{ fontSize: 14 }} aria-hidden="true"/> Sharing...</>
              : <><i className="ti ti-arrow-right" style={{ fontSize: 14 }} aria-hidden="true"/> Share</>
            }
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="cp-body">

          {/* global error */}
          {error && (
            <div className="cp-error">
              <i className="ti ti-alert-circle" style={{ fontSize: 16 }} aria-hidden="true"/>
              {error}
            </div>
          )}

          {/* ── CATEGORY ── */}
          <div className="cp-card">
            <div className="cp-card-label">
              Category <span style={{ color: "#ef4444" }}>*</span>
            </div>
            <div className="cp-cats">
              {CATEGORIES.map(c => {
                const selected = category === c.value;
                return (
                  <button
                    key={c.value}
                    className={`cp-cat${selected ? " selected" : ""}`}
                    style={selected ? { background: c.bg, borderColor: c.bg } : {}}
                    onClick={() => {
                      setCategory(c.value);
                      setShowCatErr(false);
                    }}>
                    {c.label}
                  </button>
                );
              })}
            </div>
            <p className={`cp-cat-required${showCatErr ? " show" : ""}`}>
              Please pick a category before sharing.
            </p>
          </div>

          {/* ── TITLE + BODY ── */}
          <div className="cp-card">
            {/* title */}
            <input
              className="cp-title-input"
              type="text"
              placeholder="Title"
              value={title}
              maxLength={TITLE_MAX}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
            <div className={`cp-char-count${titleCharsLeft <= 20 ? titleCharsLeft <= 0 ? " over" : " warn" : ""}`}>
              {titleCharsLeft}/{TITLE_MAX}
            </div>

            <div className="cp-divider"/>

            {/* body */}
            <div className="cp-field" style={{ paddingTop: 10 }}>
              <textarea
                className="cp-input"
                placeholder="What's happening in your neighbourhood? (optional)"
                value={body}
                maxLength={BODY_MAX}
                rows={5}
                onChange={e => setBody(e.target.value)}
              />
            </div>
            <div className={`cp-char-count${bodyCharsLeft <= 100 ? bodyCharsLeft <= 0 ? " over" : " warn" : ""}`}>
              {bodyCharsLeft}/{BODY_MAX}
            </div>
          </div>

          {/* ── IMAGES ── */}
          <div className="cp-card">
            <div className="cp-card-label">Photos (optional · max 4)</div>
            <div className="cp-img-upload-area">

              {/* existing previews */}
              {previews.map((url, i) => (
                <div key={i} className="cp-img-thumb-wrap">
                  <img src={url} alt="" className="cp-img-thumb"/>
                  {/* only show remove if upload is done */}
                  {!uploading && (
                    <div
                      className="cp-img-remove"
                      onClick={() => removeImage(i)}>
                      <i className="ti ti-x" aria-hidden="true"/>
                    </div>
                  )}
                </div>
              ))}

              {/* uploading spinner */}
              {uploading && (
                <div className="cp-uploading">
                  <i className="ti ti-refresh spin" style={{ fontSize: 18, color: "#1D9E75" }} aria-hidden="true"/>
                  <span>Uploading</span>
                </div>
              )}

              {/* add button — only if under limit and not uploading */}
              {previews.length < 4 && !uploading && (
                <div
                  className="cp-img-add"
                  onClick={() => fileInputRef.current?.click()}>
                  <i className="ti ti-photo-plus" style={{ fontSize: 22, color: "#bbb" }} aria-hidden="true"/>
                  <span>Add photo</span>
                </div>
              )}

            </div>

            {/* hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              style={{ display: "none" }}
              onChange={handleImagePick}
            />
          </div>

          {/* ── LOCATION + ANONYMOUS ── */}
          <div className="cp-card">
            {/* location — read only */}
            <div className="cp-location">
              <div className="cp-loc-icon">
                <i className="ti ti-map-pin" style={{ fontSize: 16, color: "#1D9E75" }} aria-hidden="true"/>
              </div>
              <div>
                <div className="cp-loc-name">
                  {locLoading
                    ? "Detecting location..."
                    : neighborhood || "Your current location"
                  }
                </div>
                <div className="cp-loc-sub">
                  Visible to people within 2km · auto-attached
                </div>
              </div>
            </div>

            {/* anonymous toggle */}
            <div className="cp-anon">
              <div className="cp-anon-left">
                <span className="cp-anon-label">Post anonymously</span>
                <span className="cp-anon-sub">Your name won't appear on this post</span>
              </div>
              <button
                className="cp-toggle"
                style={{ background: isAnonymous ? "#1D9E75" : "#e5e5e5" }}
                onClick={() => setIsAnonymous(p => !p)}
                aria-label={isAnonymous ? "Disable anonymous" : "Enable anonymous"}>
                <div
                  className="cp-toggle-thumb"
                  style={{ left: isAnonymous ? 21 : 3 }}
                />
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ← needs: import { useRef } from "react"; at the top
// already included above via useState destructuring line