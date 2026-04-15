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
    // Create empty row if not exists
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

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var ys = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - ys) / 86400000 + 1) / 7);
}
function getWeekId(d) { return d.getFullYear() + "-W" + String(getWeekNumber(d)).padStart(2, "0"); }
function getTodayStr() { return new Date().toISOString().split("T")[0]; }
function getDayIndex() { var d = new Date().getDay(); return d === 0 ? 6 : d - 1; }
function getNextCompetition(comps) { var t = new Date(); t.setHours(0,0,0,0); return comps.find(function(c) { return new Date(c.date) >= t; }); }
function daysUntil(ds) { var t = new Date(); t.setHours(0,0,0,0); return Math.ceil((new Date(ds) - t) / 86400000); }
function genId() { return Math.random().toString(36).substr(2, 9); }

var inp = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #333", background: "rgba(255,255,255,0.05)", color: "#e0e0e0", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box" };
function pill(a, c) { c = c || "#f4a623"; return { flex: 1, padding: "8px 4px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600, fontFamily: "inherit", background: a ? c + "22" : "rgba(255,255,255,0.05)", color: a ? c : "#666", transition: "all 0.15s ease" }; }
function ratBtn(a, v) { var c = v <= 2 ? "#e74c3c" : v <= 3 ? "#f4a623" : "#2ecc71"; return { flex: 1, height: "34px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: a ? c : "rgba(255,255,255,0.06)", color: a ? "#fff" : "#555", transition: "all 0.15s ease" }; }

function LoadBar(p) {
  var pct = Math.min((p.value / p.max) * 100, 100), hi = pct > 85;
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "#8a8a9a" }}>{p.label}</span>
        <span style={{ fontSize: "12px", color: hi ? "#e74c3c" : "#8a8a9a", fontWeight: hi ? 700 : 400 }}>{hi ? "⚠ Hög" : Math.round(pct) + "%"}</span>
      </div>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: hi ? "#e74c3c" : p.color, borderRadius: "3px", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function GymLog(p) {
  var cats = []; p.exercises.forEach(function(e) { if (cats.indexOf(e.category) === -1) cats.push(e.category); });
  return (
    <div>{cats.map(function(cat) {
      return (
        <div key={cat} style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", color: "#f4a623", marginBottom: "6px" }}>{cat}</div>
          {p.exercises.filter(function(e) { return e.category === cat; }).map(function(ex) {
            return (
              <div key={ex.id} onClick={function() { p.setLog(function(prev) { var n = Object.assign({}, prev); n[ex.id] = !n[ex.id]; return n; }); }} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", marginBottom: "3px", borderRadius: "8px",
                background: p.log[ex.id] ? "rgba(46,204,113,0.1)" : "rgba(255,255,255,0.03)",
                border: p.log[ex.id] ? "1px solid rgba(46,204,113,0.3)" : "1px solid transparent", cursor: "pointer",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: p.log[ex.id] ? "none" : "2px solid #444", background: p.log[ex.id] ? "#2ecc71" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#fff", flexShrink: 0 }}>{p.log[ex.id] ? "✓" : ""}</div>
                  <div>
                    <div style={{ fontSize: "13px", color: "#e0e0e0", fontWeight: 500 }}>{ex.name}</div>
                    <div style={{ fontSize: "10px", color: "#666" }}>{ex.sets}×{ex.reps} — {ex.targetMuscle}</div>
                  </div>
                </div>
                <div onClick={function(e) { e.stopPropagation(); }}>
                  <input type="number" placeholder="kg" value={p.log["w_" + ex.id] || ""} onChange={function(e) { p.setLog(function(prev) { var n = Object.assign({}, prev); n["w_" + ex.id] = e.target.value; return n; }); }}
                    style={{ width: "48px", padding: "3px 5px", borderRadius: "5px", border: "1px solid #333", background: "rgba(255,255,255,0.05)", color: "#ccc", fontSize: "11px", textAlign: "center" }} />
                </div>
              </div>
            );
          })}
        </div>
      );
    })}</div>
  );
}

export default function BadmintonTrainingApp() {
  var _u = useState(function() { try { return localStorage.getItem("bta_userId") || ""; } catch (e) { return ""; } }), userId = _u[0], setUserId = _u[1];
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
  var _sf = useState("week"), statsFilter = _sf[0], setStatsFilter = _sf[1];
  var _cd = useState({ from: "", to: "" }), customDates = _cd[0], setCustomDates = _cd[1];
  var _st = useState("badminton"), statsTab = _st[0], setStatsTab = _st[1];
  var _ld = useState(getTodayStr()), logDate = _ld[0], setLogDate = _ld[1];
  var _ln = useState(""), loginName = _ln[0], setLoginName = _ln[1];
  var _sy = useState(false), syncing = _sy[0], setSyncing = _sy[1];
  var _vl = useState(null), viewLog = _vl[0], setViewLog = _vl[1];

  // Load from Supabase on login
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

  // Save to Supabase whenever data changes (debounced)
  useEffect(function() {
    if (!userId || !loaded) return;
    setSyncing(true);
    var t = setTimeout(function() {
      dbSave(userId, {
        competitions: competitions,
        week_overrides: weekOv,
        training_logs: tLogs,
        wellness_logs: wLogs,
        gym_logs: gLogs,
        match_logs: mLogs,
      }).then(function() { setSyncing(false); });
    }, 800);
    return function() { clearTimeout(t); };
  }, [competitions, weekOv, tLogs, wLogs, gLogs, mLogs, userId, loaded]);

  function handleLogin() {
    if (!loginName.trim()) return;
    var clean = loginName.trim().toLowerCase().replace(/\s+/g, "_");
    try { localStorage.setItem("bta_userId", clean); } catch (e) {}
    setUserId(clean);
  }

  function handleLogout() {
    try { localStorage.removeItem("bta_userId"); } catch (e) {}
    setUserId("");
    setCompetitions(DEFAULT_COMPETITIONS); setWeekOv({}); setTLogs({}); setWLogs({}); setGLogs({}); setMLogs({});
  }

  // Login screen
  if (!userId) {
    return (
      <div style={{ fontFamily: "'JetBrains Mono','SF Mono',monospace", background: "#0d0d12", color: "#e0e0e0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ maxWidth: "320px", width: "100%" }}>
          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "3px", color: "#555", marginBottom: "8px", textAlign: "center" }}>Badminton Performance</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: "30px" }}>Logga in 🏸</div>
          <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px", textAlign: "center" }}>Skriv samma användarnamn på alla enheter för att se samma data</div>
          <input type="text" placeholder="Användarnamn" value={loginName} onChange={function(e) { setLoginName(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") handleLogin(); }} style={Object.assign({}, inp, { marginBottom: "12px", textAlign: "center", fontSize: "16px", padding: "14px" })} />
          <button onClick={handleLogin} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "none", background: loginName.trim() ? "#f4a623" : "rgba(255,255,255,0.05)", color: loginName.trim() ? "#000" : "#555", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Logga in</button>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div style={{ fontFamily: "'JetBrains Mono','SF Mono',monospace", background: "#0d0d12", color: "#e0e0e0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#666" }}>Laddar...</div>
      </div>
    );
  }

  var today = getTodayStr(), weekId = getWeekId(new Date()), weekNum = getWeekNumber(new Date()), todayIdx = getDayIndex();
  var sortedComps = competitions.slice().sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
  var nextComp = getNextCompetition(sortedComps);
  var daysToComp = nextComp ? daysUntil(nextComp.date) : null;
  var isTaper = daysToComp !== null && daysToComp <= 3;

  var curWeek = DEFAULT_WEEK.map(function(day, i) {
    var ov = weekOv[weekId + "-" + i];
    return ov ? Object.assign({}, day, { sessions: ov }) : day;
  });

  var actSess = curWeek.reduce(function(s, d) { return s + d.sessions.filter(function(x) { return x.type !== "rest" && !x.cancelled; }).length; }, 0);
  var badCnt = curWeek.reduce(function(s, d) { return s + d.sessions.filter(function(x) { return x.type === "badminton" && !x.cancelled; }).length; }, 0);
  var gymCnt = curWeek.reduce(function(s, d) { return s + d.sessions.filter(function(x) { return x.type === "gym" && !x.cancelled; }).length; }, 0);

  var todayW = wLogs[today] || {};
  var wCnt = WELLNESS_LABELS.filter(function(l) { return todayW[l]; }).length;
  var wAvg = wCnt > 0 ? WELLNESS_LABELS.reduce(function(s, l) { return s + (todayW[l] || 0); }, 0) / wCnt : 0;
  var todayGym = gLogs[today] || {};

  function setSessStatus(di, sid, status) {
    var key = weekId + "-" + di;
    var ss = (weekOv[key] || curWeek[di].sessions).map(function(s) { return s.id === sid ? Object.assign({}, s, { cancelled: status === "cancelled" }) : s; });
    setWeekOv(Object.assign({}, weekOv, { [key]: ss }));
  }

  function addSess(di) {
    if (!newSess.label) return;
    var key = weekId + "-" + di;
    var ex = weekOv[key] || curWeek[di].sessions;
    setWeekOv(Object.assign({}, weekOv, { [key]: ex.concat([Object.assign({}, newSess, { id: genId() })]) }));
    setNewSess({ label: "", time: "", type: "badminton" }); setShowAddSess(false);
  }

  function saveTLog() {
    if (!logSess) return;
    var saveDate = logSess._logDate || today;
    var saveWeekId = getWeekId(new Date(saveDate));
    var key = saveDate + "-" + logSess.id;
    setTLogs(Object.assign({}, tLogs, { [key]: Object.assign({}, logForm, { sessionId: logSess.id, sessionLabel: logSess.label, sessionType: logSess.type, date: saveDate, weekId: saveWeekId }) }));
    setLogSess(null); setLogForm({ completed: "yes", trainingType: [], rating: 0, energy: 0, note: "" });
  }

  function saveMatch() {
    if (!showMatch) return;
    var key = genId();
    setMLogs(Object.assign({}, mLogs, { [key]: Object.assign({}, matchForm, { compName: showMatch.name, compType: showMatch.type, compDate: showMatch.date, date: today }) }));
    setShowMatch(null); setMatchForm({ matchType: "Singel", won: null, sets: [{ my: "", opp: "" }, { my: "", opp: "" }, { my: "", opp: "" }], opponent: "" });
  }

  function getDateForDayIndex(dayIdx) {
    var now = new Date();
    var currentDayIdx = getDayIndex();
    var diff = dayIdx - currentDayIdx;
    var d = new Date(now);
    d.setDate(now.getDate() + diff);
    return d.toISOString().split("T")[0];
  }

  function getSessionStatus(di, sid) {
    var dayDate = getDateForDayIndex(di);
    var key = dayDate + "-" + sid;
    if (tLogs[key]) return "done";
    var dayData = weekOv[weekId + "-" + di] || curWeek[di].sessions;
    var sess = dayData.find(function(s) { return s.id === sid; });
    if (sess && sess.cancelled) return "cancelled";
    return "planned";
  }

  function filterByPeriod(items, dateField) {
    var now = new Date();
    if (statsFilter === "week") {
      var wStart = new Date(now); wStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); wStart.setHours(0,0,0,0);
      return items.filter(function(it) { return new Date(it[dateField]) >= wStart; });
    } else if (statsFilter === "month") {
      var mStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return items.filter(function(it) { return new Date(it[dateField]) >= mStart; });
    } else if (statsFilter === "year") {
      var yStart = new Date(now.getFullYear(), 0, 1);
      return items.filter(function(it) { return new Date(it[dateField]) >= yStart; });
    } else if (statsFilter === "custom" && customDates.from && customDates.to) {
      var f = new Date(customDates.from), t = new Date(customDates.to); t.setHours(23,59,59);
      return items.filter(function(it) { var d = new Date(it[dateField]); return d >= f && d <= t; });
    }
    return items;
  }

  var tabs = [
    { id: "week", label: "Vecka", icon: "📅" },
    { id: "log", label: "Logg", icon: "✏️" },
    { id: "stats", label: "Statistik", icon: "📊" },
    { id: "calendar", label: "Tävling", icon: "🏸" },
  ];

  return (
    <div style={{ fontFamily: "'JetBrains Mono','SF Mono','Fira Code',monospace", background: "#0d0d12", color: "#e0e0e0", minHeight: "100vh", maxWidth: "600px", width: "100%", margin: "0 auto", position: "relative", paddingBottom: "80px" }}>

      <div style={{ padding: "24px 20px 16px", background: "linear-gradient(180deg,#14141e 0%,#0d0d12 100%)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "3px", color: "#555", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{userId}</span>
              {syncing && <span style={{ color: "#3498db" }}>● synkar</span>}
              <button onClick={handleLogout} style={{ padding: "1px 6px", borderRadius: "3px", border: "1px solid #333", background: "transparent", color: "#666", fontSize: "9px", cursor: "pointer", fontFamily: "inherit" }}>Logga ut</button>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#fff" }}>Vecka {weekNum}</div>
          </div>
          {nextComp && (
            <div style={{ background: daysToComp <= 3 ? "rgba(231,76,60,0.15)" : "rgba(244,166,35,0.12)", border: "1px solid " + (daysToComp <= 3 ? "rgba(231,76,60,0.3)" : "rgba(244,166,35,0.25)"), borderRadius: "8px", padding: "6px 10px" }}>
              <div style={{ fontSize: "10px", color: daysToComp <= 3 ? "#e74c3c" : "#f4a623", textTransform: "uppercase", letterSpacing: "1px" }}>{daysToComp <= 3 ? "Tävling snart!" : "Nästa tävling"}</div>
              <div style={{ fontSize: "12px", color: "#ccc", marginTop: "2px" }}>{nextComp.name} — {daysToComp}d</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
          {[{ l: "Pass", v: actSess, c: "#3498db" }, { l: "Badminton", v: badCnt, c: "#2ecc71" }, { l: "Gym", v: gymCnt, c: "#f4a623" }, { l: "Kropp", v: wAvg ? wAvg.toFixed(1) : "—", c: wAvg >= 4 ? "#2ecc71" : wAvg >= 3 ? "#f4a623" : "#e74c3c" }].map(function(s) {
            return (<div key={s.l} style={{ flex: 1, textAlign: "center", padding: "8px 0", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#666", marginTop: "2px" }}>{s.l}</div>
            </div>);
          })}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>

        {activeTab === "week" && (
          <div>
            <LoadBar value={actSess} max={10} label="Totalbelastning" color="#3498db" />
            <LoadBar value={badCnt} max={7} label="Badminton" color="#2ecc71" />
            <LoadBar value={gymCnt} max={3} label="Gym" color="#f4a623" />
            {isTaper && (<div style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.25)", borderRadius: "10px", padding: "12px 14px", margin: "12px 0" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#e74c3c" }}>⚡ Tävlingsvecka — Tapering</div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>Kör lättare gym. Fokus mobilitet och aktivering.</div>
            </div>)}
            <div style={{ marginTop: "12px" }}>
              {curWeek.map(function(day, i) {
                var isToday = i === todayIdx;
                return (
                  <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: isToday ? "#3498db" : "#666" }}>{day.day}{isToday ? " ← idag" : ""}</div>
                      <button onClick={function() { setAddSessDay(i); setShowAddSess(true); }} style={{ padding: "2px 8px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#666", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>+</button>
                    </div>
                    {day.sessions.map(function(s) {
                      if (s.type === "rest") return (<div key={s.id} style={{ padding: "6px 10px", fontSize: "12px", color: "#444" }}>{s.label}</div>);
                      var status = getSessionStatus(i, s.id);
                      var stColor = status === "done" ? "#2ecc71" : status === "cancelled" ? "#e74c3c" : "#3498db";
                      var stLabel = status === "done" ? "Genomfört" : status === "cancelled" ? "Inställt" : "Planerat";
                      var dayDate = getDateForDayIndex(i);
                      var logKey = dayDate + "-" + s.id;
                      var logEntry = tLogs[logKey];
                      return (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", marginBottom: "4px", background: "rgba(255,255,255,0.03)" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: s.type === "badminton" ? "#2ecc71" : "#f4a623" }} />
                          <div style={{ flex: 1, fontSize: "13px", color: status === "cancelled" ? "#666" : "#ccc", textDecoration: status === "cancelled" ? "line-through" : "none" }}>{s.label}</div>
                          {s.time ? <div style={{ fontSize: "11px", color: "#555" }}>{s.time}</div> : null}
                          <button onClick={function() {
                            if (status === "done" && logEntry) {
                              setViewLog(Object.assign({}, logEntry, { displayDate: dayDate }));
                            } else if (status === "cancelled") {
                              setSessStatus(i, s.id, "planned");
                            } else if (status === "planned") {
                              setSessStatus(i, s.id, "cancelled");
                            }
                          }} style={{ padding: "3px 8px", borderRadius: "4px", border: "none", background: stColor + "18", color: stColor, fontSize: "10px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", minWidth: "70px", textAlign: "center" }}>
                            {stLabel}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            {showAddSess && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={function() { setShowAddSess(false); }}>
                <div onClick={function(e) { e.stopPropagation(); }} style={{ background: "#1a1a24", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "340px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>Lägg till — {DAYS[addSessDay]}</div>
                  <input type="text" placeholder="Namn" value={newSess.label} onChange={function(e) { setNewSess(Object.assign({}, newSess, { label: e.target.value })); }} style={Object.assign({}, inp, { marginBottom: "8px" })} />
                  <input type="text" placeholder="Tid (t.ex. 18:00-19:30)" value={newSess.time} onChange={function(e) { setNewSess(Object.assign({}, newSess, { time: e.target.value })); }} style={Object.assign({}, inp, { marginBottom: "8px" })} />
                  <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                    <button onClick={function() { setNewSess(Object.assign({}, newSess, { type: "badminton" })); }} style={pill(newSess.type === "badminton")}>Badminton</button>
                    <button onClick={function() { setNewSess(Object.assign({}, newSess, { type: "gym" })); }} style={pill(newSess.type === "gym")}>Gym</button>
                  </div>
                  <button onClick={function() { addSess(addSessDay); }} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: newSess.label ? "#f4a623" : "rgba(255,255,255,0.05)", color: newSess.label ? "#000" : "#555", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Lägg till</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View log modal */}
        {viewLog && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={function() { setViewLog(null); }}>
            <div onClick={function(e) { e.stopPropagation(); }} style={{ background: "#1a1a24", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "360px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{viewLog.sessionLabel}</div>
              <div style={{ fontSize: "11px", color: "#666", marginBottom: "14px" }}>{new Date(viewLog.displayDate || viewLog.date).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}</div>

              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "4px" }}>Status</div>
              <div style={{ fontSize: "14px", color: viewLog.completed === "yes" ? "#2ecc71" : viewLog.completed === "partial" ? "#f4a623" : "#e74c3c", marginBottom: "12px", fontWeight: 600 }}>
                {viewLog.completed === "yes" ? "✓ Genomfört" : viewLog.completed === "partial" ? "~ Delvis" : "✗ Inte genomfört"}
              </div>

              {(function() {
                var tt = viewLog.trainingType;
                var ttArr = Array.isArray(tt) ? tt : (tt ? [tt] : []);
                if (ttArr.length === 0) return null;
                return (<div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "4px" }}>Typ av träning</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                    {ttArr.map(function(t) { return <span key={t} style={{ fontSize: "12px", color: "#3498db", background: "rgba(52,152,219,0.15)", padding: "3px 8px", borderRadius: "5px", fontWeight: 600 }}>{t}</span>; })}
                  </div>
                </div>);
              })()}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "4px" }}>Egen insats</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: viewLog.rating >= 4 ? "#2ecc71" : viewLog.rating >= 3 ? "#f4a623" : "#e74c3c" }}>{viewLog.rating || "—"}<span style={{ fontSize: "12px", color: "#555" }}>/5</span></div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "4px" }}>Energinivå</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: viewLog.energy >= 4 ? "#2ecc71" : viewLog.energy >= 3 ? "#f4a623" : "#e74c3c" }}>{viewLog.energy || "—"}<span style={{ fontSize: "12px", color: "#555" }}>/5</span></div>
                </div>
              </div>

              {viewLog.note && (<div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "4px" }}>Anteckning</div>
                <div style={{ fontSize: "13px", color: "#ccc", background: "rgba(255,255,255,0.04)", padding: "10px", borderRadius: "8px", marginBottom: "12px", fontStyle: "italic" }}>{viewLog.note}</div>
              </div>)}

              <button onClick={function() { setViewLog(null); }} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#888", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", marginTop: "8px" }}>Stäng</button>
            </div>
          </div>
        )}

        {activeTab === "log" && (
          <div>
            {/* Date selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "10px" }}>
              <div style={{ fontSize: "11px", color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "1px" }}>Dag att logga</div>
              <input type="date" value={logDate} max={today} onChange={function(e) { setLogDate(e.target.value); }}
                style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid #333", background: "rgba(255,255,255,0.05)", color: "#e0e0e0", fontSize: "12px", fontFamily: "inherit" }} />
              {logDate !== today && (
                <button onClick={function() { setLogDate(today); }} style={{ padding: "4px 10px", borderRadius: "5px", border: "1px solid rgba(244,166,35,0.3)", background: "transparent", color: "#f4a623", fontSize: "10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Idag</button>
              )}
            </div>

            {(function() {
              var selDate = new Date(logDate);
              var selDayJs = selDate.getDay();
              var selDayIdx = selDayJs === 0 ? 6 : selDayJs - 1;
              var selWeekId = getWeekId(selDate);
              var selDayOverride = weekOv[selWeekId + "-" + selDayIdx];
              var selDaySessions = selDayOverride || DEFAULT_WEEK[selDayIdx].sessions;
              var isLogToday = logDate === today;

              return (<div>
                {isLogToday && (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Daglig avstämning</div>
                    <div style={{ fontSize: "11px", color: "#666", marginBottom: "10px" }}>1 = dåligt, 5 = topp</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {WELLNESS_LABELS.map(function(label) {
                        return (<div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "10px" }}>
                          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "6px" }}>{label}</div>
                          <div style={{ display: "flex", gap: "3px" }}>
                            {[1,2,3,4,5].map(function(v) { return <button key={v} onClick={function() { var u = Object.assign({}, wLogs); u[today] = Object.assign({}, todayW, {[label]: v}); setWLogs(u); }} style={ratBtn(todayW[label] === v, v)}>{v}</button>; })}
                          </div>
                        </div>);
                      })}
                    </div>
                    {wAvg > 0 && wAvg < 3 && (<div style={{ marginTop: "8px", background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)", borderRadius: "8px", padding: "8px 10px", fontSize: "11px", color: "#e74c3c" }}>💡 Överväg lättare pass idag.</div>)}
                  </div>
                )}

                <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{isLogToday ? "Dagens pass" : "Pass " + new Date(logDate).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}</div>
                <div style={{ fontSize: "11px", color: "#666", marginBottom: "10px" }}>Klicka för att logga eller se detaljer</div>
                {selDaySessions.filter(function(s) { return s.type !== "rest" && !s.cancelled; }).map(function(sess) {
                  var lk = logDate + "-" + sess.id, logged = tLogs[lk];
                  return (<div key={sess.id} onClick={function() {
                    if (logged) { setViewLog(Object.assign({}, logged, { displayDate: logDate })); }
                    else { setLogSess(Object.assign({}, sess, { _logDate: logDate })); setLogForm({ completed: "yes", trainingType: [], rating: 0, energy: 0, note: "" }); }
                  }} style={{
                    display: "flex", alignItems: "center", gap: "10px", padding: "12px", marginBottom: "6px", borderRadius: "10px",
                    background: logged ? "rgba(46,204,113,0.08)" : "rgba(255,255,255,0.03)",
                    border: logged ? "1px solid rgba(46,204,113,0.25)" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer",
                  }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, background: sess.type === "badminton" ? "#2ecc71" : "#f4a623" }} />
                    <div style={{ flex: 1 }}><div style={{ fontSize: "13px", color: "#e0e0e0", fontWeight: 500 }}>{sess.label}</div><div style={{ fontSize: "11px", color: "#666" }}>{sess.time}</div></div>
                    {logged ? (<div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ fontSize: "11px", color: "#2ecc71" }}>✓ Loggat</span>{logged.rating > 0 && <span style={{ fontSize: "11px", color: "#f4a623" }}>★{logged.rating}</span>}</div>) : (<div style={{ fontSize: "11px", color: "#f4a623" }}>Logga →</div>)}
                  </div>);
                })}

                {selDaySessions.some(function(s) { return s.type === "gym" && !s.cancelled; }) && isLogToday && (
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Gympass</div>
                    <div style={{ fontSize: "11px", color: "#666", marginBottom: "10px" }}>{isTaper ? "⚡ Tävlingsvecka: 60% vikt" : "Logga vikter"}</div>
                    <GymLog exercises={GYM_EXERCISES} log={todayGym} setLog={function(fn) { var u = typeof fn === "function" ? fn(todayGym) : fn; var g = Object.assign({}, gLogs); g[today] = u; setGLogs(g); }} />
                  </div>
                )}

                {selDaySessions.every(function(s) { return s.type === "rest" || s.cancelled; }) && (
                  <div style={{ textAlign: "center", padding: "30px 0", color: "#555", fontSize: "13px" }}>Vilodag 🧘</div>
                )}
              </div>);
            })()}

            {logSess && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={function() { setLogSess(null); }}>
                <div onClick={function(e) { e.stopPropagation(); }} style={{ background: "#1a1a24", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "360px", maxHeight: "80vh", overflowY: "auto" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Logga: {logSess.label}</div>
                  <div style={{ fontSize: "11px", color: "#666", marginBottom: "14px" }}>
                    {logSess.time}
                    {logSess._logDate && logSess._logDate !== today && (
                      <span style={{ color: "#f4a623", marginLeft: "8px" }}>• {new Date(logSess._logDate).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" })}</span>
                    )}
                  </div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "6px" }}>Blev passet av?</div>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                    {[{ v: "yes", l: "Ja" }, { v: "partial", l: "Delvis" }, { v: "no", l: "Nej" }].map(function(o) { return <button key={o.v} onClick={function() { setLogForm(Object.assign({}, logForm, { completed: o.v })); }} style={pill(logForm.completed === o.v, o.v === "yes" ? "#2ecc71" : o.v === "partial" ? "#f4a623" : "#e74c3c")}>{o.l}</button>; })}
                  </div>
                  {logSess.type === "badminton" && (<div>
                    <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "6px" }}>Typ av träning</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "14px" }}>
                      {TRAINING_TYPES.map(function(t) {
                        var ttArr = Array.isArray(logForm.trainingType) ? logForm.trainingType : (logForm.trainingType ? [logForm.trainingType] : []);
                        var selected = ttArr.indexOf(t) !== -1;
                        return <button key={t} onClick={function() {
                          var newArr = selected ? ttArr.filter(function(x) { return x !== t; }) : ttArr.concat([t]);
                          setLogForm(Object.assign({}, logForm, { trainingType: newArr }));
                        }} style={Object.assign({}, pill(selected, "#3498db"), { flex: "0 0 auto", padding: "6px 12px" })}>{t}</button>;
                      })}
                    </div>
                  </div>)}
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "6px" }}>Egen insats</div>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "14px" }}>{[1,2,3,4,5].map(function(v) { return <button key={v} onClick={function() { setLogForm(Object.assign({}, logForm, { rating: v })); }} style={ratBtn(logForm.rating === v, v)}>{v}</button>; })}</div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "6px" }}>Energinivå</div>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "14px" }}>{[1,2,3,4,5].map(function(v) { return <button key={v} onClick={function() { setLogForm(Object.assign({}, logForm, { energy: v })); }} style={ratBtn(logForm.energy === v, v)}>{v}</button>; })}</div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "6px" }}>Anteckning</div>
                  <textarea value={logForm.note} onChange={function(e) { setLogForm(Object.assign({}, logForm, { note: e.target.value })); }} placeholder="Valfritt..." style={Object.assign({}, inp, { height: "60px", resize: "none", marginBottom: "14px" })} />
                  <button onClick={saveTLog} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "#2ecc71", color: "#000", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Spara</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (function() {
          var allTLogs = Object.values(tLogs);
          var allMLogs = Object.values(mLogs);
          var fTLogs = filterByPeriod(allTLogs, "date");
          var fMLogs = filterByPeriod(allMLogs, "date");

          var badLogs = fTLogs.filter(function(l) { return l.sessionType === "badminton"; });
          var gymLogs2 = fTLogs.filter(function(l) { return l.sessionType === "gym"; });
          var seriesMatches = fMLogs.filter(function(l) { return l.compType === "series"; });
          var tournMatches = fMLogs.filter(function(l) { return l.compType === "tournament"; });

          function matchStats(matches) {
            var won = matches.filter(function(m) { return m.won === true; }).length;
            var lost = matches.filter(function(m) { return m.won === false; }).length;
            var byType = {}; MATCH_TYPES.forEach(function(t) { byType[t] = matches.filter(function(m) { return m.matchType === t; }); });
            return { total: matches.length, won: won, lost: lost, byType: byType };
          }

          return (
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>Statistik</div>

              <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
                {[{ v: "week", l: "Vecka" }, { v: "month", l: "Månad" }, { v: "year", l: "År" }, { v: "custom", l: "Anpassad" }].map(function(f) {
                  return <button key={f.v} onClick={function() { setStatsFilter(f.v); }} style={Object.assign({}, pill(statsFilter === f.v), { flex: "0 0 auto", padding: "6px 12px" })}>{f.l}</button>;
                })}
              </div>
              {statsFilter === "custom" && (
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <input type="date" value={customDates.from} onChange={function(e) { setCustomDates(Object.assign({}, customDates, { from: e.target.value })); }} style={Object.assign({}, inp, { fontSize: "11px" })} />
                  <input type="date" value={customDates.to} onChange={function(e) { setCustomDates(Object.assign({}, customDates, { to: e.target.value })); }} style={Object.assign({}, inp, { fontSize: "11px" })} />
                </div>
              )}

              <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                {[{ v: "badminton", l: "Badminton", c: "#2ecc71" }, { v: "gym", l: "Gym", c: "#f4a623" }, { v: "series", l: "Seriespel", c: "#3498db" }, { v: "tournament", l: "Tävlingar", c: "#e74c3c" }].map(function(t) {
                  return <button key={t.v} onClick={function() { setStatsTab(t.v); }} style={Object.assign({}, pill(statsTab === t.v, t.c), { fontSize: "10px", padding: "6px 4px" })}>{t.l}</button>;
                })}
              </div>

              {statsTab === "badminton" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                    {[{ l: "Träningar", v: badLogs.length, c: "#2ecc71" }, { l: "Genomförda", v: badLogs.filter(function(l) { return l.completed === "yes"; }).length, c: "#3498db" },
                      { l: "Snittinsats", v: badLogs.length > 0 ? (badLogs.reduce(function(s,l) { return s + (l.rating||0); }, 0) / badLogs.length).toFixed(1) : "—", c: "#f4a623" },
                      { l: "Snittenergi", v: badLogs.length > 0 ? (badLogs.reduce(function(s,l) { return s + (l.energy||0); }, 0) / badLogs.length).toFixed(1) : "—", c: "#9b59b6" },
                    ].map(function(s) {
                      return (<div key={s.l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: s.c }}>{s.v}</div>
                        <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#666", marginTop: "4px" }}>{s.l}</div>
                      </div>);
                    })}
                  </div>
                  {(function() {
                    var tc = {}; badLogs.forEach(function(l) {
                      var tt = l.trainingType;
                      var ttArr = Array.isArray(tt) ? tt : (tt ? [tt] : []);
                      ttArr.forEach(function(t) { tc[t] = (tc[t]||0) + 1; });
                    });
                    var total = Object.values(tc).reduce(function(s,c) { return s+c; }, 0);
                    if (total === 0) return null;
                    return (<div style={{ marginBottom: "16px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#aaa", marginBottom: "8px" }}>Träningstyper</div>
                      {Object.entries(tc).sort(function(a,b) { return b[1]-a[1]; }).map(function(e) {
                        var pct = Math.round(e[1]/total*100);
                        return (<div key={e[0]} style={{ marginBottom: "6px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                            <span style={{ fontSize: "12px", color: "#ccc" }}>{e[0]}</span><span style={{ fontSize: "11px", color: "#888" }}>{e[1]}st ({pct}%)</span>
                          </div>
                          <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: pct+"%", height: "100%", background: "#2ecc71", borderRadius: "3px" }} /></div>
                        </div>);
                      })}
                    </div>);
                  })()}
                  {badLogs.length === 0 && <div style={{ textAlign: "center", padding: "30px 0", color: "#555", fontSize: "13px" }}>Ingen badmintondata för vald period</div>}
                </div>
              )}

              {statsTab === "gym" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 700, color: "#f4a623" }}>{gymLogs2.length}</div>
                      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#666", marginTop: "4px" }}>Gympass</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 700, color: "#2ecc71" }}>{gymLogs2.filter(function(l) { return l.completed === "yes"; }).length}</div>
                      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#666", marginTop: "4px" }}>Genomförda</div>
                    </div>
                  </div>
                  {gymLogs2.length === 0 && <div style={{ textAlign: "center", padding: "30px 0", color: "#555", fontSize: "13px" }}>Ingen gymdata för vald period</div>}
                </div>
              )}

              {statsTab === "series" && (function() {
                var ms = matchStats(seriesMatches);
                return (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: "#3498db" }}>{ms.total}</div>
                        <div style={{ fontSize: "9px", textTransform: "uppercase", color: "#666", marginTop: "4px" }}>Matcher</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: "#2ecc71" }}>{ms.won}</div>
                        <div style={{ fontSize: "9px", textTransform: "uppercase", color: "#666", marginTop: "4px" }}>Vinster</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: "#e74c3c" }}>{ms.lost}</div>
                        <div style={{ fontSize: "9px", textTransform: "uppercase", color: "#666", marginTop: "4px" }}>Förluster</div>
                      </div>
                    </div>
                    {MATCH_TYPES.map(function(mt) {
                      var m = ms.byType[mt]; if (m.length === 0) return null;
                      var w = m.filter(function(x) { return x.won; }).length;
                      return (<div key={mt} style={{ marginBottom: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#ccc", marginBottom: "4px" }}><span>{mt}</span><span>{w}V / {m.length - w}F</span></div>
                        <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: (m.length > 0 ? (w/m.length*100) : 0)+"%", height: "100%", background: "#2ecc71", borderRadius: "3px" }} />
                        </div>
                      </div>);
                    })}
                    {seriesMatches.length > 0 && (<div style={{ marginTop: "12px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#aaa", marginBottom: "8px" }}>Matchhistorik</div>
                      {seriesMatches.slice().reverse().map(function(m, i) {
                        var setStr = m.sets.filter(function(s) { return s.my || s.opp; }).map(function(s) { return s.my + "-" + s.opp; }).join(", ");
                        return (<div key={i} style={{ padding: "8px 10px", marginBottom: "4px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div><div style={{ fontSize: "12px", color: "#ccc" }}>{m.matchType} — {m.compName}</div><div style={{ fontSize: "10px", color: "#666" }}>{m.opponent ? "vs " + m.opponent + " — " : ""}{setStr}</div></div>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: m.won ? "#2ecc71" : "#e74c3c" }}>{m.won ? "V" : "F"}</div>
                        </div>);
                      })}
                    </div>)}
                    {ms.total === 0 && <div style={{ textAlign: "center", padding: "30px 0", color: "#555", fontSize: "13px" }}>Inga seriematcher för vald period</div>}
                  </div>
                );
              })()}

              {statsTab === "tournament" && (function() {
                var ms = matchStats(tournMatches);
                return (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: "#e74c3c" }}>{ms.total}</div>
                        <div style={{ fontSize: "9px", textTransform: "uppercase", color: "#666", marginTop: "4px" }}>Matcher</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: "#2ecc71" }}>{ms.won}</div>
                        <div style={{ fontSize: "9px", textTransform: "uppercase", color: "#666", marginTop: "4px" }}>Vinster</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: "#e74c3c" }}>{ms.lost}</div>
                        <div style={{ fontSize: "9px", textTransform: "uppercase", color: "#666", marginTop: "4px" }}>Förluster</div>
                      </div>
                    </div>
                    {MATCH_TYPES.map(function(mt) {
                      var m = ms.byType[mt]; if (m.length === 0) return null;
                      var w = m.filter(function(x) { return x.won; }).length;
                      return (<div key={mt} style={{ marginBottom: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#ccc", marginBottom: "4px" }}><span>{mt}</span><span>{w}V / {m.length - w}F</span></div>
                        <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: (m.length > 0 ? (w/m.length*100) : 0)+"%", height: "100%", background: "#2ecc71", borderRadius: "3px" }} />
                        </div>
                      </div>);
                    })}
                    {tournMatches.length > 0 && (<div style={{ marginTop: "12px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#aaa", marginBottom: "8px" }}>Matchhistorik</div>
                      {tournMatches.slice().reverse().map(function(m, i) {
                        var setStr = m.sets.filter(function(s) { return s.my || s.opp; }).map(function(s) { return s.my + "-" + s.opp; }).join(", ");
                        return (<div key={i} style={{ padding: "8px 10px", marginBottom: "4px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div><div style={{ fontSize: "12px", color: "#ccc" }}>{m.matchType} — {m.compName}</div><div style={{ fontSize: "10px", color: "#666" }}>{m.opponent ? "vs " + m.opponent + " — " : ""}{setStr}</div></div>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: m.won ? "#2ecc71" : "#e74c3c" }}>{m.won ? "V" : "F"}</div>
                        </div>);
                      })}
                    </div>)}
                    {ms.total === 0 && <div style={{ textAlign: "center", padding: "30px 0", color: "#555", fontSize: "13px" }}>Inga tävlingsmatcher för vald period</div>}
                  </div>
                );
              })()}

              {/* Latest logged sessions */}
              {(function() {
                var filteredLogs = filterByPeriod(Object.values(tLogs), "date");
                var typeMatch = statsTab === "badminton" ? "badminton" : statsTab === "gym" ? "gym" : null;
                var latestLogs = typeMatch ? filteredLogs.filter(function(l) { return l.sessionType === typeMatch; }) : [];
                latestLogs = latestLogs.sort(function(a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 15);
                if (latestLogs.length === 0) return null;
                return (
                  <div style={{ marginTop: "24px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#aaa", marginBottom: "8px" }}>Senaste loggade pass</div>
                    {latestLogs.map(function(log, i) {
                      return (
                        <div key={i} onClick={function() { setViewLog(log); }} style={{
                          display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", marginBottom: "4px", borderRadius: "8px",
                          background: "rgba(255,255,255,0.03)", cursor: "pointer",
                        }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: log.sessionType === "badminton" ? "#2ecc71" : "#f4a623" }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "12px", color: "#e0e0e0", fontWeight: 500 }}>{log.sessionLabel}</div>
                            <div style={{ fontSize: "10px", color: "#666" }}>
                              {new Date(log.date).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" })}
                              {(function() {
                                var tt = log.trainingType;
                                var ttArr = Array.isArray(tt) ? tt : (tt ? [tt] : []);
                                return ttArr.length > 0 ? " — " + ttArr.join(", ") : "";
                              })()}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {log.rating > 0 && <span style={{ fontSize: "11px", color: "#f4a623" }}>★{log.rating}</span>}
                            <span style={{ fontSize: "11px", color: log.completed === "yes" ? "#2ecc71" : log.completed === "partial" ? "#f4a623" : "#e74c3c" }}>
                              {log.completed === "yes" ? "✓" : log.completed === "partial" ? "~" : "✗"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {activeTab === "calendar" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Tävlingskalender</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Tryck på tävling för att logga matcher</div>
              </div>
              <button onClick={function() { setShowAddComp(!showAddComp); }} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid rgba(244,166,35,0.3)", background: showAddComp ? "rgba(244,166,35,0.15)" : "transparent", color: "#f4a623", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{showAddComp ? "×" : "+"}</button>
            </div>
            {showAddComp && (
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "14px", marginBottom: "16px", border: "1px solid rgba(244,166,35,0.15)" }}>
                <input type="text" placeholder="Namn" value={newComp.name} onChange={function(e) { setNewComp(Object.assign({}, newComp, { name: e.target.value })); }} style={Object.assign({}, inp, { marginBottom: "8px" })} />
                <input type="date" value={newComp.date} onChange={function(e) { setNewComp(Object.assign({}, newComp, { date: e.target.value })); }} style={Object.assign({}, inp, { marginBottom: "8px" })} />
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                  <button onClick={function() { setNewComp(Object.assign({}, newComp, { type: "tournament" })); }} style={pill(newComp.type === "tournament")}>Tävling 🏆</button>
                  <button onClick={function() { setNewComp(Object.assign({}, newComp, { type: "series" })); }} style={pill(newComp.type === "series")}>Seriespel 🏸</button>
                </div>
                <button onClick={function() { if (newComp.name && newComp.date) { setCompetitions(competitions.concat([Object.assign({}, newComp)])); setNewComp({ name: "", date: "", type: "tournament" }); setShowAddComp(false); } }} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: newComp.name && newComp.date ? "#f4a623" : "rgba(255,255,255,0.05)", color: newComp.name && newComp.date ? "#000" : "#555", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Lägg till</button>
              </div>
            )}
            {sortedComps.map(function(comp, i) {
              var d = daysUntil(comp.date), isPast = d < 0, isNext = comp === nextComp;
              var compMatches = Object.values(mLogs).filter(function(m) { return m.compName === comp.name && m.compDate === comp.date; });
              return (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div onClick={function() { setShowMatch(comp); setMatchForm({ matchType: "Singel", won: null, sets: [{ my: "", opp: "" }, { my: "", opp: "" }, { my: "", opp: "" }], opponent: "" }); }} style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: compMatches.length > 0 ? "10px 10px 0 0" : "10px",
                    background: isNext ? "rgba(244,166,35,0.08)" : "rgba(255,255,255,0.02)",
                    border: isNext ? "1px solid rgba(244,166,35,0.25)" : "1px solid transparent", opacity: isPast && compMatches.length === 0 ? 0.4 : 1, cursor: "pointer",
                  }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: comp.type === "tournament" ? "rgba(231,76,60,0.15)" : "rgba(52,152,219,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{comp.type === "tournament" ? "🏆" : "🏸"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#e0e0e0" }}>{comp.name}</div>
                      <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{new Date(comp.date).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" })}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {compMatches.length > 0 && <span style={{ fontSize: "11px", color: "#3498db" }}>{compMatches.length} matcher</span>}
                      <div style={{ fontSize: "12px", fontWeight: 600, color: isPast ? "#555" : d <= 7 ? "#f4a623" : "#666" }}>{isPast ? "Klar" : d + "d"}</div>
                      <button onClick={function(e) { e.stopPropagation(); setCompetitions(competitions.filter(function(c) { return c !== comp; })); }} style={{ width: "24px", height: "24px", borderRadius: "6px", border: "none", background: "rgba(231,76,60,0.1)", color: "#e74c3c", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    </div>
                  </div>
                  {compMatches.length > 0 && (
                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "0 0 10px 10px", padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      {compMatches.map(function(m, j) {
                        var setStr = m.sets.filter(function(s) { return s.my || s.opp; }).map(function(s) { return s.my + "-" + s.opp; }).join(", ");
                        return (<div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: "11px" }}>
                          <span style={{ color: "#999" }}>{m.matchType}{m.opponent ? " vs " + m.opponent : ""}</span>
                          <span><span style={{ color: "#888" }}>{setStr}</span> <span style={{ fontWeight: 700, color: m.won ? "#2ecc71" : "#e74c3c", marginLeft: "6px" }}>{m.won ? "V" : "F"}</span></span>
                        </div>);
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {showMatch && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={function() { setShowMatch(null); }}>
                <div onClick={function(e) { e.stopPropagation(); }} style={{ background: "#1a1a24", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "360px", maxHeight: "80vh", overflowY: "auto" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Logga match</div>
                  <div style={{ fontSize: "11px", color: "#666", marginBottom: "14px" }}>{showMatch.name} — {new Date(showMatch.date).toLocaleDateString("sv-SE")}</div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "6px" }}>Typ av match</div>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                    {MATCH_TYPES.map(function(t) { return <button key={t} onClick={function() { setMatchForm(Object.assign({}, matchForm, { matchType: t })); }} style={pill(matchForm.matchType === t, "#3498db")}>{t}</button>; })}
                  </div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "6px" }}>Motståndare</div>
                  <input type="text" placeholder="Namn (valfritt)" value={matchForm.opponent} onChange={function(e) { setMatchForm(Object.assign({}, matchForm, { opponent: e.target.value })); }} style={Object.assign({}, inp, { marginBottom: "14px" })} />
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "6px" }}>Set (bäst av 3)</div>
                  {[0, 1, 2].map(function(si) {
                    return (<div key={si} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", color: "#666", width: "40px" }}>Set {si + 1}</span>
                      <input type="number" placeholder="Du" value={matchForm.sets[si].my} onChange={function(e) { var s = matchForm.sets.slice(); s[si] = Object.assign({}, s[si], { my: e.target.value }); setMatchForm(Object.assign({}, matchForm, { sets: s })); }}
                        style={{ width: "60px", padding: "6px", borderRadius: "6px", border: "1px solid #333", background: "rgba(255,255,255,0.05)", color: "#ccc", fontSize: "13px", textAlign: "center" }} />
                      <span style={{ color: "#555" }}>—</span>
                      <input type="number" placeholder="Motst." value={matchForm.sets[si].opp} onChange={function(e) { var s = matchForm.sets.slice(); s[si] = Object.assign({}, s[si], { opp: e.target.value }); setMatchForm(Object.assign({}, matchForm, { sets: s })); }}
                        style={{ width: "60px", padding: "6px", borderRadius: "6px", border: "1px solid #333", background: "rgba(255,255,255,0.05)", color: "#ccc", fontSize: "13px", textAlign: "center" }} />
                    </div>);
                  })}
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "6px", marginTop: "10px" }}>Resultat</div>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                    <button onClick={function() { setMatchForm(Object.assign({}, matchForm, { won: true })); }} style={pill(matchForm.won === true, "#2ecc71")}>Vinst ✓</button>
                    <button onClick={function() { setMatchForm(Object.assign({}, matchForm, { won: false })); }} style={pill(matchForm.won === false, "#e74c3c")}>Förlust ✗</button>
                  </div>
                  <button onClick={saveMatch} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: matchForm.won !== null ? "#2ecc71" : "rgba(255,255,255,0.05)", color: matchForm.won !== null ? "#000" : "#555", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Spara match</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "600px", background: "rgba(13,13,18,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", padding: "8px 16px", paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
        {tabs.map(function(t) {
          return (<button key={t.id} onClick={function() { setActiveTab(t.id); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "8px 0", background: "transparent", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: "20px", filter: activeTab === t.id ? "none" : "grayscale(1) opacity(0.4)" }}>{t.icon}</span>
            <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, color: activeTab === t.id ? "#f4a623" : "#444", fontFamily: "'JetBrains Mono',monospace" }}>{t.label}</span>
          </button>);
        })}
      </div>
    </div>
  );
}
