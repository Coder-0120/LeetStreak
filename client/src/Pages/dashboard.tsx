import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

interface LeetCodeStat { difficulty: string; count: number; }
interface SubmissionStatus { hasSubmittedToday: boolean; submissionsToday: number; }

const DIFF_CONFIG: Record<string, { emoji: string; color: string; glow: string; max: number; bg: string }> = {
  Easy:   { emoji: "🟢", color: "#22c55e", glow: "rgba(34,197,94,0.25)",  max: 850,  bg: "rgba(34,197,94,0.08)"  },
  Medium: { emoji: "🟡", color: "#f59e0b", glow: "rgba(245,158,11,0.25)", max: 1800, bg: "rgba(245,158,11,0.08)" },
  Hard:   { emoji: "🔴", color: "#ef4444", glow: "rgba(239,68,68,0.25)",  max: 800,  bg: "rgba(239,68,68,0.08)"  },
};

function genHeatmap() {
  const weeks: number[][] = [];
  for (let w = 0; w < 53; w++) {
    const days: number[] = [];
    for (let d = 0; d < 7; d++) {
      const v = Math.random();
      days.push(v < 0.38 ? 0 : v < 0.55 ? 1 : v < 0.75 ? 2 : v < 0.9 ? 3 : 4);
    }
    weeks.push(days);
  }
  return weeks;
}

