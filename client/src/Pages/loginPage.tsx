import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}

/* ── Shared Logo Component ─────────────────────────────────────────────────── */
export const LeetStreakLogo: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
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

/* ── Simple Top Navbar ─────────────────────────────────────────────────────── */
export const TopNav: React.FC = () => (
  <nav style={navStyle}>
    <div style={navInner}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <LeetStreakLogo size="md" />
      </Link>
    </div>
  </nav>
);

const navStyle: React.CSSProperties = {
  position: "fixed",
  top: 0, left: 0, right: 0,
  zIndex: 100,
  height: 60,
  background: "rgba(6,6,12,0.85)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const navInner: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 28px",
  height: "100%",
  display: "flex",
  alignItems: "center",
};

/* ── Login Page ────────────────────────────────────────────────────────────── */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("http://localhost:5000/api/user/login", formData);
      localStorage.setItem("userInfo", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <style>{CSS}</style>

      <TopNav />

      <div style={s.meshBg} />
      <div style={s.gridLines} />
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />

      {SYMBOLS.map((sym, i) => (
        <span key={i} className="float-sym" style={{
          position: "absolute", left: sym.x + "%", top: sym.y + "%",
          fontSize: sym.size, color: sym.color, opacity: sym.op,
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
          animationDelay: sym.delay + "s", animationDuration: sym.dur + "s",
          pointerEvents: "none", userSelect: "none",
        }}>{sym.char}</span>
      ))}

      <div style={s.splitWrap}>
        {/* Left panel */}
        <div style={{ ...s.leftPanel, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateX(-20px)", transition: "all 0.7s ease 0.1s" }}>
          <LeetStreakLogo size="lg" />
          <div style={s.leftDivider} />
          <h2 style={s.leftHeading}>Your daily coding<br /><span style={{ color: "#ff6b2b" }}>accountability</span> partner.</h2>
          <p style={s.leftSub}>Track every submission. Never let your streak die. Get smart reminders before it's too late.</p>

          <div style={s.statsRow}>
            {[{ val: "12K+", label: "Active coders" }, { val: "890K+", label: "Problems tracked" }, { val: "99.9%", label: "Uptime" }].map((st, i) => (
              <div key={i} style={s.statItem}>
                <div style={s.statVal}>{st.val}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>

          <div style={s.testimonial}>
            <div style={{ color: "#ff6b2b", fontSize: 12, marginBottom: 8, letterSpacing: 2 }}>★★★★★</div>
            <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7, marginBottom: 12 }}>
              "Went from breaking streaks every 2 weeks to a 90-day run. This app changed my interview prep."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#ff6b2b,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>A</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Arjun Sharma</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>SDE @ Amazon</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ ...s.rightPanel, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(24px)", transition: "all 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s" }}>
          <div style={s.formCard}>
            <div className="mobile-logo" style={{ marginBottom: 24 }}><LeetStreakLogo size="md" /></div>

            <div style={s.formTop}>
              <h1 style={s.formHeading}>Welcome back</h1>
              <p style={s.formSub}>Sign in to your dashboard</p>
            </div>

            {error && (
              <div style={s.errorBox}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Email address</label>
                <div style={{ ...s.fieldWrap, borderColor: focusedField === "email" ? "rgba(255,107,43,0.6)" : "rgba(255,255,255,0.09)", boxShadow: focusedField === "email" ? "0 0 0 3px rgba(255,107,43,0.12)" : "none" }}>
                  <span style={s.fieldIcon}>✉️</span>
                  <input type="email" name="email" placeholder="you@example.com" required value={formData.email} onChange={handleChange} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} style={s.input} className="ls-input" />
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Password</label>
                <div style={{ ...s.fieldWrap, borderColor: focusedField === "password" ? "rgba(255,107,43,0.6)" : "rgba(255,255,255,0.09)", boxShadow: focusedField === "password" ? "0 0 0 3px rgba(255,107,43,0.12)" : "none" }}>
                  <span style={s.fieldIcon}>🔒</span>
                  <input type={showPass ? "text" : "password"} name="password" placeholder="Your password" required value={formData.password} onChange={handleChange} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} style={s.input} className="ls-input" />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={s.eyeBtn} tabIndex={-1}>{showPass ? "🙈" : "👁️"}</button>
                </div>
              </div>

              <button type="submit" style={s.submitBtn} className="ls-submit" disabled={loading}>
                {loading ? <span className="ls-spinner" /> : <><span>Sign In</span><span style={{ fontSize: 16 }}>→</span></>}
              </button>
            </form>

            <div style={s.dividerRow}>
              <div style={s.dividerLine} /><span style={s.dividerText}>or</span><div style={s.dividerLine} />
            </div>

            <p style={s.switchText}>Don't have an account?{" "}<Link to="/register" style={s.switchLink}>Create one free →</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SYMBOLS = [
  { char: "{}", x: 2, y: 12, size: 20, delay: 0, dur: 8, op: 0.08, color: "#ff6b2b" },
  { char: "=>", x: 90, y: 18, size: 16, delay: 1, dur: 11, op: 0.07, color: "#f59e0b" },
  { char: "[]", x: 6, y: 65, size: 14, delay: 2, dur: 9, op: 0.07, color: "#60a5fa" },
  { char: "fn()", x: 85, y: 72, size: 13, delay: 3, dur: 12, op: 0.07, color: "#a78bfa" },
  { char: "++", x: 50, y: 5, size: 14, delay: 1.5, dur: 10, op: 0.06, color: "#ff6b2b" },
  { char: "</>", x: 92, y: 50, size: 14, delay: 2.5, dur: 13, op: 0.06, color: "#22c55e" },
];

const s: Record<string, React.CSSProperties> = {
  root:        { minHeight: "100vh", background: "#06060c", fontFamily: "'Outfit', sans-serif", color: "#e2e8f0", position: "relative", overflow: "hidden", display: "flex", alignItems: "stretch" },
  meshBg:      { position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(255,107,43,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 70%, rgba(96,165,250,0.04) 0%, transparent 60%)", pointerEvents: "none" },
  gridLines:   { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,107,43,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,43,0.04) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" },
  orb1:        { position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,43,0.1) 0%,transparent 65%)", top: -200, right: -100, pointerEvents: "none" },
  orb2:        { position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(251,146,60,0.07) 0%,transparent 65%)", bottom: -100, left: -80, pointerEvents: "none" },
  orb3:        { position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 65%)", top: "50%", left: "35%", pointerEvents: "none" },
  splitWrap:   { display: "flex", flex: 1, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 24px", alignItems: "center", gap: 60, position: "relative", zIndex: 1, paddingTop: 60 },
  leftPanel:   { flex: "0 0 380px", padding: "60px 0", display: "flex", flexDirection: "column" as const },
  leftDivider: { width: 40, height: 3, background: "linear-gradient(90deg,#ff6b2b,#fb923c)", borderRadius: 99, margin: "24px 0" },
  leftHeading: { fontSize: "clamp(22px,2.5vw,30px)", fontWeight: 900, color: "#f1f5f9", lineHeight: 1.25, marginBottom: 14, letterSpacing: "-0.5px" },
  leftSub:     { fontSize: 14, color: "#6b7280", lineHeight: 1.75, marginBottom: 36, maxWidth: 320 },
  statsRow:    { display: "flex", gap: 28, marginBottom: 36 },
  statItem:    { display: "flex", flexDirection: "column" as const, gap: 3 },
  statVal:     { fontSize: 22, fontWeight: 900, color: "#ff6b2b", fontFamily: "'JetBrains Mono', monospace" },
  statLabel:   { fontSize: 11, color: "#4b5563", letterSpacing: "0.04em" },
  testimonial: { padding: "20px 22px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" },
  rightPanel:  { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" },
  formCard:    { width: "100%", maxWidth: 420, padding: "44px 40px", borderRadius: 24, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(28px)", boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,107,43,0.08), inset 0 1px 0 rgba(255,255,255,0.06)" },
  formTop:     { marginBottom: 28 },
  formHeading: { fontSize: 26, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 6 },
  formSub:     { fontSize: 13, color: "#6b7280" },
  errorBox:    { display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", fontSize: 13, marginBottom: 16 },
  form:        { display: "flex", flexDirection: "column" as const, gap: 18 },
  fieldGroup:  { display: "flex", flexDirection: "column" as const, gap: 7 },
  label:       { fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: "0.04em", textTransform: "uppercase" as const },
  fieldWrap:   { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid", borderRadius: 12, padding: "0 14px", gap: 10, transition: "border-color 0.2s, box-shadow 0.2s" },
  fieldIcon:   { fontSize: 15, opacity: 0.5, flexShrink: 0 },
  input:       { flex: 1, padding: "14px 0", border: "none", background: "transparent", color: "#f1f5f9", fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif" },
  eyeBtn:      { background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.45, padding: 4, flexShrink: 0 },
  submitBtn:   { marginTop: 4, padding: "15px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#ff6b2b,#fb923c)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 28px rgba(255,107,43,0.38)", fontFamily: "'Outfit', sans-serif" },
  dividerRow:  { display: "flex", alignItems: "center", gap: 12, margin: "22px 0 18px" },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.07)" },
  dividerText: { fontSize: 12, color: "#4b5563" },
  switchText:  { textAlign: "center" as const, fontSize: 13, color: "#6b7280" },
  switchLink:  { color: "#ff6b2b", fontWeight: 700, textDecoration: "none", marginLeft: 4 },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #06060c; }
  ::selection { background: rgba(255,107,43,0.3); color: #fff; }
  .float-sym { position: absolute; animation: floatSym linear infinite; }
  @keyframes floatSym { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(4deg)} }
  .ls-input::placeholder { color: #333; }
  .ls-input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #0d0d18 inset !important; -webkit-text-fill-color: #f1f5f9 !important; }
  .ls-submit { transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s; }
  .ls-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(255,107,43,0.52) !important; }
  .ls-submit:active:not(:disabled) { transform: translateY(0px); }
  .ls-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .ls-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .mobile-logo { display: none; }
  @media (max-width: 768px) {
    .mobile-logo { display: block !important; }
    div[style*="flex: 0 0 380px"] { display: none !important; }
    div[style*="max-width: 1100px"] { padding-left: 16px !important; padding-right: 16px !important; justify-content: center; }
    div[style*="max-width: 420px"] { padding: 36px 24px !important; }
  }
  @media (max-width: 480px) {
    div[style*="max-width: 420px"] { padding: 28px 18px !important; border-radius: 18px !important; }
  }
`;

export default LoginPage;