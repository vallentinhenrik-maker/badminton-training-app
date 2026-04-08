import { useState, useEffect } from "react";

const DAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
const WELLNESS_LABELS = ["Sömn", "Muskeltrötthet", "Motivation", "Energi"];

const DEFAULT_WEEK = [
  { day: "Mån", sessions: [{ type: "gym", label: "Gym (skola)", time: "16:40-17:00" }, { type: "badminton", label: "Klubb", time: "18:30-20:00" }] },
  { day: "Tis", sessions: [{ type: "badminton", label: "Klubb", time: "18:30-20:00" }] },
  { day: "Ons", sessions: [{ type: "badminton", label: "Skola", time: "07:15-09:00" }, { type: "badminton", label: "Klubb", time: "18:30-20:00" }] },
  { day: "Tor", sessions: [{ type: "gym", label: "Extra gym", time: "14:20" }, { type: "badminton", label: "Klubb", time: "19:30-21:00" }] },
  { day: "Fre", sessions: [{ type: "badminton", label: "Skola", time: "07:15-09:00" }] },
  { day: "Lör", sessions: [{ type: "rest", label: "Vila / Tävling", time: "" }] },
  { day: "Sön", sessions: [{ type: "rest", label: "Vila / Tävling", time: "" }] },
];

const GYM_EXERCISES = [
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
];

const COMPETITIONS = [
  { date: "2026-04-11", name: "Serispel (hemma)", type: "series" },
  { date: "2026-04-25", name: "RSL Tävling", type: "tournament" },
  { date: "2026-05-09", name: "Seriespel (borta)", type: "series" },
  { date: "2026-05-23", name: "Distriktsmästerskap", type: "tournament" },
  { date: "2026-06-06", name: "USM", type: "tournament" },
];

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function getNextCompetition(competitions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return competitions.find(c => new Date(c.date) >= today);
}

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target - today) / 86400000);
}

// --- Components ---

