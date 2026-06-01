import { useEffect, useRef, useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .lp {
    font-family: 'DM Sans', sans-serif;
    background: #ffffff;
    color: #111;
    overflow-x: hidden;
    min-height: 100vh;
  }

  /* ── NAV ── */
  .lp-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2.5rem;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid rgba(0,0,0,0.07);
    transition: box-shadow 0.2s;
  }

  .lp-nav.scrolled {
    box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  }

  .lp-nav-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }

  .lp-mark {
    width: 34px; height: 34px;
    background: #1D9E75;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .lp-nav-name { font-size: 18px; font-weight: 600; color: #064534; letter-spacing: -0.3px; }

  .lp-nav-links { display: flex; align-items: center; gap: 1.75rem; }

  .lp-nav-link {
    font-size: 13px; color: #555;
    text-decoration: none; cursor: pointer;
    transition: color .15s; background: none; border: none;
    font-family: 'DM Sans', sans-serif;
  }

  .lp-nav-link:hover { color: #1D9E75; }

  .lp-nav-btns { display: flex; align-items: center; gap: 10px; }

  .lp-btn-ghost {
    font-size: 13px; font-weight: 500; color: #064534;
    background: none; border: 1.5px solid rgba(6,69,52,0.3);
    border-radius: 10px; padding: 6px 18px;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all .15s; text-decoration: none;
    display: inline-block;
  }

  .lp-btn-ghost:hover { background: #064534; color: #fff; border-color: #064534; }

  .lp-btn-solid {
    font-size: 13px; font-weight: 500; color: #fff;
    background: #1D9E75; border: none;
    border-radius: 10px; padding: 7px 18px;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: background .15s; text-decoration: none;
    display: inline-block;
  }

  .lp-btn-solid:hover { background: #0F6E56; }

  /* ── HERO ── */
  .lp-hero {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 4rem;
    align-items: center;
    padding: 5rem 2.5rem 4rem;
    max-width: 1100px;
    margin: 0 auto;
  }

  .lp-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #E1F5EE;
    border: 1px solid #9FE1CB;
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 12px; font-weight: 500; color: #085041;
    margin-bottom: 1.5rem;
  }

  .lp-badge-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #1D9E75;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: .5; transform: scale(1.3); }
  }

  .lp-hero h1 {
    font-size: 52px; font-weight: 700;
    line-height: 1.05; color: #064534;
    margin-bottom: 1.1rem; letter-spacing: -2px;
  }

  .lp-hero h1 span { color: #1D9E75; }

  .lp-hero-sub {
    font-size: 16px; color: #666;
    line-height: 1.75; margin-bottom: 2.25rem;
    max-width: 440px;
  }

  .lp-hero-ctas { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; }

  .lp-cta-primary {
    font-size: 15px; font-weight: 600; color: #fff;
    background: #1D9E75; border: none; border-radius: 14px;
    padding: 13px 30px; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background .15s, transform .1s;
    display: flex; align-items: center; gap: 8px;
    text-decoration: none;
  }

  .lp-cta-primary:hover { background: #0F6E56; transform: translateY(-1px); }
  .lp-cta-primary:active { transform: translateY(0); }

  .lp-cta-secondary {
    font-size: 15px; font-weight: 500; color: #064534;
    background: none; border: 1.5px solid rgba(6,69,52,0.25);
    border-radius: 14px; padding: 12px 26px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: all .15s;
  }

  .lp-cta-secondary:hover { border-color: #064534; background: rgba(6,69,52,0.04); }

  .lp-hero-note {
    font-size: 12.5px; color: #aaa;
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  }

  .lp-note-sep { color: #ddd; }

  /* ── PHONE ── */
  .lp-phone-wrap {
    position: relative;
    display: flex; justify-content: center;
  }

  .lp-phone {
    background: #064534;
    border-radius: 40px;
    padding: 14px;
    width: 248px;
    box-shadow:
      0 40px 100px rgba(6,69,52,0.25),
      0 12px 32px rgba(6,69,52,0.15),
      0 0 0 1px rgba(255,255,255,0.1);
    animation: floatPhone 4s ease-in-out infinite;
  }

  @keyframes floatPhone {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50%       { transform: translateY(-10px) rotate(1deg); }
  }

  .lp-phone-inner {
    background: #f5f5f0;
    border-radius: 28px;
    overflow: hidden;
  }

  .lp-phone-status {
    height: 22px; background: #e8e8e3;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px; font-size: 9px; color: #888;
    font-family: 'DM Sans', sans-serif;
  }

  .lp-phone-topbar {
    height: 40px; background: #fff;
    border-bottom: 1px solid #eeeeea;
    display: flex; align-items: center;
    padding: 0 14px; gap: 6px;
  }

  .lp-topbar-loc { font-size: 10px; font-weight: 500; color: #064534; flex: 1; }

  .lp-topbar-bell {
    width: 24px; height: 24px; border-radius: 7px;
    background: #E1F5EE;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }

  .lp-bell-badge {
    position: absolute; top: -3px; right: -3px;
    width: 8px; height: 8px; border-radius: 50%;
    background: #ef4444; border: 1.5px solid #fff;
    animation: bellPing 2s infinite;
  }

  @keyframes bellPing {
    0%,90%,100% { transform: scale(1); }
    95% { transform: scale(1.4); }
  }

  .lp-phone-filters {
    display: flex; gap: 5px; padding: 8px 10px;
    background: #fff; border-bottom: 1px solid #f5f5f2;
    overflow-x: auto;
  }

  .lp-filter {
    font-size: 8px; padding: 3px 9px; border-radius: 10px;
    border: 1px solid #e5e5e5; color: #888;
    background: #fafafa; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }

  .lp-filter.on { background: #064534; color: #fff; border-color: #064534; }

  .lp-phone-feed {
    padding: 8px;
    display: flex; flex-direction: column; gap: 6px;
    background: #f0efea; min-height: 250px;
  }

  .lp-post {
    background: #fff; border-radius: 11px;
    padding: 9px 11px; border: 1px solid #ececea;
    transform: translateX(120%);
    opacity: 0;
    transition: transform 0.5s cubic-bezier(.23,1.01,.32,1), opacity 0.5s ease;
  }

  .lp-post.visible {
    transform: translateX(0);
    opacity: 1;
  }

  .lp-post-badge {
    font-size: 7px; font-weight: 600;
    padding: 2px 6px; border-radius: 5px;
    display: inline-block; margin-bottom: 4px;
    font-family: 'DM Sans', sans-serif;
  }

  .lp-post-title { font-size: 10px; font-weight: 600; color: #111; margin-bottom: 3px; }

  .lp-post-body {
    font-size: 8.5px; color: #888;
    line-height: 1.4; margin-bottom: 5px;
  }

  .lp-post-foot {
    display: flex; align-items: center; gap: 6px;
    font-size: 8px; color: #bbb;
  }

  .lp-phone-tabbar {
    height: 46px; background: #fff;
    border-top: 1px solid #eeeeea;
    display: flex; align-items: center; justify-content: space-around;
  }

  .lp-tab {
    display: flex; flex-direction: column;
    align-items: center; gap: 1px;
    font-size: 7px; color: #bbb;
    font-family: 'DM Sans', sans-serif;
  }

  .lp-tab.on { color: #1D9E75; }

  .lp-phone-fab {
    position: absolute; bottom: 62px; right: 22px;
    width: 32px; height: 32px; border-radius: 50%;
    background: #1D9E75;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(29,158,117,0.45);
    animation: fabPulse 3s ease-in-out infinite;
  }

  @keyframes fabPulse {
    0%,100% { box-shadow: 0 4px 14px rgba(29,158,117,0.45); }
    50%      { box-shadow: 0 4px 22px rgba(29,158,117,0.7); }
  }

  /* floating notification */
  .lp-notif {
    position: absolute; top: 50px; right: -10px;
    background: #fff; border-radius: 12px;
    padding: 8px 12px; border: 1px solid #eeeeea;
    font-size: 9px; font-weight: 500; color: #064534;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    white-space: nowrap;
    display: flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', sans-serif;
    opacity: 0;
    transform: translateX(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .lp-notif.visible {
    opacity: 1;
    transform: translateX(0);
  }

  .lp-notif-dot { width: 7px; height: 7px; border-radius: 50%; background: #1D9E75; flex-shrink: 0; }

  /* comment toast */
  .lp-comment-toast {
    position: absolute; bottom: 110px; left: -10px;
    background: #fff; border-radius: 12px;
    padding: 8px 12px; border: 1px solid #eeeeea;
    font-size: 9px; color: #555;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    white-space: nowrap;
    display: flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', sans-serif;
    opacity: 0;
    transform: translateX(-20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
    max-width: 160px;
    white-space: normal;
    line-height: 1.4;
  }

  .lp-comment-toast.visible {
    opacity: 1;
    transform: translateX(0);
  }

  .lp-comment-avatar {
    width: 20px; height: 20px; border-radius: 50%;
    background: #534AB7; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px; font-weight: 600; flex-shrink: 0;
  }

  /* ── STATS ── */
  .lp-stats {
    background: #064534;
    padding: 2.5rem 2.5rem;
    display: flex; align-items: center; justify-content: center;
    gap: 5rem;
  }

  .lp-stat { text-align: center; }
  .lp-stat-num { font-size: 30px; font-weight: 700; color: #5DCAA5; display: block; letter-spacing: -1px; }
  .lp-stat-label { font-size: 12px; color: #7DCBB2; }

  /* ── SHARED ── */
  .lp-section {
    padding: 5rem 2.5rem;
    max-width: 1100px;
    margin: 0 auto;
  }

  .lp-tag {
    font-size: 12px; font-weight: 600; color: #1D9E75;
    text-transform: uppercase; letter-spacing: .1em;
    margin-bottom: .75rem;
  }

  .lp-section-title {
    font-size: 34px; font-weight: 700; color: #064534;
    margin-bottom: 3rem; line-height: 1.15; letter-spacing: -0.8px;
  }

  /* ── HOW ── */
  .lp-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }

  .lp-step {
    background: #fff; border-radius: 18px;
    padding: 1.75rem; border: 1px solid #eee;
    transition: border-color .2s, box-shadow .2s;
  }

  .lp-step:hover { border-color: #9FE1CB; box-shadow: 0 4px 20px rgba(29,158,117,0.08); }

  .lp-step-num {
    width: 40px; height: 40px; border-radius: 12px;
    background: #E1F5EE;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; color: #085041;
    margin-bottom: 1rem;
  }

  .lp-step-title { font-size: 15px; font-weight: 600; color: #111; margin-bottom: .5rem; }
  .lp-step-desc { font-size: 13px; color: #777; line-height: 1.7; }

  /* ── FEATURES ── */
  .lp-feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }

  .lp-feat {
    background: #fff; border-radius: 16px;
    padding: 1.4rem; border: 1px solid #eee;
    transition: border-color .2s, box-shadow .2s, transform .2s;
  }

  .lp-feat:hover {
    border-color: #9FE1CB;
    box-shadow: 0 4px 20px rgba(29,158,117,0.08);
    transform: translateY(-2px);
  }

  .lp-feat-icon {
    width: 44px; height: 44px; border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: .95rem;
  }

  .lp-feat-icon i { font-size: 22px; }
  .lp-feat-title { font-size: 14px; font-weight: 600; color: #111; margin-bottom: .4rem; }
  .lp-feat-desc { font-size: 13px; color: #888; line-height: 1.65; }

  /* ── CATEGORIES ── */
  .lp-cats {
    background: #064534;
    padding: 4.5rem 2.5rem; text-align: center;
  }

  .lp-cats-title { font-size: 26px; font-weight: 700; color: #c8ede2; margin-bottom: .5rem; letter-spacing: -0.5px; }
  .lp-cats-sub { font-size: 13px; color: #7DCBB2; margin-bottom: 2.25rem; }

  .lp-cat-pills {
    display: flex; flex-wrap: wrap; gap: 10px;
    justify-content: center; max-width: 600px; margin: 0 auto;
  }

  .lp-cat {
    display: flex; align-items: center; gap: 9px;
    padding: 11px 22px; border-radius: 14px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 13px; font-weight: 500; color: #c8ede2;
    transition: background .15s, transform .15s;
    cursor: default;
  }

  .lp-cat:hover { background: rgba(255,255,255,0.15); transform: translateY(-1px); }
  .lp-cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  /* ── TESTIMONIALS ── */
  .lp-t-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }

  .lp-t-card {
    background: #fff; border-radius: 18px;
    padding: 1.6rem; border: 1px solid #eee;
    transition: box-shadow .2s;
  }

  .lp-t-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.07); }

  .lp-t-stars { display: flex; gap: 3px; margin-bottom: .9rem; }

  .lp-t-quote {
    font-size: 13.5px; color: #444;
    line-height: 1.75; margin-bottom: 1.25rem;
    font-style: italic;
  }

  .lp-t-person { display: flex; align-items: center; gap: 10px; }

  .lp-t-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; color: #fff; flex-shrink: 0;
  }

  .lp-t-name { font-size: 13px; font-weight: 600; color: #111; }
  .lp-t-role { font-size: 11px; color: #999; }

  /* ── BOTTOM CTA ── */
  .lp-bottom-cta { background: #064534; padding: 5.5rem 2.5rem; text-align: center; }

  .lp-bottom-cta h2 {
    font-size: 38px; font-weight: 700; color: #c8ede2;
    margin-bottom: .75rem; letter-spacing: -1px;
  }

  .lp-bottom-cta p { font-size: 15px; color: #7DCBB2; margin-bottom: 2.25rem; }

  .lp-bottom-btn {
    font-size: 15px; font-weight: 600; color: #064534;
    background: #5DCAA5; border: none; border-radius: 14px;
    padding: 15px 38px; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background .15s, transform .1s;
    display: inline-flex; align-items: center; gap: 8px;
    text-decoration: none;
  }

  .lp-bottom-btn:hover { background: #9FE1CB; transform: translateY(-1px); }

  /* ── FOOTER ── */
  .lp-footer {
    background: #042C1E;
    padding: 2rem 2.5rem;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem;
  }

  .lp-footer-left { display: flex; align-items: center; gap: 10px; }
  .lp-footer-name { font-size: 16px; font-weight: 600; color: #5DCAA5; }
  .lp-footer-tagline { font-size: 12px; color: #3d7a62; }
  .lp-footer-copy { font-size: 12px; color: #3d7a62; }

  /* ── RESPONSIVE ── */
  @media (max-width: 960px) {
    .lp-hero { grid-template-columns: 1fr; gap: 3rem; padding: 3.5rem 1.5rem 3rem; }
    .lp-phone-wrap { justify-content: center; }
    .lp-hero h1 { font-size: 40px; }
    .lp-steps { grid-template-columns: 1fr; gap: 1rem; }
    .lp-feat-grid { grid-template-columns: 1fr 1fr; }
    .lp-t-grid { grid-template-columns: 1fr; }
    .lp-stats { gap: 3rem; flex-wrap: wrap; }
    .lp-nav-links { display: none; }
    .lp-section { padding: 3.5rem 1.5rem; }
  }

  @media (max-width: 600px) {
    .lp-nav { padding: .9rem 1.25rem; }
    .lp-feat-grid { grid-template-columns: 1fr; }
    .lp-hero h1 { font-size: 32px; letter-spacing: -1px; }
    .lp-hero-ctas { flex-direction: column; align-items: flex-start; }
    .lp-cta-primary, .lp-cta-secondary { width: 100%; justify-content: center; }
    .lp-stats { gap: 2rem; padding: 2rem 1.25rem; }
    .lp-section-title { font-size: 26px; }
    .lp-bottom-cta h2 { font-size: 28px; }
    .lp-cats { padding: 3rem 1.25rem; }
    .lp-bottom-cta { padding: 3.5rem 1.25rem; }
    .lp-footer { flex-direction: column; align-items: flex-start; padding: 1.5rem 1.25rem; }
    .lp-notif { right: -5px; font-size: 8px; }
  }
`;

const NookMark = () => (
  <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <circle cx="11" cy="8" r="4.5" stroke="white" strokeWidth="2.2"/>
    <circle cx="11" cy="8" r="1.8" fill="white"/>
    <line x1="11" y1="12.5" x2="11" y2="19.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const features = [
  { icon:"ti-map-pin",  bg:"#E1F5EE", color:"#0F6E56", title:"Geo-filtered feed",    desc:"Posts are visible only to people within your chosen radius. Nothing leaks beyond your area." },
  { icon:"ti-bolt",     bg:"#EEEDFE", color:"#534AB7", title:"Real-time updates",    desc:"New posts appear instantly without refreshing. Never miss a nearby alert." },
  { icon:"ti-clock",    bg:"#FAEEDA", color:"#854F0B", title:"Auto-expiry",           desc:"Every post disappears after 7 days. Feed stays fresh — no stale posts from months ago." },
  { icon:"ti-user-off", bg:"#FCEBEB", color:"#791F1F", title:"Anonymous posting",    desc:"Post without your name attached. Good for sensitive topics or neighbourhood concerns." },
  { icon:"ti-map",      bg:"#E1F5EE", color:"#0F6E56", title:"Map view",              desc:"See all nearby posts as pins on a map. Tap any pin for a preview without leaving the map." },
  { icon:"ti-bell",     bg:"#E6F1FB", color:"#185FA5", title:"Live notifications",   desc:"Get notified when someone comments, upvotes your post, or posts a new alert nearby." },
];

const steps = [
  { n:"1", title:"Sign up in 30 seconds",    desc:"Just your email and password. No phone number, no date of birth, nothing unnecessary." },
  { n:"2", title:"Share your location once", desc:"Allow location access and your feed fills with posts from people within 2km of you automatically." },
  { n:"3", title:"See and post instantly",   desc:"Read what's near you or post something yourself. Your neighbours see it in real time." },
];

const categories = [
  { color:"#ef4444", label:"Alert"      },
  { color:"#f97316", label:"Lost pet"   },
  { color:"#1D9E75", label:"Free stuff" },
  { color:"#8b5cf6", label:"Event"      },
  { color:"#3b82f6", label:"Question"   },
  { color:"#9FE1CB", label:"General"    },
];

const testimonials = [
  { q:'"Found out about the water outage before the municipality even announced it. This app is actually useful."', name:"Priya S.",  role:"Jodhpur resident",     initials:"P", color:"#1D9E75" },
  { q:'"Posted about my lost cat and had three replies within 10 minutes. She was found by evening."',             name:"Rahul M.", role:"Paota, Jodhpur",       initials:"R", color:"#534AB7" },
  { q:'"Gave away my old sofa and fridge the same day I posted. Way better than any resale group."',              name:"Anjali K.", role:"Sardarpura, Jodhpur", initials:"A", color:"#854F0B" },
];

const posts = [
  { badge:"Alert",    badgeBg:"#FCEBEB", badgeColor:"#791F1F", title:"Water outage on MG Road",     body:"No supply since morning. Anyone else affected?", votes:12, comments:3, dist:"0.3km" },
  { badge:"Lost pet", badgeBg:"#FAEEDA", badgeColor:"#633806", title:"Lost dog near Sardar market", body:"Brown labrador, answers to Bruno. Last seen 8am.", votes:7,  comments:1, dist:"0.8km" },
  { badge:"Free",     badgeBg:"#E1F5EE", badgeColor:"#085041", title:"Free sofa — pickup only",     body:"3-seater, good condition. Moving out today.",      votes:4,  comments:0, dist:"1.2km" },
];

function PhoneMockup() {
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [notifVisible, setNotifVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [currentVotes, setCurrentVotes] = useState([12, 7, 4]);

  useEffect(() => {
    // Stagger post slide-ins
    posts.forEach((_, i) => {
      setTimeout(() => {
        setVisiblePosts(prev => [...prev, i]);
      }, 400 + i * 300);
    });

    // Notification ping after 1.8s
    setTimeout(() => setNotifVisible(true), 1800);
    setTimeout(() => setNotifVisible(false), 4500);

    // Comment toast after 3.5s
    setTimeout(() => setToastVisible(true), 3500);
    setTimeout(() => setToastVisible(false), 6500);

    // Live vote increment loop
    const voteInterval = setInterval(() => {
      setCurrentVotes(prev => {
        const idx = Math.floor(Math.random() * 3);
        const next = [...prev];
        next[idx] = next[idx] + 1;
        return next;
      });
    }, 3000);

    return () => clearInterval(voteInterval);
  }, []);

  return (
    <div className="lp-phone-wrap">
      {/* notification */}
      <div className={`lp-notif${notifVisible ? " visible" : ""}`}>
        <div className="lp-notif-dot"/>
        3 new posts near you
      </div>

      {/* comment toast */}
      <div className={`lp-comment-toast${toastVisible ? " visible" : ""}`}>
        <div className="lp-comment-avatar">R</div>
        <span>Rahul replied to your post</span>
      </div>

      <div className="lp-phone">
        <div className="lp-phone-inner">
          <div className="lp-phone-status"><span>9:41</span><span>Jodhpur</span></div>
          <div className="lp-phone-topbar">
            <i className="ti ti-map-pin" style={{fontSize:12,color:"#1D9E75"}} aria-hidden="true"/>
            <span className="lp-topbar-loc">Paota, Jodhpur · 2km</span>
            <div className="lp-topbar-bell">
              <i className="ti ti-bell" style={{fontSize:12,color:"#1D9E75"}} aria-hidden="true"/>
              <div className="lp-bell-badge"/>
            </div>
          </div>
          <div className="lp-phone-filters">
            {["All","Alert","Lost","Free","Event"].map((f,i) => (
              <div key={f} className={`lp-filter${i===0?" on":""}`}>{f}</div>
            ))}
          </div>
          <div className="lp-phone-feed">
            {posts.map((p, i) => (
              <div key={p.title} className={`lp-post${visiblePosts.includes(i)?" visible":""}`}
                style={{transitionDelay:`${i*0.05}s`}}>
                <div className="lp-post-badge" style={{background:p.badgeBg,color:p.badgeColor}}>
                  {p.badge}
                </div>
                <div className="lp-post-title">{p.title}</div>
                <div className="lp-post-body">{p.body}</div>
                <div className="lp-post-foot">
                  <span style={{color:"#1D9E75",fontWeight:600}}>↑ {currentVotes[i]}</span>
                  <span>·</span>
                  <span>{p.comments} comments</span>
                  <span>·</span>
                  <span>{p.dist}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="lp-phone-tabbar">
            {[{icon:"ti-list",label:"Feed",on:true},{icon:"ti-map",label:"Map"},{icon:"ti-user",label:"Me"}].map(t => (
              <div key={t.label} className={`lp-tab${t.on?" on":""}`}>
                <i className={`ti ${t.icon}`} aria-hidden="true"/>
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lp-phone-fab">
        <i className="ti ti-plus" style={{fontSize:15,color:"#fff"}} aria-hidden="true"/>
      </div>
    </div>
  );
}

export default function Landing() {
  const howRef  = useRef(null);
  const featRef = useRef(null);
  const catRef  = useRef(null);
  const navRef  = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior:"smooth", block:"start" });

  useEffect(() => {
    document.title = "Nook — Your neighbourhood feed";
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle("scrolled", window.scrollY > 10);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="lp">

        {/* NAV */}
        <nav className="lp-nav" ref={navRef}>
          <a href="/" className="lp-nav-logo">
            <div className="lp-mark"><NookMark /></div>
            <span className="lp-nav-name">nook</span>
          </a>
          <div className="lp-nav-links">
            <button className="lp-nav-link" onClick={() => scrollTo(howRef)}>How it works</button>
            <button className="lp-nav-link" onClick={() => scrollTo(featRef)}>Features</button>
            <button className="lp-nav-link" onClick={() => scrollTo(catRef)}>Categories</button>
          </div>
          <div className="lp-nav-btns">
            <a href="/login"  className="lp-btn-ghost">Sign in</a>
            <a href="/signup" className="lp-btn-solid">Get started</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div>
            <div className="lp-hero-badge">
              <div className="lp-badge-dot"/>
              Posts only visible within 2km
            </div>
            <h1>Your street<br />has a <span>story.</span></h1>
            <p className="lp-hero-sub">
              Real posts from real neighbours. Alerts, lost pets, free stuff, local events — everything your area is talking about, visible only to people nearby.
            </p>
            <div className="lp-hero-ctas">
              <a href="/signup" className="lp-cta-primary">
                Join Nook
                <i className="ti ti-arrow-right" aria-hidden="true"/>
              </a>
              <button className="lp-cta-secondary" onClick={() => scrollTo(howRef)}>
                How it works
              </button>
            </div>
            <div className="lp-hero-note">
              <span>Free forever</span>
              <span className="lp-note-sep">·</span>
              <span>No ads</span>
              <span className="lp-note-sep">·</span>
              <span>Posts expire in 7 days</span>
            </div>
          </div>

          <PhoneMockup />
        </section>

        {/* STATS */}
        <div className="lp-stats">
          {[["2km","Visible radius"],["7 days","Auto-expiry"],["0 ads","Always free"],["Live","Real-time feed"]].map(([n,l]) => (
            <div className="lp-stat" key={l}>
              <span className="lp-stat-num">{n}</span>
              <span className="lp-stat-label">{l}</span>
            </div>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <section className="lp-section" ref={howRef}>
          <div className="lp-tag">How it works</div>
          <div className="lp-section-title">Three steps to your neighbourhood</div>
          <div className="lp-steps">
            {steps.map(s => (
              <div className="lp-step" key={s.n}>
                <div className="lp-step-num">{s.n}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="lp-section" style={{paddingTop:0}} ref={featRef}>
          <div className="lp-tag">Features</div>
          <div className="lp-section-title">Built for your neighbourhood</div>
          <div className="lp-feat-grid">
            {features.map(f => (
              <div className="lp-feat" key={f.title}>
                <div className="lp-feat-icon" style={{background:f.bg}}>
                  <i className={`ti ${f.icon}`} style={{color:f.color}} aria-hidden="true"/>
                </div>
                <div className="lp-feat-title">{f.title}</div>
                <div className="lp-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="lp-cats" ref={catRef}>
          <div className="lp-cats-title">Everything your neighbourhood needs</div>
          <div className="lp-cats-sub">Six categories covering every kind of local post</div>
          <div className="lp-cat-pills">
            {categories.map(c => (
              <div className="lp-cat" key={c.label}>
                <div className="lp-cat-dot" style={{background:c.color}}/>
                {c.label}
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="lp-section">
          <div className="lp-tag">What people say</div>
          <div className="lp-section-title">Neighbours who use Nook</div>
          <div className="lp-t-grid">
            {testimonials.map(t => (
              <div className="lp-t-card" key={t.name}>
                <div className="lp-t-stars">{[...Array(5)].map((_,i) => <StarIcon key={i}/>)}</div>
                <div className="lp-t-quote">{t.q}</div>
                <div className="lp-t-person">
                  <div className="lp-t-avatar" style={{background:t.color}}>{t.initials}</div>
                  <div>
                    <div className="lp-t-name">{t.name}</div>
                    <div className="lp-t-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="lp-bottom-cta">
          <h2>Ready to meet your neighbourhood?</h2>
          <p>Join for free. See what's happening near you in under a minute.</p>
          <a href="/signup" className="lp-bottom-btn">
            Join Nook — it's free
            <i className="ti ti-arrow-right" aria-hidden="true"/>
          </a>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div className="lp-footer-left">
            <div className="lp-mark"><NookMark /></div>
            <div>
              <div className="lp-footer-name">nook</div>
              <div className="lp-footer-tagline">Your neighbourhood, your feed</div>
            </div>
          </div>
          <div className="lp-footer-copy">© 2025 Nook · All rights reserved</div>
        </footer>

      </div>
    </>
  );
}