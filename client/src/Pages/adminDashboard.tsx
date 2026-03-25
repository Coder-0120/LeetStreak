import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ─── Types ───────────────────────────────────────────────────────────────── */
interface ProblemStats {
  easy: number;
  medium: number;
  hard: number;
  totalSolved: number;
  contestRating: number;
  lastSolvedAt: string | null;
}

interface User {
  _id: string;
  email: string;
  leetcodeUsername: string;
  problemStats: ProblemStats;
  activityLog: string[];      // ISO date strings after JSON parse
  lastReminderSent: string | null;
  remindersEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalUsers: number;
  activeToday: number;
  remindersSentToday: number;
  avgStreak: number;
  newThisMonth: number;
  remindersDisabled: number;
}

interface DailyActivity { date: string; count: number; }

type SortField =
  | "totalSolved" | "easy" | "medium" | "hard"
  | "contestRating" | "leetcodeUsername"
  | "activityLog" | "streak" | "createdAt";
type SortDir = "asc" | "desc";
type Tab = "overview" | "users" | "activity" | "reminders";

/* ─── Config ──────────────────────────────────────────────────────────────── */
const API = "http://localhost:5000/api/admin";

/**
 * Auth header — sends whatever token is in localStorage.
 * Your current login route doesn't require a real JWT, so we just
 * send the stored value (or an empty string) and the backend ignores it.
 */
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") ?? ""}` },
});

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function toDay(v: unknown): string {
  if (!v) return "";
  const s = typeof v === "string" ? v : String(v);
  return s.slice(0, 10);
}

function daysAgo(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function currentStreak(activityLog: string[]): number {
  if (!activityLog.length) return 0;
  const days = [...new Set(activityLog.map(toDay))].filter(Boolean).sort().reverse();
  let streak = 0;
  let expected = new Date().toISOString().slice(0, 10);
  for (const d of days) {
    if (d === expected) {
      streak++;
      expected = new Date(new Date(expected).getTime() - 86400000).toISOString().slice(0, 10);
    } else if (d < expected) break;
  }
  return streak;
}

function buildActivityChart(users: User[]): DailyActivity[] {
  const map: Record<string, Set<string>> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map[d.toISOString().slice(0, 10)] = new Set();
  }
  users.forEach(u =>
    u.activityLog.forEach(v => {
      const day = toDay(v);
      if (map[day]) map[day].add(u._id);
    })
  );
  return Object.entries(map).map(([date, set]) => ({ date, count: set.size }));
}

function buildLast30Set(): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    s.add(d.toISOString().slice(0, 10));
  }
  return s;
}

/* ─── Logo ────────────────────────────────────────────────────────────────── */
const Logo: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
    <span style={{ fontSize: 19, filter: "drop-shadow(0 0 6px rgba(255,107,43,0.8))" }}>⚡</span>
    <span style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
      Leet<span style={{ color: "#ff6b2b" }}>Streak</span>
    </span>
  </div>
);

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
const StatCard: React.FC<{
  label: string; value: string | number; sub?: string; accent?: string; icon: string;
}> = ({ label, value, sub, accent = "#ff6b2b", icon }) => (
  <div style={c.statCard}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 18, opacity: 0.7 }}>{icon}</div>
    </div>
    <div style={{ fontSize: 30, fontWeight: 900, color: accent, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 6 }}>{sub}</div>}
  </div>
);

/* ─── Bar Chart ───────────────────────────────────────────────────────────── */
const ActivityChart: React.FC<{ data: DailyActivity[] }> = ({ data }) => {
  const W = 900, H = 180, pad = { t: 16, r: 16, b: 36, l: 36 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const max = Math.max(...data.map(d => d.count), 1);
  const bw = iw / data.length - 3;
  const labels = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = pad.t + ih * (1 - f);
        return (
          <g key={f}>
            <line x1={pad.l} x2={pad.l + iw} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#4b5563">{Math.round(max * f)}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const bh = (d.count / max) * ih || 2;
        const x = pad.l + (iw / data.length) * i + 1.5;
        const y = pad.t + ih - bh;
        return (
          <rect key={d.date} x={x} y={y} width={bw} height={bh} rx={3}
            fill={i === data.length - 1 ? "#ff6b2b" : "rgba(255,107,43,0.35)"}>
            <title>{d.date}: {d.count} users</title>
          </rect>
        );
      })}
      {labels.map(d => {
        const i = data.findIndex(x => x.date === d.date);
        const x = pad.l + (iw / data.length) * i + bw / 2;
        return <text key={d.date} x={x} y={H - 8} textAnchor="middle" fontSize={9} fill="#4b5563">{d.date.slice(5)}</text>;
      })}
    </svg>
  );
};

