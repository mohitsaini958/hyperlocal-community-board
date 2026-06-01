import { useState } from "react";
import {IconAlert,IconArrow,IconEye,IconLock,IconMail,IconSpinner,NookLogoMark as NookMark,IconWave } from "../utils/icons.jsx";
import api from "../api/axios.js";
import { useAuth } from "../context/useAuth.js";
import { useNavigate, Link } from "react-router-dom";



const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .li-root {
    min-height: 100vh;
    background: #f0efea;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    font-family: 'DM Sans', sans-serif;
  }

  .li-card {
    width: 100%;
    max-width: 900px;
    display: grid;
    grid-template-columns: 420px 1fr;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.08);
  }

  .li-left {
    background: #064534;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    min-height: 560px;
  }

  .li-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .li-logo-mark {
    width: 38px;
    height: 38px;
    background: #1D9E75;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .li-logo-name {
    font-size: 20px;
    font-weight: 600;
    color: #c8ede2;
    letter-spacing: -0.3px;
  }

  .li-hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2.5rem 0 2rem;
  }

  .li-hero h1 {
    font-size: 28px;
    font-weight: 600;
    color: #c8ede2;
    line-height: 1.25;
    margin-bottom: 0.75rem;
  }

  .li-hero h1 span { color: #5DCAA5; }

  .li-hero p {
    font-size: 13px;
    color: #7DCBB2;
    line-height: 1.75;
    margin-bottom: 2rem;
  }

  .li-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 1.75rem;
  }

  .li-stat {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 14px 16px;
  }

  .li-stat-num {
    font-size: 22px;
    font-weight: 600;
    color: #5DCAA5;
    display: block;
    margin-bottom: 2px;
  }

  .li-stat-label {
    font-size: 11px;
    color: #7DCBB2;
  }

  .li-recent {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 14px 16px;
  }

  .li-recent-label {
    font-size: 10px;
    font-weight: 500;
    color: #5DCAA5;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }

  .li-post {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .li-post:last-child { border-bottom: none; padding-bottom: 0; }

  .li-post-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .li-post-title {
    font-size: 12px;
    color: #c8ede2;
    font-weight: 500;
    display: block;
    margin-bottom: 2px;
  }

  .li-post-meta {
    font-size: 11px;
    color: #7DCBB2;
  }

  .li-right {
    background: #ffffff;
    padding: 2.75rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .li-form-head { margin-bottom: 1.75rem; }

  .li-form-head h2 {
    font-size: 22px;
    font-weight: 600;
    color: #111;
    margin-bottom: 5px;
  }

  .li-form-head p {
    font-size: 13px;
    color: #888;
  }

  .li-field { margin-bottom: 1rem; }

  .li-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #555;
    margin-bottom: 6px;
  }

  .li-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .li-forgot {
    font-size: 12px;
    color: #1D9E75;
    text-decoration: none;
    font-weight: 500;
  }

  .li-forgot:hover { text-decoration: underline; }

  .li-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    height: 44px;
    border-radius: 12px;
    border: 1.5px solid #e5e5e5;
    background: #fafafa;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }

  .li-input-wrap:focus-within {
    border-color: #1D9E75;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(29,158,117,0.1);
  }

  .li-input-wrap.error {
    border-color: #f87171;
    background: #fff8f8;
  }

  .li-input-wrap.error:focus-within {
    box-shadow: 0 0 0 3px rgba(248,113,113,0.12);
  }

  .li-input-wrap input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 13.5px;
    color: #111;
    font-family: 'DM Sans', sans-serif;
    width: 100%;
  }

  .li-input-wrap input::placeholder { color: #bbb; }

  .li-icon { flex-shrink: 0; display: flex; align-items: center; }

  .li-eye {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    color: #aaa;
    flex-shrink: 0;
    transition: color 0.15s;
  }

  .li-eye:hover { color: #555; }

  .li-err {
    font-size: 11px;
    color: #ef4444;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .li-global-err {
    background: #fff5f5;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12.5px;
    color: #dc2626;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .li-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 1.25rem 0;
  }

  .li-divider-line {
    flex: 1;
    height: 1px;
    background: #f0f0f0;
  }

  .li-divider-text {
    font-size: 12px;
    color: #bbb;
    white-space: nowrap;
  }

  .li-welcome-back {
    background: #E1F5EE;
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1.25rem;
  }

  .li-welcome-back span {
    font-size: 12px;
    color: #085041;
    line-height: 1.5;
  }

  .li-btn {
    width: 100%;
    height: 46px;
    border-radius: 13px;
    background: #1D9E75;
    border: none;
    color: white;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s, transform 0.1s;
    margin-bottom: 1.25rem;
  }

  .li-btn:hover:not(:disabled) { background: #0F6E56; }
  .li-btn:active:not(:disabled) { transform: scale(0.99); }
  .li-btn:disabled { background: #9FE1CB; cursor: not-allowed; }

  .li-signup {
    text-align: center;
    font-size: 13px;
    color: #888;
  }

  .li-signup a {
    color: #1D9E75;
    font-weight: 500;
    text-decoration: none;
  }

  .li-signup a:hover { text-decoration: underline; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .li-spin { animation: spin 0.8s linear infinite; }

  @media (max-width: 768px) {
    .li-root { padding: 0; align-items: stretch; }
    .li-card {
      grid-template-columns: 1fr;
      border-radius: 0;
      min-height: 100vh;
      border: none;
    }
    .li-left {
      min-height: auto;
      padding: 2rem 1.5rem 1.75rem;
    }
    .li-hero { padding: 1.25rem 0 1rem; }
    .li-hero h1 { font-size: 22px; }
    .li-right { padding: 2rem 1.5rem; }
  }

  @media (max-width: 480px) {
    .li-left { padding: 1.5rem 1.25rem; }
    .li-right { padding: 1.75rem 1.25rem; }
    .li-form-head h2 { font-size: 20px; }
  }

  @media (min-width: 769px) and (max-width: 900px) {
    .li-card { grid-template-columns: 340px 1fr; }
  }
`;

const recentPosts = [
  { color: "#ef4444", title: "Water outage on MG Road", meta: "Alert · 0.3km · 2 min ago" },
  { color: "#f97316", title: "Lost dog near Sardar market", meta: "Lost pet · 0.8km · 1 hr ago" },
  { color: "#1D9E75", title: "Free sofa — self pickup only", meta: "Free stuff · 1.2km · 3 hr ago" },
];

const validate = (field, value) => {
  if (field === "email") {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email";
  }
  if (field === "password") {
    if (!value) return "Password is required";
    if (value.length < 6) return "At least 6 characters";
  }
  return "";
};

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalErr, setGlobalErr] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    }
    setGlobalErr("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalErr("");
    const newErrors = {
      email: validate("email", form.email),
      password: validate("password", form.password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
        const res=await api.post("/auth/login",form);
        const {accessToken,user,}=res.data;
        login(accessToken,user);
        navigate("/feed");
    } catch (err) {
      setGlobalErr(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const wrapClass = (field) =>
    `li-input-wrap${errors[field] && touched[field] ? " error" : ""}`;

  return (
    <>
      <style>{styles}</style>
      <div className="li-root">
        <div className="li-card">

          {/* ── LEFT PANEL ── */}
          <div className="li-left">
            <div className="li-logo">
              <div className="li-logo-mark"><NookMark /></div>
              <span className="li-logo-name">nook</span>
            </div>

            <div className="li-hero">
              <h1>Welcome<br /><span>back.</span></h1>
              <p>Your neighbourhood has been busy. Sign in to see what you missed.</p>

              <div className="li-stats">
                <div className="li-stat">
                  <span className="li-stat-num">2km</span>
                  <span className="li-stat-label">Your visible radius</span>
                </div>
                <div className="li-stat">
                  <span className="li-stat-num">7d</span>
                  <span className="li-stat-label">Posts auto-expire</span>
                </div>
              </div>
            </div>

            <div className="li-recent">
              <p className="li-recent-label">Recent nearby</p>
              {recentPosts.map((p) => (
                <div className="li-post" key={p.title}>
                  <div className="li-post-dot" style={{ background: p.color }} />
                  <div>
                    <span className="li-post-title">{p.title}</span>
                    <span className="li-post-meta">{p.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT FORM PANEL ── */}
          <div className="li-right">
            <div className="li-form-head">
              <h2>Sign in to Nook</h2>
              <p>Good to see you again. Your neighbours are posting.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {globalErr && (
                <div className="li-global-err">
                  <IconAlert />
                  {globalErr}
                </div>
              )}

              {/* Welcome back note */}
              <div className="li-welcome-back">
                <IconWave />
                <span>Sign in to see posts from people within 2km of you.</span>
              </div>

              {/* Email */}
              <div className="li-field">
                <label className="li-label">Email</label>
                <div className={wrapClass("email")}>
                  <span className="li-icon"><IconMail /></span>
                  <input
                    name="email" type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange} onBlur={handleBlur}
                    autoComplete="email"
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="li-err"><IconAlert />{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="li-field">
                <div className="li-label-row">
                  <label className="li-label" style={{margin:0}}>Password</label>
                  <a href="/forgot-password" className="li-forgot">Forgot password?</a>
                </div>
                <div className={wrapClass("password")}>
                  <span className="li-icon"><IconLock /></span>
                  <input
                    name="password" type={showPw ? "text" : "password"}
                    placeholder="Your password"
                    value={form.password}
                    onChange={handleChange} onBlur={handleBlur}
                    autoComplete="current-password"
                  />
                  <button type="button" className="li-eye" onClick={() => setShowPw(p => !p)} aria-label="Toggle password">
                    <IconEye open={showPw} />
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="li-err"><IconAlert />{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" className="li-btn" disabled={loading} style={{marginTop:"1.25rem"}}>
                {loading
                  ? <><IconSpinner /> Signing in...</>
                  : <>Sign in <IconArrow /></>
                }
              </button>

              <div className="li-divider">
                <div className="li-divider-line"/>
                <span className="li-divider-text">don't have an account?</span>
                <div className="li-divider-line"/>
              </div>

              <p className="li-signup">
                <a href="/signup">Create a free account →</a>
              </p>

            </form>
          </div>

        </div>
      </div>
    </>
  );
}