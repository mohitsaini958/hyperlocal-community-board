import { useState, useEffect, useCallback } from "react";

const styles = `
  .toast-wrap {
    position: fixed;
    bottom: 88px; left: 50%;
    transform: translateX(-50%);
    z-index: 500;
    display: flex; flex-direction: column;
    align-items: center; gap: 8px;
    pointer-events: none;
  }

  .toast {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: #fff;
    padding: 10px 18px;
    border-radius: 20px;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.18);
    animation: toastIn .25s ease;
    white-space: nowrap;
    pointer-events: auto;
  }

  .toast.success { background: #064534; }
  .toast.error   { background: #dc2626; }
  .toast.info    { background: #1c1c1c; }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes toastOut {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(10px); }
  }

  .toast.hiding { animation: toastOut .2s ease forwards; }
`;

// global event bus for triggering toasts from anywhere
const listeners = new Set();

export const showToast = (message, type = "success") => {
  listeners.forEach(fn => fn({ message, type, id: Date.now() }));
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts(prev => [...prev, toast]);
    // auto remove after 3s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 3000);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => listeners.delete(addToast);
  }, [addToast]);

  if (!toasts.length) return null;

  const ICONS = { success: "ti-check", error: "ti-alert-circle", info: "ti-info-circle" };

  return (
    <>
      <style>{styles}</style>
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <i className={`ti ${ICONS[t.type] || ICONS.info}`}
              style={{ fontSize: 15 }} aria-hidden="true"/>
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
};