function WellnessCheck({ wellness, setWellness }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      {WELLNESS_LABELS.map((label) => (
        <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#8a8a9a", marginBottom: "8px" }}>{label}</div>
          <div style={{ display: "flex", gap: "4px" }}>
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setWellness({ ...wellness, [label]: v })}
                style={{
                  flex: 1,
                  height: "32px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: wellness[label] === v
                    ? v <= 2 ? "#e74c3c" : v <= 3 ? "#f4a623" : "#2ecc71"
                    : "rgba(255,255,255,0.06)",
                  color: wellness[label] === v ? "#fff" : "#555",
                  transition: "all 0.15s ease",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadBar({ value, max, label, color }) {
  const pct = Math.min((value / max) * 100, 100);
  const isHigh = pct > 85;
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "#8a8a9a" }}>{label}</span>
        <span style={{ fontSize: "12px", color: isHigh ? "#e74c3c" : "#8a8a9a", fontWeight: isHigh ? 700 : 400 }}>
          {isHigh ? "⚠ Hög belastning" : `${Math.round(pct)}%`}
        </span>
      </div>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: isHigh ? "#e74c3c" : color,
          borderRadius: "3px",
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

function GymLog({ exercises, log, setLog }) {
  const toggle = (id) => {
    setLog(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const updateWeight = (id, val) => {
    setLog(prev => ({ ...prev, [`w_${id}`]: val }));
  };

  const categories = [...new Set(exercises.map(e => e.category))];

  return (
    <div>
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: "16px" }}>
          <div style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "#f4a623",
            marginBottom: "8px",
            paddingLeft: "2px",
          }}>{cat}</div>
          {exercises.filter(e => e.category === cat).map(ex => (
            <div
              key={ex.id}
              onClick={() => toggle(ex.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                marginBottom: "4px",
                borderRadius: "8px",
                background: log[ex.id] ? "rgba(46,204,113,0.1)" : "rgba(255,255,255,0.03)",
                border: log[ex.id] ? "1px solid rgba(46,204,113,0.3)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "5px",
                  border: log[ex.id] ? "none" : "2px solid #444",
                  background: log[ex.id] ? "#2ecc71" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", color: "#fff", flexShrink: 0,
                }}>
                  {log[ex.id] && "✓"}
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: "#e0e0e0", fontWeight: 500 }}>{ex.name}</div>
                  <div style={{ fontSize: "11px", color: "#666" }}>{ex.sets} × {ex.reps} — {ex.targetMuscle}</div>
                </div>
              </div>
              <div onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <input
                  type="number"
                  placeholder="kg"
                  value={log[`w_${ex.id}`] || ""}
                  onChange={e => updateWeight(ex.id, e.target.value)}
                  style={{
                    width: "52px", padding: "4px 6px", borderRadius: "6px",
                    border: "1px solid #333", background: "rgba(255,255,255,0.05)",
                    color: "#ccc", fontSize: "12px", textAlign: "center",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// --- Main App ---

export default function BadmintonTrainingApp() {
  const [activeTab, setActiveTab] = useState("week");
  const [wellness, setWellness] = useState({});
  const [gymLog, setGymLog] = useState({});
  const [week, setWeek] = useState(DEFAULT_WEEK);
  const [isTaperWeek, setIsTaperWeek] = useState(false);

  const nextComp = getNextCompetition(COMPETITIONS);
  const daysToComp = nextComp ? daysUntil(nextComp.date) : null;

  useEffect(() => {
    if (daysToComp !== null && daysToComp <= 3) {
      setIsTaperWeek(true);
    } else {
      setIsTaperWeek(false);
    }
  }, [daysToComp]);

  const weekNum = getWeekNumber(new Date());
  const totalSessions = week.reduce((sum, d) => sum + d.sessions.filter(s => s.type !== "rest").length, 0);
  const badmintonSessions = week.reduce((sum, d) => sum + d.sessions.filter(s => s.type === "badminton").length, 0);
  const gymSessions = week.reduce((sum, d) => sum + d.sessions.filter(s => s.type === "gym").length, 0);

  const wellnessAvg = WELLNESS_LABELS.length > 0
    ? WELLNESS_LABELS.reduce((s, l) => s + (wellness[l] || 0), 0) / WELLNESS_LABELS.filter(l => wellness[l]).length || 0
    : 0;

  const completedExercises = GYM_EXERCISES.filter(e => gymLog[e.id]).length;

  const tabs = [
    { id: "week", label: "Vecka", icon: "📅" },
    { id: "gym", label: "Gym", icon: "🏋️" },
    { id: "wellness", label: "Kroppen", icon: "💚" },
    { id: "calendar", label: "Tävling", icon: "🏸" },
  ];

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      background: "#0d0d12",
      color: "#e0e0e0",
      minHeight: "100vh",
      maxWidth: "480px",
      margin: "0 auto",
      position: "relative",
      paddingBottom: "80px",
    }}>
      {/* Header */}
      <div style={{
        padding: "24px 20px 16px",
        background: "linear-gradient(180deg, #14141e 0%, #0d0d12 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "3px", color: "#555", marginBottom: "4px" }}>
              Badminton Performance
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
              Vecka {weekNum}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            {nextComp && (
              <div style={{
                background: daysToComp <= 3 ? "rgba(231,76,60,0.15)" : "rgba(244,166,35,0.12)",
                border: `1px solid ${daysToComp <= 3 ? "rgba(231,76,60,0.3)" : "rgba(244,166,35,0.25)"}`,
                borderRadius: "8px",
                padding: "6px 10px",
              }}>
                <div style={{ fontSize: "10px", color: daysToComp <= 3 ? "#e74c3c" : "#f4a623", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {daysToComp <= 3 ? "Tävling snart!" : "Nästa tävling"}
                </div>
                <div style={{ fontSize: "13px", color: "#ccc", marginTop: "2px" }}>
                  {nextComp.name} — {daysToComp}d
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          {[
            { label: "Pass", value: totalSessions, color: "#3498db" },
            { label: "Badminton", value: badmintonSessions, color: "#2ecc71" },
            { label: "Gym", value: gymSessions, color: "#f4a623" },
            { label: "Kropp", value: wellnessAvg ? wellnessAvg.toFixed(1) : "—", color: wellnessAvg >= 4 ? "#2ecc71" : wellnessAvg >= 3 ? "#f4a623" : "#e74c3c" },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, textAlign: "center", padding: "10px 0",
              background: "rgba(255,255,255,0.03)", borderRadius: "10px",
            }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#666", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px" }}>

        {/* === WEEK TAB === */}
        {activeTab === "week" && (
          <div>
            <LoadBar value={totalSessions} max={10} label="Totalbelastning veckan" color="#3498db" />
            <LoadBar value={badmintonSessions} max={7} label="Badminton" color="#2ecc71" />
            <LoadBar value={gymSessions} max={3} label="Styrketräning" color="#f4a623" />

            {isTaperWeek && (
              <div style={{
                background: "rgba(231,76,60,0.1)",
                border: "1px solid rgba(231,76,60,0.25)",
                borderRadius: "10px",
                padding: "12px 14px",
                marginTop: "12px",
                marginBottom: "12px",
              }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#e74c3c" }}>⚡ Tävlingsvecka — Tapering</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                  Kör lättare gym denna vecka. Fokus på mobilitet och aktivering, inte tung belastning.
                </div>
              </div>
            )}

            <div style={{ marginTop: "16px" }}>
              {week.map((day, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: "12px",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  opacity: day.sessions[0]?.type === "rest" ? 0.5 : 1,
                }}>
                  <div style={{
                    width: "40px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: new Date().getDay() === (i + 1) % 7 ? "#3498db" : "#666",
                    paddingTop: "2px",
                  }}>
                    {day.day}
                  </div>
                  <div style={{ flex: 1 }}>
                    {day.sessions.map((s, j) => (
                      <div key={j} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: j < day.sessions.length - 1 ? "6px" : 0,
                      }}>
                        <div style={{
                          width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                          background: s.type === "badminton" ? "#2ecc71" : s.type === "gym" ? "#f4a623" : "#333",
                        }} />
                        <div style={{ fontSize: "13px", color: "#ccc" }}>{s.label}</div>
                        {s.time && <div style={{ fontSize: "11px", color: "#555", marginLeft: "auto" }}>{s.time}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* === GYM TAB === */}
        {activeTab === "gym" && (
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Extra Gympass</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Badminton-specifik styrka & explosivitet</div>
              </div>
              <div style={{
                background: "rgba(244,166,35,0.12)",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "13px",
                color: "#f4a623",
                fontWeight: 600,
              }}>
                {completedExercises}/{GYM_EXERCISES.length}
              </div>
            </div>

            {isTaperWeek && (
              <div style={{
                background: "rgba(231,76,60,0.1)",
                border: "1px solid rgba(231,76,60,0.25)",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "14px",
                fontSize: "12px",
                color: "#e74c3c",
              }}>
                ⚡ Tävlingsvecka: Kör 60% av vanlig vikt, fokus på teknik och aktivering
              </div>
            )}

            <GymLog exercises={GYM_EXERCISES} log={gymLog} setLog={setGymLog} />

            <button
              onClick={() => setGymLog({})}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent",
                color: "#666",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Återställ logg
            </button>
          </div>
        )}

        {/* === WELLNESS TAB === */}
        {activeTab === "wellness" && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Daglig avstämning</div>
              <div style={{ fontSize: "12px", color: "#666" }}>Hur mår kroppen idag? (1 = dåligt, 5 = topp)</div>
            </div>

            <WellnessCheck wellness={wellness} setWellness={setWellness} />

            {wellnessAvg > 0 && (
              <div style={{
                marginTop: "20px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", color: "#666", marginBottom: "8px" }}>
                  Totalpoäng
                </div>
                <div style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  color: wellnessAvg >= 4 ? "#2ecc71" : wellnessAvg >= 3 ? "#f4a623" : "#e74c3c",
                }}>
                  {wellnessAvg.toFixed(1)}
                </div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                  {wellnessAvg >= 4 ? "Kör på! Kroppen är redo." :
                   wellnessAvg >= 3 ? "Okej — lyssna på kroppen." :
                   wellnessAvg >= 2 ? "Varning — överväg lättare pass idag." :
                   "Vila! Kroppen behöver återhämtning."}
                </div>

                {wellnessAvg < 3 && (
                  <div style={{
                    marginTop: "12px",
                    background: "rgba(231,76,60,0.1)",
                    border: "1px solid rgba(231,76,60,0.2)",
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "12px",
                    color: "#e74c3c",
                  }}>
                    💡 Förslag: Byt dagens pass mot mobilitet/stretching. Extra vila ger mer än att pressa igenom.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* === CALENDAR TAB === */}
        {activeTab === "calendar" && (
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
              Tävlingskalender
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "16px" }}>
              Veckan innan tävling anpassas automatiskt
            </div>

            {COMPETITIONS.map((comp, i) => {
              const d = daysUntil(comp.date);
              const isPast = d < 0;
              const isNext = comp === nextComp;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px",
                    marginBottom: "8px",
                    borderRadius: "10px",
                    background: isNext ? "rgba(244,166,35,0.08)" : "rgba(255,255,255,0.02)",
                    border: isNext ? "1px solid rgba(244,166,35,0.25)" : "1px solid transparent",
                    opacity: isPast ? 0.4 : 1,
                  }}
                >
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: comp.type === "tournament" ? "rgba(231,76,60,0.15)" : "rgba(52,152,219,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    flexShrink: 0,
                  }}>
                    {comp.type === "tournament" ? "🏆" : "🏸"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#e0e0e0" }}>{comp.name}</div>
                    <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>
                      {new Date(comp.date).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: isPast ? "#555" : d <= 7 ? "#f4a623" : "#666",
                  }}>
                    {isPast ? "Klar" : `${d}d`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "480px",
        background: "rgba(13,13,18,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        padding: "8px 16px",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              padding: "8px 0",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ fontSize: "20px", filter: activeTab === t.id ? "none" : "grayscale(1) opacity(0.4)" }}>
              {t.icon}
            </span>
            <span style={{
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontWeight: 600,
              color: activeTab === t.id ? "#f4a623" : "#444",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