/* ─── Badge ───────────────────────────────────────────────────────────────── */
const Badge: React.FC<{ n: number; color: string }> = ({ n, color }) => (
  <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: color + "22", color, fontWeight: 700 }}>
    {n}
  </span>
);

/* ─── Last Solved ─────────────────────────────────────────────────────────── */
const LastSolved: React.FC<{ v: string | null }> = ({ v }) => {
  const ago = daysAgo(v);
  if (ago === null) return <span style={{ color: "#374151" }}>Never</span>;
  if (ago === 0)    return <span style={{ color: "#22c55e" }}>Today</span>;
  if (ago === 1)    return <span style={{ color: "#f59e0b" }}>Yesterday</span>;
  return <span style={{ color: "#6b7280" }}>{ago}d ago</span>;
};

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers]     = useState<User[]>([]);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tab, setTab]         = useState<Tab>("overview");
  const [sortField, setSortField] = useState<SortField>("totalSolved");
  const [sortDir, setSortDir]     = useState<SortDir>("desc");
  const [search, setSearch]       = useState("");
  const [filterReminder, setFilterReminder] = useState<"all" | "enabled" | "disabled">("all");
  const [mounted, setMounted] = useState(false);

  /* ── fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [uRes, sRes] = await Promise.all([
        axios.get<User[]>(`${API}/users`, authHeader()),
        axios.get<Stats>(`${API}/stats`, authHeader()),
      ]);
      setUsers(uRes.data);
      setStats(sRes.data);
    } catch (e: any) {
      console.error("Dashboard fetch error:", e);
      if (e?.response?.status === 401) {
        navigate("/admin/login");
        return;
      }
      // Show the actual error message to help debug
      const msg =
        e?.response?.data?.msg ||
        e?.response?.data?.message ||
        e?.message ||
        "Unknown error";
      setError(`Failed to load dashboard: ${msg}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 80);
    }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── derived ── */
  const todayStr    = new Date().toISOString().slice(0, 10);
  const activeToday = users.filter(u => u.activityLog.some(v => toDay(v) === todayStr));
  const last30      = buildLast30Set();

  /* ── sort + filter ── */
  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      if (q && !u.leetcodeUsername.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      if (filterReminder === "enabled"  && !u.remindersEnabled) return false;
      if (filterReminder === "disabled" &&  u.remindersEnabled) return false;
      return true;
    })
    .sort((a, b) => {
      let va: number | string, vb: number | string;
      switch (sortField) {
        case "totalSolved":      va = a.problemStats.totalSolved;   vb = b.problemStats.totalSolved;   break;
        case "easy":             va = a.problemStats.easy;          vb = b.problemStats.easy;          break;
        case "medium":           va = a.problemStats.medium;        vb = b.problemStats.medium;        break;
        case "hard":             va = a.problemStats.hard;          vb = b.problemStats.hard;          break;
        case "contestRating":    va = a.problemStats.contestRating; vb = b.problemStats.contestRating; break;
        case "leetcodeUsername": va = a.leetcodeUsername;           vb = b.leetcodeUsername;           break;
        case "activityLog":      va = new Set(a.activityLog.map(toDay)).size; vb = new Set(b.activityLog.map(toDay)).size; break;
        case "streak":           va = currentStreak(a.activityLog); vb = currentStreak(b.activityLog); break;
        case "createdAt":        va = a.createdAt;                  vb = b.createdAt;                  break;
        default: va = 0; vb = 0;
      }
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });

  const actChart = buildActivityChart(users);

  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortField(f); setSortDir("desc"); }
  };
  const arrow = (f: SortField) => sortField === f ? (sortDir === "desc" ? " ↓" : " ↑") : "";

  const logout = async () => {
    try {
      await axios.post(`${API}/logout`, {}, authHeader());
    } catch {
      // ignore — clear local state regardless
    } finally {
      localStorage.removeItem("adminToken");
      navigate("/");
    }
  };

  const pendingReminder = users.filter(
    u => u.remindersEnabled && !u.activityLog.some(v => toDay(v) === todayStr)
  );

  /* ── loading ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06060c", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div className="spin-ring" />
      <div style={{ color: "#4b5563", fontSize: 13 }}>Loading dashboard…</div>
      <style>{BASE_CSS}</style>
    </div>
  );

  /* ── error ── */
  if (error) return (
    <div style={{ minHeight: "100vh", background: "#06060c", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ color: "#fca5a5", fontSize: 15 }}>⚠️ {error}</div>
      <button onClick={fetchAll} style={{ ...c.refreshBtn, color: "#f1f5f9" }}>↻ Retry</button>
      <style>{BASE_CSS}</style>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: "#06060c", fontFamily: "'Outfit',sans-serif", color: "#e2e8f0", display: "flex" }}>
      <style>{BASE_CSS}</style>

      {/* ── Sidebar ── */}
      <aside style={c.sidebar}>
        <div style={c.sideTop}>
          <Logo />
          <div style={c.adminPill}>🛡️ Admin</div>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {(["overview", "users", "activity", "reminders"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...c.navBtn, ...(tab === t ? c.navActive : {}) }}>
              <span>{TAB_ICONS[t]}</span>
              <span>{TAB_LABELS[t]}</span>
            </button>
          ))}
        </nav>
        <div style={c.sideFooter}>
          <div style={{ fontSize: 11, color: "#374151", marginBottom: 10 }}>
            <span style={{ color: "#22c55e", marginRight: 5 }}>●</span>{users.length} users
          </div>
          {/* <button onClick={() => navigate("/")} style={c.homeBtn}>🏠 Homepage</button> */}
          <button onClick={logout} style={c.logoutBtn}>⏻ Sign out</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={c.main}>
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(12px)", transition: "all 0.5s ease" }}>

          {/* Header */}
          <div style={c.pageHeader}>
            <div>
              <div style={c.pageTitle}>{TAB_LABELS[tab]}</div>
              <div style={c.pageSub}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
            <button onClick={fetchAll} style={c.refreshBtn}>↻ Refresh</button>
          </div>

          {/* ══ OVERVIEW ══════════════════════════════════════════════ */}
          {tab === "overview" && stats && (
            <>
              <div style={c.grid6}>
                <StatCard label="Total users"        value={stats.totalUsers}          sub="All registered accounts"        icon="👥" />
                <StatCard label="Active today"        value={activeToday.length}        sub="Solved at least 1 problem"      icon="🔥" accent="#22c55e" />
                <StatCard label="New this month"      value={stats.newThisMonth}        sub="Joined in last 30 days"         icon="✨" accent="#60a5fa" />
                <StatCard label="Reminders sent"      value={stats.remindersSentToday}  sub="Sent today by cron"             icon="🔔" accent="#f59e0b" />
                <StatCard label="Reminders disabled"  value={stats.remindersDisabled}   sub={`of ${stats.totalUsers} users`} icon="🔕" accent="#6b7280" />
                <StatCard label="Avg streak"          value={`${stats.avgStreak}d`}     sub="Across active users"            icon="⚡" />
              </div>

              <div style={c.card}>
                <div style={c.cardHead}>
                  <div style={c.cardTitle}>Daily active users — last 30 days</div>
                  <button onClick={() => setTab("activity")} style={c.cardLink}>See full chart →</button>
                </div>
                <ActivityChart data={actChart} />
              </div>

              <div style={c.card}>
                <div style={c.cardHead}>
                  <div style={c.cardTitle}>✅ Coded today ({activeToday.length})</div>
                </div>
                {activeToday.length === 0
                  ? <div style={c.empty}>No one has solved a problem today yet.</div>
                  : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {activeToday.map(u => (
                        <div key={u._id} style={c.pill}>
                          <span style={{ color: "#22c55e", fontSize: 10 }}>●</span>
                          <span style={{ fontWeight: 700 }}>{u.leetcodeUsername}</span>
                          <span style={{ color: "#4b5563", fontSize: 11 }}>{u.problemStats.totalSolved} solved</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </>
          )}

          {/* ══ LEADERBOARD ═══════════════════════════════════════════ */}
          {tab === "users" && (
            <div style={c.card}>
              <div style={c.tableControls}>
                <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search username or email…" style={c.searchInput} />
                </div>
                <select value={filterReminder} onChange={e => setFilterReminder(e.target.value as any)} style={c.select}>
                  <option value="all">All users</option>
                  <option value="enabled">Reminders on</option>
                  <option value="disabled">Reminders off</option>
                </select>
                <div style={{ fontSize: 12, color: "#4b5563", whiteSpace: "nowrap" }}>
                  {filtered.length} of {users.length}
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={c.table}>
                  <thead>
                    <tr>
                      <th style={c.th}>#</th>
                      <th style={c.thS} onClick={() => toggleSort("leetcodeUsername")}>Username{arrow("leetcodeUsername")}</th>
                      <th style={c.thS} onClick={() => toggleSort("totalSolved")}>Total{arrow("totalSolved")}</th>
                      <th style={c.thS} onClick={() => toggleSort("easy")}>Easy{arrow("easy")}</th>
                      <th style={c.thS} onClick={() => toggleSort("medium")}>Medium{arrow("medium")}</th>
                      <th style={c.thS} onClick={() => toggleSort("hard")}>Hard{arrow("hard")}</th>
                      <th style={c.thS} onClick={() => toggleSort("contestRating")}>Rating{arrow("contestRating")}</th>
                      <th style={c.thS} onClick={() => toggleSort("activityLog")}>Days{arrow("activityLog")}</th>
                      <th style={c.thS} onClick={() => toggleSort("streak")}>Streak{arrow("streak")}</th>
                      <th style={c.th}>Last solved</th>
                      <th style={c.th}>Reminders</th>
                      <th style={c.thS} onClick={() => toggleSort("createdAt")}>Joined{arrow("createdAt")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u, i) => {
                      const streak   = currentStreak(u.activityLog);
                      const isActive = u.activityLog.some(v => toDay(v) === todayStr);
                      const rAgo     = daysAgo(u.lastReminderSent);
                      const uniqDays = new Set(u.activityLog.map(toDay)).size;
                      return (
                        <tr key={u._id} className="trow" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ ...c.td, color: i < 3 ? "#ff6b2b" : "#374151", fontWeight: 700, fontFamily: "monospace" }}>
                            {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                          </td>
                          <td style={c.td}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>
                              {isActive && <span style={{ color: "#22c55e", fontSize: 9, marginRight: 5 }}>●</span>}
                              {u.leetcodeUsername}
                            </div>
                            <div style={{ fontSize: 11, color: "#374151" }}>{u.email}</div>
                          </td>
                          <td style={{ ...c.td, fontWeight: 800, fontSize: 15, fontFamily: "monospace", color: "#f1f5f9" }}>
                            {u.problemStats.totalSolved}
                          </td>
                          <td style={c.td}><Badge n={u.problemStats.easy}   color="#22c55e" /></td>
                          <td style={c.td}><Badge n={u.problemStats.medium} color="#f59e0b" /></td>
                          <td style={c.td}><Badge n={u.problemStats.hard}   color="#ef4444" /></td>
                          <td style={{ ...c.td, fontFamily: "monospace", fontSize: 13 }}>
                            {u.problemStats.contestRating > 0 ? u.problemStats.contestRating : <span style={{ color: "#374151" }}>—</span>}
                          </td>
                          <td style={{ ...c.td, fontFamily: "monospace", fontSize: 13 }}>{uniqDays}</td>
                          <td style={c.td}>
                            {streak > 0
                              ? <span style={{ color: "#ff6b2b", fontWeight: 700, fontSize: 13 }}>🔥 {streak}d</span>
                              : <span style={{ color: "#374151" }}>—</span>}
                          </td>
                          <td style={{ ...c.td, fontSize: 12 }}>
                            <LastSolved v={u.problemStats.lastSolvedAt} />
                          </td>
                          <td style={c.td}>
                            <span style={{
                              fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 700,
                              background: u.remindersEnabled ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
                              color: u.remindersEnabled ? "#22c55e" : "#6b7280",
                            }}>
                              {u.remindersEnabled ? "On" : "Off"}
                            </span>
                            {rAgo !== null && (
                              <div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>
                                sent {rAgo === 0 ? "today" : `${rAgo}d ago`}
                              </div>
                            )}
                          </td>
                          <td style={{ ...c.td, fontSize: 11, color: "#4b5563" }}>
                            {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={12} style={{ ...c.td, textAlign: "center", color: "#374151", padding: "32px 0" }}>No users match the filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ ACTIVITY ══════════════════════════════════════════════ */}
          {tab === "activity" && (
            <>
              <div style={c.card}>
                <div style={c.cardHead}>
                  <div style={c.cardTitle}>Active users per day — last 30 days</div>
                  <div style={{ fontSize: 12, color: "#4b5563" }}>Distinct users with at least one solve</div>
                </div>
                <ActivityChart data={actChart} />
                <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  {[
                    { label: "Peak day", value: `${Math.max(...actChart.map(d => d.count))} users` },
                    { label: "30d avg",  value: `${Math.round(actChart.reduce((s, d) => s + d.count, 0) / 30)} users/day` },
                    { label: "Today",    value: `${actChart[actChart.length - 1]?.count ?? 0} users` },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 3 }}>{m.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#ff6b2b", fontFamily: "monospace" }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={c.card}>
                <div style={{ ...c.cardTitle, marginBottom: 16 }}>Per-user activity heatmap (last 30 days)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...users]
                    .sort((a, b) =>
                      b.activityLog.filter(v => last30.has(toDay(v))).length -
                      a.activityLog.filter(v => last30.has(toDay(v))).length
                    )
                    .slice(0, 25)
                    .map(u => {
                      const days30Arr = Array.from({ length: 30 }, (_, i) => {
                        const d = new Date(); d.setDate(d.getDate() - (29 - i));
                        return d.toISOString().slice(0, 10);
                      });
                      const activeDays = new Set(u.activityLog.map(toDay));
                      const cnt = days30Arr.filter(d => activeDays.has(d)).length;
                      return (
                        <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 130, fontSize: 12, fontWeight: 700, color: "#9ca3af", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {u.leetcodeUsername}
                          </div>
                          <div style={{ display: "flex", gap: 3 }}>
                            {days30Arr.map(day => (
                              <div key={day} title={day} style={{
                                width: 14, height: 14, borderRadius: 3,
                                background: activeDays.has(day) ? "#ff6b2b" : "rgba(255,255,255,0.05)",
                              }} />
                            ))}
                          </div>
                          <div style={{ fontSize: 12, color: "#4b5563", minWidth: 28 }}>{cnt}d</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}

          {/* ══ REMINDERS ══════════════════════════════════════════════ */}
          {tab === "reminders" && (
            <>
              <div style={c.grid6}>
                <StatCard label="Reminders enabled"  value={users.filter(u => u.remindersEnabled).length}   sub="Will receive alerts"        icon="🔔" accent="#22c55e" />
                <StatCard label="Reminders disabled"  value={users.filter(u => !u.remindersEnabled).length}  sub="Opted out"                  icon="🔕" accent="#6b7280" />
                <StatCard label="Pending tonight"     value={pendingReminder.length}                          sub="Haven't coded yet today"    icon="⏰" accent="#f59e0b" />
                <StatCard label="Never reminded"      value={users.filter(u => !u.lastReminderSent).length}   sub="No reminder ever sent"      icon="📭" accent="#60a5fa" />
              </div>

              <div style={c.card}>
                <div style={{ ...c.cardTitle, marginBottom: 16 }}>📋 Pending reminder tonight ({pendingReminder.length})</div>
                {pendingReminder.length === 0
                  ? <div style={c.empty}>Everyone has already coded today 🎉</div>
                  : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={c.table}>
                        <thead>
                          <tr>
                            <th style={c.th}>Username</th>
                            <th style={c.th}>Email</th>
                            <th style={c.th}>Current streak</th>
                            <th style={c.th}>Last solved</th>
                            <th style={c.th}>Last reminder</th>
                            <th style={c.th}>Total solved</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingReminder.map(u => {
                            const streak = currentStreak(u.activityLog);
                            const rAgo   = daysAgo(u.lastReminderSent);
                            return (
                              <tr key={u._id} className="trow" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <td style={{ ...c.td, fontWeight: 700 }}>{u.leetcodeUsername}</td>
                                <td style={{ ...c.td, fontSize: 12, color: "#6b7280" }}>{u.email}</td>
                                <td style={c.td}>
                                  {streak > 0
                                    ? <span style={{ color: "#ff6b2b", fontWeight: 700 }}>🔥 {streak}d</span>
                                    : <span style={{ color: "#4b5563" }}>—</span>}
                                </td>
                                <td style={{ ...c.td, fontSize: 12 }}><LastSolved v={u.problemStats.lastSolvedAt} /></td>
                                <td style={{ ...c.td, fontSize: 12 }}>
                                  {rAgo === null ? <span style={{ color: "#374151" }}>Never</span>
                                    : rAgo === 0 ? "Today"
                                    : `${rAgo}d ago`}
                                </td>
                                <td style={{ ...c.td, fontFamily: "monospace" }}>{u.problemStats.totalSolved}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>

              <div style={c.card}>
                <div style={{ ...c.cardTitle, marginBottom: 16 }}>🔕 Opted out ({users.filter(u => !u.remindersEnabled).length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {users.filter(u => !u.remindersEnabled).map(u => (
                    <div key={u._id} style={{ ...c.pill, borderColor: "rgba(107,114,128,0.2)", background: "rgba(107,114,128,0.07)" }}>
                      <span style={{ color: "#6b7280", fontSize: 10 }}>●</span>
                      <span style={{ fontWeight: 700, color: "#9ca3af" }}>{u.leetcodeUsername}</span>
                    </div>
                  ))}
                  {users.filter(u => !u.remindersEnabled).length === 0 && (
                    <div style={c.empty}>All users have reminders enabled.</div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

/* ─── Constants ───────────────────────────────────────────────────────────── */
const TAB_ICONS:  Record<Tab, string> = { overview: "📊", users: "🏆", activity: "📈", reminders: "🔔" };
const TAB_LABELS: Record<Tab, string> = { overview: "Overview", users: "Leaderboard", activity: "Activity", reminders: "Reminders" };

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const c: Record<string, React.CSSProperties> = {
  sidebar:      { width: 210, minWidth: 210, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: "0 0 24px" },
  sideTop:      { padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 8 },
  adminPill:    { marginTop: 10, display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#ff6b2b", background: "rgba(255,107,43,0.1)", border: "1px solid rgba(255,107,43,0.2)", borderRadius: 6, padding: "3px 8px" },
  navBtn:       { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 20px", background: "none", border: "none", color: "#6b7280", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" as const, fontFamily: "inherit", borderLeft: "2px solid transparent", transition: "all 0.15s" },
  navActive:    { color: "#f1f5f9", background: "rgba(255,107,43,0.07)", borderLeft: "2px solid #ff6b2b" },
  sideFooter:   { padding: "0 20px" },
  homeBtn:      { width: "100%", padding: "8px 12px", background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.18)", borderRadius: 8, color: "#60a5fa", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, marginBottom: 6 },
  logoutBtn:    { width: "100%", padding: "8px 12px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 8, color: "#f87171", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const },
  main:         { flex: 1, overflowY: "auto" as const, padding: "32px 36px" },
  pageHeader:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  pageTitle:    { fontSize: 22, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.5px" },
  pageSub:      { fontSize: 12, color: "#374151", marginTop: 3 },
  refreshBtn:   { padding: "8px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#6b7280", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  grid6:        { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 },
  statCard:     { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px" },
  card:         { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "22px 24px", marginBottom: 20 },
  cardHead:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  cardTitle:    { fontSize: 13, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.03em" },
  cardLink:     { fontSize: 12, color: "#ff6b2b", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  tableControls:{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" as const },
  searchInput:  { width: "100%", padding: "8px 12px 8px 34px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f1f5f9", fontSize: 13, outline: "none", fontFamily: "inherit" },
  select:       { padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#9ca3af", fontSize: 13, fontFamily: "inherit", cursor: "pointer" },
  table:        { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th:           { padding: "10px 12px", textAlign: "left" as const, fontSize: 11, color: "#4b5563", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" as const },
  thS:          { padding: "10px 12px", textAlign: "left" as const, fontSize: 11, color: "#4b5563", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" as const, cursor: "pointer", userSelect: "none" as const },
  td:           { padding: "11px 12px", verticalAlign: "middle" as const },
  pill:         { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)", fontSize: 12 },
  empty:        { textAlign: "center" as const, color: "#374151", fontSize: 13, padding: "32px 0" },
};

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #06060c; font-family: 'Outfit', sans-serif; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,107,43,0.25); border-radius: 2px; }
  .trow:hover td { background: rgba(255,255,255,0.02); }
  .spin-ring { width: 32px; height: 32px; border: 2px solid rgba(255,107,43,0.2); border-top-color: #ff6b2b; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default AdminDashboard;