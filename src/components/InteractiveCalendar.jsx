import { useState, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Indian National & Major Festivals (fixed dates)
const INDIAN_HOLIDAYS = {
  "1-1":  "🎆 New Year's Day",
  "1-14": "🪁 Makar Sankranti",
  "1-26": "🇮🇳 Republic Day",
  "2-14": "💝 Valentine's Day",
  "3-8":  "👩 International Women's Day",
  "3-25": "🎨 Holi",
  "4-6":  "🌸 Ram Navami",
  "4-14": "📿 Ambedkar Jayanti",
  "4-14": "🌾 Baisakhi",
  "5-1":  "✊ Labour Day",
  "6-21": "🧘 International Yoga Day",
  "8-15": "🇮🇳 Independence Day",
  "8-19": "🐘 Ganesh Chaturthi",
  "8-26": "💛 Janmashtami",
  "9-2":  "🪔 Onam",
  "10-2": "🕊️ Gandhi Jayanti",
  "10-2": "🙏 Dussehra",
  "10-20":"🪔 Diwali",
  "10-21":"🎉 Govardhan Puja",
  "10-23":"🎊 Bhai Dooj",
  "11-1": "🕯️ Diwali",
  "11-5": "🎊 Bhai Dooj",
  "11-15":"🌟 Guru Nanak Jayanti",
  "12-25":"🎄 Christmas",
  "12-31":"🥂 New Year's Eve",
};

// Per-month hero gradient + accent color
const MONTH_HERO = [
  { hero:"linear-gradient(160deg,#0d1b2a 0%,#1b4332 50%,#2d6a4f 100%)", accent:"#52b788", emoji:"❄️",  label:"Naye saal ki shuruat" },
  { hero:"linear-gradient(160deg,#1a0a1e 0%,#6b2737 50%,#9d4e6e 100%)", accent:"#e07a9a", emoji:"🌹",  label:"Pyaar ka mahina" },
  { hero:"linear-gradient(160deg,#1a1000 0%,#5c3000 50%,#9e5a00 100%)", accent:"#f4a44a", emoji:"🎨",  label:"Rang aur khushi" },
  { hero:"linear-gradient(160deg,#0d2818 0%,#1a5c3a 50%,#2a8c5a 100%)", accent:"#4cc38a", emoji:"🌸",  label:"Bahaar ka mausam" },
  { hero:"linear-gradient(160deg,#0a1a0a 0%,#1a4a1a 50%,#2d7a2d 100%)", accent:"#6abf6a", emoji:"🌺",  label:"Garmi ki shuruaat" },
  { hero:"linear-gradient(160deg,#1a0a00 0%,#4a2000 50%,#8a4000 100%)", accent:"#ffb347", emoji:"☀️",  label:"Yoga aur tyohar" },
  { hero:"linear-gradient(160deg,#001428 0%,#003a6e 50%,#0060b0 100%)", accent:"#4da8e8", emoji:"🌧️",  label:"Barish ki boondein" },
  { hero:"linear-gradient(160deg,#0d1b2a 0%,#1a3040 50%,#2a4860 100%)", accent:"#74b3e0", emoji:"🇮🇳",  label:"Azaadi ka jazba" },
  { hero:"linear-gradient(160deg,#1a0800 0%,#4a2800 50%,#7a5000 100%)", accent:"#e89040", emoji:"🐘",  label:"Utsav ka mahina" },
  { hero:"linear-gradient(160deg,#140800 0%,#3d1e00 50%,#6b3800 100%)", accent:"#ffcc66", emoji:"🪔",  label:"Diwali ki roshni" },
  { hero:"linear-gradient(160deg,#0a0a14 0%,#1a1a2e 50%,#2a2a4a 100%)", accent:"#8888cc", emoji:"🌾",  label:"Faslon ka sehra" },
  { hero:"linear-gradient(160deg,#050e1a 0%,#0a2040 50%,#0e3060 100%)", accent:"#5a9fd4", emoji:"⛄",  label:"Tyoharon ki raat" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDays(y, m)  { return new Date(y, m + 1, 0).getDate(); }
function getFirst(y, m) { return new Date(y, m, 1).getDay(); }

function isSame(a, b) {
  return a && b && a.y === b.y && a.m === b.m && a.d === b.d;
}
function inBetween(day, s, e) {
  if (!s || !e) return false;
  const d = new Date(day.y, day.m, day.d);
  const a = new Date(s.y, s.m, s.d);
  const b = new Date(e.y, e.m, e.d);
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return d > lo && d < hi;
}
function daysBetween(s, e) {
  if (!s || !e) return 0;
  return (
    Math.abs(
      (new Date(e.y, e.m, e.d) - new Date(s.y, s.m, s.d)) / 86400000
    ) + 1
  );
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────

const DARK = {
  bg:          "#0a0a0f",
  card:        "#111118",
  right:       "#0e0e16",
  border:      "rgba(255,255,255,0.07)",
  text:        "rgba(255,255,255,0.78)",
  muted:       "rgba(255,255,255,0.30)",
  dim:         "rgba(255,255,255,0.10)",
  statBg:      "rgba(255,255,255,0.03)",
  noteBg:      "rgba(255,255,255,0.025)",
  tareaeBg:    "rgba(255,255,255,0.03)",
  heroFade:    "#111118",
  shadow:      "0 40px 80px rgba(0,0,0,0.7)",
};

const LIGHT = {
  bg:          "#f0f0f5",
  card:        "#ffffff",
  right:       "#f7f7fc",
  border:      "rgba(0,0,0,0.08)",
  text:        "rgba(0,0,0,0.78)",
  muted:       "rgba(0,0,0,0.38)",
  dim:         "rgba(0,0,0,0.12)",
  statBg:      "rgba(0,0,0,0.03)",
  noteBg:      "rgba(0,0,0,0.025)",
  tareaeBg:    "rgba(0,0,0,0.03)",
  heroFade:    "#ffffff",
  shadow:      "0 20px 60px rgba(0,0,0,0.15)",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function InteractiveCalendar() {
  const today = new Date();

  const [year,       setYear]       = useState(today.getFullYear());
  const [month,      setMonth]      = useState(today.getMonth());
  const [isDark,     setIsDark]     = useState(true);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd,   setRangeEnd]   = useState(null);
  const [hover,      setHover]      = useState(null);
  const [noteText,   setNoteText]   = useState("");
  const [notes,      setNotes]      = useState(() => {
    try { return JSON.parse(localStorage.getItem("ical_notes") || "[]"); }
    catch { return []; }
  });
  const [sliding,    setSliding]    = useState(false);
  const [slideDir,   setSlideDir]   = useState(1);

  // Persist
  useEffect(() => { localStorage.setItem("ical_notes", JSON.stringify(notes)); }, [notes]);
  useEffect(() => {
    const saved = localStorage.getItem("ical_dark");
    if (saved !== null) setIsDark(saved === "true");
  }, []);
  useEffect(() => { localStorage.setItem("ical_dark", isDark); }, [isDark]);

  const TH = isDark ? DARK : LIGHT;
  const MH = MONTH_HERO[month];
  const accent = MH.accent;

  // Month navigation with slide animation
  const changeMonth = useCallback((dir) => {
    setSlideDir(dir);
    setSliding(true);
    setTimeout(() => {
      if (dir === 1) {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
      } else {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
      }
      setSliding(false);
    }, 220);
  }, [month]);

  // Build 42-cell grid
  const daysInMonth = getDays(year, month);
  const firstDay    = getFirst(year, month);
  const prevDays    = getDays(year, month === 0 ? 11 : month - 1);
  const cells = [];
  for (let i = 0; i < firstDay; i++)
    cells.push({ d: prevDays - firstDay + i + 1, type: "prev" });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ d, type: "cur" });
  const rem = 42 - cells.length;
  for (let i = 1; i <= rem; i++)
    cells.push({ d: i, type: "next" });

  // Range selection
  const handleDay = useCallback((cell) => {
    if (cell.type !== "cur") return;
    const d = { y: year, m: month, d: cell.d };
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(d); setRangeEnd(null);
    } else {
      const s  = new Date(rangeStart.y, rangeStart.m, rangeStart.d);
      const en = new Date(d.y, d.m, d.d);
      if (s <= en) setRangeEnd(d);
      else { setRangeStart(d); setRangeEnd(rangeStart); }
    }
  }, [rangeStart, rangeEnd, year, month]);

  const effEnd     = rangeStart && !rangeEnd ? hover : rangeEnd;
  const monthNotes = notes.filter(n => n.month === month && n.year === year);
  const totalDays  = rangeStart && rangeEnd ? daysBetween(rangeStart, rangeEnd) : null;
  const progressPct =
    today.getMonth() === month && today.getFullYear() === year
      ? (today.getDate() / daysInMonth) * 100
      : month < today.getMonth() && year <= today.getFullYear() ? 100 : 0;

  const saveNote = () => {
    if (!noteText.trim()) return;
    const label = rangeStart
      ? rangeEnd
        ? `${rangeStart.d}–${rangeEnd.d} ${MONTH_NAMES[month].slice(0, 3)}`
        : `${rangeStart.d} ${MONTH_NAMES[month].slice(0, 3)}`
      : MONTH_NAMES[month];
    setNotes(n =>
      [{ id: Date.now(), label, text: noteText.trim(), month, year }, ...n].slice(0, 50)
    );
    setNoteText("");
  };

  // ─── CSS (theme-aware, generated per render) ────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Sora:wght@300;400;600;700&family=Playfair+Display:ital,wght@1,400;1,700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${TH.bg}; font-family: 'Inter', sans-serif; min-height: 100vh; transition: background 0.4s; }

    .page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 24px 16px;
      background: ${TH.bg};
      transition: background 0.4s;
    }

    /* ── CARD ── */
    .card {
      width: 100%; max-width: 860px;
      background: ${TH.card};
      border-radius: 20px;
      border: 1px solid ${TH.border};
      overflow: hidden;
      box-shadow: ${TH.shadow};
      position: relative;
      transition: background 0.4s, border-color 0.4s, box-shadow 0.4s;
    }
    .card::before {
      content: '';
      position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
      background: linear-gradient(90deg, transparent, ${accent}60, transparent);
      z-index: 5; transition: background 0.6s;
    }

    /* ── HERO ── */
    .hero {
      position: relative; height: 200px;
      background: ${MH.hero};
      overflow: hidden;
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 24px 28px 0;
      transition: background 0.6s;
    }
    .hero::before {
      content: '';
      position: absolute; top: -60px; right: -40px;
      width: 260px; height: 260px; border-radius: 50%;
      background: ${accent}25; filter: blur(70px);
      pointer-events: none; transition: background 0.6s;
    }
    .hero::after {
      content: '';
      position: absolute; bottom: 0; left: 0; right: 0; height: 80px;
      background: linear-gradient(to bottom, transparent, ${TH.heroFade});
      pointer-events: none; transition: background 0.4s;
    }

    .hero-pill {
      display: inline-flex; align-items: center; gap: 6px;
      font-family: 'Sora', sans-serif;
      font-size: 11px; font-weight: 400; letter-spacing: 2px;
      color: rgba(255,255,255,0.55);
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      padding: 5px 14px; border-radius: 20px;
      backdrop-filter: blur(8px);
      margin-bottom: 10px; width: fit-content;
    }
    .hero-month {
      font-family: 'Playfair Display', serif;
      font-style: italic; font-weight: 700;
      font-size: 58px; line-height: 1; color: #fff;
      letter-spacing: -2px; position: relative; z-index: 1;
      text-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .hero-sub {
      font-size: 12px; font-weight: 300;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0.8px; margin-top: 7px;
      position: relative; z-index: 1;
      padding-bottom: 22px;
    }

    .prog { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.08); z-index: 2; }
    .prog-fill {
      height: 100%; background: ${accent};
      box-shadow: 0 0 8px ${accent}80;
      transition: width 1s ease, background 0.6s;
      border-radius: 0 2px 2px 0;
    }

    /* ── NAV ── */
    .nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 13px 20px;
      border-bottom: 1px solid ${TH.border};
      transition: border-color 0.4s;
    }
    .nav-left { display: flex; gap: 6px; }

    .nav-btn {
      width: 34px; height: 34px; border-radius: 10px;
      border: 1px solid ${TH.border};
      background: ${TH.statBg};
      color: ${TH.muted}; font-size: 17px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.18s; font-family: inherit;
    }
    .nav-btn:hover { background: ${accent}20; border-color: ${accent}50; color: ${accent}; }

    .nav-title {
      font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 600;
      color: ${TH.text}; text-align: center; transition: color 0.4s;
    }
    .nav-sub {
      font-size: 10px; color: ${TH.muted}; letter-spacing: 1.5px;
      text-transform: uppercase; text-align: center; margin-top: 1px;
    }

    .nav-right { display: flex; gap: 8px; align-items: center; }

    /* Dark/Light toggle */
    .theme-toggle {
      width: 56px; height: 28px; border-radius: 14px; cursor: pointer;
      border: 1px solid ${TH.border};
      background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"};
      position: relative; transition: all 0.3s; flex-shrink: 0;
      display: flex; align-items: center; padding: 3px;
    }
    .toggle-knob {
      width: 20px; height: 20px; border-radius: 50%;
      background: ${accent};
      position: absolute;
      left: ${isDark ? "4px" : "32px"};
      transition: left 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.4s;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }

    .today-btn {
      font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 500;
      padding: 7px 14px; border-radius: 20px;
      border: 1px solid ${TH.border}; background: ${TH.statBg};
      color: ${TH.muted}; cursor: pointer; transition: all 0.18s; letter-spacing: 0.3px;
    }
    .today-btn:hover { background: ${accent}20; border-color: ${accent}50; color: ${accent}; }

    /* ── BODY ── */
    .body { display: grid; grid-template-columns: 1fr 290px; }

    /* ── CALENDAR ── */
    .cal-left {
      padding: 14px 16px 18px;
      border-right: 1px solid ${TH.border};
      transition: opacity 0.22s ease, transform 0.22s ease, border-color 0.4s;
      opacity: ${sliding ? 0 : 1};
      transform: ${sliding
        ? (slideDir === 1 ? "translateX(-10px)" : "translateX(10px)")
        : "translateX(0)"};
    }

    .dh-row { display: grid; grid-template-columns: repeat(7,1fr); margin-bottom: 4px; }
    .dh {
      text-align: center; padding: 6px 0;
      font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
      color: ${TH.muted};
    }
    .dh:first-child { color: ${accent}; opacity: 0.9; }

    .grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }

    .dc {
      position: relative; aspect-ratio: 1;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      border-radius: 10px; cursor: pointer; user-select: none;
      transition: all 0.15s;
      animation: fadeUp 0.3s ease backwards;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .dc:hover:not(.ghost) { background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}; transform: scale(1.08); z-index: 2; }
    .ghost { cursor: default; }

    .dn {
      font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 400;
      color: ${TH.text}; line-height: 1; transition: color 0.4s;
    }
    .ghost .dn { color: ${TH.dim}; }
    .is-sun .dn { color: ${accent}; opacity: 0.9; }

    .is-today { background: ${accent}18; }
    .is-today::after {
      content: ''; position: absolute; inset: 2px;
      border: 1.5px solid ${accent}65; border-radius: 8px; pointer-events: none;
    }
    .is-today .dn { color: ${accent}; font-weight: 600; }

    .in-range { background: ${accent}15; border-radius: 0 !important; }
    .in-range:nth-child(7n+1) { border-radius: 10px 0 0 10px !important; }
    .in-range:nth-child(7n)   { border-radius: 0 10px 10px 0 !important; }

    .is-start, .is-end {
      background: ${accent} !important;
      border-radius: 10px !important;
      box-shadow: 0 0 18px ${accent}55 !important;
      transform: scale(1.1) !important; z-index: 3;
    }
    .is-start .dn, .is-end .dn { color: #fff !important; font-weight: 700 !important; }

    .dot-row { display: flex; gap: 2px; margin-top: 2px; }
    .h-dot { width: 3px; height: 3px; border-radius: 50%; background: ${accent}; }
    .n-dot { width: 3px; height: 3px; border-radius: 50%; background: ${TH.muted}; }

    .tip {
      position: absolute; bottom: calc(100% + 7px); left: 50%;
      transform: translateX(-50%);
      background: ${TH.card}; border: 1px solid ${TH.border};
      color: ${TH.text}; font-size: 10px; font-weight: 500;
      padding: 5px 10px; border-radius: 8px; white-space: nowrap;
      pointer-events: none; z-index: 50;
      opacity: 0; transition: opacity 0.12s;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }
    .dc:hover .tip { opacity: 1; }

    /* ── RIGHT PANEL ── */
    .right {
      display: flex; flex-direction: column;
      background: ${TH.right}; transition: background 0.4s;
    }

    .panel-block {
      padding: 18px 18px 14px;
      border-bottom: 1px solid ${TH.border};
      transition: border-color 0.4s;
    }

    .panel-label {
      font-family: 'Sora', sans-serif;
      font-size: 9px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
      color: ${TH.muted}; margin-bottom: 12px;
      display: flex; align-items: center; gap: 8px;
      transition: color 0.4s;
    }
    .panel-label::after { content: ''; flex: 1; height: 1px; background: ${TH.border}; }

    /* Stats */
    .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; }
    .stat {
      background: ${TH.statBg}; border: 1px solid ${TH.border};
      border-radius: 10px; padding: 8px 6px 6px; text-align: center;
      transition: border-color 0.3s, background 0.3s;
    }
    .stat.lit { border-color: ${accent}40; background: ${accent}0c; }
    .stat-n {
      font-family: 'Playfair Display', serif; font-style: italic;
      font-size: 22px; font-weight: 400; color: ${accent};
      line-height: 1; transition: color 0.6s;
    }
    .stat-l {
      font-size: 8px; font-weight: 600; letter-spacing: 0.8px;
      text-transform: uppercase; color: ${TH.muted}; margin-top: 2px;
    }

    /* Range */
    .range-empty {
      text-align: center; padding: 14px 0;
      font-size: 12px; font-weight: 300; font-style: italic;
      color: ${TH.muted};
    }
    .range-empty span { display: block; font-size: 24px; margin-bottom: 6px; }

    .range-box {
      background: ${accent}10; border: 1px solid ${accent}30;
      border-radius: 12px; padding: 12px 14px; margin-bottom: 8px;
      position: relative; overflow: hidden; transition: all 0.5s;
    }
    .range-box::before {
      content: ''; position: absolute; top: -20px; right: -20px;
      width: 80px; height: 80px; border-radius: 50%;
      background: ${accent}18; filter: blur(20px);
    }
    .range-dates {
      font-family: 'Playfair Display', serif; font-style: italic;
      font-size: 18px; font-weight: 700;
      color: ${isDark ? "#fff" : "#111"};
      line-height: 1.2; margin-bottom: 8px;
    }
    .range-chips { display: flex; flex-wrap: wrap; gap: 5px; }
    .chip {
      font-size: 10px; font-weight: 500; padding: 3px 9px; border-radius: 20px;
      background: ${TH.statBg}; border: 1px solid ${TH.border}; color: ${TH.muted};
    }
    .chip.a { background: ${accent}18; border-color: ${accent}40; color: ${accent}; }

    .clr-btn {
      width: 100%; padding: 8px; border-radius: 9px; background: transparent;
      border: 1px solid rgba(255,80,80,0.2); color: rgba(220,80,80,0.55);
      font-family: 'Sora', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer;
      transition: all 0.18s;
    }
    .clr-btn:hover { background: rgba(255,0,0,0.06); border-color: rgba(255,80,80,0.5); color: rgba(220,60,60,0.9); }

    /* Notes */
    .notes-block { flex: 1; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }

    .note-ta {
      width: 100%; resize: none; min-height: 76px;
      background: ${TH.tareaeBg}; border: 1px solid ${TH.border};
      border-radius: 12px; padding: 11px 12px; outline: none;
      font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300;
      color: ${TH.text}; line-height: 1.6;
      caret-color: ${accent};
      transition: border-color 0.2s, box-shadow 0.2s, background 0.4s, color 0.4s;
    }
    .note-ta:focus { border-color: ${accent}50; box-shadow: 0 0 0 3px ${accent}12; }
    .note-ta::placeholder { color: ${TH.muted}; font-style: italic; }

    .save-btn {
      width: 100%; padding: 10px; border-radius: 11px; cursor: pointer;
      background: ${accent}; border: none; color: #fff;
      font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      transition: all 0.18s; box-shadow: 0 4px 16px ${accent}40;
    }
    .save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 22px ${accent}55; }
    .save-btn:disabled { opacity: 0.22; cursor: default; transform: none; box-shadow: none; }

    .notes-list { display: flex; flex-direction: column; gap: 5px; max-height: 150px; overflow-y: auto; }
    .notes-list::-webkit-scrollbar { width: 2px; }
    .notes-list::-webkit-scrollbar-thumb { background: ${TH.border}; border-radius: 2px; }

    .note-item {
      display: flex; gap: 8px; align-items: flex-start;
      background: ${TH.noteBg}; border: 1px solid ${TH.border};
      border-radius: 9px; padding: 8px 9px;
      transition: border-color 0.18s, background 0.4s;
      animation: slideUp 0.25s ease;
    }
    @keyframes slideUp { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
    .note-item:hover { border-color: ${accent}30; }
    .n-led { width: 5px; height: 5px; border-radius: 50%; background: ${accent}; margin-top: 5px; flex-shrink: 0; box-shadow: 0 0 5px ${accent}80; }
    .n-body { flex: 1; min-width: 0; }
    .n-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${accent}; opacity: 0.85; margin-bottom: 2px; }
    .n-txt { font-size: 12px; font-weight: 300; color: ${TH.text}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .n-del { background: transparent; border: none; color: ${TH.muted}; cursor: pointer; font-size: 16px; line-height: 1; transition: color 0.15s; padding: 0; }
    .n-del:hover { color: rgba(220,60,60,0.8); }

    /* ── FOOTER ── */
    .footer {
      border-top: 1px solid ${TH.border}; padding: 10px 22px;
      display: flex; align-items: center; justify-content: space-between;
      background: ${TH.statBg}; transition: all 0.4s;
    }
    .f-date { font-size: 10px; font-weight: 300; color: ${TH.muted}; letter-spacing: 0.3px; }
    .legend { display: flex; gap: 14px; align-items: center; }
    .leg { display: flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: ${TH.muted}; }
    .lb { width: 9px; height: 9px; border-radius: 3px; }

    /* ── RESPONSIVE ── */
    @media (max-width: 640px) {
      .body { grid-template-columns: 1fr; }
      .cal-left { border-right: none; border-bottom: 1px solid ${TH.border}; }
      .hero-month { font-size: 40px; }
      .hero { height: 170px; }
      .legend { display: none; }
    }
  `;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="page">
        <div className="card">

          {/* HERO */}
          <div className="hero">
            <div className="hero-pill">{MH.emoji} &nbsp;{year}</div>
            <div className="hero-month">{MONTH_NAMES[month]}</div>
            <div className="hero-sub">{MH.label}</div>
            <div className="prog">
              <div className="prog-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* NAV */}
          <div className="nav">
            <div className="nav-left">
              <button className="nav-btn" onClick={() => changeMonth(-1)}>‹</button>
              <button className="nav-btn" onClick={() => changeMonth(1)}>›</button>
            </div>

            <div style={{ textAlign: "center" }}>
              <div className="nav-title">{MONTH_NAMES[month]} {year}</div>
              <div className="nav-sub">Interactive Calendar</div>
            </div>

            <div className="nav-right">
              {/* Dark / Light toggle */}
              <button
                className="theme-toggle"
                onClick={() => setIsDark(d => !d)}
                title={isDark ? "Switch to Light" : "Switch to Dark"}
              >
                <div className="toggle-knob">
                  {isDark ? "🌙" : "☀️"}
                </div>
              </button>
              <button
                className="today-btn"
                onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
              >
                Today
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="body">

            {/* CALENDAR GRID */}
            <div className="cal-left">
              <div className="dh-row">
                {DAY_SHORT.map(d => <div key={d} className="dh">{d}</div>)}
              </div>
              <div className="grid">
                {cells.map((cell, idx) => {
                  const isCur   = cell.type === "cur";
                  const d       = { y: year, m: month, d: cell.d };
                  const isToday = isCur
                    && cell.d === today.getDate()
                    && month   === today.getMonth()
                    && year    === today.getFullYear();
                  const isSun   = idx % 7 === 0;
                  const hKey    = `${month + 1}-${cell.d}`;
                  const holiday = isCur && INDIAN_HOLIDAYS[hKey];
                  const rs      = isSame(d, rangeStart);
                  const re      = isSame(d, effEnd);
                  const inR     = isCur && inBetween(d, rangeStart, effEnd);
                  const hasNote = isCur && monthNotes.some(n =>
                    n.label.startsWith(`${cell.d} `) || n.label.startsWith(`${cell.d}–`)
                  );

                  const cls = [
                    "dc",
                    !isCur        ? "ghost"    : "",
                    isSun && isCur? "is-sun"   : "",
                    isToday       ? "is-today" : "",
                    rs            ? "is-start" : "",
                    re && !rs     ? "is-end"   : "",
                    inR           ? "in-range" : "",
                  ].filter(Boolean).join(" ");

                  return (
                    <div
                      key={idx}
                      className={cls}
                      style={{ animationDelay: `${idx * 6}ms` }}
                      onClick={() => handleDay(cell)}
                      onMouseEnter={() => isCur && setHover(d)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <span className="dn">{cell.d}</span>
                      {(holiday || hasNote) && (
                        <div className="dot-row">
                          {holiday  && <span className="h-dot" />}
                          {hasNote  && <span className="n-dot" />}
                        </div>
                      )}
                      {holiday && <span className="tip">{holiday}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="right">

              {/* Overview stats */}
              <div className="panel-block">
                <div className="panel-label">Overview</div>
                <div className="stats">
                  <div className={`stat${rangeStart ? " lit" : ""}`}>
                    <div className="stat-n">{daysInMonth}</div>
                    <div className="stat-l">Days</div>
                  </div>
                  <div className={`stat${totalDays ? " lit" : ""}`}>
                    <div className="stat-n">{totalDays || "—"}</div>
                    <div className="stat-l">Sel.</div>
                  </div>
                  <div className="stat">
                    <div className="stat-n">{monthNotes.length}</div>
                    <div className="stat-l">Notes</div>
                  </div>
                  <div className="stat">
                    <div className="stat-n">
                      {today.getMonth() === month && today.getFullYear() === year
                        ? daysInMonth - today.getDate()
                        : "—"}
                    </div>
                    <div className="stat-l">Left</div>
                  </div>
                </div>
              </div>

              {/* Range selection */}
              <div className="panel-block">
                <div className="panel-label">Selected range</div>
                {!rangeStart ? (
                  <div className="range-empty">
                    <span>📅</span>Click a start date
                  </div>
                ) : (
                  <>
                    <div className="range-box">
                      <div className="range-dates">
                        {rangeEnd
                          ? `${MONTH_NAMES[month].slice(0, 3)} ${rangeStart.d} – ${rangeEnd.d}`
                          : `${MONTH_NAMES[month]} ${rangeStart.d} →`}
                      </div>
                      <div className="range-chips">
                        {totalDays && (
                          <span className="chip a">
                            📅 {totalDays} day{totalDays > 1 ? "s" : ""}
                          </span>
                        )}
                        <span className="chip">{MONTH_NAMES[month]} {year}</span>
                      </div>
                    </div>
                    <button
                      className="clr-btn"
                      onClick={() => { setRangeStart(null); setRangeEnd(null); }}
                    >
                      ✕ &nbsp;Clear range
                    </button>
                  </>
                )}
              </div>

              {/* Notes */}
              <div className="notes-block">
                <div className="panel-label">Notes for selection</div>
                <textarea
                  className="note-ta"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note for this date or range…"
                  onKeyDown={e => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveNote();
                  }}
                  rows={3}
                />
                <button className="save-btn" onClick={saveNote} disabled={!noteText.trim()}>
                  Save note
                </button>

                {monthNotes.length > 0 && (
                  <div className="notes-list">
                    {monthNotes.map(n => (
                      <div key={n.id} className="note-item">
                        <div className="n-led" />
                        <div className="n-body">
                          <div className="n-lbl">{n.label}</div>
                          <div className="n-txt">{n.text}</div>
                        </div>
                        <button
                          className="n-del"
                          onClick={() => setNotes(ns => ns.filter(x => x.id !== n.id))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="footer">
            <span className="f-date">
              {today.toLocaleDateString("en-IN", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
            </span>
            <div className="legend">
              <div className="leg">
                <div className="lb" style={{ background: accent }} />
                Selected
              </div>
              <div className="leg">
                <div className="lb" style={{ background: `${accent}20`, border: `1px solid ${accent}35` }} />
                Range
              </div>
              <div className="leg">
                <div className="lb" style={{ background: "transparent", border: `1.5px solid ${accent}60` }} />
                Today
              </div>
              <div className="leg">
                <div className="lb" style={{ background: accent, borderRadius: "50%", width: 7, height: 7 }} />
                Holiday
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
