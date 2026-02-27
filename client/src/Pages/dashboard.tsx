import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────
interface LeetCodeStat { difficulty: string; count: number; }
interface SubmissionStatus { hasSubmittedToday: boolean; submissionsToday: number; }
interface Profile {
  username: string;
  profile: { realName: string; userAvatar: string; countryName: string; company: string; school: string; ranking: number; };
  beatsStats: { difficulty: string; percentage: number | null }[];
  languages: { languageName: string; problemsSolved: number }[];
  badges: { id: string; displayName: string; icon: string; creationDate: string }[];
}
interface CalendarData {
  streak: number;
  totalActiveDays: number;
  activeYears: number[];
  heatmap: { date: string; count: number }[];
}
interface ContestData {
  ranking: { attendedContestsCount: number; rating: number; globalRanking: number; totalParticipants: number; topPercentage: number } | null;
  history: { rating: number; ranking: number; contest: { title: string; startTime: number } }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const DIFF_CFG: Record<string, { emoji: string; color: string; glow: string; max: number; bg: string; border: string }> = {
  Easy:   { emoji: "🟢", color: "#4ade80", glow: "rgba(74,222,128,0.3)",  max: 850,  bg: "rgba(74,222,128,0.06)",  border: "rgba(74,222,128,0.2)"  },
  Medium: { emoji: "🟡", color: "#fbbf24", glow: "rgba(251,191,36,0.3)",  max: 1800, bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.2)"  },
  Hard:   { emoji: "🔴", color: "#f87171", glow: "rgba(248,113,113,0.3)", max: 800,  bg: "rgba(248,113,113,0.06)", border: "rgba(248,113,113,0.2)" },
};
const HEAT_COLORS = ["#161622", "#1a3a1a", "#1f5c1f", "#2d8c2d", "#3dba3d"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const API    = "http://localhost:5000/api/leetcode";
const CELL   = 13;
const GAP    = 3;

// ── Heatmap Component ─────────────────────────────────────────────────────────
const Heatmap: React.FC<{ heatmap: { date: string; count: number }[] }> = ({ heatmap }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const today     = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 363);

  // Map by date string
  const countByDate: Record<string, number> = {};
  heatmap.forEach(d => { countByDate[d.date] = d.count; });

  // Start grid on Sunday
  const gridStart = new Date(startDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const weeks: { date: Date; inRange: boolean }[][] = [];
  const cursor = new Date(gridStart);
  while (cursor <= today) {
    const week: { date: Date; inRange: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({ date: new Date(cursor), inRange: cursor >= startDate && cursor <= today });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  // Month labels: track where month changes across weeks
  const monthLabels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week.find(d => d.inRange);
    if (!first) return;
    const m = first.date.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ weekIndex: wi, label: MONTHS[m] });
      lastMonth = m;
    }
  });

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  const fmtDisplay = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const levelFor = (n: number) => n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4;

  const todayStr = fmt(today);

  // Tooltip info for hovered cell
  const hoveredCell = hoveredKey ? (() => {
    const count = countByDate[hoveredKey] ?? 0;
    const d = new Date(hoveredKey + "T00:00:00");
    return {
      count,
      label: count === 0
        ? `No submissions · ${fmtDisplay(d)}`
        : `${count} submission${count !== 1 ? "s" : ""} · ${fmtDisplay(d)}`,
    };
  })() : null;

  return (
    <div style={{ overflowX: "auto", overflowY: "visible", paddingBottom: 4 }}>
      {/* 
        Key fix: wrap everything in a div with position:relative so the
        tooltip is positioned relative to the heatmap container, NOT the
        viewport — this prevents any scroll/layout shift on hover.
      */}
      <div style={{ display: "inline-block", position: "relative", minWidth: "max-content" }}>

        {/* Tooltip — positioned absolutely inside the heatmap container */}
        {hoveredCell && (
          <div style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(18,18,28,0.98)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "6px 11px",
            fontSize: 11,
            color: "#d0d0e0",
            pointerEvents: "none",
            zIndex: 50,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {hoveredCell.label}
            {/* Arrow */}
            <div style={{
              position: "absolute",
              bottom: -5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 8,
              height: 8,
              background: "rgba(18,18,28,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderTop: "none",
              borderLeft: "none",
              rotate: "45deg",
            }} />
          </div>
        )}

        {/* Month labels row */}
        <div style={{ marginLeft: 28, marginBottom: 6, position: "relative", height: 16 }}>
          {monthLabels.map((m, i) => (
            <div key={i} style={{
              position: "absolute",
              left: m.weekIndex * (CELL + GAP),
              fontSize: 10,
              color: "#4a4a6a",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              letterSpacing: "0.04em",
              userSelect: "none",
              lineHeight: 1,
            }}>
              {m.label}
            </div>
          ))}
        </div>

        {/* Grid + day labels */}
        <div style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>

          {/* Day labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP, width: 24 }}>
            {DAYS.map((day, d) => (
              <div key={d} style={{
                height: CELL,
                fontSize: 9,
                // Only show Mon (1), Wed (3), Fri (5)
                color: [1, 3, 5].includes(d) ? "#3a3a5a" : "transparent",
                fontFamily: "'JetBrains Mono', monospace",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                userSelect: "none",
                paddingRight: 2,
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Cells — NO inline transform on hover, use CSS class instead */}
          <div style={{ display: "flex", gap: GAP }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                {week.map((day, di) => {
                  if (!day.inRange) {
                    return <div key={di} style={{ width: CELL, height: CELL, flexShrink: 0 }} />;
                  }
                  const dateStr = fmt(day.date);
                  const count   = countByDate[dateStr] ?? 0;
                  const level   = levelFor(count);
                  const isToday = dateStr === todayStr;
                  const isHover = hoveredKey === dateStr;

                  return (
                    <div
                      key={di}
                      className="heat-cell"
                      onMouseEnter={() => setHoveredKey(dateStr)}
                      onMouseLeave={() => setHoveredKey(null)}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 3,
                        background: HEAT_COLORS[level],
                        border: isToday
                          ? "1.5px solid rgba(251,146,60,0.85)"
                          : "1px solid rgba(255,255,255,0.03)",
                        cursor: "default",
                        flexShrink: 0,
                        // Scale via CSS will-change — no layout impact
                        transform: isHover ? "scale(1.6)" : "scale(1)",
                        transition: "transform 0.1s ease",
                        // Keep scaled cell on top, no surrounding layout shift
                        position: "relative",
                        zIndex: isHover ? 10 : 1,
                        boxShadow: isHover && level > 0
                          ? "0 0 8px rgba(61,186,61,0.65)"
                          : "none",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 12, marginLeft: 28 }}>
          <span style={{ fontSize: 10, color: "#3a3a5a", fontFamily: "'JetBrains Mono',monospace" }}>Less</span>
          {HEAT_COLORS.map((c, i) => (
            <div key={i} style={{
              width: CELL, height: CELL, borderRadius: 3,
              background: c,
              border: "1px solid rgba(255,255,255,0.06)",
            }} />
          ))}
          <span style={{ fontSize: 10, color: "#3a3a5a", fontFamily: "'JetBrains Mono',monospace" }}>More</span>
        </div>

      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [stats, setStats]       = useState<LeetCodeStat[]>([]);
  const [status, setStatus]     = useState<SubmissionStatus | null>(null);
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [calendar, setCalendar] = useState<CalendarData | null>(null);
  const [contest, setContest]   = useState<ContestData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [username, setUsername] = useState("");
  const [animated, setAnimated] = useState<Record<string, number>>({});
  const contestRef              = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    const uname = userInfo ? JSON.parse(userInfo).data.leetcodeUsername : null;
    if (uname) setUsername(uname);
    if (!uname) { setLoading(false); return; }
    fetchAll(uname);
  }, []);

  const fetchAll = async (uname: string) => {
    try {
      const [statsRes, statusRes, profileRes, calRes, contestRes] = await Promise.allSettled([
        axios.get(`${API}/${uname}`),
        axios.get(`${API}/status/${uname}`),
        axios.get(`${API}/profile/${uname}`),
        axios.get(`${API}/calendar/${uname}`),
        axios.get(`${API}/contest/${uname}`),
      ]);
      if (statsRes.status   === "fulfilled") { setStats(statsRes.value.data); animateCounters(statsRes.value.data); }
      if (statusRes.status  === "fulfilled") setStatus(statusRes.value.data);
      if (profileRes.status === "fulfilled") setProfile(profileRes.value.data);
      if (calRes.status     === "fulfilled") setCalendar(calRes.value.data);
      if (contestRes.status === "fulfilled") setContest(contestRes.value.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const animateCounters = (data: LeetCodeStat[]) => {
    const targets: Record<string, number> = {};
    data.forEach(s => { targets[s.difficulty] = s.count; });
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const e = 1 - Math.pow(1 - step / 60, 3);
      const cur: Record<string, number> = {};
      Object.entries(targets).forEach(([k, v]) => cur[k] = Math.round(v * e));
      setAnimated(cur);
      if (step >= 60) clearInterval(iv);
    }, 20);
  };

  useEffect(() => {
    if (!contestRef.current || !contest?.history.length) return;
    const canvas = contestRef.current;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    ctx.clearRect(0, 0, W, H);
    const data = contest.history.map(h => h.rating);
    if (data.length < 2) return;
    const min = Math.min(...data) - 30, max = Math.max(...data) + 30;
    const pts = data.map((v, i) => ({
      x: 12 + (i / (data.length - 1)) * (W - 24),
      y: H - 16 - ((v - min) / (max - min)) * (H - 28),
    }));
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(251,146,60,0.3)"); grad.addColorStop(1, "rgba(251,146,60,0)");
    ctx.beginPath(); ctx.moveTo(pts[0].x, H);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length-1].x, H); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath();
    pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.strokeStyle="#fb923c"; ctx.lineWidth=2; ctx.lineJoin="round"; ctx.stroke();
    pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fillStyle="#fb923c"; ctx.fill(); });
  }, [contest]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#0a0a0f", fontFamily:"'Outfit',sans-serif", gap:16, color:"#444" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:36, height:36, border:"2px solid #1a1a28", borderTop:"2px solid #fb923c", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ fontSize:13, letterSpacing:"0.05em" }}>Loading your stats…</p>
    </div>
  );

  if (!status) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0a0a0f", fontFamily:"'Outfit',sans-serif", color:"#fff" }}>
      No data. Please log in again.
    </div>
  );

  const allStat      = stats.find(s => s.difficulty === "All");
  const displayStats = stats.filter(s => s.difficulty !== "All");
  const totalSolved  = allStat?.count ?? 0;
  const topLangs     = [...(profile?.languages ?? [])].sort((a,b) => b.problemsSolved - a.problemsSolved).slice(0,5);

  return (
    <div style={s.root}>
      <style>{CSS}</style>
      <div style={s.noise} /><div style={s.orb1} /><div style={s.orb2} />

      {/* NAVBAR */}
      <nav style={s.navbar}>
        <div style={s.navBrand}>
          <span style={s.navIcon}>⚡</span>
          <span style={s.navTitle} onClick={() => window.location.href="/"}>Leet<span style={{ color:"#ff6b2b" }}>Streak</span></span>
        </div>
        <div style={s.navUser}>
          {profile?.profile?.userAvatar
            ? <img src={profile.profile.userAvatar} style={s.avatar} alt="avatar" />
            : <div style={s.avatarFallback}>{username[0]?.toUpperCase()}</div>}
          <div>
            <div style={s.navName}>{profile?.profile?.realName || username}</div>
            <div style={s.navSub}>@{username}{profile?.profile?.countryName ? ` · ${profile.profile.countryName}` : ""}</div>
          </div>
          <button style={s.signout} onClick={() => { localStorage.clear(); window.location.href="/login"; }}>Sign out</button>
        </div>
      </nav>

      {/* BANNER */}
      <div style={{
        ...s.banner,
        background: status.hasSubmittedToday
          ? "linear-gradient(90deg,rgba(20,90,50,0.55) 0%,rgba(10,40,25,0.45) 60%,rgba(10,10,15,0.3) 100%)"
          : "linear-gradient(90deg,rgba(100,20,20,0.55) 0%,rgba(50,10,10,0.45) 60%,rgba(10,10,15,0.3) 100%)",
        borderBottom:`1px solid ${status.hasSubmittedToday ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
        borderTop:`1px solid ${status.hasSubmittedToday ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)"}`,
      }}>
        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:180, background: status.hasSubmittedToday ? "radial-gradient(ellipse at left center,rgba(74,222,128,0.18) 0%,transparent 70%)" : "radial-gradient(ellipse at left center,rgba(248,113,113,0.18) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, zIndex:1, background: status.hasSubmittedToday ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)", border:`1px solid ${status.hasSubmittedToday ? "rgba(74,222,128,0.35)" : "rgba(248,113,113,0.35)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
          {status.hasSubmittedToday ? "✅" : "⚠️"}
        </div>
        <div style={{ flex:1, zIndex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" as const }}>
            <span style={{ fontWeight:800, fontSize:14, color: status.hasSubmittedToday ? "#6ee7a0" : "#fca5a5" }}>
              {status.hasSubmittedToday ? `Streak safe! ${status.submissionsToday} submission${status.submissionsToday!==1?"s":""} today` : "No submission today — streak at risk!"}
            </span>
            {status.hasSubmittedToday && <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", color:"#4ade80", letterSpacing:"0.05em" }}>🔥 ON FIRE</span>}
          </div>
          <div style={{ fontSize:12, color:"#3a5a47", marginTop:2 }}>{status.hasSubmittedToday ? "Keep the momentum going!" : "Reminders go out every 3–4h."}</div>
        </div>
        {status.hasSubmittedToday
          ? <div style={{ flexShrink:0, zIndex:1, display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:10, background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.2)" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80" }} className="pulse-dot" />
              <span style={{ fontSize:12, color:"#4ade80", fontWeight:600 }}>Active streak</span>
            </div>
          : <a href="https://leetcode.com/problemset/" target="_blank" rel="noreferrer" style={s.solveBtn}>Solve Now →</a>}
      </div>

      <main style={s.main}>

        {/* KPI STRIP */}
        <div className="kpi-strip" style={s.kpiStrip}>
          {[
            { icon:"🔥", val:calendar?.streak??"—",  label:"Day Streak",      color:"#fb923c", sub:`${calendar?.totalActiveDays??"—"} total active days` },
            { icon:"✅", val:totalSolved,              label:"Total Solved",    color:"#4ade80", sub:`Global Rank #${profile?.profile?.ranking?.toLocaleString()??"—"}` },
            { icon:"🏆", val:contest?.ranking?`#${contest.ranking.globalRanking.toLocaleString()}`:"—", label:"Contest Rank", color:"#fbbf24", sub:contest?.ranking?`Top ${contest.ranking.topPercentage?.toFixed(1)}%`:"No contests yet" },
            { icon:"⭐", val:contest?.ranking?Math.round(contest.ranking.rating):"—", label:"Contest Rating", color:"#c084fc", sub:contest?.ranking?`${contest.ranking.attendedContestsCount} contests attended`:"—" },
          ].map((k,i) => (
            <div key={i} className="kpi-card" style={s.kpiCard}>
              <div style={s.kpiIcon}>{k.icon}</div>
              <div style={{ ...s.kpiVal, color:k.color }}>{k.val}</div>
              <div style={s.kpiLabel}>{k.label}</div>
              <div style={s.kpiSub}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* DIFFICULTY CARDS */}
        <div className="diff-strip" style={s.diffStrip}>
          {displayStats.map((stat,i) => {
            const cfg = DIFF_CFG[stat.difficulty]; if (!cfg) return null;
            const count = animated[stat.difficulty] ?? stat.count;
            const pct   = Math.min((stat.count/cfg.max)*100,100);
            const beats = profile?.beatsStats?.find(b=>b.difficulty===stat.difficulty)?.percentage;
            const circ  = 2*Math.PI*38;
            return (
              <div key={stat.difficulty} className="diff-card" style={{ ...s.diffCard, background:cfg.bg, border:`1px solid ${cfg.border}`, animationDelay:`${i*0.1}s` }}>
                <div style={s.diffHeader}>
                  <span style={{ ...s.diffBadge, color:cfg.color, borderColor:cfg.border }}>{cfg.emoji} {stat.difficulty}</span>
                  {beats!=null && <span style={{ fontSize:12, color:cfg.color, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>Beats {beats.toFixed(1)}%</span>}
                </div>
                <div style={s.diffBody}>
                  <svg width="96" height="96" viewBox="0 0 96 96" style={{ flexShrink:0 }}>
                    <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                    <circle cx="48" cy="48" r="38" fill="none" stroke={cfg.color} strokeWidth="8"
                      strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeDashoffset={circ/4} strokeLinecap="round"
                      style={{ transition:"stroke-dasharray 1.4s cubic-bezier(0.22,1,0.36,1)", filter:`drop-shadow(0 0 6px ${cfg.glow})` }}/>
                    <text x="48" y="44" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="800" fontFamily="'JetBrains Mono',monospace">{count}</text>
                    <text x="48" y="60" textAnchor="middle" fill="#3a3a4a" fontSize="9">of {cfg.max.toLocaleString()}</text>
                  </svg>
                  <div style={s.diffStats}>
                    <div style={{ fontSize:13, color:"#5a5a6a" }}>Solved</div>
                    <div style={{ fontSize:22, fontWeight:800, color:cfg.color, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.1 }}>{stat.count}</div>
                    <div style={{ fontSize:11, color:"#3a3a4a", marginTop:4 }}>of {cfg.max.toLocaleString()} total</div>
                    <div style={{ marginTop:12, height:4, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                      <div className="bar-fill" style={{ width:`${pct}%`, height:"100%", borderRadius:99, background:cfg.color, boxShadow:`0 0 8px ${cfg.glow}` }}/>
                    </div>
                    <div style={{ fontSize:11, color:"#3a3a4a", marginTop:4 }}>{pct.toFixed(1)}% complete</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TRI GRID */}
        <div className="tri-grid" style={s.triGrid}>
          <div style={s.card}>
            <div style={s.cardTitle}>Languages Used</div>
            {topLangs.length===0 ? <div style={s.empty}>No language data</div> : topLangs.map((lang,i) => {
              const pct   = Math.max(3,(lang.problemsSolved/topLangs[0].problemsSolved)*100);
              const LCLRS = ["#fb923c","#38bdf8","#a78bfa","#f472b6","#34d399"];
              const color = LCLRS[i%LCLRS.length];
              return (
                <div key={i} style={{ marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontSize:13, color:"#c0c0d0", fontWeight:600 }}>{lang.languageName}</span>
                    <span style={{ fontSize:13, fontWeight:800, color, fontFamily:"'JetBrains Mono',monospace", padding:"2px 9px", borderRadius:6, background:color+"15", border:"1px solid "+color+"35" }}>{lang.problemsSolved}</span>
                  </div>
                  <div style={{ height:8, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                    <div style={{ width:pct+"%", height:"100%", borderRadius:99, background:`linear-gradient(90deg,${color},${color}99)`, boxShadow:`0 0 10px ${color}66`, animation:"langBarGrow 1.2s cubic-bezier(0.22,1,0.36,1) both", animationDelay:(i*0.09)+"s" }}/>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ ...s.card, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
            <div style={{ fontSize:13, color:"#5a5a6a", marginBottom:8, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" as const }}>Today's Submissions</div>
            <div style={{ fontSize:80, fontWeight:900, fontFamily:"'JetBrains Mono',monospace", lineHeight:1, color:status.submissionsToday>0?"#fb923c":"#1e1e2a" }}>{status.submissionsToday}</div>
            <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:status.hasSubmittedToday?"#4ade80":"#fb923c" }} className={status.hasSubmittedToday?"":"pulse-dot"}/>
              <span style={{ fontSize:12, color:"#4a4a5a" }}>{status.hasSubmittedToday?"Reminders paused ✓":"Reminders active"}</span>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Badges Earned 🎖️</div>
            {!profile?.badges?.length ? <div style={s.empty}>No badges yet</div> : (
              <div style={{ display:"flex", flexWrap:"wrap" as const, gap:8 }}>
                {profile.badges.slice(0,9).map(b => (
                  <div key={b.id} title={b.displayName} style={s.badge}>
                    <img src={b.icon} alt={b.displayName} style={{ width:30, height:30 }} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                    <span style={s.badgeLabel}>{b.displayName.replace(" Badge","").replace("Days","d")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* HEATMAP */}
        <div style={s.card}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap" as const, gap:10 }}>
            <div>
              <div style={s.cardTitle}>Activity Heatmap</div>
              <div style={{ fontSize:12, color:"#3a3a5a", marginTop:3, fontFamily:"'JetBrains Mono',monospace" }}>
                <span style={{ color:"#fb923c", fontWeight:700 }}>{calendar?.streak??"—"}</span>
                <span style={{ color:"#3a3a5a" }}> day streak · </span>
                <span style={{ color:"#3dba3d", fontWeight:700 }}>{calendar?.totalActiveDays??"—"}</span>
                <span style={{ color:"#3a3a5a" }}> active days in past year</span>
              </div>
            </div>
          </div>
          {!calendar ? <div style={s.empty}>Loading heatmap…</div> : <Heatmap heatmap={calendar.heatmap}/>}
        </div>

        {/* CONTEST */}
        {(contest?.ranking || (contest?.history && contest.history.length>0)) && (
          <div className="contest-grid" style={s.contestGrid}>
            <div style={s.card}>
              <div style={s.cardTitle}>Contest Stats</div>
              {!contest?.ranking ? <div style={s.empty}>No contest participation yet</div> : (
                <>
                  <div style={{ textAlign:"center", padding:"16px 0 20px" }}>
                    <div style={{ fontSize:52, fontWeight:900, color:"#fb923c", fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>{Math.round(contest.ranking.rating)}</div>
                    <div style={{ fontSize:12, color:"#4a4a5a", marginTop:4 }}>Rating</div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      { label:"Global Rank", val:`#${contest.ranking.globalRanking.toLocaleString()}` },
                      { label:"Top %",        val:`${contest.ranking.topPercentage?.toFixed(1)}%` },
                      { label:"Contests",     val:contest.ranking.attendedContestsCount },
                      { label:"Total Users",  val:contest.ranking.totalParticipants?.toLocaleString() },
                    ].map((row,i)=>(
                      <div key={i} style={{ padding:"12px 14px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", textAlign:"center" }}>
                        <div style={{ fontSize:16, fontWeight:800, color:"#e2e8f0", fontFamily:"'JetBrains Mono',monospace" }}>{row.val}</div>
                        <div style={{ fontSize:11, color:"#4a4a5a", marginTop:2 }}>{row.label}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div style={{ ...s.card, display:"flex", flexDirection:"column" }}>
              <div style={s.cardTitle}>Rating History</div>
              {!contest?.history.length ? <div style={s.empty}>No contest history</div> : (
                <>
                  <canvas ref={contestRef} style={{ width:"100%", height:120, marginBottom:14 }}/>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {contest.history.slice(-5).reverse().map((h,i)=>(
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize:12, color:"#5a5a6a", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const, paddingRight:8 }}>{h.contest.title}</span>
                        <span style={{ fontSize:12, color:"#fb923c", fontFamily:"'JetBrains Mono',monospace", fontWeight:700, flexShrink:0 }}>{Math.round(h.rating)} <span style={{ color:"#333", fontWeight:400 }}>#{h.ranking}</span></span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root:        { minHeight:"100vh", background:"#0a0a0f", fontFamily:"'Outfit',sans-serif", color:"#e2e8f0", position:"relative", overflowX:"hidden", paddingTop:56 },
  noise:       { position:"fixed", inset:0, pointerEvents:"none", opacity:0.025, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize:"128px 128px" },
  orb1:        { position:"fixed", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(251,146,60,0.08) 0%,transparent 65%)", top:-200, right:-200, pointerEvents:"none" },
  orb2:        { position:"fixed", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(192,132,252,0.05) 0%,transparent 65%)", bottom:-100, left:-100, pointerEvents:"none" },
  navbar:      { position:"fixed", top:0, left:0, right:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", height:56, background:"rgba(10,10,15,0.9)", borderBottom:"1px solid rgba(255,255,255,0.07)", backdropFilter:"blur(20px)" },
  navBrand:    { display:"flex", alignItems:"center", gap:8 },
  navIcon:     { fontSize:20 },
  navTitle:    { cursor:"pointer", fontSize:18, fontWeight:800, color:"#fff", letterSpacing:"-0.5px" },
  navUser:     { display:"flex", alignItems:"center", gap:10 },
  avatar:      { width:28, height:28, borderRadius:"50%", border:"1.5px solid #fb923c", objectFit:"cover" as const },
  avatarFallback:{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#fb923c,#f97316)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:800 },
  navName:     { fontSize:13, fontWeight:700, color:"#e2e8f0" },
  navSub:      { fontSize:10, color:"#4a4a5a", fontFamily:"'JetBrains Mono',monospace" },
  signout:     { padding:"5px 12px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:7, color:"#5a5a6a", fontSize:12, cursor:"pointer", fontFamily:"'Outfit',sans-serif", marginLeft:4 },
  banner:      { display:"flex", alignItems:"center", gap:12, padding:"12px 28px", backdropFilter:"blur(16px)", flexWrap:"wrap" as const, overflow:"hidden", position:"relative" as const },
  solveBtn:    { marginLeft:"auto", padding:"7px 16px", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", borderRadius:8, textDecoration:"none", fontWeight:700, fontSize:12, boxShadow:"0 4px 12px rgba(239,68,68,0.35)" },
  main:        { maxWidth:1200, margin:"0 auto", padding:"24px 20px 48px", display:"flex", flexDirection:"column", gap:18, position:"relative", zIndex:1 },
  kpiStrip:    { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 },
  kpiCard:     { padding:"22px 18px", borderRadius:16, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", textAlign:"center", backdropFilter:"blur(10px)" },
  kpiIcon:     { fontSize:20, marginBottom:8 },
  kpiVal:      { fontSize:28, fontWeight:900, fontFamily:"'JetBrains Mono',monospace", lineHeight:1, marginBottom:5 },
  kpiLabel:    { fontSize:10, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.1em", color:"#4a4a5a", marginBottom:4 },
  kpiSub:      { fontSize:11, color:"#2e2e3e" },
  diffStrip:   { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 },
  diffCard:    { padding:"20px 22px", borderRadius:16, backdropFilter:"blur(12px)", animation:"fadeUp 0.6s ease both" },
  diffHeader:  { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 },
  diffBadge:   { fontSize:12, fontWeight:700, padding:"4px 10px", borderRadius:99, border:"1px solid" },
  diffBody:    { display:"flex", alignItems:"center", gap:16 },
  diffStats:   { flex:1 },
  triGrid:     { display:"grid", gridTemplateColumns:"1fr 1fr 1.2fr", gap:14 },
  card:        { padding:"22px", borderRadius:16, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", backdropFilter:"blur(12px)" },
  cardTitle:   { fontSize:14, fontWeight:700, color:"#c0c0d0", marginBottom:16, letterSpacing:"0.02em" },
  empty:       { fontSize:13, color:"#3a3a4a", padding:"20px 0" },
  badge:       { display:"flex", flexDirection:"column" as const, alignItems:"center", gap:4, padding:"8px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", width:62 },
  badgeLabel:  { fontSize:8.5, color:"#3a3a4a", textAlign:"center" as const, lineHeight:1.2 },
  contestGrid: { display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:14 },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0f; }
  ::selection { background: rgba(251,146,60,0.3); }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(251,146,60,0.3); border-radius: 99px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
  @keyframes spin { to { transform:rotate(360deg); } }
  .kpi-card { transition:transform 0.18s, box-shadow 0.18s; cursor:default; }
  .kpi-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(251,146,60,0.08) !important; }
  .diff-card { transition:transform 0.18s; cursor:default; }
  .diff-card:hover { transform:translateY(-4px); }
  .bar-fill { animation:barGrow 1.4s cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes barGrow { from { width:0 !important; } }
  @keyframes langBarGrow { from { width:0 !important; } }
  .pulse-dot { animation:pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(251,146,60,0.5)} 50%{box-shadow:0 0 0 5px rgba(251,146,60,0)} }

  /* Critical: isolate heatmap cell scaling so it never causes layout shift */
  .heat-cell {
    will-change: transform;
    transform-origin: center center;
    isolation: isolate;
  }

  @media (max-width:1024px) {
    .kpi-strip { grid-template-columns:repeat(2,1fr) !important; }
    .diff-strip { grid-template-columns:repeat(2,1fr) !important; }
    .tri-grid { grid-template-columns:1fr 1fr !important; }
    .contest-grid { grid-template-columns:1fr !important; }
  }
  @media (max-width:640px) {
    .kpi-strip { grid-template-columns:1fr 1fr !important; }
    .diff-strip { grid-template-columns:1fr !important; }
    .tri-grid { grid-template-columns:1fr !important; }
  }
`;

export default Dashboard;