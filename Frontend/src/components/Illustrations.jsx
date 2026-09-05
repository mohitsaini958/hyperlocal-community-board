/* ─────────────────────────────────────────
   Illustrations.jsx
   Signature visual for Nook — a small street
   of houses with the 2km radius drawn as
   concentric rings around it. This is the
   one illustrated moment in the app, and it
   literally depicts the thing that makes
   Nook different: visibility is local.
───────────────────────────────────────── */

// used on empty feed / empty map states
export const NeighborhoodIllustration = ({ width = 220 }) => (
  <svg width={width} height={width * 0.64} viewBox="0 0 220 140" role="img">
    <title>Illustration of houses with a visibility radius around them</title>

    {/* radius rings — dashed, fading outward, centred behind the houses */}
    <circle cx="110" cy="92" r="34" fill="none" stroke="#9FE1CB" strokeWidth="1.4" strokeDasharray="3 4" opacity="0.9"/>
    <circle cx="110" cy="92" r="54" fill="none" stroke="#9FE1CB" strokeWidth="1.4" strokeDasharray="3 4" opacity="0.6"/>
    <circle cx="110" cy="92" r="74" fill="none" stroke="#9FE1CB" strokeWidth="1.4" strokeDasharray="3 4" opacity="0.35"/>

    {/* ground line */}
    <line x1="20" y1="118" x2="200" y2="118" stroke="#E1F5EE" strokeWidth="2" strokeLinecap="round"/>

    {/* house 1 — left, small */}
    <g>
      <rect x="34" y="96" width="26" height="22" fill="#E1F5EE"/>
      <polygon points="30,96 47,82 64,96" fill="#5DCAA5"/>
      <rect x="43" y="104" width="8" height="14" fill="#fff"/>
    </g>

    {/* house 2 — centre, tallest, the "home" the radius is drawn from */}
    <g>
      <rect x="92" y="80" width="34" height="38" fill="#fff" stroke="#9FE1CB" strokeWidth="1.5"/>
      <polygon points="86,80 109,60 132,80" fill="#1D9E75"/>
      <rect x="103" y="98" width="11" height="20" fill="#E1F5EE"/>
      <rect x="98" y="88" width="7" height="7" fill="#E1F5EE"/>
      <rect x="115" y="88" width="7" height="7" fill="#E1F5EE"/>
      {/* small pin marker above the roof, anchoring the radius */}
      <circle cx="109" cy="50" r="3" fill="#064534"/>
      <line x1="109" y1="53" x2="109" y2="60" stroke="#064534" strokeWidth="1.5"/>
    </g>

    {/* house 3 — right, medium */}
    <g>
      <rect x="152" y="92" width="28" height="26" fill="#E1F5EE"/>
      <polygon points="147,92 166,76 185,92" fill="#5DCAA5"/>
      <rect x="162" y="102" width="9" height="16" fill="#fff"/>
    </g>
  </svg>
);

// smaller variant for inline use (notification empty state, etc.)
export const SmallHouseIcon = ({ size = 28, color = "#1D9E75" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 11l9-7 9 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <rect x="10" y="14" width="4" height="6" fill={color}/>
  </svg>
);

export default NeighborhoodIllustration;