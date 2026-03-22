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
  streak: number; totalActiveDays: number; activeYears: number[];
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
const HEAT_COLORS = ["#111118", "#1e3a1e", "#2d6b2d", "#3d9c3d", "#4ade80"];
const API = "http://localhost:5000/api/leetcode";

// ── Leaderboard Panel (reused in sidebar + drawer + inline) ──────────────────
const LeaderboardPanel: React.FC<{
  leaderboard: { username: string; count: number }[];
  username: string;
  myRank: number;
}> = ({ leaderboard, username, myRank }) => {
  const totalSolvedThisMonth = leaderboard.reduce((s, u) => s + u.count, 0);
  const topScore = leaderboard[0]?.count ?? 0;
  const myEntry = leaderboard.find(u => u.username === username);

  return (
    <>
      {/* ── Header ── */}
      <div className="lb-panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🏆</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Leaderboard</div>
            <div style={{ fontSize: 11, color: "#6b6b72" }}>Monthly Rankings</div>
          </div>
          <div className="live-pill">
            <span className="pulse-dot-green" />
            <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 700, letterSpacing: "0.05em" }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* ── Month Stats Strip ── */}
      <div className="lb-stats-strip">
        <div className="lb-stat-item">
          <div className="lb-stat-val">{leaderboard.length}</div>
          <div className="lb-stat-label">Coders</div>
        </div>
        <div className="lb-stat-divider" />
        <div className="lb-stat-item">
          <div className="lb-stat-val">{totalSolvedThisMonth}</div>
          <div className="lb-stat-label">Total Solved</div>
        </div>
        <div className="lb-stat-divider" />
        <div className="lb-stat-item">
          <div className="lb-stat-val" style={{ color: "#ffd700" }}>{topScore}</div>
          <div className="lb-stat-label">Top Score</div>
        </div>
      </div>

      {/* ── Podium ── */}
      {leaderboard.length >= 3 && (
        <div className="podium-wrap">
          {/* 2nd */}
          <div className="podium-item" style={{ animationDelay: "0.15s" }}>
            <div className="podium-avatar" style={{ border: "2px solid #c0c0c0", boxShadow: "0 0 14px rgba(192,192,192,0.3)" }}>🥈</div>
            <div className="podium-name">{leaderboard[1].username}</div>
            <div className="podium-score" style={{ color: "#c0c0c0" }}>{leaderboard[1].count}</div>
            <div className="podium-base" style={{ height: 44, background: "linear-gradient(180deg,rgba(192,192,192,0.15),rgba(192,192,192,0.04))", border: "1px solid rgba(192,192,192,0.2)" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#c0c0c0" }}>#2</span>
            </div>
          </div>
          {/* 1st */}
          <div className="podium-item" style={{ animationDelay: "0.05s" }}>
            <div style={{ fontSize: 16, marginBottom: -2 }}>👑</div>
            <div className="podium-avatar" style={{ width: 54, height: 54, fontSize: 22, border: "2px solid #ffd700", boxShadow: "0 0 22px rgba(255,215,0,0.45)" }}>🥇</div>
            <div className="podium-name" style={{ color: "#ffd700", fontWeight: 800 }}>{leaderboard[0].username}</div>
            <div className="podium-score" style={{ color: "#ffd700", fontSize: 18 }}>{leaderboard[0].count}</div>
            <div className="podium-base" style={{ height: 64, background: "linear-gradient(180deg,rgba(255,215,0,0.2),rgba(255,215,0,0.05))", border: "1px solid rgba(255,215,0,0.35)" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#ffd700" }}>#1</span>
            </div>
          </div>
          {/* 3rd */}
          <div className="podium-item" style={{ animationDelay: "0.25s" }}>
            <div className="podium-avatar" style={{ border: "2px solid #cd7f32", boxShadow: "0 0 14px rgba(205,127,50,0.3)" }}>🥉</div>
            <div className="podium-name">{leaderboard[2].username}</div>
            <div className="podium-score" style={{ color: "#cd7f32" }}>{leaderboard[2].count}</div>
            <div className="podium-base" style={{ height: 30, background: "linear-gradient(180deg,rgba(205,127,50,0.15),rgba(205,127,50,0.04))", border: "1px solid rgba(205,127,50,0.2)" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#cd7f32" }}>#3</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Full ranked list (ALL users) ── */}
      <div className="lb-list">
        {leaderboard.length === 0
          ? <div style={{ textAlign: "center" as const, padding: "28px 8px" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏁</div>
              <div style={{ fontSize: 13, color: "#6b6b72" }}>No data yet this month</div>
            </div>
          : leaderboard.map((user, index) => {
              const isMe = user.username === username;
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;
              const medalColor = index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : null;
              const pct = topScore > 0 ? Math.round((user.count / topScore) * 100) : 0;

              // Visual tiers — "you" always gets tier 0 treatment
              // tier 0 = 1–3 (medal), tier 1 = 4–6 (bright), tier 2 = 7–10 (mid), tier 3 = 11+ (dim)
              const tier = isMe ? 0 : index < 3 ? 0 : index < 6 ? 1 : index < 10 ? 2 : 3;

              const rowOpacity = tier === 3 ? 0.45 : tier === 2 ? 0.7 : 1;
              const nameColor  = isMe ? "#fb923c" : medal ? medalColor! : tier === 1 ? "#d4d4e0" : tier === 2 ? "#9a9aaa" : "#6a6a7a";
              const scoreColor = isMe ? "#fb923c" : medal ? medalColor! : tier === 1 ? "#4ade80" : tier === 2 ? "#2d7a50" : "#1e4a35";
              const rowBg      = isMe
                ? "linear-gradient(90deg,rgba(251,146,60,0.18),rgba(251,146,60,0.07))"
                : medal ? `linear-gradient(90deg,${medalColor}10,transparent)`
                : "rgba(255,255,255,0.02)";
              const rowBorder  = isMe
                ? "1px solid rgba(251,146,60,0.5)"
                : medal ? `1px solid ${medalColor}30`
                : tier <= 1 ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.03)";
              const padding    = isMe ? "12px 12px" : tier === 0 ? "11px 12px" : tier <= 2 ? "9px 11px" : "7px 10px";
              const badgeSize  = isMe || tier <= 1 ? 26 : tier === 2 ? 23 : 20;

              return (
                <div
                  key={index}
                  className={`lb-row${isMe ? " lb-row-me" : ""}`}
                  style={{ opacity: rowOpacity, background: rowBg, border: rowBorder, padding, gap: isMe || tier <= 1 ? 9 : 7 }}
                >
                  {isMe && <div className="row-shimmer" />}
                  {/* "YOU" flame indicator */}
                  {isMe && <div style={{ position: "absolute" as const, left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg,#fb923c,#f97316)", borderRadius: "3px 0 0 3px" }} />}

                  {/* rank badge */}
                  <div style={{
                    width: badgeSize, height: badgeSize, borderRadius: 7, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: medal ? (isMe || tier === 0 ? 15 : 13) : tier === 3 ? 9 : tier === 2 ? 10 : 11,
                    fontWeight: 800, fontFamily: "'JetBrains Mono',monospace",
                    background: isMe ? "rgba(251,146,60,0.22)" : medal ? `${medalColor}18` : "rgba(255,255,255,0.05)",
                    border: isMe ? "1px solid rgba(251,146,60,0.4)" : medal ? `1px solid ${medalColor}40` : "1px solid rgba(255,255,255,0.07)",
                    color: isMe ? "#fb923c" : medal ? medalColor! : tier <= 1 ? "#7a7a9a" : "#4a4a5a",
                    boxShadow: isMe ? "0 0 10px rgba(251,146,60,0.3)" : medal && tier === 0 ? `0 0 8px ${medalColor}30` : "none",
                  }}>
                    {medal ?? `${index + 1}`}
                  </div>

                  {/* name + bar */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: isMe ? 13 : tier === 3 ? 11 : 13,
                      fontWeight: isMe ? 800 : tier <= 1 ? 700 : 600,
                      color: nameColor,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
                      marginBottom: tier <= 2 || isMe ? 4 : 0,
                      letterSpacing: isMe ? "0.01em" : "normal",
                    }}>
                      {user.username}
                      {isMe && <span style={{ fontSize: 10, color: "#fb923c99", fontWeight: 600, marginLeft: 5 }}>you</span>}
                    </div>
                    {(tier <= 2 || isMe) && (
                      <div style={{ height: isMe ? 4 : 3, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                        <div style={{
                          width: `${pct}%`, height: "100%", borderRadius: 99,
                          background: isMe ? "linear-gradient(90deg,#fb923c,#fbbf24)" : medal ? medalColor! : tier === 1 ? "#4ade80" : "#2d7a50",
                          boxShadow: isMe ? "0 0 6px rgba(251,146,60,0.6)" : "none",
                          opacity: isMe ? 1 : tier === 2 ? 0.5 : 0.7,
                        }} />
                      </div>
                    )}
                  </div>

                  {/* score */}
                  <div style={{ flexShrink: 0, textAlign: "right" as const }}>
                    <div style={{
                      fontSize: isMe ? 16 : tier <= 1 ? 15 : tier === 2 ? 13 : 11,
                      fontWeight: 900, fontFamily: "'JetBrains Mono',monospace",
                      color: scoreColor, lineHeight: 1,
                    }}>
                      {user.count}
                    </div>
                    {(isMe || tier <= 1) && <div style={{ fontSize: 9, color: "#5a5a6a", letterSpacing: "0.04em", marginTop: 2 }}>solved</div>}
                  </div>
                </div>
              );
            })}
      </div>

      {/* ── My progress bar vs leader ── */}
      {myEntry && myRank >= 0 && topScore > 0 && (
        <div className="lb-my-progress">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#6b6b72", fontWeight: 600 }}>Your progress vs leader</span>
            <span style={{ fontSize: 11, color: "#fb923c", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>
              {myEntry.count} / {topScore}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" as const }}>
            <div style={{ width: `${Math.round((myEntry.count / topScore) * 100)}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#fb923c,#fbbf24)", boxShadow: "0 0 8px rgba(251,146,60,0.5)", transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }} />
          </div>
          <div style={{ fontSize: 10, color: "#5a5a6a", marginTop: 5, textAlign: "right" as const }}>
            {topScore - myEntry.count > 0 ? `${topScore - myEntry.count} more to reach #1` : "🎉 You're leading!"}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="my-rank-footer">
        <div style={{ display: "flex", flexDirection: "column" as const }}>
          <span style={{ fontSize: 11, color: "#6b6b72" }}>Your rank this month</span>
          {myRank >= 0
            ? <span style={{ fontSize: 10, color: "#5a5a6a", marginTop: 1 }}>
                {myRank === 0 ? "👑 You're on top!" : myRank === 1 ? "🥈 So close to #1!" : myRank === 2 ? "🥉 Top 3 — great!" : `Keep climbing!`}
              </span>
            : null}
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, color: myRank >= 0 ? "#fb923c" : "#6b6b72", fontFamily: "'JetBrains Mono',monospace" }}>
          {myRank >= 0 ? `#${myRank + 1}` : "—"}
          <span style={{ fontSize: 11, color: "#6b6b72", fontWeight: 400 }}> / {leaderboard.length}</span>
        </span>
      </div>
    </>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [stats, setStats]                     = useState<LeetCodeStat[]>([]);
  const [status, setStatus]                   = useState<SubmissionStatus | null>(null);
  const [profile, setProfile]                 = useState<Profile | null>(null);
  const [calendar, setCalendar]               = useState<CalendarData | null>(null);
  const [contest, setContest]                 = useState<ContestData | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [username, setUsername]               = useState("");
  const [animated, setAnimated]               = useState<Record<string, number>>({});
  const [hoverCell, setHoverCell]             = useState<number | null>(null);
  const [reminders, setReminders]             = useState<boolean | null>(null);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [lbOpen, setLbOpen]                   = useState(false);
  const contestRef                            = useRef<HTMLCanvasElement>(null);
  const [leaderboard, setLeaderboard]         = useState<{ username: string; count: number }[]>([]);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leetcode/leaderboard/monthly");
      setLeaderboard(res.data);
    } catch (err) { console.error("Leaderboard fetch error", err); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/me");
        const { leetcodeUsername, remindersEnabled } = res.data;
        setUsername(leetcodeUsername);
        setReminders(remindersEnabled !== false);
        fetchAll(leetcodeUsername);
        await fetchLeaderboard();
        try {
          await axios.get(`${API}/submissions/${leetcodeUsername}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
        } catch (err) {
          console.log("Sync failed (ignore):", err instanceof Error ? err.message : String(err));
        }
      } catch { window.location.href = "/login"; }
    };
    init();
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

  const toggleReminders = async () => {
    if (reminderLoading || reminders === null) return;
    const next = !reminders;
    setReminderLoading(true);
    setReminders(next);
    try {
      await axios.put("http://localhost:5000/api/user/update-reminder", { remindersEnabled: next });
    } catch { setReminders(!next); }
    finally { setReminderLoading(false); }
  };

  const handleSignOut = async () => {
    try { await axios.post("http://localhost:5000/api/user/logout"); }
    catch (err) { console.error("Logout error", err); }
    finally { window.location.href = "/login"; }
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
    grad.addColorStop(0, "rgba(251,146,60,0.3)");
    grad.addColorStop(1, "rgba(251,146,60,0)");
    ctx.beginPath(); ctx.moveTo(pts[0].x, H);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, H);
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = "#fb923c"; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#fb923c"; ctx.fill();
    });
  }, [contest]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0f", fontFamily: "'Outfit',sans-serif", gap: 16, color: "#444" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, border: "2px solid #1a1a28", borderTop: "2px solid #fb923c", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontSize: 13, letterSpacing: "0.05em" }}>Loading your stats…</p>
    </div>
  );

  if (!status) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", fontFamily: "'Outfit',sans-serif", color: "#fff" }}>
      No data. Please log in again.
    </div>
  );

  const allStat      = stats.find(s => s.difficulty === "All");
  const displayStats = stats.filter(s => s.difficulty !== "All");
  const totalSolved  = allStat?.count ?? 0;
  const topLangs     = [...(profile?.languages ?? [])].sort((a, b) => b.problemsSolved - a.problemsSolved).slice(0, 5);
  const myRank       = leaderboard.findIndex(u => u.username === username);

  const heatWeeks: ({ date: string; count: number } | null)[][] = [];
  if (calendar?.heatmap) {
    const days = calendar.heatmap.slice(-364);
    const firstDow = new Date(days[0]?.date ?? Date.now()).getDay();
    const padded: ({ date: string; count: number } | null)[] = [...Array(firstDow).fill(null), ...days];
    for (let i = 0; i < padded.length; i += 7) heatWeeks.push(padded.slice(i, i + 7));
  }

  const isGreen = status.hasSubmittedToday;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Outfit',sans-serif", color: "#e2e8f0", position: "relative", overflowX: "hidden", paddingTop: 56 }}>
      <style>{CSS}</style>

      {/* Ambient */}
      <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
      <div className="noise" />

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        {/* Brand */}
        <div className="nav-brand">
          <span style={{ fontSize: 20 }}>⚡</span>
          <span className="nav-title" onClick={() => window.location.href = "/"}>
            Leet<span style={{ color: "#ff6b2b" }}>Streak</span>
          </span>
        </div>

        {/* Center slot */}
        <div className="nav-center">
          <div className="reminder-wrap">
            <span className="reminder-label-text" style={{ color: reminders ? "#4ade80" : "#5a5a6a" }}>
              {reminders ? "🔔 Reminders on" : "🔕 Reminders off"}
            </span>
            <button
              onClick={toggleReminders}
              disabled={reminderLoading || reminders === null}
              className="toggle-track"
              style={{
                background: reminders ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.07)",
                border: `1px solid ${reminders ? "rgba(74,222,128,0.45)" : "rgba(255,255,255,0.1)"}`,
                boxShadow: reminders ? "0 0 12px rgba(74,222,128,0.2)" : "none",
                opacity: reminderLoading ? 0.6 : 1,
              }}
              aria-label="Toggle email reminders"
            >
              <div className="toggle-thumb" style={{
                transform: reminders ? "translateX(18px)" : "translateX(2px)",
                background: reminders ? "#4ade80" : "#3a3a4a",
                boxShadow: reminders ? "0 0 8px rgba(74,222,128,0.6)" : "none",
              }} />
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="nav-right">
          {/* Trophy FAB — visible on ≤1200px */}
          <button className="lb-fab" onClick={() => setLbOpen(true)} aria-label="Open leaderboard">🏆</button>

          {/* Avatar + name */}
          <div className="nav-user">
            {profile?.profile?.userAvatar
              ? <img src={profile.profile.userAvatar} className="avatar" alt="avatar" />
              : <div className="avatar-fallback">{username[0]?.toUpperCase()}</div>}
            <div className="nav-user-meta">
              <div className="nav-name">{profile?.profile?.realName || username}</div>
              <div className="nav-sub">@{username}{profile?.profile?.countryName ? ` · ${profile.profile.countryName}` : ""}</div>
            </div>
            <button className="signout-btn" onClick={handleSignOut}>log out</button>
          </div>
        </div>
      </nav>

      {/* ── STATUS BANNER ── */}
      <div className="banner" style={{
        background: isGreen
          ? "linear-gradient(90deg,rgba(20,90,50,0.55),rgba(10,40,25,0.45) 60%,rgba(10,10,15,0.3))"
          : "linear-gradient(90deg,rgba(100,20,20,0.55),rgba(50,10,10,0.45) 60%,rgba(10,10,15,0.3))",
        borderBottom: `1px solid ${isGreen ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
        borderTop: `1px solid ${isGreen ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)"}`,
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 180, background: isGreen ? "radial-gradient(ellipse at left center,rgba(74,222,128,0.18),transparent 70%)" : "radial-gradient(ellipse at left center,rgba(248,113,113,0.18),transparent 70%)", pointerEvents: "none" }} />
        <div className="banner-icon" style={{ background: isGreen ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)", border: `1px solid ${isGreen ? "rgba(74,222,128,0.35)" : "rgba(248,113,113,0.35)"}` }}>
          {isGreen ? "✅" : "⚠️"}
        </div>
        <div style={{ flex: 1, zIndex: 1, minWidth: 0 }}>
          <div className="banner-title-row">
            <span className="banner-main-text" style={{ color: isGreen ? "#6ee7a0" : "#fca5a5" }}>
              {isGreen ? `Streak safe! ${status.submissionsToday} submission${status.submissionsToday !== 1 ? "s" : ""} today` : "No submission today — streak at risk!"}
            </span>
            {isGreen && <span className="on-fire-pill">🔥 ON FIRE</span>}
          </div>
          <div style={{ fontSize: 12, color: "#a2a8ad", marginTop: 2 }}>
            {isGreen ? "Keep the momentum going! You're crushing it." : "Reminders go out every 3–4h. Don't let it slip!"}
          </div>
        </div>
        {isGreen ? (
          <div className="active-streak-pill">
            <span className="pulse-dot-green" />
            <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>Active streak</span>
          </div>
        ) : (
          <a href="https://leetcode.com/problemset/" target="_blank" rel="noreferrer" className="solve-btn">Solve Now →</a>
        )}
      </div>

      {/* ── PAGE BODY ── */}
      <div className="body-wrap">

        {/* MAIN FEED */}
        <main className="main-content">

          {/* KPI Strip */}
          <div className="kpi-strip">
            {[
              { icon: "🔥", val: calendar?.streak ?? "—",  label: "Day Streak",     color: "#fb923c", sub: `${calendar?.totalActiveDays ?? "—"} active days` },
              { icon: "✅", val: totalSolved,               label: "Total Solved",   color: "#4ade80", sub: `Global #${profile?.profile?.ranking?.toLocaleString() ?? "—"}` },
              { icon: "🏆", val: contest?.ranking ? `#${contest.ranking.globalRanking.toLocaleString()}` : "—", label: "Contest Rank", color: "#fbbf24", sub: contest?.ranking ? `Top ${contest.ranking.topPercentage?.toFixed(1)}%` : "No contests" },
              { icon: "⭐", val: contest?.ranking ? Math.round(contest.ranking.rating) : "—", label: "Rating", color: "#c084fc", sub: contest?.ranking ? `${contest.ranking.attendedContestsCount} contests` : "—" },
            ].map((k, i) => (
              <div key={i} className="kpi-card">
                <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: k.color, lineHeight: 1, marginBottom: 5 }}>{k.val}</div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b6b72", marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 11, color: "#6b6b72" }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Difficulty Cards */}
          <div className="diff-strip">
            {displayStats.map((stat, i) => {
              const cfg = DIFF_CFG[stat.difficulty];
              if (!cfg) return null;
              const count = animated[stat.difficulty] ?? stat.count;
              const pct   = Math.min((stat.count / cfg.max) * 100, 100);
              const beats = profile?.beatsStats?.find(b => b.difficulty === stat.difficulty)?.percentage;
              const circ  = 2 * Math.PI * 38;
              return (
                <div key={stat.difficulty} className="diff-card" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, animationDelay: `${i * 0.1}s` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99, border: `1px solid ${cfg.border}`, color: cfg.color }}>{cfg.emoji} {stat.difficulty}</span>
                    {beats != null && <span style={{ fontSize: 11, color: cfg.color, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>Beats {beats.toFixed(1)}%</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <svg width="86" height="86" viewBox="0 0 96 96" style={{ flexShrink: 0 }}>
                      <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle cx="48" cy="48" r="38" fill="none" stroke={cfg.color} strokeWidth="8"
                        strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 6px ${cfg.glow})` }} />
                      <text x="48" y="44" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="800" fontFamily="'JetBrains Mono',monospace">{count}</text>
                      <text x="48" y="60" textAnchor="middle" fill="#a9a9b5" fontSize="9">of {cfg.max.toLocaleString()}</text>
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#a9a9b5" }}>Solved</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.1 }}>{stat.count}</div>
                      <div style={{ fontSize: 11, color: "#a9a9b5", marginTop: 3 }}>of {cfg.max.toLocaleString()}</div>
                      <div style={{ marginTop: 10, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div className="bar-fill" style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: cfg.color, boxShadow: `0 0 8px ${cfg.glow}` }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#a9a9b5", marginTop: 3 }}>{pct.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Languages + Today + Badges */}
          <div className="tri-grid">
            {/* Languages */}
            <div className="card">
              <div className="card-title">Languages Used</div>
              {topLangs.length === 0 ? <div className="empty">No language data</div> :
                topLangs.map((lang, i) => {
                  const pct = Math.max(3, (lang.problemsSolved / topLangs[0].problemsSolved) * 100);
                  const LANG_COLORS = ["#fb923c","#38bdf8","#a78bfa","#f472b6","#34d399"];
                  const color = LANG_COLORS[i % LANG_COLORS.length];
                  return (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#c0c0d0", fontWeight: 600 }}>{lang.languageName}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace", padding: "1px 8px", borderRadius: 6, background: color + "15", border: "1px solid " + color + "30" }}>{lang.problemsSolved}</span>
                      </div>
                      <div style={{ height: 7, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${color},${color}99)`, boxShadow: `0 0 8px ${color}66`, animation: "langBarGrow 1.2s cubic-bezier(0.22,1,0.36,1) both", animationDelay: (i * 0.09) + "s" }} />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Today's submissions */}
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#5a5a6a", fontWeight: 700, marginBottom: 12 }}>Today's Submissions</div>
              <div style={{ fontSize: 72, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: "#fff", lineHeight: 1 }}>{status?.submissionsToday ?? 0}</div>
              <div style={{ marginTop: 14, fontSize: 13 }}>
                {(status?.submissionsToday ?? 0) > 0
                  ? <span style={{ color: "#4ade80" }}>Great work! Keep the streak alive 🚀</span>
                  : <span style={{ color: "#fb923c" }}>No submissions yet today 🔥</span>}
              </div>
            </div>

            {/* Badges */}
            <div className="card">
              <div className="card-title">Badges Earned 🎖️</div>
              {!profile?.badges?.length ? <div className="empty">No badges yet</div> :
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                  {profile.badges.slice(0, 9).map(b => (
                    <div key={b.id} title={b.displayName} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, padding: 8, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", width: 60 }}>
                      <img src={b.icon} alt={b.displayName} style={{ width: 28, height: 28 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <span style={{ fontSize: 8, color: "#6b6b72", textAlign: "center" as const, lineHeight: 1.2 }}>{b.displayName.replace(" Badge","").replace("Days","d")}</span>
                    </div>
                  ))}
                </div>}
            </div>
          </div>

          {/* Heatmap */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap" as const, gap: 10 }}>
              <div>
                <div className="card-title" style={{ marginBottom: 2 }}>Activity Heatmap</div>
                <div style={{ fontSize: 12, color: "#a9a9b5" }}>{calendar?.totalActiveDays ?? "—"} active days · {calendar?.streak ?? "—"} day streak</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: "#6b6b72" }}>Less</span>
                {HEAT_COLORS.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c, border: i === 0 ? "1px solid #1e1e2a" : "none" }} />)}
                <span style={{ fontSize: 10, color: "#6b6b72" }}>More</span>
              </div>
            </div>
            {!calendar ? <div className="empty">Loading heatmap…</div> : (() => {
              const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
              const monthLabels: { label: string; colIndex: number }[] = [];
              heatWeeks.forEach((week, wi) => {
                const firstReal = week.find(d => d !== null);
                if (firstReal) {
                  const month = new Date(firstReal.date).getMonth();
                  const prev = wi > 0 ? heatWeeks[wi-1].find(d => d !== null) : null;
                  if (!prev || new Date(prev.date).getMonth() !== month) monthLabels.push({ label: MONTHS[month], colIndex: wi });
                }
              });
              return (
                <div style={{ overflowX: "auto" }}>
                  <div style={{ minWidth: "max-content" }}>
                    <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                      {heatWeeks.map((_, wi) => {
                        const ml = monthLabels.find(m => m.colIndex === wi);
                        return <div key={wi} style={{ width: 11, fontSize: 9, color: "#6b6b72", fontFamily: "'JetBrains Mono',monospace", overflow: "visible", whiteSpace: "nowrap" as const, flexShrink: 0 }}>{ml ? ml.label : ""}</div>;
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 3 }}>
                      {heatWeeks.map((week, wi) => (
                        <div key={wi} style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
                          {week.map((day, di) => {
                            if (!day) return <div key={di} style={{ width: 11, height: 11 }} />;
                            const lvl = day.count === 0 ? 0 : day.count === 1 ? 1 : day.count <= 3 ? 2 : day.count <= 6 ? 3 : 4;
                            const idx = wi * 7 + di;
                            return (
                              <div key={di} title={`${day.date}: ${day.count} submission${day.count !== 1 ? "s" : ""}`}
                                onMouseEnter={() => setHoverCell(idx)} onMouseLeave={() => setHoverCell(null)}
                                style={{ width: 11, height: 11, borderRadius: 2, background: HEAT_COLORS[lvl], cursor: "default", border: lvl === 0 ? "1px solid #1e1e2a" : "none", transform: hoverCell === idx ? "scale(1.6)" : "scale(1)", transition: "transform 0.1s", boxShadow: hoverCell === idx ? "0 0 8px rgba(74,222,128,0.6)" : "none" }}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Contest */}
          {(contest?.ranking || (contest?.history && contest.history.length > 0)) && (
            <div className="contest-grid">
              <div className="card">
                <div className="card-title">Contest Stats</div>
                {!contest?.ranking ? <div className="empty">No contest participation yet</div> : <>
                  <div style={{ textAlign: "center", padding: "14px 0 18px" }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: "#fb923c", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{Math.round(contest.ranking.rating)}</div>
                    <div style={{ fontSize: 12, color: "#a9a9b5", marginTop: 4 }}>Rating</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "Global Rank", val: `#${contest.ranking.globalRanking.toLocaleString()}` },
                      { label: "Top %",        val: `${contest.ranking.topPercentage?.toFixed(1)}%` },
                      { label: "Contests",     val: contest.ranking.attendedContestsCount },
                      { label: "Total Users",  val: contest.ranking.totalParticipants?.toLocaleString() },
                    ].map((row, i) => (
                      <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", fontFamily: "'JetBrains Mono',monospace" }}>{row.val}</div>
                        <div style={{ fontSize: 11, color: "#a9a9b5", marginTop: 2 }}>{row.label}</div>
                      </div>
                    ))}
                  </div>
                </>}
              </div>
              <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                <div className="card-title">Rating History</div>
                {!contest?.history.length ? <div className="empty">No contest history</div> : <>
                  <canvas ref={contestRef} style={{ width: "100%", height: 110, marginBottom: 12 }} />
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                    {contest.history.slice(-5).reverse().map((h, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: 12, color: "#a9a9b5", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, paddingRight: 8 }}>{h.contest.title}</span>
                        <span style={{ fontSize: 12, color: "#fb923c", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, flexShrink: 0 }}>{Math.round(h.rating)} <span style={{ color: "#6b6b72", fontWeight: 400 }}>#{h.ranking}</span></span>
                      </div>
                    ))}
                  </div>
                </>}
              </div>
            </div>
          )}

          {/* Inline leaderboard (shows in feed on tablet/mobile) */}
          <div className="lb-inline">
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <LeaderboardPanel leaderboard={leaderboard} username={username} myRank={myRank} />
            </div>
          </div>

        </main>

        {/* ── RIGHT SIDEBAR (desktop ≥1200px) ── */}
        <aside className="lb-sidebar">
          <div className="lb-sidebar-inner">
            <LeaderboardPanel leaderboard={leaderboard} username={username} myRank={myRank} />
          </div>
        </aside>
      </div>

      {/* ── BOTTOM SHEET DRAWER (mobile/tablet) ── */}
      {lbOpen && (
        <div className="drawer-overlay" onClick={() => setLbOpen(false)}>
          <div className="drawer-sheet" onClick={e => e.stopPropagation()}>
            {/* drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>🏆 Leaderboard</span>
              <button onClick={() => setLbOpen(false)} style={{ background: "none", border: "none", color: "#6b6b72", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>✕</button>
            </div>
            <LeaderboardPanel leaderboard={leaderboard} username={username} myRank={myRank} />
          </div>
        </div>
      )}
    </div>
  );
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0a0f}
::selection{background:rgba(251,146,60,0.3)}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(251,146,60,0.3);border-radius:99px}

/* Ambient */
.noise{position:fixed;inset:0;pointer-events:none;opacity:0.025;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:128px 128px;z-index:0}
.orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
.orb1{width:600px;height:600px;background:radial-gradient(circle,rgba(251,146,60,0.08),transparent 65%);top:-200px;right:-200px}
.orb2{width:400px;height:400px;background:radial-gradient(circle,rgba(192,132,252,0.05),transparent 65%);bottom:-100px;left:-100px}
.orb3{width:280px;height:280px;background:radial-gradient(circle,rgba(255,215,0,0.04),transparent 65%);top:40%;right:24%}

/* ── Navbar ── */
.navbar{
  position:fixed;top:0;left:0;right:0;z-index:1000;
  display:flex;align-items:center;gap:8px;
  padding:0 18px;height:56px;
  background:rgba(10,10,15,0.92);
  border-bottom:1px solid rgba(255,255,255,0.07);
  backdrop-filter:blur(20px);
}
.nav-brand{display:flex;align-items:center;gap:7px;flex-shrink:0;min-width:0}
.nav-title{cursor:pointer;font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.5px;white-space:nowrap}
.nav-center{flex:1;display:flex;justify-content:center;min-width:0;overflow:hidden}
.nav-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.nav-user{display:flex;align-items:center;gap:7px}
.nav-user-meta{display:flex;flex-direction:column}
.nav-name{font-size:13px;font-weight:700;color:#e2e8f0;white-space:nowrap}
.nav-sub{font-size:10px;color:rgba(211,211,222,0.73);font-family:'JetBrains Mono',monospace;white-space:nowrap}
.avatar{width:28px;height:28px;border-radius:50%;border:1.5px solid #fb923c;object-fit:cover;flex-shrink:0}
.avatar-fallback{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#fb923c,#f97316);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;flex-shrink:0}
.signout-btn{padding:5px 10px;background:rgb(238,10,10);border:none;border-radius:7px;color:#fff;font-size:11px;cursor:pointer;font-family:'Outfit',sans-serif;white-space:nowrap;flex-shrink:0}
.reminder-wrap{display:flex;align-items:center;gap:7px;padding:5px 11px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);overflow:hidden;max-width:100%}
.reminder-label-text{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.toggle-track{position:relative;width:40px;height:22px;border-radius:99px;cursor:pointer;transition:background 0.25s,box-shadow 0.25s;padding:0;flex-shrink:0}
.toggle-thumb{position:absolute;top:3px;width:16px;height:16px;border-radius:50%;transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),background 0.25s,box-shadow 0.25s}
.lb-fab{display:none;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:rgba(255,215,0,0.12);border:1px solid rgba(255,215,0,0.3);font-size:16px;cursor:pointer;flex-shrink:0;transition:background 0.2s}
.lb-fab:hover{background:rgba(255,215,0,0.22)}

/* ── Banner ── */
.banner{display:flex;align-items:center;gap:10px;padding:11px 18px;backdrop-filter:blur(16px);flex-wrap:wrap;overflow:hidden;position:relative;z-index:1}
.banner-icon{width:34px;height:34px;min-width:34px;border-radius:10px;z-index:1;display:flex;align-items:center;justify-content:center;font-size:17px}
.banner-title-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.banner-main-text{font-weight:800;font-size:13px;letter-spacing:0.01em}
.on-fire-pill{font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:rgba(74,222,128,0.15);border:1px solid rgba(74,222,128,0.3);color:#4ade80;letter-spacing:0.05em;white-space:nowrap;flex-shrink:0}
.active-streak-pill{flex-shrink:0;z-index:1;display:flex;align-items:center;gap:5px;padding:5px 11px;border-radius:10px;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2)}
.solve-btn{flex-shrink:0;padding:6px 13px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:12px;box-shadow:0 4px 12px rgba(239,68,68,0.35);white-space:nowrap}

/* ── Body ── */
.body-wrap{display:flex;align-items:flex-start;max-width:1440px;margin:0 auto;padding:18px 16px 48px;gap:16px;position:relative;z-index:1}
.main-content{flex:1;min-width:0;display:flex;flex-direction:column;gap:14px}

/* ── Cards ── */
.card{padding:20px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px)}
.card-title{font-size:13px;font-weight:700;color:#6b6b72;margin-bottom:14px;letter-spacing:0.02em}
.empty{font-size:13px;color:#6b6b72;padding:16px 0}

/* ── KPI ── */
.kpi-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.kpi-card{padding:18px 14px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);text-align:center;backdrop-filter:blur(10px);transition:transform 0.18s,box-shadow 0.18s;cursor:default}
.kpi-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(251,146,60,0.08)}

/* ── Diff ── */
.diff-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.diff-card{padding:18px 18px;border-radius:16px;backdrop-filter:blur(12px);animation:fadeUp 0.6s ease both;transition:transform 0.18s}
.diff-card:hover{transform:translateY(-4px)}

/* ── Tri ── */
.tri-grid{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:12px}

/* ── Contest ── */
.contest-grid{display:grid;grid-template-columns:1fr 1.6fr;gap:12px}

/* ── Bar anims ── */
.bar-fill{animation:barGrow 1.4s cubic-bezier(0.22,1,0.36,1) both}
@keyframes barGrow{from{width:0 !important}}
@keyframes langBarGrow{from{width:0 !important}}

/* ── Sidebar ── */
.lb-sidebar{width:280px;flex-shrink:0;align-self:stretch;display:flex;flex-direction:column}
.lb-sidebar-inner{
  position:sticky;top:72px;
  border-radius:18px;
  background:rgba(255,255,255,0.025);
  border:1px solid rgba(255,255,255,0.08);
  backdrop-filter:blur(20px);
  overflow:hidden;
  height:calc(100vh - 90px);
  display:flex;flex-direction:column;
}

/* ── LB panel pieces ── */
.lb-panel-header{padding:16px 14px 12px;border-bottom:1px solid rgba(255,255,255,0.06);background:linear-gradient(135deg,rgba(255,215,0,0.07),rgba(251,146,60,0.04));flex-shrink:0;position:relative}
.lb-panel-header::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,rgba(255,215,0,0.6),rgba(251,146,60,0.5),transparent)}
.live-pill{margin-left:auto;display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:99px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.25)}

/* month stats strip */
.lb-stats-strip{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.015);border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0}
.lb-stat-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px}
.lb-stat-val{font-size:18px;font-weight:900;font-family:'JetBrains Mono',monospace;color:#e2e8f0;line-height:1}
.lb-stat-label{font-size:9px;color:#5a5a6a;font-weight:600;letter-spacing:0.06em;text-transform:uppercase}
.lb-stat-divider{width:1px;height:28px;background:rgba(255,255,255,0.07);flex-shrink:0}

.podium-wrap{display:flex;align-items:flex-end;justify-content:center;gap:4px;padding:18px 8px 0;background:linear-gradient(180deg,rgba(255,215,0,0.04),transparent);flex-shrink:0}
.podium-item{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;animation:fadeUp 0.5s ease both}
.podium-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.06);font-size:18px;flex-shrink:0}
.podium-name{font-size:10px;color:#c0c0d0;font-weight:700;text-align:center;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 2px}
.podium-score{font-size:14px;font-weight:900;font-family:'JetBrains Mono',monospace;color:#e2e8f0}
.podium-base{width:100%;border-radius:6px 6px 0 0;display:flex;align-items:center;justify-content:center;padding:5px 0}
.lb-list{padding:8px 8px 4px;display:flex;flex-direction:column;gap:6px;overflow-y:auto;flex:1;min-height:0;scrollbar-width:thin}
.lb-row{display:flex;align-items:center;gap:9px;border-radius:10px;transition:all 0.18s;position:relative;overflow:hidden;cursor:default}
.lb-row:hover{filter:brightness(1.14);transform:translateX(2px)}
.lb-row-me{box-shadow:0 0 18px rgba(251,146,60,0.15) !important}
.lb-rank-badge{border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-family:'JetBrains Mono',monospace}
.row-shimmer{position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(251,146,60,0.07) 50%,transparent 100%);background-size:200% 100%;animation:shimmer 2.5s infinite;pointer-events:none}

/* my progress vs leader */
.lb-my-progress{margin:0 8px;padding:12px 12px;border-radius:10px;background:rgba(251,146,60,0.05);border:1px solid rgba(251,146,60,0.15);flex-shrink:0;margin-bottom:6px}

.my-rank-footer{margin:0 8px 8px;padding:10px 14px;border-radius:10px;background:rgba(251,146,60,0.09);border:1px solid rgba(251,146,60,0.22);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;position:relative;overflow:hidden}
.my-rank-footer::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(251,146,60,0.06),transparent);pointer-events:none}

/* Inline LB for non-desktop (hidden by default, shown below 1200px) */
.lb-inline{display:none}

/* ── Drawer ── */
.drawer-overlay{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center}
.drawer-sheet{width:100%;max-width:480px;max-height:82vh;background:#0e0e18;border:1px solid rgba(255,255,255,0.1);border-radius:20px 20px 0 0;padding:14px 14px 24px;overflow-y:auto;display:flex;flex-direction:column}

/* ── Keyframes ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulse-g{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.5)}50%{box-shadow:0 0 0 4px rgba(74,222,128,0)}}
.pulse-dot-green{display:inline-block;width:6px;height:6px;border-radius:50%;background:#4ade80;animation:pulse-g 1.5s ease-in-out infinite}

/* ─────────────────────────────────────────
   RESPONSIVE BREAKPOINTS
───────────────────────────────────────── */

/* Large desktop default: sidebar visible, inline hidden */

/* ≤1200px: hide sidebar, show FAB, show inline leaderboard in feed */
@media(max-width:1200px){
  .lb-sidebar{display:none}
  .lb-fab{display:flex}
  .lb-inline{display:block}
}

/* ≤960px: 2-col KPI + 2-col diff */
@media(max-width:960px){
  .kpi-strip{grid-template-columns:repeat(2,1fr)}
  .diff-strip{grid-template-columns:repeat(2,1fr)}
  .tri-grid{grid-template-columns:1fr 1fr}
  .contest-grid{grid-template-columns:1fr}
}

/* ≤700px: hide nav meta text, compact reminder */
@media(max-width:700px){
  .nav-user-meta{display:none}
  .reminder-label-text{display:none}
  .body-wrap{padding:12px 10px 40px;gap:0}
  .main-content{gap:10px}
}

/* ≤600px: full single-column */
@media(max-width:600px){
  .navbar{padding:0 10px;height:52px}
  .nav-title{font-size:16px}
  .reminder-wrap{padding:4px 8px}
  .signout-btn{font-size:10px;padding:4px 7px}
  .banner{padding:9px 10px;gap:8px}
  .kpi-strip{grid-template-columns:repeat(2,1fr);gap:8px}
  .kpi-card{padding:13px 10px}
  .diff-strip{grid-template-columns:1fr}
  .tri-grid{grid-template-columns:1fr}
  .contest-grid{grid-template-columns:1fr}
  .card{padding:14px 12px}
}

/* ≤400px: tighter tweaks */
@media(max-width:400px){
  .kpi-strip{grid-template-columns:1fr 1fr;gap:7px}
  .nav-title{font-size:15px}
  .lb-fab{width:30px;height:30px;font-size:14px}
}
`;

export default Dashboard;