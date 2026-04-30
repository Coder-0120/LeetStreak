import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { askAI } from "../services/aiService";

type Message = {
  text: string;
  type: "user" | "ai";
};

/* ── Shared Logo (same as LoginPage) ── */
const LeetStreakLogo: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  const sz = { sm: { icon: 16, text: 16 }, md: { icon: 20, text: 18 }, lg: { icon: 26, text: 22 } }[size];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: sz.icon, lineHeight: 1, filter: "drop-shadow(0 0 8px rgba(255,107,43,0.7))" }}>⚡</span>
      <span style={{ fontSize: sz.text, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", fontFamily: "'Outfit', sans-serif" }}>
        Leet<span style={{ color: "#ff6b2b" }}>Streak</span>
      </span>
    </div>
  );
};

/* ── Floating symbols (same set as LoginPage) ── */
const SYMBOLS = [
  { char: "{}", x: 2, y: 12, size: 20, delay: 0, dur: 8, op: 0.08, color: "#ff6b2b" },
  { char: "=>", x: 90, y: 18, size: 16, delay: 1, dur: 11, op: 0.07, color: "#f59e0b" },
  { char: "[]", x: 6, y: 65, size: 14, delay: 2, dur: 9, op: 0.07, color: "#60a5fa" },
  { char: "fn()", x: 85, y: 72, size: 13, delay: 3, dur: 12, op: 0.07, color: "#a78bfa" },
  { char: "++", x: 50, y: 5, size: 14, delay: 1.5, dur: 10, op: 0.06, color: "#ff6b2b" },
  { char: "</>", x: 92, y: 50, size: 14, delay: 2.5, dur: 13, op: 0.06, color: "#22c55e" },
  { char: "O(n)", x: 15, y: 85, size: 13, delay: 0.8, dur: 9.5, op: 0.07, color: "#f59e0b" },
  { char: "dp[]", x: 75, y: 8, size: 13, delay: 1.2, dur: 10.5, op: 0.06, color: "#a78bfa" },
];

const QUICK_CHIPS = [
  "Explain Binary Search",
  "What is memoization?",
  "BFS vs DFS?",
  "Time complexity of quicksort?",
  "Sliding window pattern",
  "What is dynamic programming?",
];

