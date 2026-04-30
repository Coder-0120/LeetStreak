import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { askAI } from "../services/aiService";

type Message = {
  text: string;
  type: "user" | "ai";
};

export default function DsaInstructor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const ask = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { text: input, type: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    const data = await askAI(input);
    const aiMsg: Message = {
      text: data.answer || "⚠️ No response",
      type: "ai",
    };
    setMessages((prev) => [...prev, aiMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(false);
  };

  const QUICK_CHIPS = [
    "Explain Binary Search",
    "What is memoization?",
    "BFS vs DFS?",
    "Time complexity of quicksort?",
    "Sliding window pattern",
    "What is dynamic programming?",
  ];

  return (
    <div style={s.root}>
      <style>{CSS}</style>

      {/* Custom cursors — identical to Homepage */}
      <div className="cursor-dot" style={{ left: mousePos.x, top: mousePos.y }} />
      <div className="cursor-ring" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* ── NAVBAR (exact Homepage nav) ── */}
      <nav style={{ ...s.nav, background: scrollY > 60 ? "rgba(6,6,12,0.96)" : "transparent" }}>
        <div style={s.navInner}>
          {/* Logo — exact same as Homepage */}
          <button onClick={() => navigate("/dashboard")} style={s.navLogoBtn}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={s.logoWord}>
              Leet<span style={{ color: "#ff6b2b" }}>Streak</span>
            </span>
          </button>

          {/* Page badge */}
          <div style={s.navBadge}>
            <span style={{ color: "#ff6b2b" }}>🤖</span>
            <span> DSA Instructor</span>
          </div>

          {/* Dashboard CTA — same style as Homepage "Start Free" button */}
          <button
            onClick={() => navigate("/dashboard")}
            style={s.navCta}
            className="cta-glow"
          >
            Dashboard →
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={s.main}>
        {/* Background orbs — same as Homepage */}
        <div style={s.heroOrb1} />
        <div style={s.heroOrb2} />

        {/* Page header */}
        <div style={s.pageHeader} className="fade-up-1">
          <div style={s.sectionBadge}>✦ AI-POWERED</div>
          <h1 style={s.pageTitle}>
            DSA{" "}
            <span className="shimmer-text">Instructor</span>
          </h1>
          <p style={s.pageSub}>
            Ask anything — arrays, trees, DP, graphs, complexity analysis, code walkthroughs.
          </p>
        </div>

        {/* Chat window */}
        <div style={s.chatWindow} className="fade-up-2">
          {messages.length === 0 && !loading ? (
            <div style={s.emptyState}>
              <div style={{ fontSize: 44, opacity: 0.45 }}>💡</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginTop: 12 }}>
                Your DSA tutor is ready
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 280, lineHeight: 1.65, textAlign: "center" }}>
                Ask a question below or tap a suggestion to get started.
              </p>
            </div>
          ) : (
            <div style={s.messagesList}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    ...s.msgRow,
                    flexDirection: msg.type === "user" ? "row-reverse" : "row",
                  }}
                >
                  <div
                    style={{
                      ...s.avatar,
                      background:
                        msg.type === "ai"
                          ? "rgba(255,107,43,0.12)"
                          : "rgba(37,99,235,0.18)",
                      border:
                        msg.type === "ai"
                          ? "1px solid rgba(255,107,43,0.25)"
                          : "1px solid rgba(37,99,235,0.35)",
                    }}
                  >
                    {msg.type === "ai" ? "🤖" : "👤"}
                  </div>
                  <div
                    style={{
                      ...s.bubble,
                      background:
                        msg.type === "user"
                          ? "linear-gradient(135deg,#1d4ed8,#2563eb)"
                          : "rgba(255,255,255,0.04)",
                      border:
                        msg.type === "user"
                          ? "1px solid rgba(37,99,235,0.4)"
                          : "1px solid rgba(255,255,255,0.08)",
                      borderBottomRightRadius: msg.type === "user" ? 4 : 14,
                      borderBottomLeftRadius: msg.type === "ai" ? 4 : 14,
                      boxShadow:
                        msg.type === "user"
                          ? "0 4px 18px rgba(37,99,235,0.2)"
                          : "none",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ ...s.msgRow, flexDirection: "row" }}>
                  <div
                    style={{
                      ...s.avatar,
                      background: "rgba(255,107,43,0.12)",
                      border: "1px solid rgba(255,107,43,0.25)",
                    }}
                  >
                    🤖
                  </div>
                  <div
                    style={{
                      ...s.bubble,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderBottomLeftRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "14px 18px",
                    }}
                  >
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>
                      Thinking like a DSA instructor...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Quick suggestion chips */}
        {messages.length === 0 && (
          <div style={s.chipsRow} className="fade-up-3">
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

        {/* Input bar */}
        <div style={s.inputBar} className="fade-up-4 input-bar-focus">
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
              background:
                input.trim() && !loading
                  ? "linear-gradient(135deg,#ff6b2b,#ff9a5c)"
                  : "rgba(255,255,255,0.06)",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            }}
            className={input.trim() && !loading ? "btn-primary-glow" : ""}
            onClick={ask}
            disabled={loading || !input.trim()}
            title="Send"
          >
            {/* Arrow icon */}
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#374151", paddingBottom: 8 }}>
          ✓ Free to use &nbsp;·&nbsp; ✓ Powered by Claude AI &nbsp;·&nbsp; ✓ DSA-focused
        </p>
      </main>

      {/* ── FOOTER (same as Homepage) ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <span>⚡</span>
            <span style={{ color: "#ff6b2b" }}>LeetStreak</span>
          </div>
          <p style={{ fontSize: 13, color: "#4b5563" }}>Keep the fire burning. One problem at a time.</p>
        </div>
      </footer>
    </div>
  );
}

/* ── Styles — mirrors Homepage s object exactly ── */
const s: Record<string, React.CSSProperties> = {
  root: {
    background: "#06060c",
    minHeight: "100vh",
    fontFamily: "'Outfit', sans-serif",
    color: "#e2e8f0",
    overflowX: "hidden",
    cursor: "none",
    display: "flex",
    flexDirection: "column",
  },

  /* Nav */
  nav: {
    position: "fixed",
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    transition: "background 0.4s",
    backdropFilter: "blur(14px)",
  },
  navInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    height: 60,
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  navLogoBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "none",
    border: "none",
    cursor: "pointer",
    marginRight: "auto",
    padding: 0,
    flexShrink: 0,
  },
  logoWord: {
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.5px",
    fontFamily: "'Outfit', sans-serif",
  },
  navBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(255,107,43,0.1)",
    border: "1px solid rgba(255,107,43,0.25)",
    borderRadius: 100,
    padding: "4px 12px",
    fontSize: 12,
    color: "#ff9a5c",
    whiteSpace: "nowrap" as const,
  },
  navCta: {
    padding: "8px 18px",
    background: "linear-gradient(135deg,#ff6b2b,#ff9a5c)",
    color: "#fff",
    borderRadius: 9,
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap" as const,
    fontFamily: "'Outfit', sans-serif",
    cursor: "pointer",
  },

  /* Main */
  main: {
    flex: 1,
    maxWidth: 860,
    width: "100%",
    margin: "0 auto",
    padding: "96px 24px 32px",
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  /* Orbs */
  heroOrb1: {
    position: "fixed",
    width: 600, height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle,rgba(255,107,43,0.09) 0%,transparent 70%)",
    top: -150, right: -150,
    pointerEvents: "none",
    zIndex: 0,
  },
  heroOrb2: {
    position: "fixed",
    width: 400, height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle,rgba(245,158,11,0.06) 0%,transparent 70%)",
    bottom: 0, left: -100,
    pointerEvents: "none",
    zIndex: 0,
  },

  /* Header */
  pageHeader: { textAlign: "center", paddingTop: 12 },
  sectionBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "2px",
    color: "#ff6b2b",
    textTransform: "uppercase" as const,
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: "clamp(32px,5vw,54px)",
    fontWeight: 900,
    color: "#f1f5f9",
    letterSpacing: "-1.5px",
    lineHeight: 1.1,
    marginBottom: 12,
  },
  pageSub: {
    fontSize: 15,
    color: "#6b7280",
    maxWidth: 480,
    margin: "0 auto",
    lineHeight: 1.7,
  },

  /* Chat */
  chatWindow: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    overflow: "hidden",
    backdropFilter: "blur(12px)",
    minHeight: "46vh",
    maxHeight: "52vh",
  },
  emptyState: {
    height: "46vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    padding: "24px",
  },
  messagesList: {
    overflowY: "auto" as const,
    maxHeight: "52vh",
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
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
    fontSize: 16,
    flexShrink: 0,
  },
  bubble: {
    padding: "12px 16px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.7,
    maxWidth: "74%",
    wordBreak: "break-word" as const,
    whiteSpace: "pre-wrap" as const,
    color: "#e2e8f0",
  },

  /* Chips */
  chipsRow: {
    display: "flex",
    flexWrap: "wrap" as const,
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
  },

  /* Input */
  inputBar: {
    display: "flex",
    gap: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 14,
    padding: "12px 14px",
    alignItems: "flex-end",
    backdropFilter: "blur(12px)",
  },
  textarea: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e2e8f0",
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    resize: "none" as const,
    lineHeight: 1.6,
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
};

