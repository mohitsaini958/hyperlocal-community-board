import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { NookLogoMark as NookMark,IconLock,IconEye,IconArrow,IconBack,IconSpinner,IconAlert,IconCheck,IconExpired} from "../utils/icons";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .rp-root {
    min-height: 100vh;
    background: #f0efea;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    font-family: 'DM Sans', sans-serif;
  }

  .rp-card {
    width: 100%;
    max-width: 900px;
    display: grid;
    grid-template-columns: 420px 1fr;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.08);
  }

  /* LEFT */
  .rp-left {
    background: #064534;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    min-height: 520px;
  }

  .rp-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .rp-logo-mark {
    width: 38px; height: 38px;
    background: #1D9E75;
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .rp-logo-name {
    font-size: 20px; font-weight: 600;
    color: #c8ede2; letter-spacing: -0.3px;
  }

  .rp-hero {
    flex: 1;
    display: flex; flex-direction: column; justify-content: center;
    padding: 2rem 0 1.5rem;
  }

  .rp-hero h1 {
    font-size: 26px; font-weight: 600;
    color: #c8ede2; line-height: 1.3;
    margin-bottom: 0.75rem;
  }

  .rp-hero h1 span { color: #5DCAA5; }

  .rp-hero p {
    font-size: 13px; color: #7DCBB2;
    line-height: 1.75; margin-bottom: 1.75rem;
  }

  .rp-rules {
    display: flex; flex-direction: column; gap: 8px;
    margin-bottom: 1.75rem;
  }

  .rp-rule {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px;
    font-size: 12px; color: #c8ede2;
    transition: background 0.2s, border-color 0.2s;
  }

  .rp-rule.met {
    background: rgba(29,158,117,0.15);
    border-color: rgba(29,158,117,0.3);
  }

  .rp-rule-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(255,255,255,0.15); flex-shrink: 0;
    transition: background 0.2s;
  }

  .rp-rule.met .rp-rule-dot { background: #5DCAA5; }

  .rp-strength-wrap {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px 16px;
  }

  .rp-strength-label {
    font-size: 11px; color: #7DCBB2; margin-bottom: 8px;
    display: flex; justify-content: space-between; align-items: center;
  }

  .rp-strength-label span { font-weight: 500; }

  .rp-strength-bar {
    display: flex; gap: 4px;
  }

  .rp-bar-seg {
    flex: 1; height: 4px; border-radius: 2px;
    background: rgba(255,255,255,0.1);
    transition: background 0.3s;
  }

  /* RIGHT */
  .rp-right {
    background: #ffffff;
    padding: 2.75rem 2.5rem;
    display: flex; flex-direction: column; justify-content: center;
  }

  .rp-back {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; color: #888; text-decoration: none;
    margin-bottom: 1.75rem; transition: color 0.15s;
    cursor: pointer; background: none; border: none;
    padding: 0; font-family: 'DM Sans', sans-serif;
  }

  .rp-back:hover { color: #1D9E75; }

  .rp-form-head { margin-bottom: 1.75rem; }

  .rp-form-head h2 {
    font-size: 22px; font-weight: 600; color: #111; margin-bottom: 5px;
  }

  .rp-form-head p { font-size: 13px; color: #888; line-height: 1.6; }

  .rp-field { margin-bottom: 1rem; }

  .rp-label {
    display: block; font-size: 12px; font-weight: 500;
    color: #555; margin-bottom: 6px;
  }

  .rp-input-wrap {
    display: flex; align-items: center; gap: 10px;
    padding: 0 14px; height: 44px;
    border-radius: 12px; border: 1.5px solid #e5e5e5;
    background: #fafafa;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }

  .rp-input-wrap:focus-within {
    border-color: #1D9E75; background: #fff;
    box-shadow: 0 0 0 3px rgba(29,158,117,0.1);
  }

  .rp-input-wrap.error { border-color: #f87171; background: #fff8f8; }

  .rp-input-wrap.error:focus-within {
    box-shadow: 0 0 0 3px rgba(248,113,113,0.12);
  }

  .rp-input-wrap.success-field { border-color: #1D9E75; background: #f0fdf8; }

  .rp-input-wrap input {
    flex: 1; border: none; outline: none;
    background: transparent; font-size: 13.5px; color: #111;
    font-family: 'DM Sans', sans-serif; width: 100%;
  }

  .rp-input-wrap input::placeholder { color: #bbb; }

  .rp-icon { flex-shrink: 0; display: flex; align-items: center; }

  .rp-eye {
    background: none; border: none; cursor: pointer; padding: 0;
    display: flex; align-items: center; color: #aaa; flex-shrink: 0;
    transition: color 0.15s;
  }

  .rp-eye:hover { color: #555; }

  .rp-err {
    font-size: 11px; color: #ef4444; margin-top: 5px;
    display: flex; align-items: center; gap: 4px;
  }

  /* inline strength bar on right */
  .rp-inline-strength {
    margin-top: 8px;
    display: flex; gap: 4px;
  }

  .rp-seg {
    flex: 1; height: 3px; border-radius: 2px;
    background: #f0f0f0; transition: background 0.3s;
  }

  .rp-btn {
    width: 100%; height: 46px; border-radius: 13px;
    background: #1D9E75; border: none; color: white;
    font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    gap: 8px; transition: background 0.15s, transform 0.1s;
    margin-bottom: 1.25rem;
  }

  .rp-btn:hover:not(:disabled) { background: #0F6E56; }
  .rp-btn:active:not(:disabled) { transform: scale(0.99); }
  .rp-btn:disabled { background: #9FE1CB; cursor: not-allowed; }

  /* expired state */
  .rp-expired {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 1rem 0;
  }

  .rp-expired-icon {
    width: 64px; height: 64px; border-radius: 50%;
    background: #fff5f5; display: flex; align-items: center;
    justify-content: center; margin-bottom: 1.25rem;
  }

  .rp-expired h3 { font-size: 20px; font-weight: 600; color: #111; margin-bottom: 8px; }
  .rp-expired p { font-size: 13px; color: #888; line-height: 1.7; margin-bottom: 1.75rem; max-width: 280px; }

  /* success state */
  .rp-success {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 1rem 0;
  }

  .rp-success-icon {
    width: 64px; height: 64px; border-radius: 50%;
    background: #E1F5EE; display: flex; align-items: center;
    justify-content: center; margin-bottom: 1.25rem;
  }

  .rp-success h3 { font-size: 20px; font-weight: 600; color: #111; margin-bottom: 8px; }
  .rp-success p { font-size: 13px; color: #888; line-height: 1.7; margin-bottom: 1.75rem; max-width: 280px; }

  .rp-signin-row { text-align: center; font-size: 13px; color: #888; }
  .rp-signin-row a { color: #1D9E75; font-weight: 500; text-decoration: none; }
  .rp-signin-row a:hover { text-decoration: underline; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .rp-spin { animation: spin 0.8s linear infinite; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rp-animate { animation: fadeIn 0.35s ease; }

  @media (max-width: 768px) {
    .rp-root { padding: 0; align-items: stretch; }
    .rp-card { grid-template-columns: 1fr; border-radius: 0; min-height: 100vh; border: none; }
    .rp-left { min-height: auto; padding: 2rem 1.5rem 1.75rem; }
    .rp-hero { padding: 1.25rem 0 1rem; }
    .rp-hero h1 { font-size: 22px; }
    .rp-right { padding: 2rem 1.5rem; }
  }

  @media (max-width: 480px) {
    .rp-left { padding: 1.5rem 1.25rem; }
    .rp-right { padding: 1.75rem 1.25rem; }
    .rp-form-head h2 { font-size: 20px; }
  }

  @media (min-width: 769px) and (max-width: 900px) {
    .rp-card { grid-template-columns: 340px 1fr; }
  }
`;
/* ── password strength ── */
const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthLabel = (s) => {
  if (s === 0) return { text: "", color: "#f0f0f0" };
  if (s <= 1)  return { text: "Weak",   color: "#ef4444" };
  if (s <= 2)  return { text: "Fair",   color: "#f97316" };
  if (s <= 3)  return { text: "Good",   color: "#eab308" };
  return               { text: "Strong", color: "#1D9E75" };
};

const segColor = (score, idx) => {
  const c = strengthLabel(score).color;
  return score > idx ? c : "#f0f0f0";
};

const leftSegColor = (score, idx) => {
  const c = strengthLabel(score).color;
  return score > idx ? c : "rgba(255,255,255,0.1)";
};

/* ── validation ── */
const validateField = (field, value, form) => {
  if (field === "password") {
    if (!value) return "Password is required";
    if (value.length < 6) return "At least 6 characters";
  }
  if (field === "confirmPassword") {
    if (!value) return "Please confirm your password";
    if (value !== form.password) return "Passwords do not match";
  }
  return "";
};


/* ── main component ── */
export default function ResetPassword() {
  const [form, setForm]       = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [showPw, setShowPw]   = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, setState]     = useState("form"); // "form" | "success" | "expired"
  const {token} = useParams();
  const navigate = useNavigate();

  // If no token in URL, show expired immediately
  useEffect(() => { if (!token) setState("expired"); }, [token]);

  const strength = getStrength(form.password);
  const sl = strengthLabel(strength);

  const passwordRules = [
    { label: "At least 6 characters", met: form.password.length >= 6 },
    { label: "At least 10 characters (recommended)", met: form.password.length >= 10 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(form.password) },
    { label: "Contains a number", met: /[0-9]/.test(form.password) },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value, updated) }));
    }
    if (name === "password" && touched.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateField("confirmPassword", updated.confirmPassword, updated) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value, form) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fields = ["password", "confirmPassword"];
    const newErrors = {};
    fields.forEach(f => { newErrors[f] = validateField(f, form[f], form); });
    setErrors(newErrors);
    setTouched({ password: true, confirmPassword: true });
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
        await api.post(`/auth/reset-password/${token}`,
            {
                password:form.password,
                confirmPassword:form.confirmPassword,
            }
        );
      setState("success");
    } catch {
      setState("expired");
    } finally {
      setLoading(false);
    }
  };

  const wrapClass = (field) => {
    const hasErr = errors[field] && touched[field];
    const isOk   = !errors[field] && touched[field] && form[field];
    return `rp-input-wrap${hasErr ? " error" : isOk ? " success-field" : ""}`;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="rp-root">
        <div className="rp-card">

          {/* ── LEFT PANEL ── */}
          <div className="rp-left">
            <div className="rp-logo">
              <div className="rp-logo-mark"><NookMark /></div>
              <span className="rp-logo-name">nook</span>
            </div>

            <div className="rp-hero">
              <h1>Choose a<br /><span>strong password.</span></h1>
              <p>A strong password keeps your account safe. It doesn't have to be impossible to remember — just hard to guess.</p>

              <div className="rp-rules">
                {passwordRules.map((r) => (
                  <div className={`rp-rule${r.met ? " met" : ""}`} key={r.label}>
                    <div className="rp-rule-dot"/>
                    {r.met
                      ? <IconCheck size={13} color="#5DCAA5"/>
                      : <span style={{width:13,flexShrink:0}}/>
                    }
                    {r.label}
                  </div>
                ))}
              </div>

              <div className="rp-strength-wrap">
                <div className="rp-strength-label">
                  Password strength
                  <span style={{ color: sl.color }}>{sl.text || "—"}</span>
                </div>
                <div className="rp-strength-bar">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="rp-bar-seg"
                      style={{ background: leftSegColor(strength, i) }}/>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="rp-right">

            {state === "form" && (
              <div className="rp-animate">
                <button className="rp-back" onClick={() => window.location.href = "/login"}>
                  <IconBack /> Back to sign in
                </button>

                <div className="rp-form-head">
                  <h2>Set new password</h2>
                  <p>Choose a password you haven't used before. The link expires in 15 minutes.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>

                  {/* Password */}
                  <div className="rp-field">
                    <label className="rp-label">New password</label>
                    <div className={wrapClass("password")}>
                      <span className="rp-icon"><IconLock /></span>
                      <input
                        name="password" type={showPw ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={form.password}
                        onChange={handleChange} onBlur={handleBlur}
                        autoComplete="new-password" autoFocus
                      />
                      <button type="button" className="rp-eye" onClick={() => setShowPw(p => !p)} aria-label="Toggle password">
                        <IconEye open={showPw}/>
                      </button>
                    </div>
                    {/* Inline strength bar */}
                    {form.password && (
                      <div className="rp-inline-strength">
                        {[0,1,2,3,4].map(i => (
                          <div key={i} className="rp-seg" style={{ background: segColor(strength, i) }}/>
                        ))}
                      </div>
                    )}
                    {errors.password && touched.password && (
                      <p className="rp-err"><IconAlert />{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="rp-field">
                    <label className="rp-label">Confirm new password</label>
                    <div className={wrapClass("confirmPassword")}>
                      <span className="rp-icon"><IconLock /></span>
                      <input
                        name="confirmPassword" type={showCPw ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={form.confirmPassword}
                        onChange={handleChange} onBlur={handleBlur}
                        autoComplete="new-password"
                      />
                      <button type="button" className="rp-eye" onClick={() => setShowCPw(p => !p)} aria-label="Toggle confirm password">
                        <IconEye open={showCPw}/>
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="rp-err"><IconAlert />{errors.confirmPassword}</p>
                    )}
                    {!errors.confirmPassword && touched.confirmPassword && form.confirmPassword && (
                      <p style={{fontSize:11,color:"#1D9E75",marginTop:5,display:"flex",alignItems:"center",gap:4}}>
                        <IconCheck size={11}/> Passwords match
                      </p>
                    )}
                  </div>

                  <button type="submit" className="rp-btn"
                    disabled={loading}
                    style={{marginTop:"1.25rem"}}>
                    {loading
                      ? <><IconSpinner /> Resetting password...</>
                      : <>Reset password <IconArrow /></>
                    }
                  </button>

                  <p className="rp-signin-row">
                    Remembered it? <a href="/login">Sign in instead</a>
                  </p>
                </form>
              </div>
            )}

            {state === "success" && (
              <div className="rp-success rp-animate">
                <div className="rp-success-icon"><IconCheck /></div>
                <h3>Password updated!</h3>
                <p>Your password has been reset successfully. You can now sign in with your new password.</p>
                <button className="rp-btn" style={{width:"100%"}}
                  onClick={() => window.location.href = "/login"}>
                  Sign in to Nook <IconArrow />
                </button>
                <p className="rp-signin-row" style={{marginTop:0}}>
                  All your posts and activity are still there.
                </p>
              </div>
            )}

            {state === "expired" && (
              <div className="rp-expired rp-animate">
                <div className="rp-expired-icon"><IconExpired /></div>
                <h3>Link expired</h3>
                <p>This reset link has expired or already been used or server error. Reset links are valid for 15 minutes only.</p>
                <button className="rp-btn" style={{width:"100%",background:"#1D9E75"}}
                  onClick={() => window.location.href = "/forgot-password"}>
                  Request a new link <IconArrow />
                </button>
                <p className="rp-signin-row" style={{marginTop:0}}>
                  Remembered it? <a href="/login">Sign in instead</a>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}