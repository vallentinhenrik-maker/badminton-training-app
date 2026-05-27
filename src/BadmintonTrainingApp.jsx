import { useState, useEffect } from "react";

// === SUPABASE CONFIG ===
var SUPABASE_URL = "https://amrsbdvlgblgsmluruxt.supabase.co";
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcnNiZHZsZ2JsZ3NtbHVydXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTMxODksImV4cCI6MjA5MTQ2OTE4OX0.7CAFY-ePGEmeXhILk15ZLt7dCgbdsWvyJm-8HQBGENA";

async function dbLoad(userId) {
  try {
    var res = await fetch(SUPABASE_URL + "/rest/v1/user_data?user_id=eq." + encodeURIComponent(userId) + "&select=*", {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
    });
    var data = await res.json();
    if (data && data.length > 0) return data[0];
    await fetch(SUPABASE_URL + "/rest/v1/user_data", {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ user_id: userId })
    });
    return null;
  } catch (e) { console.error(e); return null; }
}

async function dbSave(userId, fields) {
  try {
    var body = Object.assign({}, fields, { updated_at: new Date().toISOString() });
    await fetch(SUPABASE_URL + "/rest/v1/user_data?user_id=eq." + encodeURIComponent(userId), {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(body)
    });
  } catch (e) { console.error(e); }
}

// === CONSTANTS ===
var DAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
var TRAINING_TYPES = ["Teknik", "Fys", "Enbollsövningar", "Matchspel", "Multi", "Flackt spel", "Teori", "Blandat"];
var WELLNESS_LABELS = ["Sömn", "Muskeltrötthet", "Motivation", "Energi"];
var MATCH_TYPES = ["Singel", "Dubbel", "Mixed"];

var DEFAULT_WEEK = [
  { day: "Mån", sessions: [{ id: "mon1", type: "gym", label: "Gym (skola)", time: "16:40-17:00" }, { id: "mon2", type: "badminton", label: "Klubb", time: "18:30-20:00" }] },
  { day: "Tis", sessions: [{ id: "tue1", type: "badminton", label: "Klubb", time: "18:30-20:00" }] },
  { day: "Ons", sessions: [{ id: "wed1", type: "badminton", label: "Skola", time: "07:15-09:00" }, { id: "wed2", type: "badminton", label: "Klubb", time: "18:30-20:00" }] },
  { day: "Tor", sessions: [{ id: "thu1", type: "gym", label: "Extra gym", time: "14:20" }, { id: "thu2", type: "badminton", label: "Klubb", time: "19:30-21:00" }] },
  { day: "Fre", sessions: [{ id: "fri1", type: "badminton", label: "Skola", time: "07:15-09:00" }] },
  { day: "Lör", sessions: [{ id: "sat1", type: "rest", label: "Vila / Tävling", time: "" }] },
  { day: "Sön", sessions: [{ id: "sun1", type: "rest", label: "Vila / Tävling", time: "" }] },
];

var GYM_EXERCISES = [
  { id: 1, name: "Knäböj", category: "Ben", sets: 4, reps: "6-8", targetMuscle: "Explosivitet" },
  { id: 2, name: "Utfall med hopp", category: "Ben", sets: 3, reps: "8/ben", targetMuscle: "Explosivitet" },
  { id: 3, name: "Bänkpress", category: "Överkropp", sets: 4, reps: "8-10", targetMuscle: "Bröst/axlar" },
  { id: 4, name: "Axelrotation (extern)", category: "Axelstabilitet", sets: 3, reps: "12-15", targetMuscle: "Rotatorkuff" },
  { id: 5, name: "Face pulls", category: "Axelstabilitet", sets: 3, reps: "15", targetMuscle: "Bakre axel" },
  { id: 6, name: "Pallof press", category: "Core", sets: 3, reps: "10/sida", targetMuscle: "Anti-rotation" },
  { id: 7, name: "Marklyft (rumänsk)", category: "Ben", sets: 4, reps: "8-10", targetMuscle: "Posterior kedja" },
  { id: 8, name: "Planka variationer", category: "Core", sets: 3, reps: "30-45s", targetMuscle: "Stabilitet" },
  { id: 9, name: "Enbensstående rodd", category: "Rygg", sets: 3, reps: "10/sida", targetMuscle: "Balans + rygg" },
  { id: 10, name: "Box jumps", category: "Plyometri", sets: 4, reps: "5", targetMuscle: "Explosivitet" },
  { id: 11, name: "Pullups", category: "Överkropp", sets: 4, reps: "Max", targetMuscle: "Rygg/biceps" },
  { id: 12, name: "Armhävningar", category: "Överkropp", sets: 3, reps: "Max", targetMuscle: "Bröst/triceps" },
  { id: 13, name: "Nordic hamstrings", category: "Ben", sets: 3, reps: "5-8", targetMuscle: "Hamstrings (excentriskt)" },
];

var DEFAULT_COMPETITIONS = [
  { date: "2026-04-11", name: "Seriespel (hemma)", type: "series" },
  { date: "2026-04-25", name: "RSL Tävling", type: "tournament" },
  { date: "2026-05-09", name: "Seriespel (borta)", type: "series" },
  { date: "2026-05-23", name: "Distriktsmästerskap", type: "tournament" },
  { date: "2026-06-06", name: "USM", type: "tournament" },
];

// === DESIGN TOKENS ===
var C = {
  bg: "#121218", bgCard: "#1c1c26", bgCardHover: "#22222e", bgElevated: "#252530", bgInput: "#1a1a24",
  border: "rgba(255,255,255,0.07)", borderLight: "rgba(255,255,255,0.04)",
  text: "#f0f0f5", textSecondary: "#a0a0b0", textMuted: "#6a6a7a", textDim: "#4a4a58",
  accent: "#f5b731", accentDim: "rgba(245,183,49,0.12)",
  green: "#34d399", greenDim: "rgba(52,211,153,0.12)", greenBorder: "rgba(52,211,153,0.25)",
  red: "#f87171", redDim: "rgba(248,113,113,0.10)", redBorder: "rgba(248,113,113,0.25)",
  blue: "#60a5fa", blueDim: "rgba(96,165,250,0.12)",
  purple: "#a78bfa", purpleDim: "rgba(167,139,250,0.12)",
  yellow: "#fbbf24", yellowDim: "rgba(251,191,36,0.12)",
};
var font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif";
var R = { sm: "8px", md: "12px", lg: "16px", xl: "20px" };

// === HELPERS ===
function getWeekNumber(d) { d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); var ys = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); return Math.ceil(((d - ys) / 86400000 + 1) / 7); }
function getWeekId(d) { return d.getFullYear() + "-W" + String(getWeekNumber(d)).padStart(2, "0"); }
function getTodayStr() { return new Date().toISOString().split("T")[0]; }
function getDayIndex() { var d = new Date().getDay(); return d === 0 ? 6 : d - 1; }
function getNextCompetition(comps) { var t = new Date(); t.setHours(0,0,0,0); return comps.find(function(c) { return new Date(c.date) >= t; }); }
function daysUntil(ds) { var t = new Date(); t.setHours(0,0,0,0); return Math.ceil((new Date(ds) - t) / 86400000); }
function genId() { return Math.random().toString(36).substr(2, 9); }

