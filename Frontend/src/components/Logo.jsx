/* ─────────────────────────────────────────
   Logo.jsx
   Nook's visual mark — a location pin with
   a single signal ring, sitting inside a
   rounded badge. Ties directly to the app's
   core idea: "you only see what's within
   your radius."
───────────────────────────────────────── */

// the mark alone — used at small sizes (favicon, app icon, compact nav)
export const LogoMark = ({ size = 36, bg = "#1D9E75", pinColor = "#fff" }) => (
  <div style={{
    width: size, height: size,
    background: bg,
    borderRadius: size * 0.3,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
      {/* signal ring — the "radius" concept, sits behind the pin */}
      <ellipse cx="12" cy="19.5" rx="5.5" ry="1.3"
        fill="none" stroke={pinColor} strokeWidth="1.2" opacity="0.45"/>
      {/* teardrop pin */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={pinColor}/>
      <circle cx="12" cy="9" r="2.6" fill={bg}/>
    </svg>
  </div>
);

// full lockup — mark + wordmark, used in topbars and headers
export const Logo = ({ size = 32, showWordmark = true, dark = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
    <LogoMark size={size}/>
    {showWordmark && (
      <span style={{
        fontSize: size * 0.5,
        fontWeight: 600,
        color: dark ? "#c8ede2" : "#064534",
        letterSpacing: "-0.3px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        nook
      </span>
    )}
  </div>
);

export default Logo;