/* ── CSS — exact same class names & keyframes as Homepage ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #06060c; overflow-x: hidden; }
  ::selection { background: rgba(255,107,43,0.3); color: #fff; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #06060c; }
  ::-webkit-scrollbar-thumb { background: rgba(255,107,43,0.4); border-radius: 99px; }

  /* Cursors — identical to Homepage */
  .cursor-dot  { position: fixed; width: 6px; height: 6px; background: #ff6b2b; border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%,-50%); }
  .cursor-ring { position: fixed; width: 26px; height: 26px; border: 1.5px solid rgba(255,107,43,0.45); border-radius: 50%; pointer-events: none; z-index: 9998; transform: translate(-50%,-50%); transition: all 0.1s ease; }
  @media (hover: none) { .cursor-dot, .cursor-ring { display: none; } }

  /* Shimmer — identical to Homepage */
  .shimmer-text { background: linear-gradient(90deg,#ff6b2b,#ff9a5c,#fbbf24,#ff6b2b); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
  @keyframes shimmer { to { background-position: 200% center; } }

  /* Fade ups — same as Homepage */
  .fade-up-1 { animation: fadeUp 0.6s ease 0.1s both; }
  .fade-up-2 { animation: fadeUp 0.6s ease 0.25s both; }
  .fade-up-3 { animation: fadeUp 0.6s ease 0.4s both; }
  .fade-up-4 { animation: fadeUp 0.6s ease 0.55s both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }

  /* Glow buttons — identical to Homepage */
  .cta-glow { box-shadow: 0 0 18px rgba(255,107,43,0.3); transition: box-shadow 0.3s, opacity 0.2s; }
  .cta-glow:hover { box-shadow: 0 0 30px rgba(255,107,43,0.5); opacity: 0.9; }
  .btn-primary-glow { box-shadow: 0 8px 24px rgba(255,107,43,0.38) !important; transition: transform 0.2s, box-shadow 0.2s !important; }
  .btn-primary-glow:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(255,107,43,0.52) !important; }

  /* Typing indicator */
  .typing-dots { display: flex; gap: 4px; align-items: center; }
  .typing-dots span { width: 7px; height: 7px; background: #ff6b2b; border-radius: 50%; animation: dotBounce 1.2s infinite; display: inline-block; }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:0.35} 40%{transform:translateY(-7px);opacity:1} }

  /* Chip hover — same hover style as feat-card */
  .chip-btn { transition: all 0.2s; }
  .chip-btn:hover { border-color: rgba(255,107,43,0.4) !important; color: #ff9a5c !important; background: rgba(255,107,43,0.08) !important; transform: translateY(-2px); }

  /* Input bar focus glow */
  .input-bar-focus:focus-within { border-color: rgba(255,107,43,0.4) !important; box-shadow: 0 0 0 3px rgba(255,107,43,0.08); }

  /* Textarea */
  textarea::placeholder { color: #374151; }
  textarea { scrollbar-width: none; }
  textarea::-webkit-scrollbar { display: none; }

  /* Mobile */
  @media (max-width: 768px) {
    body { cursor: auto !important; }
    .cursor-dot, .cursor-ring { display: none !important; }
  }
  @media (max-width: 600px) {
    .chip-btn { font-size: 12px !important; padding: 6px 12px !important; }
  }
`;