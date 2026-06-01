import { useState } from "react";
import { NookLogoMark as NookMark,IconMail, IconArrow,IconBack,IconSpinner,IconAlert,IconCheck,IconShield} from "../utils/icons";
import api from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .fp-root {
    min-height: 100vh;
    background: #f0efea;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    font-family: 'DM Sans', sans-serif;
  }

  .fp-card {
    width: 100%;
    max-width: 900px;
    display: grid;
    grid-template-columns: 420px 1fr;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.08);
  }

  .fp-left {
    background: #064534;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    min-height: 520px;
  }

  .fp-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: auto;
  }

  .fp-logo-mark {
    width: 38px;
    height: 38px;
    background: #1D9E75;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .fp-logo-name {
    font-size: 20px;
    font-weight: 600;
    color: #c8ede2;
    letter-spacing: -0.3px;
  }

  .fp-hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem 0;
  }

  .fp-hero h1 {
    font-size: 26px;
    font-weight: 600;
    color: #c8ede2;
    line-height: 1.3;
    margin-bottom: 0.75rem;
  }

  .fp-hero h1 span { color: #5DCAA5; }

  .fp-hero p {
    font-size: 13px;
    color: #7DCBB2;
    line-height: 1.75;
  }

  .fp-steps {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 1.75rem;
  }

  .fp-step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 12px 0;
    position: relative;
  }

  .fp-step-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .fp-step-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(29,158,117,0.25);
    border: 1px solid rgba(29,158,117,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #5DCAA5;
    flex-shrink: 0;
  }

  .fp-step-line {
    width: 1px;
    flex: 1;
    min-height: 20px;
    background: rgba(29,158,117,0.2);
    margin-top: 4px;
  }

  .fp-step:last-child .fp-step-line { display: none; }

  .fp-step-label {
    font-size: 12px;
    font-weight: 500;
    color: #c8ede2;
    margin-bottom: 2px;
    margin-top: 4px;
  }

  .fp-step-desc {
    font-size: 11px;
    color: #7DCBB2;
    line-height: 1.5;
  }

  .fp-security-note {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .fp-security-note span {
    font-size: 12px;
    color: #7DCBB2;
    line-height: 1.6;
  }

  /* RIGHT */
  .fp-right {
    background: #ffffff;
    padding: 2.75rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* back link */
  .fp-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #888;
    text-decoration: none;
    margin-bottom: 1.75rem;
    transition: color 0.15s;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: 'DM Sans', sans-serif;
  }

  .fp-back:hover { color: #1D9E75; }

  .fp-form-head { margin-bottom: 1.75rem; }

  .fp-form-head h2 {
    font-size: 22px;
    font-weight: 600;
    color: #111;
    margin-bottom: 5px;
  }

  .fp-form-head p {
    font-size: 13px;
    color: #888;
    line-height: 1.6;
  }

  .fp-field { margin-bottom: 1.25rem; }

  .fp-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #555;
    margin-bottom: 6px;
  }

  .fp-input-wrap {
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

  .fp-input-wrap:focus-within {
    border-color: #1D9E75;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(29,158,117,0.1);
  }

  .fp-input-wrap.error {
    border-color: #f87171;
    background: #fff8f8;
  }

  .fp-input-wrap.error:focus-within {
    box-shadow: 0 0 0 3px rgba(248,113,113,0.12);
  }

  .fp-input-wrap input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 13.5px;
    color: #111;
    font-family: 'DM Sans', sans-serif;
    width: 100%;
  }

  .fp-input-wrap input::placeholder { color: #bbb; }

  .fp-icon { flex-shrink: 0; display: flex; align-items: center; }

  .fp-err {
    font-size: 11px;
    color: #ef4444;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .fp-btn {
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

  .fp-btn:hover:not(:disabled) { background: #0F6E56; }
  .fp-btn:active:not(:disabled) { transform: scale(0.99); }
  .fp-btn:disabled { background: #9FE1CB; cursor: not-allowed; }

  /* success state */
  .fp-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem 0;
  }

  .fp-success-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #E1F5EE;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
  }

  .fp-success h3 {
    font-size: 20px;
    font-weight: 600;
    color: #111;
    margin-bottom: 8px;
  }

  .fp-success p {
    font-size: 13px;
    color: #888;
    line-height: 1.7;
    margin-bottom: 1.75rem;
    max-width: 280px;
  }

  .fp-success p span {
    color: #111;
    font-weight: 500;
  }

  .fp-success-hint {
    background: #f5f5f0;
    border-radius: 10px;
    padding: 11px 16px;
    font-size: 12px;
    color: #888;
    line-height: 1.6;
    text-align: left;
    width: 100%;
    margin-bottom: 1.5rem;
  }

  .fp-success-hint b { color: #555; }

  .fp-resend {
    font-size: 13px;
    color: #888;
    margin-top: 0.5rem;
  }

  .fp-resend button {
    background: none;
    border: none;
    color: #1D9E75;
    font-weight: 500;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    padding: 0;
  }

  .fp-resend button:hover { text-decoration: underline; }
  .fp-resend button:disabled { color: #9FE1CB; cursor: not-allowed; }

  .fp-signin-row {
    text-align: center;
    font-size: 13px;
    color: #888;
  }

  .fp-signin-row a {
    color: #1D9E75;
    font-weight: 500;
    text-decoration: none;
  }

  .fp-signin-row a:hover { text-decoration: underline; }

  .fp-timer {
    font-size: 12px;
    color: #aaa;
    margin-top: 6px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .fp-spin { animation: spin 0.8s linear infinite; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .fp-animate { animation: fadeIn 0.35s ease; }

  @media (max-width: 768px) {
    .fp-root { padding: 0; align-items: stretch; }
    .fp-card {
      grid-template-columns: 1fr;
      border-radius: 0;
      min-height: 100vh;
      border: none;
    }
    .fp-left { min-height: auto; padding: 2rem 1.5rem 1.75rem; }
    .fp-hero { padding: 1.25rem 0 1rem; }
    .fp-hero h1 { font-size: 22px; }
    .fp-right { padding: 2rem 1.5rem; }
  }

  @media (max-width: 480px) {
    .fp-left { padding: 1.5rem 1.25rem; }
    .fp-right { padding: 1.75rem 1.25rem; }
    .fp-form-head h2 { font-size: 20px; }
  }

  @media (min-width: 769px) and (max-width: 900px) {
    .fp-card { grid-template-columns: 340px 1fr; }
  }
`;



const steps = [
  { label: "Enter your email", desc: "The one you signed up with" },
  { label: "Check your inbox", desc: "We'll send a reset link in seconds" },
  { label: "Set new password", desc: "Link expires in 15 minutes" },
];

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const validate = (val) => {
    if (!val) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email";
    return "";
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (touched) setError(validate(e.target.value));
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validate(email));
  };

  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(email);
    setError(err);
    if (err) return;

    setLoading(true);
    try {
        await api.post("/auth/forget-password",{email});
    //   await fetch("/api/auth/forgot-password", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email }),
    //   });
      // Always show success — never reveal if email exists
      setSent(true);
      startCooldown();
    } catch {
      setSent(true); // still show success on network error — security
      startCooldown();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
     await api.post("/auth/forget-password",{email});
      startCooldown();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="fp-root">
        <div className="fp-card">

          {/* ── LEFT PANEL ── */}
          <div className="fp-left">
            <div className="fp-logo">
              <div className="fp-logo-mark"><NookMark /></div>
              <span className="fp-logo-name">nook</span>
            </div>

            <div className="fp-hero">
              <h1>Reset your<br /><span>password.</span></h1>
              <p>It happens to everyone. We'll get you back into your neighbourhood in three simple steps.</p>
            </div>

            <div className="fp-steps">
              {steps.map((s, i) => (
                <div className="fp-step" key={s.label}>
                  <div className="fp-step-left">
                    <div className="fp-step-num"
                      style={sent && i === 0 ? { background: "rgba(29,158,117,0.4)", borderColor: "#1D9E75" } : {}}>
                      {sent && i === 0
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : i + 1
                      }
                    </div>
                    <div className="fp-step-line"/>
                  </div>
                  <div>
                    <p className="fp-step-label" style={sent && i === 0 ? { color: "#5DCAA5" } : {}}>
                      {s.label}
                    </p>
                    <p className="fp-step-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="fp-security-note">
              <IconShield />
              <span>For security, we never tell you if an email is registered. You'll always see the same response.</span>
            </div>
          </div>

          {/* ── RIGHT FORM / SUCCESS PANEL ── */}
          <div className="fp-right">

            {!sent ? (
              /* ── FORM STATE ── */
              <div className="fp-animate">
                <button className="fp-back" onClick={() => window.location.href = "/login"}>
                  <IconBack /> Back to sign in
                </button>

                <div className="fp-form-head">
                  <h2>Forgot password?</h2>
                  <p>Enter your email and we'll send you a reset link. It expires in 15 minutes.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="fp-field">
                    <label className="fp-label">Email address</label>
                    <div className={`fp-input-wrap${error && touched ? " error" : ""}`}>
                      <span className="fp-icon"><IconMail /></span>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                    {error && touched && (
                      <p className="fp-err"><IconAlert />{error}</p>
                    )}
                  </div>

                  <button type="submit" className="fp-btn" disabled={loading}>
                    {loading
                      ? <><IconSpinner /> Sending link...</>
                      : <>Send reset link <IconArrow /></>
                    }
                  </button>

                  <p className="fp-signin-row">
                    Remembered it? <a href="/login">Sign in</a>
                  </p>
                </form>
              </div>

            ) : (
              /* ── SUCCESS STATE ── */
              <div className="fp-success fp-animate">
                <div className="fp-success-icon">
                  <IconCheck />
                </div>

                <h3>Check your inbox</h3>
                <p>
                  We sent a reset link to <span>{email}</span>. Click the link to set a new password.
                </p>

                <div className="fp-success-hint" style={{width:"100%"}}>
                  <b>Didn't get it?</b> Check your spam or junk folder. The link expires in <b>15 minutes</b>.
                </div>

                <button
                  className="fp-btn"
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  style={{width:"100%"}}>
                  {loading
                    ? <><IconSpinner /> Resending...</>
                    : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : <>Resend link <IconArrow /></>
                  }
                </button>

                <p className="fp-resend" style={{marginBottom:"1rem"}}>
                  Wrong email?{" "}
                  <button onClick={() => { setSent(false); setEmail(""); setTouched(false); setError(""); }}>
                    Try a different one
                  </button>
                </p>

                <p className="fp-signin-row">
                  <a href="/login">← Back to sign in</a>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}