// === STYLES ===
var inputStyle = { width: "100%", padding: "12px 14px", borderRadius: R.md, border: "1px solid " + C.border, background: C.bgInput, color: C.text, fontSize: "15px", fontFamily: font, boxSizing: "border-box", outline: "none" };
function chipStyle(active, color) { color = color || C.accent; return { padding: "8px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, fontFamily: font, background: active ? color + "20" : C.bgElevated, color: active ? color : C.textMuted, transition: "all 0.2s ease" }; }
function ratingBtnStyle(active, v) { var c = v <= 2 ? C.red : v <= 3 ? C.yellow : C.green; return { flex: 1, height: "40px", borderRadius: R.md, border: "none", cursor: "pointer", fontSize: "15px", fontWeight: 600, fontFamily: font, background: active ? c : C.bgElevated, color: active ? "#fff" : C.textDim, transition: "all 0.2s ease" }; }
var cardStyle = { background: C.bgCard, borderRadius: R.lg, padding: "16px", marginBottom: "10px", border: "1px solid " + C.borderLight };
var modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" };
var modalBox = { background: C.bgCard, borderRadius: R.xl, padding: "24px", width: "100%", maxWidth: "380px", maxHeight: "85vh", overflowY: "auto", border: "1px solid " + C.border };
var sectionTitle = { fontSize: "18px", fontWeight: 700, color: C.text, marginBottom: "6px" };
var sectionSub = { fontSize: "13px", color: C.textMuted, marginBottom: "14px" };
var labelStyle = { fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.2px", color: C.textMuted, marginBottom: "8px", fontWeight: 600 };

// === COMPONENTS ===
function LoadBar(p) {
  var pct = Math.min((p.value / p.max) * 100, 100), hi = pct > 85;
  return (<div style={{ marginBottom: "12px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
      <span style={{ fontSize: "13px", color: C.textSecondary, fontWeight: 500 }}>{p.label}</span>
      <span style={{ fontSize: "13px", color: hi ? C.red : C.textSecondary, fontWeight: hi ? 600 : 400 }}>{hi ? "⚠ Hög" : Math.round(pct) + "%"}</span>
    </div>
    <div style={{ height: "8px", background: C.bgElevated, borderRadius: "4px", overflow: "hidden" }}>
      <div style={{ width: pct + "%", height: "100%", background: hi ? C.red : p.color, borderRadius: "4px", transition: "width 0.5s ease" }} />
    </div>
  </div>);
}

function GymLog(p) {
  var cats = []; p.exercises.forEach(function(e) { if (cats.indexOf(e.category) === -1) cats.push(e.category); });
  return (<div>{cats.map(function(cat) {
    return (<div key={cat} style={{ marginBottom: "16px" }}>
      <div style={Object.assign({}, labelStyle, { color: C.accent })}>{cat}</div>
      {p.exercises.filter(function(e) { return e.category === cat; }).map(function(ex) {
        return (<div key={ex.id} onClick={function() { p.setLog(function(prev) { var n = Object.assign({}, prev); n[ex.id] = !n[ex.id]; return n; }); }} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", marginBottom: "6px", borderRadius: R.md,
          background: p.log[ex.id] ? C.greenDim : C.bgElevated, border: p.log[ex.id] ? "1px solid " + C.greenBorder : "1px solid " + C.borderLight, cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "6px", border: p.log[ex.id] ? "none" : "2px solid " + C.textDim, background: p.log[ex.id] ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#fff", flexShrink: 0 }}>{p.log[ex.id] ? "✓" : ""}</div>
            <div><div style={{ fontSize: "14px", color: C.text, fontWeight: 500 }}>{ex.name}</div><div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{ex.sets}×{ex.reps} — {ex.targetMuscle}</div></div>
          </div>
          <div onClick={function(e) { e.stopPropagation(); }}>
            <input type="number" placeholder="kg" value={p.log["w_" + ex.id] || ""} onChange={function(e) { p.setLog(function(prev) { var n = Object.assign({}, prev); n["w_" + ex.id] = e.target.value; return n; }); }}
              style={{ width: "54px", padding: "6px", borderRadius: R.sm, border: "1px solid " + C.border, background: C.bgInput, color: C.text, fontSize: "13px", textAlign: "center", fontFamily: font, outline: "none" }} />
          </div>
        </div>);
      })}
    </div>);
  })}</div>);
}

function StatCard(p) {
  return (<div style={Object.assign({}, cardStyle, { textAlign: "center", padding: "18px 12px" })}>
    <div style={{ fontSize: "28px", fontWeight: 700, color: p.color }}>{p.value}</div>
    <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.2px", color: C.textMuted, marginTop: "6px", fontWeight: 500 }}>{p.label}</div>
  </div>);
}

function InsightCard(p) {
  if (p.type === "dayChart") {
    return (<div style={Object.assign({}, cardStyle, { marginBottom: "12px" })}>
      <div style={Object.assign({}, labelStyle, { marginBottom: "12px" })}>Insats per veckodag</div>
      <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", height: "90px" }}>
        {p.data.map(function(d) { var h = Math.max((d.avg / 5) * 75, 8); return (<div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <div style={{ fontSize: "11px", color: C.textSecondary, fontWeight: 600 }}>{d.avg.toFixed(1)}</div>
          <div style={{ width: "100%", height: h + "px", borderRadius: "4px 4px 0 0", background: d.avg >= 4 ? C.green : d.avg >= 3 ? C.accent : C.red }} />
          <div style={{ fontSize: "10px", color: C.textMuted }}>{d.day}</div>
        </div>); })}
      </div>
    </div>);
  }
  return (<div style={Object.assign({}, cardStyle, { marginBottom: "12px" })}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
      {p.icon && <span style={{ fontSize: "20px" }}>{p.icon}</span>}
      <div style={{ fontSize: "15px", fontWeight: 600, color: C.text }}>{p.title}</div>
    </div>
    <div style={{ fontSize: "14px", color: C.textSecondary, lineHeight: 1.6, marginBottom: "8px" }}>{p.body}</div>
    <div style={{ fontSize: "14px", fontWeight: 600, color: p.color, lineHeight: 1.5 }}>{p.highlight}</div>
  </div>);
}

// === MAIN APP ===
export default function BadmintonTrainingApp() {
  var _u = useState(function() { try { return localStorage.getItem("bta_userId") || ""; } catch(e) { return ""; } }), userId = _u[0], setUserId = _u[1];
  var _li = useState(false), loaded = _li[0], setLoaded = _li[1];
  var _at = useState("week"), activeTab = _at[0], setActiveTab = _at[1];
  var _co = useState(DEFAULT_COMPETITIONS), competitions = _co[0], setCompetitions = _co[1];
  var _wo = useState({}), weekOv = _wo[0], setWeekOv = _wo[1];
  var _tl = useState({}), tLogs = _tl[0], setTLogs = _tl[1];
  var _wl = useState({}), wLogs = _wl[0], setWLogs = _wl[1];
  var _gl = useState({}), gLogs = _gl[0], setGLogs = _gl[1];
  var _ml = useState({}), mLogs = _ml[0], setMLogs = _ml[1];
  var _sac = useState(false), showAddComp = _sac[0], setShowAddComp = _sac[1];
  var _nc = useState({ name: "", date: "", type: "tournament" }), newComp = _nc[0], setNewComp = _nc[1];
  var _sas = useState(false), showAddSess = _sas[0], setShowAddSess = _sas[1];
  var _asd = useState(0), addSessDay = _asd[0], setAddSessDay = _asd[1];
  var _ns = useState({ label: "", time: "", type: "badminton" }), newSess = _ns[0], setNewSess = _ns[1];
  var _ls = useState(null), logSess = _ls[0], setLogSess = _ls[1];
  var _lf = useState({ completed: "yes", trainingType: [], rating: 0, energy: 0, note: "" }), logForm = _lf[0], setLogForm = _lf[1];
  var _sm = useState(null), showMatch = _sm[0], setShowMatch = _sm[1];
  var _mf = useState({ matchType: "Singel", won: null, sets: [{ my: "", opp: "" }, { my: "", opp: "" }, { my: "", opp: "" }], opponent: "" }), matchForm = _mf[0], setMatchForm = _mf[1];
  var _sf = useState("month"), statsFilter = _sf[0], setStatsFilter = _sf[1];
  var _cd = useState({ from: "", to: "" }), customDates = _cd[0], setCustomDates = _cd[1];
  var _st = useState("badminton"), statsTab = _st[0], setStatsTab = _st[1];
  var _ld = useState(getTodayStr()), logDate = _ld[0], setLogDate = _ld[1];
  var _ln = useState(""), loginName = _ln[0], setLoginName = _ln[1];
  var _sy = useState(false), syncing = _sy[0], setSyncing = _sy[1];
  var _vl = useState(null), viewLog = _vl[0], setViewLog = _vl[1];
  var _mp = useState(null), motivMsg = _mp[0], setMotivMsg = _mp[1];

  // --- Motivation ---
  function getStreak() {
    var allLogs = Object.values(tLogs); if (allLogs.length === 0) return 0;
    var dates = {}; allLogs.forEach(function(l) { if (l.completed === "yes" || l.completed === "partial") dates[l.date] = true; });
    var streak = 0, d = new Date(); d.setHours(0,0,0,0);
    if (!dates[d.toISOString().split("T")[0]]) d.setDate(d.getDate() - 1);
    while (streak < 365) {
      var ds = d.toISOString().split("T")[0]; var dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      var hasSess = DEFAULT_WEEK[dayIdx].sessions.some(function(s) { return s.type !== "rest"; });
      if (hasSess) { if (dates[ds]) streak++; else break; }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }
  function getMilestone(n) { var ms = [10,25,50,75,100,150,200,300,500]; for (var i = ms.length-1; i >= 0; i--) { if (n === ms[i]) return ms[i]; } return null; }
  function getMotivMsg(f) {
    var ms;
    if (f.rating >= 4 && f.energy >= 4) ms = ["Otroligt pass! Du var helt on fire 🔥", "Topp-prestanda! Kroppen och viljan levererade 💪", "Starkt jobbat! Både energi och insats på topp ⭐"];
    else if (f.rating >= 4) ms = ["Riktigt bra insats! Du gav allt idag 💪", "Stark mental insats — det bygger mästare 🏆"];
    else if (f.energy >= 4) ms = ["Bra energi idag! Kroppen var redo 💪", "Fint att kroppen mår bra — utnyttja det! ⚡"];
    else if (f.rating >= 3 || f.energy >= 3) ms = ["Bra jobbat! Varje pass räknas 👊", "Solid träning — konsistens slår allt 📈"];
    else if (f.completed === "yes") ms = ["Bra att du genomförde trots att det var tungt 💙", "De tyngsta passen bygger mest mental styrka 🧠"];
    else if (f.completed === "partial") ms = ["Bra att du loggade — att lyssna på kroppen är smart 🧘"];
    else ms = ["Tack för att du loggade. Vila är också träning 💤"];
    return ms[Math.floor(Math.random() * ms.length)];
  }
  function getWeeklySummary() {
    var all = Object.values(tLogs), now = new Date();
    var wS = new Date(now); wS.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); wS.setHours(0,0,0,0);
    var wE = new Date(wS); wE.setDate(wS.getDate() + 7);
    var tw = all.filter(function(l) { var d = new Date(l.date); return d >= wS && d < wE; });
    var lwS = new Date(wS); lwS.setDate(lwS.getDate() - 7);
    var lw = all.filter(function(l) { var d = new Date(l.date); return d >= lwS && d < wS; });
    var twC = tw.filter(function(l) { return l.completed === "yes"; }).length;
    var lwC = lw.filter(function(l) { return l.completed === "yes"; }).length;
    var twR = tw.length > 0 ? tw.reduce(function(s, l) { return s + (l.rating || 0); }, 0) / tw.length : 0;
    return { twC: twC, lwC: lwC, diff: twC - lwC, twR: twR, hasLW: lw.length > 0 };
  }
  var streak = getStreak();
  var totalLogCount = Object.values(tLogs).filter(function(l) { return l.completed === "yes" || l.completed === "partial"; }).length;

  // --- Supabase sync ---
  useEffect(function() {
    if (!userId) { setLoaded(true); return; }
    setLoaded(false);
    dbLoad(userId).then(function(data) {
      if (data) {
        if (data.competitions && data.competitions.length > 0) setCompetitions(data.competitions);
        if (data.week_overrides) setWeekOv(data.week_overrides);
        if (data.training_logs) setTLogs(data.training_logs);
        if (data.wellness_logs) setWLogs(data.wellness_logs);
        if (data.gym_logs) setGLogs(data.gym_logs);
        if (data.match_logs) setMLogs(data.match_logs);
      }
      setLoaded(true);
    });
  }, [userId]);

  useEffect(function() {
    if (!userId || !loaded) return;
    setSyncing(true);
    var t = setTimeout(function() {
      dbSave(userId, { competitions: competitions, week_overrides: weekOv, training_logs: tLogs, wellness_logs: wLogs, gym_logs: gLogs, match_logs: mLogs }).then(function() { setSyncing(false); });
    }, 800);
    return function() { clearTimeout(t); };
  }, [competitions, weekOv, tLogs, wLogs, gLogs, mLogs, userId, loaded]);

  function handleLogin() { if (!loginName.trim()) return; var clean = loginName.trim().toLowerCase().replace(/\s+/g, "_"); try { localStorage.setItem("bta_userId", clean); } catch(e) {} setUserId(clean); }
  function handleLogout() { try { localStorage.removeItem("bta_userId"); } catch(e) {} setUserId(""); setCompetitions(DEFAULT_COMPETITIONS); setWeekOv({}); setTLogs({}); setWLogs({}); setGLogs({}); setMLogs({}); }

  // --- Login screen ---
  if (!userId) {
    return (<div style={{ fontFamily: font, background: C.bg, color: C.text, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "340px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>{"🏸"}</div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Badminton Tracker</div>
          <div style={{ fontSize: "15px", color: C.textMuted }}>Logga träning, matcher & utveckling</div>
        </div>
        <div style={{ fontSize: "13px", color: C.textMuted, marginBottom: "12px", textAlign: "center" }}>Skriv samma namn på alla enheter</div>
        <input type="text" placeholder="Ditt användarnamn" value={loginName} onChange={function(e) { setLoginName(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") handleLogin(); }} style={Object.assign({}, inputStyle, { marginBottom: "14px", textAlign: "center", fontSize: "18px", padding: "16px" })} />
        <button onClick={handleLogin} style={{ width: "100%", padding: "16px", borderRadius: R.lg, border: "none", background: loginName.trim() ? C.accent : C.bgElevated, color: loginName.trim() ? "#000" : C.textDim, fontSize: "16px", fontWeight: 700, cursor: "pointer", fontFamily: font }}>Logga in</button>
      </div>
    </div>);
  }
  if (!loaded) return (<div style={{ fontFamily: font, background: C.bg, color: C.text, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: C.textMuted }}>Laddar...</div></div>);

  // --- Computed values ---
  var today = getTodayStr(), weekId = getWeekId(new Date()), weekNum = getWeekNumber(new Date()), todayIdx = getDayIndex();
  var sortedComps = competitions.slice().sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
  var nextComp = getNextCompetition(sortedComps);
  var daysToComp = nextComp ? daysUntil(nextComp.date) : null;
  var isTaper = daysToComp !== null && daysToComp <= 3;
  var curWeek = DEFAULT_WEEK.map(function(day, i) { var ov = weekOv[weekId + "-" + i]; return ov ? Object.assign({}, day, { sessions: ov }) : day; });
  var actSess = curWeek.reduce(function(s, d) { return s + d.sessions.filter(function(x) { return x.type !== "rest" && !x.cancelled; }).length; }, 0);
  var badCnt = curWeek.reduce(function(s, d) { return s + d.sessions.filter(function(x) { return x.type === "badminton" && !x.cancelled; }).length; }, 0);
  var gymCnt = curWeek.reduce(function(s, d) { return s + d.sessions.filter(function(x) { return x.type === "gym" && !x.cancelled; }).length; }, 0);
  var todayW = wLogs[today] || {};
  var wCnt = WELLNESS_LABELS.filter(function(l) { return todayW[l]; }).length;
  var wAvg = wCnt > 0 ? WELLNESS_LABELS.reduce(function(s, l) { return s + (todayW[l] || 0); }, 0) / wCnt : 0;
  var todayGym = gLogs[today] || {};

  function getDateForDayIndex(dayIdx) { var now = new Date(); var diff = dayIdx - getDayIndex(); var d = new Date(now); d.setDate(now.getDate() + diff); return d.toISOString().split("T")[0]; }
  function getSessionStatus(di, sid) { var dayDate = getDateForDayIndex(di); var key = dayDate + "-" + sid; if (tLogs[key]) return "done"; var dayData = weekOv[weekId + "-" + di] || curWeek[di].sessions; var sess = dayData.find(function(s) { return s.id === sid; }); if (sess && sess.cancelled) return "cancelled"; return "planned"; }
  function setSessStatus(di, sid, status) { var key = weekId + "-" + di; var ss = (weekOv[key] || curWeek[di].sessions).map(function(s) { return s.id === sid ? Object.assign({}, s, { cancelled: status === "cancelled" }) : s; }); setWeekOv(Object.assign({}, weekOv, { [key]: ss })); }
  function removeSess(di, sid) { var key = weekId + "-" + di; var ss = (weekOv[key] || curWeek[di].sessions).filter(function(s) { return s.id !== sid; }); setWeekOv(Object.assign({}, weekOv, { [key]: ss })); var dayDate = getDateForDayIndex(di); var logKey = dayDate + "-" + sid; if (tLogs[logKey]) { var nl = Object.assign({}, tLogs); delete nl[logKey]; setTLogs(nl); } }
  function addSess(di) { if (!newSess.label) return; var key = weekId + "-" + di; var ex = weekOv[key] || curWeek[di].sessions; setWeekOv(Object.assign({}, weekOv, { [key]: ex.concat([Object.assign({}, newSess, { id: genId() })]) })); setNewSess({ label: "", time: "", type: "badminton" }); setShowAddSess(false); }

  function saveTLog() {
    if (!logSess) return;
    var saveDate = logSess._logDate || today, saveWeekId = getWeekId(new Date(saveDate)), key = saveDate + "-" + logSess.id;
    var newTLogs = Object.assign({}, tLogs, { [key]: Object.assign({}, logForm, { sessionId: logSess.id, sessionLabel: logSess.label, sessionType: logSess.type, date: saveDate, weekId: saveWeekId }) });
    setTLogs(newTLogs);
    var msg = getMotivMsg(logForm);
    var newTotal = Object.values(newTLogs).filter(function(l) { return l.completed === "yes" || l.completed === "partial"; }).length;
    var ms = getMilestone(newTotal);
    if (ms) msg = "🎉 " + ms + " loggade pass! " + msg;
    setMotivMsg(msg); setTimeout(function() { setMotivMsg(null); }, 4000);
    setLogSess(null); setLogForm({ completed: "yes", trainingType: [], rating: 0, energy: 0, note: "" });
  }

  function saveMatch() { if (!showMatch) return; setMLogs(Object.assign({}, mLogs, { [genId()]: Object.assign({}, matchForm, { compName: showMatch.name, compType: showMatch.type, compDate: showMatch.date, date: today }) })); setShowMatch(null); setMatchForm({ matchType: "Singel", won: null, sets: [{ my: "", opp: "" }, { my: "", opp: "" }, { my: "", opp: "" }], opponent: "" }); }

  function filterByPeriod(items, dateField) {
    var now = new Date();
    if (statsFilter === "week") { var wStart = new Date(now); wStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); wStart.setHours(0,0,0,0); return items.filter(function(it) { return new Date(it[dateField]) >= wStart; }); }
    if (statsFilter === "month") return items.filter(function(it) { return new Date(it[dateField]) >= new Date(now.getFullYear(), now.getMonth(), 1); });
    if (statsFilter === "year") return items.filter(function(it) { return new Date(it[dateField]) >= new Date(now.getFullYear(), 0, 1); });
    if (statsFilter === "custom" && customDates.from && customDates.to) { var f = new Date(customDates.from), t = new Date(customDates.to); t.setHours(23,59,59); return items.filter(function(it) { var d = new Date(it[dateField]); return d >= f && d <= t; }); }
    return items;
  }

  // Wellness lookup: checks exact date + day before + day after
  function gwfd(date) {
    var w = wLogs[date]; if (w) return w;
    var d = new Date(date);
    var p = new Date(d); p.setDate(d.getDate() - 1);
    var wp = wLogs[p.toISOString().split("T")[0]]; if (wp) return wp;
    var n = new Date(d); n.setDate(d.getDate() + 1);
    return wLogs[n.toISOString().split("T")[0]] || null;
  }

  // Period filter chips component
  function PeriodFilter() {
    return (<div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
        {[{ v: "week", l: "Vecka" }, { v: "month", l: "Månad" }, { v: "year", l: "År" }, { v: "custom", l: "Anpassad" }].map(function(f) { return <button key={f.v} onClick={function() { setStatsFilter(f.v); }} style={chipStyle(statsFilter === f.v)}>{f.l}</button>; })}
      </div>
      {statsFilter === "custom" && (<div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        <input type="date" value={customDates.from} onChange={function(e) { setCustomDates(Object.assign({}, customDates, { from: e.target.value })); }} style={Object.assign({}, inputStyle, { fontSize: "13px" })} />
        <input type="date" value={customDates.to} onChange={function(e) { setCustomDates(Object.assign({}, customDates, { to: e.target.value })); }} style={Object.assign({}, inputStyle, { fontSize: "13px" })} />
      </div>)}
    </div>);
  }

  var tabs = [{ id: "week", label: "Vecka", icon: "📅" }, { id: "log", label: "Logg", icon: "✏️" }, { id: "stats", label: "Statistik", icon: "📊" }, { id: "insights", label: "Insikter", icon: "🧠" }, { id: "calendar", label: "Tävling", icon: "🏸" }];

  return (
    <div style={{ fontFamily: font, background: C.bg, color: C.text, minHeight: "100vh", maxWidth: "600px", width: "100%", margin: "0 auto", position: "relative", paddingBottom: "90px" }}>

      {/* HEADER */}
      <div style={{ padding: "28px 24px 20px", background: "linear-gradient(180deg, #1a1a26 0%, " + C.bg + " 100%)", borderBottom: "1px solid " + C.borderLight }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: C.textMuted, fontWeight: 500 }}>{userId}</span>
              {syncing && <span style={{ fontSize: "11px", color: C.blue }}>{"●"} synkar</span>}
              <button onClick={handleLogout} style={{ padding: "3px 8px", borderRadius: "4px", border: "1px solid " + C.border, background: "transparent", color: C.textMuted, fontSize: "11px", cursor: "pointer", fontFamily: font }}>Logga ut</button>
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, letterSpacing: "-0.5px" }}>Vecka {weekNum}</div>
          </div>
          {nextComp && (<div style={{ background: daysToComp <= 3 ? C.redDim : C.accentDim, border: "1px solid " + (daysToComp <= 3 ? C.redBorder : "rgba(245,183,49,0.25)"), borderRadius: R.md, padding: "8px 12px", maxWidth: "180px" }}>
            <div style={{ fontSize: "10px", color: daysToComp <= 3 ? C.red : C.accent, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>{daysToComp <= 3 ? "Tävling snart!" : "Nästa tävling"}</div>
            <div style={{ fontSize: "13px", color: C.textSecondary, marginTop: "3px" }}>{nextComp.name} — {daysToComp}d</div>
          </div>)}
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
          {[{ l: "Pass", v: actSess, c: C.blue }, { l: "Badminton", v: badCnt, c: C.green }, { l: "Gym", v: gymCnt, c: C.accent }, { l: "Streak", v: streak > 0 ? streak + "🔥" : "0", c: streak >= 5 ? C.accent : streak > 0 ? C.green : C.textDim }, { l: "Kropp", v: wAvg ? wAvg.toFixed(1) : "—", c: wAvg >= 4 ? C.green : wAvg >= 3 ? C.yellow : C.red }].map(function(s) {
            return (<div key={s.l} style={{ flex: 1, textAlign: "center", padding: "10px 0", background: C.bgCard, borderRadius: R.md, border: "1px solid " + C.borderLight }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "1px", color: C.textMuted, marginTop: "4px", fontWeight: 500 }}>{s.l}</div>
            </div>);
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "20px 24px" }}>

        {/* WEEK TAB */}
        {activeTab === "week" && (<div>
          {(function() { var ws = getWeeklySummary(); if (ws.twC === 0 && !ws.hasLW) return null;
            return (<div style={Object.assign({}, cardStyle, { marginBottom: "18px", background: C.bgElevated, border: "1px solid " + C.border })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>Veckoöversikt</div>
                {totalLogCount > 0 && <div style={{ fontSize: "12px", color: C.textMuted }}>{totalLogCount} totalt</div>}
              </div>
              <div style={{ fontSize: "15px", color: C.textSecondary, lineHeight: 1.5 }}>
                {ws.twC > 0 ? (<span><span style={{ color: C.green, fontWeight: 600 }}>{ws.twC} genomförda pass</span> denna vecka{ws.twR > 0 ? <span> med snittinsats <span style={{ color: C.accent, fontWeight: 600 }}>{ws.twR.toFixed(1)}</span></span> : ""}</span>) : (<span style={{ color: C.textMuted }}>Inga loggade pass ännu</span>)}
              </div>
              {ws.hasLW && (<div style={{ fontSize: "13px", marginTop: "6px", color: ws.diff > 0 ? C.green : ws.diff < 0 ? C.red : C.textMuted }}>
                {ws.diff > 0 ? "↑ " + ws.diff + " fler än förra veckan" : ws.diff < 0 ? "↓ " + Math.abs(ws.diff) + " färre än förra veckan" : "Samma som förra veckan"}
              </div>)}
            </div>);
          })()}
          <LoadBar value={actSess} max={10} label="Totalbelastning" color={C.blue} />
          <LoadBar value={badCnt} max={7} label="Badminton" color={C.green} />
          <LoadBar value={gymCnt} max={3} label="Gym" color={C.accent} />
          {isTaper && (<div style={{ background: C.redDim, border: "1px solid " + C.redBorder, borderRadius: R.lg, padding: "14px 16px", margin: "16px 0" }}>
            <div style={{ fontSize: "15px", fontWeight: 600, color: C.red }}>{"⚡"} Tävlingsvecka — Tapering</div>
            <div style={{ fontSize: "13px", color: C.textSecondary, marginTop: "4px" }}>Kör lättare gym. Fokus mobilitet och aktivering.</div>
          </div>)}
          <div style={{ marginTop: "16px" }}>
            {curWeek.map(function(day, i) {
              var isToday = i === todayIdx;
              return (<div key={i} style={{ padding: "14px 0", borderBottom: "1px solid " + C.borderLight }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: isToday ? C.blue : C.textSecondary }}>{day.day}{isToday ? " — idag" : ""}</div>
                  <button onClick={function() { setAddSessDay(i); setShowAddSess(true); }} style={{ padding: "4px 12px", borderRadius: R.sm, border: "1px solid " + C.border, background: "transparent", color: C.textMuted, fontSize: "12px", cursor: "pointer", fontFamily: font }}>+ Lägg till</button>
                </div>
                {day.sessions.map(function(s) {
                  if (s.type === "rest") return (<div key={s.id} style={{ padding: "10px 14px", fontSize: "13px", color: C.textDim, background: C.bgCard, borderRadius: R.md, marginBottom: "6px" }}>{s.label}</div>);
                  var status = getSessionStatus(i, s.id);
                  var stColor = status === "done" ? C.green : status === "cancelled" ? C.red : C.blue;
                  var stLabel = status === "done" ? "Genomfört" : status === "cancelled" ? "Inställt" : "Planerat";
                  var dayDate = getDateForDayIndex(i); var logEntry = tLogs[dayDate + "-" + s.id];
                  var dotColor = s.type === "badminton" ? C.green : C.accent;
                  return (<div key={s.id} style={Object.assign({}, cardStyle, { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", marginBottom: "6px" })}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, background: dotColor }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", color: status === "cancelled" ? C.textDim : C.text, textDecoration: status === "cancelled" ? "line-through" : "none", fontWeight: 500 }}>{s.label}</div>
                      {s.time ? <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{s.time}</div> : null}
                    </div>
                    <button onClick={function() {
                      if (status === "done" && logEntry) setViewLog(Object.assign({}, logEntry, { displayDate: dayDate }));
                      else if (status === "cancelled") setSessStatus(i, s.id, "planned");
                      else if (status === "planned") setSessStatus(i, s.id, "cancelled");
                    }} style={{ padding: "5px 12px", borderRadius: "20px", border: "none", background: stColor + "18", color: stColor, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font, minWidth: "80px", textAlign: "center" }}>{stLabel}</button>
                    <button onClick={function() { if (window.confirm("Ta bort " + s.label + "?")) removeSess(i, s.id); }} style={{ padding: "4px 8px", borderRadius: "6px", border: "none", background: C.redDim, color: C.red, fontSize: "14px", cursor: "pointer", lineHeight: 1 }}>{"×"}</button>
                  </div>);
                })}
              </div>);
            })}
          </div>
          {showAddSess && (<div style={modalOverlay} onClick={function() { setShowAddSess(false); }}><div onClick={function(e) { e.stopPropagation(); }} style={modalBox}>
            <div style={sectionTitle}>Lägg till pass — {DAYS[addSessDay]}</div>
            <div style={{ marginTop: "16px" }}>
              <input type="text" placeholder="Namn" value={newSess.label} onChange={function(e) { setNewSess(Object.assign({}, newSess, { label: e.target.value })); }} style={Object.assign({}, inputStyle, { marginBottom: "10px" })} />
              <input type="text" placeholder="Tid (t.ex. 18:00-19:30)" value={newSess.time} onChange={function(e) { setNewSess(Object.assign({}, newSess, { time: e.target.value })); }} style={Object.assign({}, inputStyle, { marginBottom: "12px" })} />
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <button onClick={function() { setNewSess(Object.assign({}, newSess, { type: "badminton" })); }} style={chipStyle(newSess.type === "badminton", C.green)}>Badminton</button>
                <button onClick={function() { setNewSess(Object.assign({}, newSess, { type: "gym" })); }} style={chipStyle(newSess.type === "gym", C.accent)}>Gym</button>
              </div>
              <button onClick={function() { addSess(addSessDay); }} style={{ width: "100%", padding: "14px", borderRadius: R.md, border: "none", background: newSess.label ? C.accent : C.bgElevated, color: newSess.label ? "#000" : C.textDim, fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>Lägg till</button>
            </div>
          </div></div>)}
        </div>)}

        {/* LOG TAB */}
        {activeTab === "log" && (<div>
          <div style={Object.assign({}, cardStyle, { display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" })}>
            <div style={{ fontSize: "13px", color: C.textMuted, fontWeight: 500, whiteSpace: "nowrap" }}>Dag att logga</div>
            <input type="date" value={logDate} max={today} onChange={function(e) { setLogDate(e.target.value); }} style={Object.assign({}, inputStyle, { padding: "8px 10px", fontSize: "14px" })} />
            {logDate !== today && (<button onClick={function() { setLogDate(today); }} style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid rgba(245,183,49,0.3)", background: C.accentDim, color: C.accent, fontSize: "12px", cursor: "pointer", fontFamily: font, fontWeight: 600, whiteSpace: "nowrap" }}>Idag</button>)}
          </div>
          {(function() {
            var selDate = new Date(logDate); var selDayJs = selDate.getDay(); var selDayIdx = selDayJs === 0 ? 6 : selDayJs - 1;
            var selWeekId = getWeekId(selDate); var selDayOv = weekOv[selWeekId + "-" + selDayIdx];
            var selDaySessions = selDayOv || DEFAULT_WEEK[selDayIdx].sessions;
            var isLogToday = logDate === today;
            return (<div>
              {isLogToday && (<div style={{ marginBottom: "24px" }}>
                <div style={sectionTitle}>Daglig avstämning</div>
                <div style={sectionSub}>1 = dåligt, 5 = topp</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {WELLNESS_LABELS.map(function(label) {
                    return (<div key={label} style={cardStyle}>
                      <div style={labelStyle}>{label}</div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {[1,2,3,4,5].map(function(v) { return <button key={v} onClick={function() { var u = Object.assign({}, wLogs); u[today] = Object.assign({}, todayW, {[label]: v}); setWLogs(u); }} style={ratingBtnStyle(todayW[label] === v, v)}>{v}</button>; })}
                      </div>
                    </div>);
                  })}
                </div>
                {wAvg > 0 && wAvg < 3 && (<div style={{ marginTop: "10px", background: C.redDim, border: "1px solid " + C.redBorder, borderRadius: R.md, padding: "10px 14px", fontSize: "13px", color: C.red }}>{"💡"} Överväg lättare pass idag.</div>)}
              </div>)}
              <div style={sectionTitle}>{isLogToday ? "Dagens pass" : "Pass " + new Date(logDate).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}</div>
              <div style={sectionSub}>Klicka för att logga eller se detaljer</div>
              {selDaySessions.filter(function(s) { return s.type !== "rest" && !s.cancelled; }).map(function(sess) {
                var lk = logDate + "-" + sess.id, logged = tLogs[lk];
                return (<div key={sess.id} onClick={function() {
                  if (logged) setViewLog(Object.assign({}, logged, { displayDate: logDate }));
                  else { setLogSess(Object.assign({}, sess, { _logDate: logDate })); setLogForm({ completed: "yes", trainingType: [], rating: 0, energy: 0, note: "" }); }
                }} style={Object.assign({}, cardStyle, { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", background: logged ? C.greenDim : C.bgCard, border: logged ? "1px solid " + C.greenBorder : "1px solid " + C.borderLight })}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, background: sess.type === "badminton" ? C.green : C.accent }} />
                  <div style={{ flex: 1 }}><div style={{ fontSize: "15px", fontWeight: 500 }}>{sess.label}</div><div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{sess.time}</div></div>
                  {logged ? (<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "13px", color: C.green, fontWeight: 600 }}>{"✓"} Loggat</span>{logged.rating > 0 && <span style={{ fontSize: "13px", color: C.accent, fontWeight: 600 }}>{"★"}{logged.rating}</span>}</div>) : (<div style={{ fontSize: "13px", color: C.accent, fontWeight: 500 }}>Logga {"→"}</div>)}
                </div>);
              })}
              {selDaySessions.some(function(s) { return s.type === "gym" && !s.cancelled; }) && isLogToday && (<div style={{ marginTop: "20px" }}>
                <div style={sectionTitle}>Gympass</div>
                <div style={sectionSub}>{isTaper ? "⚡ Tävlingsvecka: 60% vikt" : "Logga vikter"}</div>
                <GymLog exercises={GYM_EXERCISES} log={todayGym} setLog={function(fn) { var u = typeof fn === "function" ? fn(todayGym) : fn; var g = Object.assign({}, gLogs); g[today] = u; setGLogs(g); }} />
              </div>)}
            </div>);
          })()}
          {logSess && (<div style={modalOverlay} onClick={function() { setLogSess(null); }}><div onClick={function(e) { e.stopPropagation(); }} style={modalBox}>
            <div style={sectionTitle}>Logga: {logSess.label}</div>
            <div style={Object.assign({}, sectionSub, { marginBottom: "18px" })}>{logSess.time}{logSess._logDate && logSess._logDate !== today && (<span style={{ color: C.accent, marginLeft: "8px" }}>{"•"} {new Date(logSess._logDate).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" })}</span>)}</div>
            <div style={labelStyle}>Blev passet av?</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
              {[{ v: "yes", l: "Ja", c: C.green }, { v: "partial", l: "Delvis", c: C.yellow }, { v: "no", l: "Nej", c: C.red }].map(function(o) { return <button key={o.v} onClick={function() { setLogForm(Object.assign({}, logForm, { completed: o.v })); }} style={chipStyle(logForm.completed === o.v, o.c)}>{o.l}</button>; })}
            </div>
            {logSess.type === "badminton" && (<div>
              <div style={labelStyle}>Typ av träning</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                {TRAINING_TYPES.map(function(t) { var ttArr = Array.isArray(logForm.trainingType) ? logForm.trainingType : []; var sel = ttArr.indexOf(t) !== -1;
                  return <button key={t} onClick={function() { setLogForm(Object.assign({}, logForm, { trainingType: sel ? ttArr.filter(function(x){return x!==t;}) : ttArr.concat([t]) })); }} style={chipStyle(sel, C.blue)}>{t}</button>; })}
              </div>
            </div>)}
            <div style={labelStyle}>Egen insats</div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "18px" }}>{[1,2,3,4,5].map(function(v) { return <button key={v} onClick={function() { setLogForm(Object.assign({}, logForm, { rating: v })); }} style={ratingBtnStyle(logForm.rating === v, v)}>{v}</button>; })}</div>
            <div style={labelStyle}>Energinivå</div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "18px" }}>{[1,2,3,4,5].map(function(v) { return <button key={v} onClick={function() { setLogForm(Object.assign({}, logForm, { energy: v })); }} style={ratingBtnStyle(logForm.energy === v, v)}>{v}</button>; })}</div>
            <div style={labelStyle}>Anteckning</div>
            <textarea value={logForm.note} onChange={function(e) { setLogForm(Object.assign({}, logForm, { note: e.target.value })); }} placeholder="Valfritt..." style={Object.assign({}, inputStyle, { height: "70px", resize: "none", marginBottom: "18px" })} />
            <button onClick={saveTLog} style={{ width: "100%", padding: "14px", borderRadius: R.md, border: "none", background: C.green, color: "#000", fontSize: "16px", fontWeight: 700, cursor: "pointer", fontFamily: font }}>Spara</button>
          </div></div>)}
        </div>)}

        {/* STATS TAB */}
        {activeTab === "stats" && (function() {
          var fTLogs = filterByPeriod(Object.values(tLogs), "date");
          var fMLogs = filterByPeriod(Object.values(mLogs), "date");
          var badLogs = fTLogs.filter(function(l) { return l.sessionType === "badminton"; });
          var gymLogs2 = fTLogs.filter(function(l) { return l.sessionType === "gym"; });
          var seriesM = fMLogs.filter(function(l) { return l.compType === "series"; });
          var tournM = fMLogs.filter(function(l) { return l.compType === "tournament"; });
          function ms(matches) { var w = matches.filter(function(m){return m.won===true||m.won==="true";}).length; return { total: matches.length, won: w, lost: matches.filter(function(m){return m.won===false||m.won==="false";}).length, byType: MATCH_TYPES.reduce(function(o,t){ o[t] = matches.filter(function(m){return m.matchType===t;}); return o; }, {}) }; }
          return (<div>
            <div style={sectionTitle}>Statistik</div>
            <PeriodFilter />
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
              {[{ v: "badminton", l: "Badminton", c: C.green }, { v: "gym", l: "Gym", c: C.accent }, { v: "series", l: "Seriespel", c: C.blue }, { v: "tournament", l: "Tävlingar", c: C.red }].map(function(t) { return <button key={t.v} onClick={function() { setStatsTab(t.v); }} style={Object.assign({}, chipStyle(statsTab === t.v, t.c), { fontSize: "12px" })}>{t.l}</button>; })}
            </div>
            {statsTab === "badminton" && (<div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                <StatCard label="Träningar" value={badLogs.length} color={C.green} />
                <StatCard label="Genomförda" value={badLogs.filter(function(l){return l.completed==="yes";}).length} color={C.blue} />
                <StatCard label="Snittinsats" value={badLogs.length > 0 ? (badLogs.reduce(function(s,l){return s+(l.rating||0);},0)/badLogs.length).toFixed(1) : "—"} color={C.accent} />
                <StatCard label="Snittenergi" value={badLogs.length > 0 ? (badLogs.reduce(function(s,l){return s+(l.energy||0);},0)/badLogs.length).toFixed(1) : "—"} color={C.purple} />
              </div>
              {(function() {
                var tc = {}; badLogs.forEach(function(l) { var tt = Array.isArray(l.trainingType) ? l.trainingType : (l.trainingType ? [l.trainingType] : []); tt.forEach(function(t) { tc[t] = (tc[t]||0) + 1; }); });
                var total = Object.values(tc).reduce(function(s,c){return s+c;}, 0);
                if (total === 0) return null;
                return (<div style={{ marginBottom: "18px" }}><div style={Object.assign({}, labelStyle, { marginBottom: "10px" })}>Träningstyper</div>
                  {Object.entries(tc).sort(function(a,b){return b[1]-a[1];}).map(function(e) { var pct = Math.round(e[1]/total*100);
                    return (<div key={e[0]} style={{ marginBottom: "10px" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontSize: "13px" }}>{e[0]}</span><span style={{ fontSize: "13px", color: C.textMuted }}>{e[1]}st ({pct}%)</span></div>
                      <div style={{ height: "6px", background: C.bgElevated, borderRadius: "3px", overflow: "hidden" }}><div style={{ width: pct+"%", height: "100%", background: C.green, borderRadius: "3px" }} /></div></div>);
                  })}</div>);
              })()}
              {badLogs.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: C.textDim, fontSize: "14px" }}>Ingen badmintondata för vald period</div>}
            </div>)}
            {statsTab === "gym" && (<div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                <StatCard label="Gympass" value={gymLogs2.length} color={C.accent} />
                <StatCard label="Genomförda" value={gymLogs2.filter(function(l){return l.completed==="yes";}).length} color={C.green} />
              </div>
              {gymLogs2.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: C.textDim, fontSize: "14px" }}>Ingen gymdata för vald period</div>}
            </div>)}
            {(statsTab === "series" || statsTab === "tournament") && (function() {
              var matches = statsTab === "series" ? seriesM : tournM; var mst = ms(matches);
              return (<div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                  <StatCard label="Matcher" value={mst.total} color={statsTab === "series" ? C.blue : C.red} />
                  <StatCard label="Vinster" value={mst.won} color={C.green} />
                  <StatCard label="Förluster" value={mst.lost} color={C.red} />
                </div>
                {MATCH_TYPES.map(function(mt) { var m = mst.byType[mt]; if (m.length === 0) return null; var w = m.filter(function(x){return x.won===true||x.won==="true";}).length;
                  return (<div key={mt} style={{ marginBottom: "10px" }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: C.textSecondary, marginBottom: "4px" }}><span>{mt}</span><span>{w}V / {m.length-w}F</span></div>
                    <div style={{ height: "6px", background: C.bgElevated, borderRadius: "3px", overflow: "hidden" }}><div style={{ width: (m.length>0?(w/m.length*100):0)+"%", height: "100%", background: C.green, borderRadius: "3px" }} /></div></div>);
                })}
                {matches.length > 0 && (<div style={{ marginTop: "18px" }}><div style={Object.assign({}, labelStyle, { marginBottom: "10px" })}>Matchhistorik</div>
                  {matches.slice().reverse().map(function(m, i) { var setStr = m.sets.filter(function(s){return s.my||s.opp;}).map(function(s){return s.my+"-"+s.opp;}).join(", ");
                    return (<div key={i} style={Object.assign({}, cardStyle, { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px" })}>
                      <div><div style={{ fontSize: "13px" }}>{m.matchType} — {m.compName}</div><div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>{m.opponent ? "vs " + m.opponent + " — " : ""}{setStr}</div></div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: m.won ? C.green : C.red }}>{m.won ? "V" : "F"}</div></div>);
                  })}</div>)}
                {mst.total === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: C.textDim, fontSize: "14px" }}>Inga matcher för vald period</div>}
              </div>);
            })()}
          </div>);
        })()}

        {/* INSIGHTS TAB */}
        {activeTab === "insights" && (function() {
          var allLogsF = filterByPeriod(Object.values(tLogs), "date");
          return (<div>
            <div style={sectionTitle}>Insikter</div>
            <div style={sectionSub}>Analyser baserade på din träningsdata</div>
            <PeriodFilter />
            {allLogsF.length < 3 ? (<div style={{ textAlign: "center", padding: "40px 0", color: C.textDim, fontSize: "14px" }}>Behöver minst 3 loggade pass för vald period</div>) : (function() {
              var allLogs = allLogsF; var cards = [];

              // Sleep vs Performance
              var slD = { g: [], b: [] }; allLogs.forEach(function(l) { var dw = gwfd(l.date); if (dw && dw["Sömn"]) { if (dw["Sömn"] >= 4) slD.g.push(l); else if (dw["Sömn"] <= 3) slD.b.push(l); } });
              var slM = slD.g.length + slD.b.length;
              if (slD.g.length >= 2 && slD.b.length >= 1) {
                var gR = slD.g.reduce(function(s,l){return s+(l.rating||0);},0)/slD.g.length; var bR = slD.b.reduce(function(s,l){return s+(l.rating||0);},0)/slD.b.length;
                var gE = slD.g.reduce(function(s,l){return s+(l.energy||0);},0)/slD.g.length; var bE = slD.b.reduce(function(s,l){return s+(l.energy||0);},0)/slD.b.length;
                cards.push({ icon: "😴", title: "Sömn vs Prestation", body: "Bra sömn (4-5): insats " + gR.toFixed(1) + ", energi " + gE.toFixed(1) + " (" + slD.g.length + " pass). Dålig sömn (1-3): insats " + bR.toFixed(1) + ", energi " + bE.toFixed(1) + " (" + slD.b.length + " pass).", highlight: (gR-bR>0.3||gE-bE>0.3) ? "Bra sömn ger" + (gR-bR>0.3?" +"+(gR-bR).toFixed(1)+" insats":"") + (gR-bR>0.3&&gE-bE>0.3?" och":"") + (gE-bE>0.3?" +"+(gE-bE).toFixed(1)+" energi":"") + "!" : "Sömnen verkar inte påverka prestationen.", color: (gR-bR>0.3||gE-bE>0.3) ? C.green : C.textMuted });
              } else { cards.push({ icon: "😴", title: "Sömn vs Prestation", body: "Sömndata matchad för " + slM + " av " + allLogs.length + " pass. Fyll i sömn i daglig avstämning.", highlight: "Behöver minst 2 pass med bra sömn (4-5) och 1 med dålig (1-3).", color: C.textMuted }); }

              // Single vs Double sessions
              var dsc = {}; allLogs.forEach(function(l) { if (!dsc[l.date]) dsc[l.date] = []; dsc[l.date].push(l); });
              var sngl = [], dbl = []; Object.values(dsc).forEach(function(ls) { if (ls.length === 1) sngl.push(ls[0]); else ls.forEach(function(l) { dbl.push(l); }); });
              if (sngl.length >= 2 && dbl.length >= 2) {
                var sR = sngl.reduce(function(s,l){return s+(l.rating||0);},0)/sngl.length; var dR = dbl.reduce(function(s,l){return s+(l.rating||0);},0)/dbl.length;
                var sE = sngl.reduce(function(s,l){return s+(l.energy||0);},0)/sngl.length; var dE = dbl.reduce(function(s,l){return s+(l.energy||0);},0)/dbl.length;
                cards.push({ icon: "📊", title: "Enkelpass vs Dubbelpass-dagar", body: "Enkelpass (" + sngl.length + "): insats " + sR.toFixed(1) + ", energi " + sE.toFixed(1) + ". Dubbelpass (" + dbl.length + "): insats " + dR.toFixed(1) + ", energi " + dE.toFixed(1) + ".", highlight: dE < sE - 0.3 ? "Energin sjunker " + (sE-dE).toFixed(1) + " på dubbelpass-dagar" : "Energin håller bra på dubbelpass!", color: dE < sE - 0.3 ? C.yellow : C.green });
              }

              // Best/worst weekday
              var dsm = {}; allLogs.forEach(function(l) { var d = new Date(l.date); var di = d.getDay()===0?6:d.getDay()-1; var dn = DAYS[di]; if (!dsm[dn]) dsm[dn] = { r: [], e: [] }; if (l.rating) dsm[dn].r.push(l.rating); if (l.energy) dsm[dn].e.push(l.energy); });
              var dent = Object.entries(dsm).filter(function(e) { return e[1].r.length >= 2; });
              if (dent.length >= 3) {
                dent.sort(function(a,b) { return (b[1].r.reduce(function(s,v){return s+v;},0)/b[1].r.length) - (a[1].r.reduce(function(s,v){return s+v;},0)/a[1].r.length); });
                var bD = dent[0], wD = dent[dent.length-1]; var bA = bD[1].r.reduce(function(s,v){return s+v;},0)/bD[1].r.length; var wA = wD[1].r.reduce(function(s,v){return s+v;},0)/wD[1].r.length;
                cards.push({ icon: "📅", title: "Bästa & sämsta dag", body: "Bäst: " + bD[0] + " (" + bA.toFixed(1) + "). Sämst: " + wD[0] + " (" + wA.toFixed(1) + ").", highlight: bA-wA > 0.5 ? bD[0] + "ar ger " + (bA-wA).toFixed(1) + " högre insats!" : "Insatsen är jämn alla dagar.", color: bA-wA > 0.5 ? C.blue : C.textMuted });
                cards.push({ type: "dayChart", data: dent.map(function(e) { return { day: e[0], avg: e[1].r.reduce(function(s,v){return s+v;},0)/e[1].r.length, count: e[1].r.length }; }) });
              }

              // Training type
              var tr = {}; allLogs.forEach(function(l) { var tt = Array.isArray(l.trainingType)?l.trainingType:(l.trainingType?[l.trainingType]:[]); tt.forEach(function(t) { if (!tr[t]) tr[t] = []; if (l.rating) tr[t].push(l.rating); }); });
              var tent = Object.entries(tr).filter(function(e) { return e[1].length >= 2; });
              if (tent.length >= 2) { tent.sort(function(a,b) { return (b[1].reduce(function(s,v){return s+v;},0)/b[1].length) - (a[1].reduce(function(s,v){return s+v;},0)/a[1].length); });
                cards.push({ icon: "🏸", title: "Träningstyp vs Insats", body: tent.map(function(e) { return e[0] + ": " + (e[1].reduce(function(s,v){return s+v;},0)/e[1].length).toFixed(1) + " (" + e[1].length + " pass)"; }).join(". "), highlight: "Bäst på " + tent[0][0] + "-pass!", color: C.green }); }

              // Low energy warning
              var rl = allLogs.slice().sort(function(a,b){return new Date(b.date)-new Date(a.date);}).slice(0, 5);
              var lec = rl.filter(function(l) { return (l.energy||0) <= 2; }).length;
              if (lec >= 3) cards.push({ icon: "⚠️", title: "Belastningsvarning", body: lec + " av senaste 5 passen hade låg energi.", highlight: "Överväg extra vila.", color: C.red });

              // Fatigue
              var fd = { hf: [], lf: [] }; allLogs.forEach(function(l) { var dw = gwfd(l.date); if (dw && dw["Muskeltrötthet"]) { if (dw["Muskeltrötthet"] <= 2) fd.hf.push(l); else if (dw["Muskeltrötthet"] >= 4) fd.lf.push(l); } });
              if (fd.hf.length >= 2 && fd.lf.length >= 2) { var hR = fd.hf.reduce(function(s,l){return s+(l.rating||0);},0)/fd.hf.length; var lR = fd.lf.reduce(function(s,l){return s+(l.rating||0);},0)/fd.lf.length;
                cards.push({ icon: "💪", title: "Muskeltrötthet vs Insats", body: "Utvilad: " + lR.toFixed(1) + ". Trött: " + hR.toFixed(1) + ".", highlight: lR-hR > 0.3 ? "Vila ger +" + (lR-hR).toFixed(1) + " insats!" : "Presterar bra även trött!", color: lR-hR > 0.3 ? C.green : C.blue }); }

              // Motivation
              var mvd = { hm: [], lm: [] }; allLogs.forEach(function(l) { var dw = gwfd(l.date); if (dw && dw["Motivation"]) { if (dw["Motivation"] >= 4) mvd.hm.push(l); else if (dw["Motivation"] <= 2) mvd.lm.push(l); } });
              if (mvd.hm.length >= 2 && mvd.lm.length >= 1) { var hmR = mvd.hm.reduce(function(s,l){return s+(l.rating||0);},0)/mvd.hm.length; var lmR = mvd.lm.reduce(function(s,l){return s+(l.rating||0);},0)/mvd.lm.length;
                cards.push({ icon: "🧠", title: "Motivation vs Insats", body: "Hög: " + hmR.toFixed(1) + " (" + mvd.hm.length + " pass). Låg: " + lmR.toFixed(1) + " (" + mvd.lm.length + " pass).", highlight: hmR-lmR > 0.3 ? "Motivation ger +" + (hmR-lmR).toFixed(1) + " insats!" : "Levererar oavsett motivation — starkt!", color: hmR-lmR > 0.3 ? C.purple : C.green }); }

              if (cards.length === 0) return (<div style={{ textAlign: "center", padding: "40px 0", color: C.textDim }}>Logga fler pass och fyll i avstämning</div>);
              return (<div>{cards.map(function(c, i) { return <InsightCard key={i} {...c} />; })}</div>);
            })()}
          </div>);
        })()}

        {/* CALENDAR TAB */}
        {activeTab === "calendar" && (<div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div><div style={sectionTitle}>Tävlingskalender</div><div style={sectionSub}>Tryck på tävling för att logga matcher</div></div>
            <button onClick={function() { setShowAddComp(!showAddComp); }} style={{ width: "40px", height: "40px", borderRadius: R.md, border: "1px solid rgba(245,183,49,0.3)", background: showAddComp ? C.accentDim : "transparent", color: C.accent, fontSize: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{showAddComp ? "×" : "+"}</button>
          </div>
          {showAddComp && (<div style={Object.assign({}, cardStyle, { border: "1px solid rgba(245,183,49,0.15)", marginBottom: "18px" })}>
            <input type="text" placeholder="Namn" value={newComp.name} onChange={function(e) { setNewComp(Object.assign({}, newComp, { name: e.target.value })); }} style={Object.assign({}, inputStyle, { marginBottom: "10px" })} />
            <input type="date" value={newComp.date} onChange={function(e) { setNewComp(Object.assign({}, newComp, { date: e.target.value })); }} style={Object.assign({}, inputStyle, { marginBottom: "10px" })} />
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button onClick={function() { setNewComp(Object.assign({}, newComp, { type: "tournament" })); }} style={chipStyle(newComp.type === "tournament")}>Tävling {"🏆"}</button>
              <button onClick={function() { setNewComp(Object.assign({}, newComp, { type: "series" })); }} style={chipStyle(newComp.type === "series")}>Seriespel {"🏸"}</button>
            </div>
            <button onClick={function() { if (newComp.name && newComp.date) { setCompetitions(competitions.concat([Object.assign({}, newComp)])); setNewComp({ name: "", date: "", type: "tournament" }); setShowAddComp(false); } }} style={{ width: "100%", padding: "14px", borderRadius: R.md, border: "none", background: newComp.name && newComp.date ? C.accent : C.bgElevated, color: newComp.name && newComp.date ? "#000" : C.textDim, fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>Lägg till</button>
          </div>)}
          {sortedComps.map(function(comp, i) {
            var d = daysUntil(comp.date), isPast = d < 0, isNext = comp === nextComp;
            var compM = Object.values(mLogs).filter(function(m) { return m.compName === comp.name && m.compDate === comp.date; });
            return (<div key={i} style={{ marginBottom: "10px" }}>
              <div onClick={function() { setShowMatch(comp); setMatchForm({ matchType: "Singel", won: null, sets: [{ my: "", opp: "" }, { my: "", opp: "" }, { my: "", opp: "" }], opponent: "" }); }} style={Object.assign({}, cardStyle, {
                display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", borderRadius: compM.length > 0 ? R.lg + " " + R.lg + " 0 0" : R.lg,
                background: isNext ? C.accentDim : C.bgCard, border: isNext ? "1px solid rgba(245,183,49,0.25)" : "1px solid " + C.borderLight, opacity: isPast && compM.length === 0 ? 0.4 : 1, marginBottom: 0,
              })}>
                <div style={{ width: "48px", height: "48px", borderRadius: R.md, background: comp.type === "tournament" ? C.redDim : C.blueDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{comp.type === "tournament" ? "🏆" : "🏸"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{comp.name}</div>
                  <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "3px" }}>{new Date(comp.date).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" })}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {compM.length > 0 && <span style={{ fontSize: "12px", color: C.blue, fontWeight: 500 }}>{compM.length} matcher</span>}
                  <div style={{ fontSize: "13px", fontWeight: 600, color: isPast ? C.textDim : d <= 7 ? C.accent : C.textMuted }}>{isPast ? "Klar" : d + "d"}</div>
                  <button onClick={function(e) { e.stopPropagation(); setCompetitions(competitions.filter(function(c) { return c !== comp; })); }} style={{ width: "28px", height: "28px", borderRadius: R.sm, border: "none", background: C.redDim, color: C.red, fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{"×"}</button>
                </div>
              </div>
              {compM.length > 0 && (<div style={{ background: C.bgElevated, borderRadius: "0 0 " + R.lg + " " + R.lg, padding: "10px 16px", borderTop: "1px solid " + C.borderLight }}>
                {compM.map(function(m, j) { var setStr = m.sets.filter(function(s){return s.my||s.opp;}).map(function(s){return s.my+"-"+s.opp;}).join(", ");
                  return (<div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: "13px" }}>
                    <span style={{ color: C.textSecondary }}>{m.matchType}{m.opponent ? " vs " + m.opponent : ""}</span>
                    <span><span style={{ color: C.textMuted }}>{setStr}</span> <span style={{ fontWeight: 700, color: m.won ? C.green : C.red, marginLeft: "8px" }}>{m.won ? "V" : "F"}</span></span>
                  </div>);
                })}
              </div>)}
            </div>);
          })}
          {showMatch && (<div style={modalOverlay} onClick={function() { setShowMatch(null); }}><div onClick={function(e) { e.stopPropagation(); }} style={modalBox}>
            <div style={sectionTitle}>Logga match</div>
            <div style={Object.assign({}, sectionSub, { marginBottom: "18px" })}>{showMatch.name}</div>
            <div style={labelStyle}>Typ av match</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
              {MATCH_TYPES.map(function(t) { return <button key={t} onClick={function() { setMatchForm(Object.assign({}, matchForm, { matchType: t })); }} style={chipStyle(matchForm.matchType === t, C.blue)}>{t}</button>; })}
            </div>
            <div style={labelStyle}>Motståndare</div>
            <input type="text" placeholder="Namn (valfritt)" value={matchForm.opponent} onChange={function(e) { setMatchForm(Object.assign({}, matchForm, { opponent: e.target.value })); }} style={Object.assign({}, inputStyle, { marginBottom: "18px" })} />
            <div style={labelStyle}>Set (bäst av 3)</div>
            {[0, 1, 2].map(function(si) {
              return (<div key={si} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: C.textMuted, width: "42px" }}>Set {si + 1}</span>
                <input type="number" placeholder="Du" value={matchForm.sets[si].my} onChange={function(e) { var s = matchForm.sets.slice(); s[si] = Object.assign({}, s[si], { my: e.target.value }); setMatchForm(Object.assign({}, matchForm, { sets: s })); }}
                  style={{ width: "65px", padding: "8px", borderRadius: R.sm, border: "1px solid " + C.border, background: C.bgInput, color: C.text, fontSize: "15px", textAlign: "center", fontFamily: font, outline: "none" }} />
                <span style={{ color: C.textDim }}>{"—"}</span>
                <input type="number" placeholder="Motst." value={matchForm.sets[si].opp} onChange={function(e) { var s = matchForm.sets.slice(); s[si] = Object.assign({}, s[si], { opp: e.target.value }); setMatchForm(Object.assign({}, matchForm, { sets: s })); }}
                  style={{ width: "65px", padding: "8px", borderRadius: R.sm, border: "1px solid " + C.border, background: C.bgInput, color: C.text, fontSize: "15px", textAlign: "center", fontFamily: font, outline: "none" }} />
              </div>);
            })}
            <div style={Object.assign({}, labelStyle, { marginTop: "14px" })}>Resultat</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
              <button onClick={function() { setMatchForm(Object.assign({}, matchForm, { won: true })); }} style={chipStyle(matchForm.won === true, C.green)}>Vinst {"✓"}</button>
              <button onClick={function() { setMatchForm(Object.assign({}, matchForm, { won: false })); }} style={chipStyle(matchForm.won === false, C.red)}>Förlust {"✗"}</button>
            </div>
            <button onClick={saveMatch} style={{ width: "100%", padding: "14px", borderRadius: R.md, border: "none", background: matchForm.won !== null ? C.green : C.bgElevated, color: matchForm.won !== null ? "#000" : C.textDim, fontSize: "16px", fontWeight: 700, cursor: "pointer", fontFamily: font }}>Spara match</button>
          </div></div>)}
        </div>)}
      </div>

      {/* VIEW LOG MODAL */}
      {viewLog && (<div style={modalOverlay} onClick={function() { setViewLog(null); }}><div onClick={function(e) { e.stopPropagation(); }} style={modalBox}>
        <div style={sectionTitle}>{viewLog.sessionLabel}</div>
        <div style={Object.assign({}, sectionSub, { marginBottom: "18px" })}>{new Date(viewLog.displayDate || viewLog.date).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}</div>
        <div style={labelStyle}>Status</div>
        <div style={{ fontSize: "15px", color: viewLog.completed === "yes" ? C.green : viewLog.completed === "partial" ? C.yellow : C.red, marginBottom: "16px", fontWeight: 600 }}>
          {viewLog.completed === "yes" ? "✓ Genomfört" : viewLog.completed === "partial" ? "~ Delvis" : "✗ Inte genomfört"}
        </div>
        {(function() { var tt = Array.isArray(viewLog.trainingType) ? viewLog.trainingType : (viewLog.trainingType ? [viewLog.trainingType] : []); if (tt.length === 0) return null;
          return (<div><div style={labelStyle}>Träningstyp</div><div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
            {tt.map(function(t) { return <span key={t} style={{ fontSize: "13px", color: C.blue, background: C.blueDim, padding: "4px 10px", borderRadius: "12px", fontWeight: 500 }}>{t}</span>; })}
          </div></div>);
        })()}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div><div style={labelStyle}>Insats</div><div style={{ fontSize: "26px", fontWeight: 700, color: (viewLog.rating||0) >= 4 ? C.green : (viewLog.rating||0) >= 3 ? C.yellow : C.red }}>{viewLog.rating || "—"}<span style={{ fontSize: "14px", color: C.textDim }}>/5</span></div></div>
          <div><div style={labelStyle}>Energi</div><div style={{ fontSize: "26px", fontWeight: 700, color: (viewLog.energy||0) >= 4 ? C.green : (viewLog.energy||0) >= 3 ? C.yellow : C.red }}>{viewLog.energy || "—"}<span style={{ fontSize: "14px", color: C.textDim }}>/5</span></div></div>
        </div>
        {viewLog.note && (<div><div style={labelStyle}>Anteckning</div><div style={{ fontSize: "14px", color: C.textSecondary, background: C.bgElevated, padding: "12px 14px", borderRadius: R.md, marginBottom: "16px", fontStyle: "italic", lineHeight: 1.5 }}>{viewLog.note}</div></div>)}
        <button onClick={function() { if (window.confirm("Ta bort denna logg?")) { var k = (viewLog.displayDate || viewLog.date) + "-" + viewLog.sessionId; var nl = Object.assign({}, tLogs); delete nl[k]; setTLogs(nl); setViewLog(null); } }} style={{ width: "100%", padding: "14px", borderRadius: R.md, border: "1px solid " + C.redBorder, background: C.redDim, color: C.red, fontSize: "14px", cursor: "pointer", fontFamily: font, fontWeight: 600, marginBottom: "8px" }}>Ta bort logg</button>
        <button onClick={function() { setViewLog(null); }} style={{ width: "100%", padding: "14px", borderRadius: R.md, border: "1px solid " + C.border, background: "transparent", color: C.textMuted, fontSize: "14px", cursor: "pointer", fontFamily: font }}>Stäng</button>
      </div></div>)}

      {/* MOTIVATION TOAST */}
      {motivMsg && (<div onClick={function() { setMotivMsg(null); }} style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", maxWidth: "360px", width: "calc(100% - 48px)", padding: "16px 20px", background: C.bgElevated, border: "1px solid " + C.greenBorder, borderRadius: R.lg, zIndex: 2000, cursor: "pointer", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        <div style={{ fontSize: "15px", fontWeight: 500, lineHeight: 1.5 }}>{motivMsg}</div>
      </div>)}

      {/* NAV */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "600px", background: "rgba(18,18,24,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid " + C.border, display: "flex", padding: "10px 20px", paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
        {tabs.map(function(t) {
          var active = activeTab === t.id;
          return (<button key={t.id} onClick={function() { setActiveTab(t.id); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 0", background: "transparent", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: "20px", filter: active ? "none" : "grayscale(1) opacity(0.35)" }}>{t.icon}</span>
            <span style={{ fontSize: "9px", fontWeight: 600, color: active ? C.accent : C.textDim, fontFamily: font, letterSpacing: "0.5px", textTransform: "uppercase" }}>{t.label}</span>
          </button>);
        })}
      </div>
    </div>
  );
}