export default function DsaInstructor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [focusedInput, setFocusedInput] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const ask = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { text: input, type: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);
    const data = await askAI(input);
    const aiMsg: Message = { text: data.answer || "⚠️ No response", type: "ai" };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div style={s.root}>
      <style>{CSS}</style>

      {/* Background layers — identical to LoginPage */}
      <div style={s.meshBg} />
      <div style={s.gridLines} />
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />

      {/* Floating code symbols */}
      {SYMBOLS.map((sym, i) => (
        <span key={i} className="float-sym" style={{
          position: "absolute", left: sym.x + "%", top: sym.y + "%",
          fontSize: sym.size, color: sym.color, opacity: sym.op,
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
          animationDelay: sym.delay + "s", animationDuration: sym.dur + "s",
          pointerEvents: "none", userSelect: "none",
        }}>{sym.char}</span>
      ))}

      {/* ── NAVBAR ── */}
      <nav style={{
        ...s.nav,
        background: scrollY > 60 ? "rgba(6,6,12,0.96)" : "rgba(6,6,12,0.85)",
      }}>
        <div style={s.navInner}>
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <LeetStreakLogo size="md" />
          </Link>

          {/* Page badge — styled like LoginPage stat chip */}
          <div style={s.navBadge}>
            <span style={{ fontSize: 11 }}>🤖</span>
            <span>DSA Instructor</span>
          </div>

          <button onClick={() => navigate("/dashboard")} style={s.navCta} className="ls-submit">
            Dashboard →
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={s.main}>

        {/* Page header — fade in like LoginPage panels */}
        <div style={{
          ...s.pageHeader,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(20px)",
          transition: "all 0.65s cubic-bezier(0.22,1,0.36,1) 0.1s",
        }}>
          <div style={s.sectionBadge}>✦ AI-POWERED</div>
          <h1 style={s.pageTitle}>
            DSA{" "}
            <span style={s.shimmerText}>Instructor</span>
          </h1>
          <p style={s.pageSub}>
            Ask anything — arrays, trees, DP, graphs, complexity analysis, code walkthroughs.
          </p>
        </div>

        {/* ── CHAT WINDOW — styled like formCard from LoginPage ── */}
        <div style={{
          ...s.chatCard,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(24px)",
          transition: "all 0.65s cubic-bezier(0.22,1,0.36,1) 0.2s",
        }}>
          {messages.length === 0 && !loading ? (
            <div style={s.emptyState}>
              <div style={{ fontSize: 40, opacity: 0.4, filter: "drop-shadow(0 0 12px rgba(255,107,43,0.5))" }}>💡</div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", marginTop: 14, letterSpacing: "-0.3px" }}>
                Your DSA tutor is ready
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 280, lineHeight: 1.7, textAlign: "center", marginTop: 6 }}>
                Ask a question below or tap a suggestion to get started.
              </p>
              {/* Mini stats row — same as LoginPage */}
              <div style={s.statsRow}>
                {[
                  { val: "50+", label: "Topics covered" },
                  { val: "∞", label: "Questions" },
                  { val: "Free", label: "Always" },
                ].map((st, i) => (
                  <div key={i} style={s.statItem}>
                    <div style={s.statVal}>{st.val}</div>
                    <div style={s.statLabel}>{st.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={s.messagesList}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  ...s.msgRow,
                  flexDirection: msg.type === "user" ? "row-reverse" : "row",
                }}>
                  {/* Avatar — styled like LoginPage testimonial avatar */}
                  <div style={{
                    ...s.avatar,
                    background: msg.type === "ai"
                      ? "rgba(255,107,43,0.15)"
                      : "linear-gradient(135deg,#1d4ed8,#2563eb)",
                    border: msg.type === "ai"
                      ? "1px solid rgba(255,107,43,0.3)"
                      : "1px solid rgba(37,99,235,0.4)",
                    boxShadow: msg.type === "ai"
                      ? "0 0 12px rgba(255,107,43,0.15)"
                      : "0 4px 14px rgba(37,99,235,0.25)",
                  }}>
                    {msg.type === "ai" ? "🤖" : "👤"}
                  </div>

                  {/* Bubble — uses same glass card style */}
                  <div style={{
                    ...s.bubble,
                    background: msg.type === "user"
                      ? "linear-gradient(135deg,#1d4ed8,#2563eb)"
                      : "rgba(255,255,255,0.04)",
                    border: msg.type === "user"
                      ? "1px solid rgba(37,99,235,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                    borderBottomRightRadius: msg.type === "user" ? 4 : 14,
                    borderBottomLeftRadius: msg.type === "ai" ? 4 : 14,
                    boxShadow: msg.type === "user"
                      ? "0 4px 18px rgba(37,99,235,0.25)"
                      : "none",
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ ...s.msgRow, flexDirection: "row" }}>
                  <div style={{
                    ...s.avatar,
                    background: "rgba(255,107,43,0.15)",
                    border: "1px solid rgba(255,107,43,0.3)",
                    boxShadow: "0 0 12px rgba(255,107,43,0.15)",
                  }}>🤖</div>
                  <div style={{
                    ...s.bubble,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderBottomLeftRadius: 4,
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "14px 18px",
                  }}>
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                    <span style={{ fontSize: 13, color: "#6b7280", fontFamily: "'Outfit', sans-serif" }}>
                      Thinking like a DSA instructor...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* ── QUICK CHIPS — styled like LoginPage switch links ── */}
        {messages.length === 0 && (
          <div style={{
            ...s.chipsRow,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(16px)",
            transition: "all 0.65s cubic-bezier(0.22,1,0.36,1) 0.3s",
          }}>
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                style={s.chip}
                className="chip-btn"
                onClick={() => {
                  setInput(chip);
                  textareaRef.current?.focus();
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* ── INPUT BAR — matches LoginPage fieldWrap style ── */}
        <div style={{
          ...s.inputBar,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(16px)",
          transition: "all 0.65s cubic-bezier(0.22,1,0.36,1) 0.4s",
          borderColor: focusedInput ? "rgba(255,107,43,0.6)" : "rgba(255,255,255,0.09)",
          boxShadow: focusedInput ? "0 0 0 3px rgba(255,107,43,0.12)" : "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <span style={{ fontSize: 16, opacity: 0.45, flexShrink: 0 }}>💬</span>
          <textarea
            ref={textareaRef}
            style={s.textarea}
            value={input}
            rows={1}
            placeholder="Ask a DSA question... (Enter to send, Shift+Enter for newline)"
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onFocus={() => setFocusedInput(true)}
            onBlur={() => setFocusedInput(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask();
              }
            }}
          />
          <button
            style={{
              ...s.sendBtn,
              background: input.trim() && !loading
                ? "linear-gradient(135deg,#ff6b2b,#fb923c)"
                : "rgba(255,255,255,0.06)",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              boxShadow: input.trim() && !loading
                ? "0 8px 24px rgba(255,107,43,0.38)"
                : "none",
            }}
            className={input.trim() && !loading ? "ls-submit" : ""}
            onClick={ask}
            disabled={loading || !input.trim()}
            title="Send"
          >
            {loading ? (
              <span className="ls-spinner" style={{ width: 16, height: 16 }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        {/* Footer tagline */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#374151", paddingBottom: 8, fontFamily: "'Outfit', sans-serif" }}>
          ✓ Free to use &nbsp;·&nbsp; ✓ Powered by Claude AI &nbsp;·&nbsp; ✓ DSA-focused
        </p>
      </main>

      {/* ── FOOTER — same as LoginPage ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <LeetStreakLogo size="md" />
          <p style={{ fontSize: 13, color: "#4b5563", marginTop: 8 }}>
            Keep the fire burning. One problem at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Styles — mirrors LoginPage s object ── */
const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#06060c",
    fontFamily: "'Outfit', sans-serif",
    color: "#e2e8f0",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  /* Backgrounds — identical to LoginPage */
  meshBg: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(255,107,43,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 70%, rgba(96,165,250,0.04) 0%, transparent 60%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  gridLines: {
    position: "fixed",
    inset: 0,
    backgroundImage: "linear-gradient(rgba(255,107,43,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,43,0.04) 1px,transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
    zIndex: 0,
  },
  orb1: {
    position: "fixed",
    width: 500, height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle,rgba(255,107,43,0.1) 0%,transparent 65%)",
    top: -200, right: -100,
    pointerEvents: "none",
    zIndex: 0,
  },
  orb2: {
    position: "fixed",
    width: 350, height: 350,
    borderRadius: "50%",
    background: "radial-gradient(circle,rgba(251,146,60,0.07) 0%,transparent 65%)",
    bottom: -100, left: -80,
    pointerEvents: "none",
    zIndex: 0,
  },
  orb3: {
    position: "fixed",
    width: 200, height: 200,
    borderRadius: "50%",
    background: "radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 65%)",
    top: "50%", left: "35%",
    pointerEvents: "none",
    zIndex: 0,
  },

  /* Navbar — matches LoginPage TopNav */
  nav: {
    position: "fixed",
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    height: 60,
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    transition: "background 0.4s",
  },
  navInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 28px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  navBadge: {
    marginLeft: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,107,43,0.08)",
    border: "1px solid rgba(255,107,43,0.2)",
    borderRadius: 100,
    padding: "5px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "#ff9a5c",
    letterSpacing: "0.02em",
  },
  navCta: {
    padding: "8px 18px",
    background: "linear-gradient(135deg,#ff6b2b,#fb923c)",
    color: "#fff",
    borderRadius: 10,
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    cursor: "pointer",
    boxShadow: "0 4px 18px rgba(255,107,43,0.3)",
    whiteSpace: "nowrap",
  },

  /* Main */
  main: {
    flex: 1,
    maxWidth: 800,
    width: "100%",
    margin: "0 auto",
    padding: "88px 24px 24px",
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  /* Header */
  pageHeader: {
    textAlign: "center",
    paddingTop: 8,
  },
  sectionBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "2px",
    color: "#ff6b2b",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: "clamp(30px,5vw,50px)",
    fontWeight: 900,
    color: "#f1f5f9",
    letterSpacing: "-1.5px",
    lineHeight: 1.1,
    marginBottom: 10,
  },
  shimmerText: {
    background: "linear-gradient(90deg,#ff6b2b,#fb923c,#fbbf24,#ff6b2b)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "shimmer 3s linear infinite",
  },
  pageSub: {
    fontSize: 14,
    color: "#6b7280",
    maxWidth: 460,
    margin: "0 auto",
    lineHeight: 1.75,
  },

  /* Chat card — same glass card as LoginPage formCard */
  chatCard: {
    width: "100%",
    borderRadius: 24,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    backdropFilter: "blur(28px)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,107,43,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
    overflow: "hidden",
    minHeight: "44vh",
    maxHeight: "50vh",
  },
  emptyState: {
    height: "44vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    padding: "24px",
  },
  statsRow: {
    display: "flex",
    gap: 32,
    marginTop: 24,
    padding: "18px 28px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    alignItems: "center",
  },
  statVal: {
    fontSize: 20,
    fontWeight: 900,
    color: "#ff6b2b",
    fontFamily: "'JetBrains Mono', monospace",
  },
  statLabel: {
    fontSize: 11,
    color: "#4b5563",
    letterSpacing: "0.04em",
  },
  messagesList: {
    overflowY: "auto",
    maxHeight: "50vh",
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  msgRow: {
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    flexShrink: 0,
  },
  bubble: {
    padding: "11px 15px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.7,
    maxWidth: "74%",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    color: "#e2e8f0",
    fontFamily: "'Outfit', sans-serif",
  },

  /* Chips */
  chipsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#9ca3af",
    padding: "7px 15px",
    borderRadius: 100,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
    backdropFilter: "blur(8px)",
  },

  /* Input bar — matches LoginPage fieldWrap */
  inputBar: {
    display: "flex",
    gap: 10,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 14,
    padding: "12px 16px",
    alignItems: "flex-end",
    backdropFilter: "blur(28px)",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  textarea: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f1f5f9",
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    resize: "none",
    lineHeight: 1.65,
    minHeight: 22,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "none",
    color: "white",
    transition: "all 0.2s",
  },

  /* Footer */
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
    position: "relative",
    zIndex: 2,
  },
  footerInner: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "28px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
};

/* ── CSS — same keyframes & class names as LoginPage ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #06060c; overflow-x: hidden; }
  ::selection { background: rgba(255,107,43,0.3); color: #fff; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #06060c; }
  ::-webkit-scrollbar-thumb { background: rgba(255,107,43,0.4); border-radius: 99px; }

  /* Float symbols — same as LoginPage */
  .float-sym { position: absolute; animation: floatSym linear infinite; }
  @keyframes floatSym { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(4deg)} }

  /* Shimmer */
  @keyframes shimmer { to { background-position: 200% center; } }

  /* Spinner — same as LoginPage ls-spinner */
  .ls-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Submit / CTA button hover — same as LoginPage ls-submit */
  .ls-submit { transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s !important; }
  .ls-submit:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 14px 36px rgba(255,107,43,0.52) !important; }
  .ls-submit:active:not(:disabled) { transform: translateY(0px) !important; }
  .ls-submit:disabled { opacity: 0.5 !important; cursor: not-allowed !important; }

  /* Chip hover — same hover style */
  .chip-btn { transition: all 0.2s !important; }
  .chip-btn:hover { border-color: rgba(255,107,43,0.4) !important; color: #ff9a5c !important; background: rgba(255,107,43,0.08) !important; transform: translateY(-2px) !important; }

  /* Typing dots */
  .typing-dots { display: flex; gap: 4px; align-items: center; }
  .typing-dots span { width: 7px; height: 7px; background: #ff6b2b; border-radius: 50%; animation: dotBounce 1.2s infinite; display: inline-block; }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:0.35} 40%{transform:translateY(-7px);opacity:1} }

  /* Textarea */
  textarea::placeholder { color: #374151; }
  textarea { scrollbar-width: none; }
  textarea::-webkit-scrollbar { display: none; }
  textarea:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #0d0d18 inset !important; }

  /* Messages scrollbar */
  div[style*="overflow-y"] { scrollbar-width: thin; scrollbar-color: rgba(255,107,43,0.3) transparent; }

  /* Mobile */
  @media (max-width: 768px) {
    nav > div { padding: 0 16px !important; gap: 10px !important; }
    main { padding-left: 16px !important; padding-right: 16px !important; }
  }
  @media (max-width: 520px) {
    .chip-btn { font-size: 12px !important; padding: 6px 12px !important; }
    div[style*="border-radius: 24px"] { border-radius: 16px !important; }
    div[style*="border-radius: 14px"] { border-radius: 12px !important; }
  }
`;