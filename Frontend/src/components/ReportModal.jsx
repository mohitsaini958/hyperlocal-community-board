import { useState } from "react";
import axios from "../api/axios.js";

const styles = `
  .rm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 400;
    display: flex; align-items: flex-end;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    animation: rmFadeIn .2s ease;
  }

  @keyframes rmFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .rm-sheet {
    background: #fff;
    border-radius: 20px 20px 0 0;
    width: 100%; max-width: 680px;
    padding: 0 0 env(safe-area-inset-bottom);
    animation: rmSlideUp .25s ease;
    box-shadow: 0 -4px 24px rgba(0,0,0,0.12);
  }

  @keyframes rmSlideUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }

  .rm-handle {
    width: 40px; height: 4px;
    border-radius: 2px; background: #e0e0e0;
    margin: 12px auto 0;
  }

  .rm-header {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
    border-bottom: 1px solid #f5f5f2;
  }

  .rm-title  { font-size: 16px; font-weight: 600; color: #111; }
  .rm-close  {
    width: 32px; height: 32px; border-radius: 8px;
    background: #f5f5f0; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #888; font-size: 18px; transition: background .15s;
  }

  .rm-close:hover { background: #eeeeea; }

  .rm-sub {
    font-size: 13px; color: #888;
    padding: 10px 16px 0; line-height: 1.5;
  }

  .rm-reasons { padding: 10px 16px; display: flex; flex-direction: column; gap: 6px; }

  .rm-reason {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 12px;
    border: 1.5px solid #eeeeea; background: #fafafa;
    cursor: pointer; transition: all .15s;
    font-family: 'DM Sans', sans-serif; text-align: left;
    width: 100%;
  }

  .rm-reason:hover { border-color: #1D9E75; background: #E1F5EE; }

  .rm-reason.selected {
    border-color: #1D9E75; background: #E1F5EE;
  }

  .rm-reason-icon {
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .rm-reason-label { font-size: 13px; font-weight: 500; color: #111; display: block; margin-bottom: 1px; }
  .rm-reason-desc  { font-size: 11px; color: #888; }

  .rm-radio {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid #ddd; margin-left: auto; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: border-color .15s;
  }

  .rm-reason.selected .rm-radio { border-color: #1D9E75; }

  .rm-radio-inner {
    width: 9px; height: 9px; border-radius: 50%;
    background: #1D9E75; display: none;
  }

  .rm-reason.selected .rm-radio-inner { display: block; }

  .rm-footer { padding: 0 16px 20px; display: flex; gap: 10px; }

  .rm-submit {
    flex: 1; height: 46px; border-radius: 13px;
    background: #1D9E75; color: #fff; border: none;
    font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background .15s, opacity .15s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }

  .rm-submit:hover:not(:disabled) { background: #0F6E56; }
  .rm-submit:disabled { opacity: .5; cursor: not-allowed; }

  .rm-cancel {
    height: 46px; padding: 0 20px; border-radius: 13px;
    background: #f5f5f0; color: #555; border: 1px solid #eeeeea;
    font-size: 14px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background .15s;
  }

  .rm-cancel:hover { background: #eeeeea; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .rm-spin { animation: spin .7s linear infinite; display: inline-block; }
`;

const REASONS = [
  { value: "spam",           icon: "ti-mail-off",    iconBg: "#FAEEDA", iconColor: "#854F0B", label: "Spam",            desc: "Repetitive, promotional or irrelevant content"     },
  { value: "offensive",      icon: "ti-alert-triangle", iconBg: "#FCEBEB", iconColor: "#791F1F", label: "Offensive",       desc: "Harassment, hate speech or abusive content"        },
  { value: "misinformation", icon: "ti-info-circle", iconBg: "#E6F1FB", iconColor: "#0C447C", label: "Misinformation",  desc: "False or misleading information"                   },
  { value: "other",          icon: "ti-dots",        iconBg: "#F1F1EE", iconColor: "#555",    label: "Other",           desc: "Something else that doesn't fit above"             },
];

const ReportModal = ({ targetType, targetId, onClose, onSuccess }) => {
  const [selected,   setSelected]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      await axios.post(`/${targetType}s/${targetId}/report`, {
        reason: selected,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Report failed:", err.message);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      {/* backdrop */}
      <div className="rm-backdrop" onClick={onClose}>
        <div className="rm-sheet" onClick={e => e.stopPropagation()}>

          <div className="rm-handle"/>

          <div className="rm-header">
            <span className="rm-title">Report {targetType}</span>
            <button className="rm-close" onClick={onClose} aria-label="Close">
              <i className="ti ti-x" aria-hidden="true"/>
            </button>
          </div>

          <p className="rm-sub">
            Help keep Nook safe. Pick the reason that best describes the problem.
          </p>

          <div className="rm-reasons">
            {REASONS.map(r => (
              <button
                key={r.value}
                className={`rm-reason${selected === r.value ? " selected" : ""}`}
                onClick={() => setSelected(r.value)}>

                <div className="rm-reason-icon" style={{ background: r.iconBg }}>
                  <i className={`ti ${r.icon}`}
                    style={{ fontSize: 16, color: r.iconColor }} aria-hidden="true"/>
                </div>

                <div style={{ flex: 1 }}>
                  <span className="rm-reason-label">{r.label}</span>
                  <span className="rm-reason-desc">{r.desc}</span>
                </div>

                <div className="rm-radio">
                  <div className="rm-radio-inner"/>
                </div>
              </button>
            ))}
          </div>

          <div className="rm-footer">
            <button className="rm-cancel" onClick={onClose}>Cancel</button>
            <button
              className="rm-submit"
              onClick={handleSubmit}
              disabled={!selected || submitting}>
              {submitting
                ? <><i className="ti ti-refresh rm-spin" style={{ fontSize: 14 }} aria-hidden="true"/> Reporting...</>
                : <><i className="ti ti-flag" style={{ fontSize: 14 }} aria-hidden="true"/> Submit report</>
              }
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ReportModal