const HEATMAP_DATA = genHeatmap();
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS = ["S","M","T","W","T","F","S"];
const HEAT_COLORS = ["#1a1a28", "#2d1f0e", "#7c3c12", "#c2621e", "#f97316"];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<LeetCodeStat[]>([]);
  const [status, setStatus] = useState<SubmissionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [animatedCounts, setAnimatedCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"overview" | "heatmap" | "trends">("overview");
  const [hoverCell, setHoverCell] = useState<{ w: number; d: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    const uname = userInfo ? JSON.parse(userInfo).data.leetcodeUsername : null;
    if (uname) setUsername(uname);
    if (!uname) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        const [statsRes, statusRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/leetcode/${uname}`),
          axios.get(`http://localhost:5000/api/leetcode/status/${uname}`),
        ]);
        setStats(statsRes.data);
        setStatus(statusRes.data);
        console.log("Fetched stats:", statsRes.data);
        console.log("fetched status:",statusRes.data);
        
        const targets: Record<string, number> = {};
        statsRes.data.forEach((s: LeetCodeStat) => { targets[s.difficulty] = s.count; });
        animateCounters(targets);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || activeTab !== "trends") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const data = [2, 5, 3, 8, 4, 7, 6, 9, 5, 11, 8, 6, 10, 12];
    const max = Math.max(...data);
    const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * (w - 20) + 10, y: h - 20 - (v / max) * (h - 30) }));
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(249,115,22,0.4)");
    grad.addColorStop(1, "rgba(249,115,22,0)");
    ctx.beginPath();
    ctx.moveTo(pts[0].x, h - 10);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, h - 10);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
    pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fillStyle = "#f97316"; ctx.fill(); });
  }, [activeTab]);

  const animateCounters = (targets: Record<string, number>) => {
    const steps = 60; let step = 0;
    const iv = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      const cur: Record<string, number> = {};
      Object.entries(targets).forEach(([k, v]) => { cur[k] = Math.round(v * eased); });
      setAnimatedCounts(cur);
      if (step >= steps) clearInterval(iv);
    }, 1200 / steps);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#09090f", fontFamily: "'Outfit',sans-serif", gap: 16, color: "#666" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&display=swap'); @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25);opacity:0.7}}`}</style>
      <div style={{ fontSize: 52, animation: "pulse 1.2s ease-in-out infinite" }}>⚡</div>
      <p style={{ fontSize: 15 }}>Loading your stats...</p>
    </div>
  );

  if (!status) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#09090f", fontFamily: "'Outfit',sans-serif", color: "#fff", fontSize: 18 }}>
      No data available. Please log in again.
    </div>
  );

  const allStat = stats.find(s => s.difficulty === "All");
  const displayStats = stats.filter(s => s.difficulty !== "All");
  const mockStreak = 23, mockRank = 4821, mockReputation = 1240, mockActiveDays = 187;
  const totalSolved = allStat?.count ?? 0;
  const acceptRate = allStat ? ((allStat.count / (allStat.count * 1.48)) * 100).toFixed(1) : "0";

  return (
    <div style={s.root}>
      <style>{CSS}</style>
      <div style={s.gridBg} />
      <div style={s.orb1} />
      <div style={s.orb2} />

      {/* ── NAVBAR ── */}
      <nav style={s.navbar}>
        <div style={s.navLogo}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={s.navLogoText}>Leet<span style={{ color: "#f97316" }}>Streak</span></span>
        </div>
        <div style={s.navTabs}>
          {(["overview", "heatmap", "trends"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              ...s.navTab,
              color: activeTab === tab ? "#fff" : "#555",
              borderBottom: activeTab === tab ? "2px solid #f97316" : "2px solid transparent",
            }}>
              {tab === "overview" ? "📊 Overview" : tab === "heatmap" ? "🗓 Activity" : "📈 Trends"}
            </button>
          ))}
        </div>
        <div style={s.navRight}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={s.navAvatar}>{username[0]?.toUpperCase()}</div>
            <span style={s.navUsername}>@{username}</span>
          </div>
          <button style={s.logoutBtn} onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>Sign out</button>
        </div>
      </nav>

      {/* ── STATUS BANNER ── */}
      <div style={{
        ...s.banner,
        background: status.hasSubmittedToday ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
        borderColor: status.hasSubmittedToday ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
      }} className="ls-fadein">
        <div style={{ fontSize: 24 }}>{status.hasSubmittedToday ? "✅" : "⚠️"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ ...s.bannerTitle, color: status.hasSubmittedToday ? "#22c55e" : "#ef4444" }}>
            {status.hasSubmittedToday
              ? `Streak is safe! ${status.submissionsToday} submission${status.submissionsToday !== 1 ? "s" : ""} today 🔥`
              : "No submission today yet — streak at risk!"}
          </div>
          <div style={s.bannerSub}>
            {status.hasSubmittedToday ? "Keep the momentum going, you're on a roll!" : "We'll ping you every 3–4 hours. Don't let the streak die!"}
          </div>
        </div>
        {!status.hasSubmittedToday && (
          <a href="https://leetcode.com/problemset/" target="_blank" rel="noreferrer" style={s.solveBtn}>Solve Now →</a>
        )}
      </div>

      <main style={s.main}>

        {/* ══════════════ OVERVIEW ══════════════ */}
        {activeTab === "overview" && (
          <>
            {/* KPI Strip */}
            <div style={s.kpiStrip} className="ls-fadein">
              {[
                { icon: "🔥", val: mockStreak, label: "Day Streak", color: "#f97316", sub: "Personal best: 31" },
                { icon: "✅", val: totalSolved, label: "Total Solved", color: "#22c55e", sub: `${acceptRate}% acceptance` },
                { icon: "🏆", val: `#${mockRank.toLocaleString()}`, label: "Global Rank", color: "#f59e0b", sub: "Top 8%" },
                { icon: "📅", val: mockActiveDays, label: "Active Days", color: "#60a5fa", sub: "This year" },
                { icon: "⭐", val: mockReputation, label: "Reputation", color: "#a78bfa", sub: "+120 this month" },
              ].map((k, i) => (
                <div key={i} style={s.kpiCard} className="kpi-card">
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{k.icon}</div>
                  <div style={{ ...s.kpiVal, color: k.color }}>{k.val}</div>
                  <div style={s.kpiLabel}>{k.label}</div>
                  <div style={s.kpiSub}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Difficulty Cards */}
            <div style={s.diffGrid}>
              {displayStats.map((stat, i) => {
                const cfg = DIFF_CONFIG[stat.difficulty];
                if (!cfg) return null;
                const count = animatedCounts[stat.difficulty] ?? stat.count;
                const pct = Math.min((stat.count / cfg.max) * 100, 100);
                return (
                  <div key={stat.difficulty} className="diff-card" style={{ ...s.diffCard, background: cfg.bg, animationDelay: `${i * 0.12}s` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 100, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}44` }}>
                        {cfg.emoji} {stat.difficulty}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: cfg.color }}>{pct.toFixed(1)}%</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <svg width="110" height="110" viewBox="0 0 110 110">
                        <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
                        <circle cx="55" cy="55" r="44" fill="none" stroke={cfg.color} strokeWidth="9"
                          strokeDasharray={`${(pct / 100) * 276.5} ${276.5}`}
                          strokeDashoffset="69.1" strokeLinecap="round"
                          style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.22,1,0.36,1)" }} />
                        <text x="55" y="50" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="800" fontFamily="'JetBrains Mono',monospace">{count}</text>
                        <text x="55" y="66" textAnchor="middle" fill="#555" fontSize="10">of {cfg.max.toLocaleString()}</text>
                      </svg>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                      <div className="diff-bar-fill" style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${cfg.color},${cfg.color}aa)`, boxShadow: `0 0 8px ${cfg.glow}` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Row */}
            <div style={s.bottomGrid}>
              {/* Today card */}
              <div style={s.glassCard} className="ls-fadein">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>🎯</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Today's Submissions</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{status.hasSubmittedToday ? "Great work — you're on track!" : "Nothing submitted yet today."}</div>
                  </div>
                </div>
                <div style={{ fontSize: 64, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", textAlign: "center", color: status.submissionsToday > 0 ? "#f97316" : "#2a2a2a", lineHeight: 1 }}>
                  {status.submissionsToday}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>📌 Daily Goal: 2</span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>🔥 Streak: {mockStreak}d</span>
                </div>
              </div>

              {/* Sparkline card */}
              <div style={s.glassCard} className="ls-fadein">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>14-Day Activity</span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 100, color: "#22c55e", background: "rgba(34,197,94,0.1)" }}>↑ 24%</span>
                </div>
                <SparklineChart />
                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Avg: <strong style={{ color: "#f97316" }}>6.2/day</strong></span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Best: <strong style={{ color: "#22c55e" }}>12</strong></span>
                </div>
              </div>

              {/* Alert card */}
              <div style={{ ...s.glassCard, border: "1px solid rgba(249,115,22,0.2)" }} className="ls-fadein">
                <div style={{ fontSize: 28, marginBottom: 10 }}>📧</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Smart Alerts Active</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 14 }}>
                  Reminder emails every <strong style={{ color: "#f97316" }}>3–4 hours</strong> if no submission today.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.hasSubmittedToday ? "#22c55e" : "#f97316", flexShrink: 0 }} className={status.hasSubmittedToday ? "" : "pulse-dot"} />
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{status.hasSubmittedToday ? "No reminders needed today ✓" : "Reminders scheduled"}</span>
                </div>
                <div style={{ fontSize: 11, color: "#333" }}>Auto-pauses after 30 days of inactivity</div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════ HEATMAP ══════════════ */}
        {activeTab === "heatmap" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="ls-fadein">
            <div style={{ ...s.glassCard, overflowX: "auto" as const }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Submission Activity — 2024</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{mockActiveDays} active days · {mockStreak} day current streak</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: "#555" }}>Less</span>
                  {HEAT_COLORS.map((c, i) => <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />)}
                  <span style={{ fontSize: 12, color: "#555" }}>More</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 3, marginBottom: 4, paddingLeft: 22 }}>
                {MONTHS.map((m, i) => <div key={i} style={{ width: `${(53 / 12) * 16}px`, fontSize: 10, color: "#444", flexShrink: 0 }}>{m}</div>)}
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingTop: 2 }}>
                  {WEEKDAYS.map((day, i) => <div key={i} style={{ height: 13, fontSize: 9, color: "#444", display: "flex", alignItems: "center" }}>{i % 2 === 0 ? day : ""}</div>)}
                </div>
                <div style={{ display: "flex", gap: 3, overflowX: "auto" as const }}>
                  {HEATMAP_DATA.map((week, wi) => (
                    <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {week.map((val, di) => (
                        <div key={di} title={`${val} submission${val !== 1 ? "s" : ""}`}
                          onMouseEnter={() => setHoverCell({ w: wi, d: di })}
                          onMouseLeave={() => setHoverCell(null)}
                          style={{
                            width: 13, height: 13, borderRadius: 3, background: HEAT_COLORS[val], cursor: "pointer",
                            transform: hoverCell?.w === wi && hoverCell?.d === di ? "scale(1.4)" : "scale(1)",
                            transition: "transform 0.15s, box-shadow 0.15s",
                            boxShadow: hoverCell?.w === wi && hoverCell?.d === di ? "0 0 6px rgba(249,115,22,0.6)" : "none",
                          }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly breakdown */}
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Monthly Breakdown</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
                  {MONTHS.map((m, i) => {
                    const count = Math.floor(Math.random() * 20) + 3;
                    return (
                      <div key={i} style={{ padding: "14px 10px", borderRadius: 12, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{m}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#f97316", fontFamily: "'JetBrains Mono',monospace" }}>{count}</div>
                        <div style={{ fontSize: 10, color: "#444" }}>days</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Streak milestones */}
            <div style={s.glassCard}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Streak Milestones 🏆</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { days: 7, label: "First Week", date: "Jan 8", color: "#22c55e" },
                  { days: 14, label: "Two Weeks", date: "Jan 15", color: "#60a5fa" },
                  { days: 30, label: "One Month", date: "Feb 1", color: "#f59e0b" },
                  { days: 23, label: "Current →", date: "Today", color: "#f97316" },
                ].map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${m.color}30` }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: m.color, fontFamily: "'JetBrains Mono',monospace", minWidth: 48 }}>{m.days}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{m.label}</div>
                      <div style={{ fontSize: 12, color: "#555" }}>{m.date}</div>
                    </div>
                    {m.label === "Current →" && <div style={{ marginLeft: "auto", fontSize: 20 }}>🔥</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TRENDS ══════════════ */}
        {activeTab === "trends" && (
          <div style={s.trendsGrid} className="ls-fadein">
            {/* Donut */}
            <div style={s.glassCard}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Difficulty Distribution</div>
              <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  {[{ pct: 37, color: "#22c55e", offset: 0 }, { pct: 52, color: "#f59e0b", offset: 37 }, { pct: 11, color: "#ef4444", offset: 89 }].map((seg, i) => {
                    const circ = 2 * Math.PI * 50;
                    const dash = (seg.pct / 100) * circ;
                    const off = (seg.offset / 100) * circ;
                    return <circle key={i} cx="70" cy="70" r="50" fill="none" stroke={seg.color} strokeWidth="22" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4 - off} strokeLinecap="butt" style={{ transition: "stroke-dasharray 1.2s ease" }} />;
                  })}
                  <text x="70" y="66" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="900">{totalSolved}</text>
                  <text x="70" y="82" textAnchor="middle" fill="#555" fontSize="9">solved</text>
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {displayStats.map((stat) => {
                    const cfg = DIFF_CONFIG[stat.difficulty];
                    if (!cfg) return null;
                    return (
                      <div key={stat.difficulty} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#aaa" }}>{stat.difficulty}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: cfg.color, fontFamily: "'JetBrains Mono',monospace", marginLeft: "auto" }}>{stat.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weekly bars */}
            <div style={s.glassCard}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Weekly Submissions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[{ week: "This week", count: 8, max: 14 }, { week: "Last week", count: 11, max: 14 }, { week: "2 weeks ago", count: 6, max: 14 }, { week: "3 weeks ago", count: 13, max: 14 }, { week: "4 weeks ago", count: 9, max: 14 }].map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "#555", minWidth: 90 }}>{w.week}</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                      <div style={{ width: `${(w.count / w.max) * 100}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#f97316,#fb923c)", boxShadow: "0 0 8px rgba(249,115,22,0.4)", transition: "width 1.2s ease" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f97316", fontFamily: "'JetBrains Mono',monospace", minWidth: 20 }}>{w.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceptance rate */}
            <div style={s.glassCard}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Acceptance Rate</div>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: "#f97316", fontFamily: "'JetBrains Mono',monospace" }}>{acceptRate}%</div>
                <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>All time · {totalSolved} accepted</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                {displayStats.map((stat) => {
                  const cfg = DIFF_CONFIG[stat.difficulty];
                  if (!cfg) return null;
                  const rate = ((stat.count / (stat.count * 1.48)) * 100).toFixed(0);
                  return (
                    <div key={stat.difficulty} style={{ padding: "12px", borderRadius: 10, textAlign: "center", background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: cfg.color }}>{rate}%</div>
                      <div style={{ fontSize: 11, color: "#555" }}>{stat.difficulty}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sparkline */}
            <div style={s.glassCard}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>14-Day Activity</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 100, color: "#22c55e", background: "rgba(34,197,94,0.1)" }}>↑ 24%</span>
              </div>
              <canvas ref={canvasRef} width={320} height={100} style={{ width: "100%", height: 100 }} />
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Avg: <strong style={{ color: "#f97316" }}>6.2/day</strong></span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Best: <strong style={{ color: "#22c55e" }}>12</strong></span>
              </div>
            </div>

            {/* Goals — full width */}
            <div style={{ ...s.glassCard, gridColumn: "1/-1" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Monthly Goals Progress</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                {[
                  { goal: 20, done: 8, label: "Easy solved", color: "#22c55e" },
                  { goal: 15, done: 11, label: "Medium solved", color: "#f59e0b" },
                  { goal: 5, done: 2, label: "Hard solved", color: "#ef4444" },
                  { goal: 25, done: 23, label: "Day streak", color: "#f97316" },
                ].map((g, i) => {
                  const pct = Math.round((g.done / g.goal) * 100);
                  return (
                    <div key={i} style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${g.color}25` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: "#aaa" }}>{g.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: g.color }}>{g.done}/{g.goal}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)" }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: g.color, transition: "width 1.2s ease" }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>{pct}% complete</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

/* ── Sparkline ── */
const SparklineChart: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width, h = canvas.height;
    const data = [2, 5, 3, 8, 4, 7, 6, 9, 5, 11, 8, 6, 10, 12];
    const max = Math.max(...data);
    const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * (w - 20) + 10, y: h - 20 - (v / max) * (h - 30) }));
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(249,115,22,0.4)"); grad.addColorStop(1, "rgba(249,115,22,0)");
    ctx.beginPath(); ctx.moveTo(pts[0].x, h - 10);
    pts.forEach(p => ctx.lineTo(p.x, p.y)); ctx.lineTo(pts[pts.length-1].x, h-10); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); pts.forEach((p,i) => i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.strokeStyle="#f97316"; ctx.lineWidth=2; ctx.lineJoin="round"; ctx.stroke();
    pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fillStyle="#f97316"; ctx.fill(); });
  }, []);
  return <canvas ref={ref} width={320} height={100} style={{ width: "100%", height: 100 }} />;
};

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "#09090f", fontFamily: "'Outfit',sans-serif", color: "#e2e8f0", position: "relative", overflowX: "hidden" },
  gridBg: { position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(249,115,22,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.03) 1px,transparent 1px)", backgroundSize: "44px 44px" },
  orb1: { position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.1) 0%,transparent 70%)", top: -150, right: -100, pointerEvents: "none", animation: "orbFloat 9s ease-in-out infinite" },
  orb2: { position: "fixed", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(251,146,60,0.07) 0%,transparent 70%)", bottom: -100, left: -80, pointerEvents: "none", animation: "orbFloat 12s ease-in-out infinite reverse" },
  navbar: { position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", padding: "0 32px", height: 58, background: "rgba(9,9,15,0.88)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", gap: 24 },
  navLogo: { display: "flex", alignItems: "center", gap: 7, flexShrink: 0 },
  navLogoText: { fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" },
  navTabs: { display: "flex", height: "100%", gap: 4 },
  navTab: { padding: "0 18px", background: "none", border: "none", borderBottom: "2px solid transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit',sans-serif", transition: "all 0.2s", height: "100%" },
  navRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 },
  navAvatar: { width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800 },
  navUsername: { fontSize: 12, color: "#6b7280", fontFamily: "'JetBrains Mono',monospace" },
  logoutBtn: { padding: "6px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#6b7280", fontSize: 12, fontFamily: "'Outfit',sans-serif", cursor: "pointer", transition: "all 0.2s" },
  banner: { display: "flex", alignItems: "center", gap: 14, padding: "14px 32px", borderBottom: "1px solid", position: "sticky", top: 58, zIndex: 99, backdropFilter: "blur(12px)" },
  bannerTitle: { fontSize: 15, fontWeight: 700, marginBottom: 2 },
  bannerSub: { fontSize: 12, color: "#6b7280" },
  solveBtn: { marginLeft: "auto", flexShrink: 0, padding: "9px 18px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 13, boxShadow: "0 4px 14px rgba(239,68,68,0.4)" },
  main: { maxWidth: 1100, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20, position: "relative", zIndex: 1 },
  kpiStrip: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 },
  kpiCard: { padding: "20px 16px", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" },
  kpiVal: { fontSize: 26, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1, marginBottom: 4 },
  kpiLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#6b7280", marginBottom: 4 },
  kpiSub: { fontSize: 11, color: "#3a3a4a" },
  diffGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
  diffCard: { padding: "24px", borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both" },
  bottomGrid: { display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 16 },
  glassCard: { padding: "24px", borderRadius: 18, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" },
  trendsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #09090f; }
  ::selection { background: rgba(249,115,22,0.25); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #09090f; }
  ::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.4); border-radius: 99px; }
  @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-24px) scale(1.03)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
  .ls-fadein { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .kpi-card { transition: transform 0.2s, box-shadow 0.2s; }
  .kpi-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(249,115,22,0.1) !important; }
  .diff-card { transition: transform 0.2s, box-shadow 0.2s; }
  .diff-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(249,115,22,0.12) !important; }
  .diff-bar-fill { animation: barGrow 1.4s cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes barGrow { from{width:0!important} }
  .pulse-dot { animation: pulseDot 1.5s ease-in-out infinite; }
  @keyframes pulseDot { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.4)} 50%{box-shadow:0 0 0 6px rgba(249,115,22,0)} }
  @media (max-width:900px) {
    .kpiStrip { grid-template-columns: repeat(3,1fr) !important; }
    .diffGrid, .bottomGrid, .trendsGrid { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width:600px) {
    .kpiStrip, .diffGrid, .bottomGrid, .trendsGrid { grid-template-columns: 1fr !important; }
  }
`;

export default Dashboard;