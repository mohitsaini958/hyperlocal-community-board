import { useState } from "react";
import validate from "../utils/validate";
import { IconUser,IconAlert,IconArrow,IconClock,IconEye,IconLock,IconMail,IconMap,IconPin,IconSpinner,IconUserOff,NookLogoMark } from "../utils/icons.jsx";
import {useNavigate,Link} from "react-router-dom"
import api from "../api/axios.js";
import { useAuth } from "../context/useAuth.js";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .su-root {
    min-height: 100vh;
    background: #f0efea;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    font-family: 'DM Sans', sans-serif;
  }

  .su-card {
    width: 100%;
    max-width: 900px;
    display: grid;
    grid-template-columns: 420px 1fr;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.08);
  }

  .su-left {
    background: #064534;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    min-height: 620px;
  }

  .su-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: auto;
  }

  .su-logo-mark {
    width: 38px;
    height: 38px;
    background: #1D9E75;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .su-logo-name {
    font-size: 20px;
    font-weight: 600;
    color: #c8ede2;
    letter-spacing: -0.3px;
  }

  .su-hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem 0 1.5rem;
  }

  .su-hero h1 {
    font-size: 28px;
    font-weight: 600;
    color: #c8ede2;
    line-height: 1.25;
    margin-bottom: 0.75rem;
  }

  .su-hero h1 span { color: #5DCAA5; }

  .su-hero p {
    font-size: 13px;
    color: #7DCBB2;
    line-height: 1.75;
  }

  .su-feats {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 1.25rem;
  }

  .su-feat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: rgba(255,255,255,0.06);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.05);
  }

  .su-feat-icon {
    width: 32px;
    height: 32px;
    background: rgba(29,158,117,0.25);
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .su-feat-label {
    font-size: 12px;
    font-weight: 500;
    color: #c8ede2;
    display: block;
  }

  .su-feat-desc {
    font-size: 11px;
    color: #7DCBB2;
  }

  .su-testimonial {
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 14px 16px;
  }

  .su-testimonial p {
    font-size: 12px;
    color: #7DCBB2;
    line-height: 1.65;
    font-style: italic;
    margin-bottom: 12px;
  }

  .su-t-person {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .su-t-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #1D9E75;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: white;
    flex-shrink: 0;
  }

  .su-t-name { font-size: 12px; font-weight: 500; color: #c8ede2; }
  .su-t-role { font-size: 11px; color: #5DCAA5; }

  .su-right {
    background: #ffffff;
    padding: 2.75rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .su-form-head { margin-bottom: 1.75rem; }

  .su-form-head h2 {
    font-size: 22px;
    font-weight: 600;
    color: #111;
    margin-bottom: 5px;
  }

  .su-form-head p {
    font-size: 13px;
    color: #888;
  }

  .su-field { margin-bottom: 1rem; }

  .su-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #555;
    margin-bottom: 6px;
  }

  .su-input-wrap {
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

  .su-input-wrap:focus-within {
    border-color: #1D9E75;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(29,158,117,0.1);
  }

  .su-input-wrap.error {
    border-color: #f87171;
    background: #fff8f8;
  }

  .su-input-wrap.error:focus-within {
    box-shadow: 0 0 0 3px rgba(248,113,113,0.12);
  }

  .su-input-wrap input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 13.5px;
    color: #111;
    font-family: 'DM Sans', sans-serif;
    width: 100%;
  }

  .su-input-wrap input::placeholder { color: #bbb; }

  .su-icon { flex-shrink: 0; display: flex; align-items: center; }

  .su-err {
    font-size: 11px;
    color: #ef4444;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .su-eye {
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

  .su-eye:hover { color: #555; }

  .su-loc-note {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #E1F5EE;
    border-radius: 12px;
    padding: 11px 14px;
    margin-bottom: 1.25rem;
  }

  .su-loc-note span {
    font-size: 12px;
    color: #085041;
    line-height: 1.6;
  }

  .su-btn {
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

  .su-btn:hover:not(:disabled) { background: #0F6E56; }
  .su-btn:active:not(:disabled) { transform: scale(0.99); }
  .su-btn:disabled { background: #9FE1CB; cursor: not-allowed; }

  .su-signin {
    text-align: center;
    font-size: 13px;
    color: #888;
  }

  .su-signin a {
    color: #1D9E75;
    font-weight: 500;
    text-decoration: none;
  }

  .su-signin a:hover { text-decoration: underline; }

  .su-global-err {
    background: #fff5f5;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12.5px;
    color: #dc2626;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .su-spin { animation: spin 0.8s linear infinite; }

  @media (max-width: 768px) {
    .su-root { padding: 0; align-items: stretch; }
    .su-card {
      grid-template-columns: 1fr;
      border-radius: 0;
      min-height: 100vh;
      border: none;
    }
    .su-left {
      min-height: auto;
      padding: 2rem 1.5rem 1.75rem;
    }
    .su-hero { padding: 1.25rem 0 1rem; }
    .su-hero h1 { font-size: 22px; }
    .su-feats { gap: 7px; }
    .su-right { padding: 2rem 1.5rem; }
  }

  @media (max-width: 480px) {
    .su-left { padding: 1.5rem 1.25rem; }
    .su-right { padding: 1.75rem 1.25rem; }
    .su-form-head h2 { font-size: 20px; }
  }

  @media (min-width: 769px) and (max-width: 900px) {
    .su-card { grid-template-columns: 360px 1fr; }
  }
`;


const features = [
  { Icon: IconMap,    label: "Only within 2km",      desc: "Posts never leave your neighbourhood" },
  { Icon: IconClock,  label: "Auto-expires in 7 days", desc: "Feed stays fresh, always"            },
  { Icon: IconUserOff,label: "Post anonymously",      desc: "Your name, your choice"               },
];



export default function SignUp() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalErr, setGlobalErr] = useState("");
  const navigate = useNavigate();
  const {login}=useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validate(name, value, updated) }));
    }
    if (name === "password" && touched.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validate("confirmPassword", updated.confirmPassword, updated) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value, form) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalErr("");
    const fields = ["username", "email", "password", "confirmPassword"];
    const newErrors = {};
    fields.forEach(f => { newErrors[f] = validate(f, form[f], form); });
    setErrors(newErrors);
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {

      const res=await api.post("/auth/register",form);
      const {accessToken,user,} = res.data;
      login(user,accessToken);
      navigate("/");
    } catch (err) {
      setGlobalErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  const wrapClass = (field) =>
    `su-input-wrap${errors[field] && touched[field] ? " error" : ""}`;

  return (
    <>
      <style>{styles}</style>
      <div className="su-root">
        <div className="su-card">

          {/* ── LEFT PANEL ── */}
          <div className="su-left">
            <div className="su-logo">
              <div className="su-logo-mark"><NookLogoMark /></div>
              <span className="su-logo-name">nook</span>
            </div>

            <div className="su-hero">
              <h1>Your street has<br /><span>a story.</span></h1>
              <p>Real posts from real neighbours within 2km. Alerts, lost pets, free stuff — everything your area is talking about.</p>
            </div>

            <div className="su-feats">
              {features.map(({ Icon, label, desc }) => (
                <div className="su-feat" key={label}>
                  <div className="su-feat-icon"><Icon /></div>
                  <div>
                    <span className="su-feat-label">{label}</span>
                    <span className="su-feat-desc">{desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="su-testimonial">
              <p>"Found out about the water outage before the municipality even announced it. Actually useful."</p>
              <div className="su-t-person">
                <div className="su-t-avatar">P</div>
                <div>
                  <p className="su-t-name">Priya S.</p>
                  <p className="su-t-role">Jodhpur resident</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT FORM PANEL ── */}
          <div className="su-right">
            <div className="su-form-head">
              <h2>Create your account</h2>
              <p>See what your neighbours are posting right now.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {globalErr && (
                <div className="su-global-err">{globalErr}</div>
              )}

              {/* Username */}
              <div className="su-field">
                <label className="su-label">Username</label>
                <div className={wrapClass("username")}>
                  <span className="su-icon"><IconUser /></span>
                  <input
                    name="username" type="text"
                    placeholder="rahul_jodhpur"
                    value={form.username}
                    onChange={handleChange} onBlur={handleBlur}
                    autoComplete="username"
                  />
                </div>
                {errors.username && touched.username && (
                  <p className="su-err"><IconAlert />{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div className="su-field">
                <label className="su-label">Email</label>
                <div className={wrapClass("email")}>
                  <span className="su-icon"><IconMail /></span>
                  <input
                    name="email" type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange} onBlur={handleBlur}
                    autoComplete="email"
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="su-err"><IconAlert />{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="su-field">
                <label className="su-label">Password</label>
                <div className={wrapClass("password")}>
                  <span className="su-icon"><IconLock /></span>
                  <input
                    name="password" type={showPw ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={handleChange} onBlur={handleBlur}
                    autoComplete="new-password"
                  />
                  <button type="button" className="su-eye" onClick={() => setShowPw(p => !p)} aria-label="Toggle password">
                    <IconEye open={showPw} />
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="su-err"><IconAlert />{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="su-field">
                <label className="su-label">Confirm password</label>
                <div className={wrapClass("confirmPassword")}>
                  <span className="su-icon"><IconLock /></span>
                  <input
                    name="confirmPassword" type={showCPw ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={handleChange} onBlur={handleBlur}
                    autoComplete="new-password"
                  />
                  <button type="button" className="su-eye" onClick={() => setShowCPw(p => !p)} aria-label="Toggle confirm password">
                    <IconEye open={showCPw} />
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="su-err"><IconAlert />{errors.confirmPassword}</p>
                )}
              </div>

              {/* Location note */}
              <div className="su-loc-note">
                <IconPin />
                <span>We'll ask for your location after signup — only used to show nearby posts, never shared.</span>
              </div>

              {/* Submit */}
              <button type="submit" className="su-btn" disabled={loading}>
                {loading ? <><IconSpinner /> Creating account...</> : <>Join Nook <IconArrow /></>}
              </button>

              <p className="su-signin">
                Already have an account? <a href="/login">Sign in</a>
              </p>

            </form>
          </div>

        </div>
      </div>
    </>
  );
}
