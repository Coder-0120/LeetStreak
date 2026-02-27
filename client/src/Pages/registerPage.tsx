import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { LeetStreakLogo, TopNav } from "./loginPage";

interface RegisterForm {
  email: string;
  password: string;
  leetcodeUsername: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({ email: "", password: "", leetcodeUsername: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
      await axios.post("http://localhost:5000/api/user/register", formData);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldBorder = (name: string) => focusedField === name ? "rgba(255,107,43,0.6)" : "rgba(255,255,255,0.09)";
  const fieldShadow = (name: string) => focusedField === name ? "0 0 0 3px rgba(255,107,43,0.12)" : "none";

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
          <h2 style={s.leftHeading}>Track every submission.<br /><span style={{ color: "#ff6b2b" }}>Own your progress.</span></h2>
          <p style={s.leftSub}>Set up in 2 minutes. Get smart reminders every 3–4 hours if you haven't submitted today.</p>

          <div style={s.featureList}>
            {[
              { icon: "🔥", text: "Real-time streak tracking" },
              { icon: "📧", text: "Smart email reminders" },
              { icon: "📊", text: "Beautiful progress dashboard" },
              { icon: "🏆", text: "Contest rank & rating" },
              { icon: "📅", text: "365-day activity heatmap" },
            ].map((f, i) => (
              <div key={i} style={s.featureItem}>
                <span style={s.featureIcon}>{f.icon}</span>
                <span style={s.featureText}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={s.socialProof}>
            <div style={{ display: "flex" }}>
              {["A","P","R","S"].map((l, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${i*40+20},80%,55%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", border: "2px solid #06060c", marginLeft: i > 0 ? -8 : 0 }}>{l}</div>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Join <span style={{ color: "#ff6b2b", fontWeight: 700 }}>12,000+</span> coders already tracking</span>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ ...s.rightPanel, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(24px)", transition: "all 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s" }}>
          <div style={s.formCard}>
            <div className="mobile-logo" style={{ marginBottom: 24 }}><LeetStreakLogo size="md" /></div>

            {success ? (
              <div style={s.successBox}>
                <div style={s.successIcon}>🎉</div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#f1f5f9", marginBottom: 8 }}>You're in!</h2>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, marginBottom: 6 }}>Account created. Redirecting you to sign in…</p>
                <div style={s.successPulse} />
              </div>
            ) : (
              <>
                <div style={s.formTop}>
                  <h1 style={s.formHeading}>Create account</h1>
                  <p style={s.formSub}>Free forever · No credit card needed</p>
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
                    <div style={{ ...s.fieldWrap, borderColor: fieldBorder("email"), boxShadow: fieldShadow("email") }}>
                      <span style={s.fieldIcon}>✉️</span>
                      <input type="email" name="email" placeholder="you@example.com" required value={formData.email} onChange={handleChange} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} style={s.input} className="ls-input" />
                    </div>
                  </div>

                  <div style={s.fieldGroup}>
                    <label style={s.label}>Password</label>
                    <div style={{ ...s.fieldWrap, borderColor: fieldBorder("password"), boxShadow: fieldShadow("password") }}>
                      <span style={s.fieldIcon}>🔒</span>
                      <input type={showPass ? "text" : "password"} name="password" placeholder="Min. 8 characters" required value={formData.password} onChange={handleChange} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} style={s.input} className="ls-input" />
                      <button type="button" onClick={() => setShowPass(p => !p)} style={s.eyeBtn} tabIndex={-1}>{showPass ? "🙈" : "👁️"}</button>
                    </div>
                  </div>

                  <div style={s.fieldGroup}>
                    <label style={s.label}>LeetCode Username</label>
                    <div style={{ ...s.fieldWrap, borderColor: fieldBorder("leetcodeUsername"), boxShadow: fieldShadow("leetcodeUsername") }}>
                      <span style={s.fieldIcon}>⚡</span>
                      <input type="text" name="leetcodeUsername" placeholder="your_lc_handle" required value={formData.leetcodeUsername} onChange={handleChange} onFocus={() => setFocusedField("leetcodeUsername")} onBlur={() => setFocusedField(null)} style={s.input} className="ls-input" />
                    </div>
                    <div style={s.fieldHint}>📧 We'll send a reminder every 3–4h if you haven't coded today</div>
                  </div>

                  <button type="submit" style={s.submitBtn} className="ls-submit" disabled={loading}>
                    {loading ? <span className="ls-spinner" /> : <><span>Create Free Account</span><span style={{ fontSize: 16 }}>→</span></>}
                  </button>
                </form>

                <div style={s.dividerRow}>
                  <div style={s.dividerLine} /><span style={s.dividerText}>or</span><div style={s.dividerLine} />
                </div>

                <p style={s.switchText}>Already have an account?{" "}<Link to="/login" style={s.switchLink}>Sign in →</Link></p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SYMBOLS = [
  { char: "O(n)", x: 2, y: 20, size: 14, delay: 0, dur: 9, op: 0.08, color: "#22c55e" },
  { char: "=>",   x: 91, y: 15, size: 16, delay: 1.2, dur: 11, op: 0.07, color: "#f59e0b" },
  { char: "{}",   x: 88, y: 65, size: 18, delay: 0.5, dur: 8, op: 0.08, color: "#ff6b2b" },
  { char: "&&",   x: 4, y: 70, size: 14, delay: 3, dur: 12, op: 0.07, color: "#60a5fa" },
  { char: "++",   x: 50, y: 92, size: 14, delay: 2, dur: 10, op: 0.06, color: "#a78bfa" },
  { char: "!==",  x: 94, y: 38, size: 12, delay: 1.8, dur: 9, op: 0.06, color: "#ff6b2b" },
];

const s: Record<string, React.CSSProperties> = {
  root:         { minHeight: "100vh", background: "#06060c", fontFamily: "'Outfit', sans-serif", color: "#e2e8f0", position: "relative", overflow: "hidden", display: "flex", alignItems: "stretch" },
  meshBg:       { position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 80% 30%, rgba(255,107,43,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 20% 80%, rgba(167,139,250,0.04) 0%, transparent 60%)", pointerEvents: "none" },
  gridLines:    { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,107,43,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,43,0.04) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" },
  orb1:         { position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,43,0.1) 0%,transparent 65%)", top: -200, left: -100, pointerEvents: "none" },
  orb2:         { position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(251,146,60,0.07) 0%,transparent 65%)", bottom: -100, right: -80, pointerEvents: "none" },
  orb3:         { position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.05) 0%,transparent 65%)", top: "40%", right: "35%", pointerEvents: "none" },
  splitWrap:    { display: "flex", flex: 1, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 24px", alignItems: "center", gap: 60, position: "relative", zIndex: 1, paddingTop: 60 },
  leftPanel:    { flex: "0 0 360px", padding: "60px 0", display: "flex", flexDirection: "column" as const },
  leftDivider:  { width: 40, height: 3, background: "linear-gradient(90deg,#ff6b2b,#fb923c)", borderRadius: 99, margin: "22px 0" },
  leftHeading:  { fontSize: "clamp(20px,2.3vw,28px)", fontWeight: 900, color: "#f1f5f9", lineHeight: 1.3, marginBottom: 14, letterSpacing: "-0.5px" },
  leftSub:      { fontSize: 14, color: "#6b7280", lineHeight: 1.75, marginBottom: 32, maxWidth: 320 },
  featureList:  { display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 32 },
  featureItem:  { display: "flex", alignItems: "center", gap: 12 },
  featureIcon:  { width: 32, height: 32, borderRadius: 9, background: "rgba(255,107,43,0.1)", border: "1px solid rgba(255,107,43,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 },
  featureText:  { fontSize: 13, color: "#9ca3af" },
  socialProof:  { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" },
  rightPanel:   { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" },
  formCard:     { width: "100%", maxWidth: 420, padding: "44px 40px", borderRadius: 24, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(28px)", boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,107,43,0.08), inset 0 1px 0 rgba(255,255,255,0.06)" },
  formTop:      { marginBottom: 24 },
  formHeading:  { fontSize: 26, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 6 },
  formSub:      { fontSize: 13, color: "#6b7280" },
  errorBox:     { display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", fontSize: 13, marginBottom: 16 },
  form:         { display: "flex", flexDirection: "column" as const, gap: 16 },
  fieldGroup:   { display: "flex", flexDirection: "column" as const, gap: 7 },
  label:        { fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: "0.04em", textTransform: "uppercase" as const },
  fieldWrap:    { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid", borderRadius: 12, padding: "0 14px", gap: 10, transition: "border-color 0.2s, box-shadow 0.2s" },
  fieldIcon:    { fontSize: 15, opacity: 0.5, flexShrink: 0 },
  input:        { flex: 1, padding: "13px 0", border: "none", background: "transparent", color: "#f1f5f9", fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif" },
  eyeBtn:       { background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.45, padding: 4, flexShrink: 0 },
  fieldHint:    { fontSize: 11, color: "#4b5563", padding: "8px 12px", borderRadius: 8, background: "rgba(255,107,43,0.06)", border: "1px solid rgba(255,107,43,0.12)", lineHeight: 1.6 },
  submitBtn:    { marginTop: 4, padding: "15px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#ff6b2b,#fb923c)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 28px rgba(255,107,43,0.38)", fontFamily: "'Outfit', sans-serif" },
  dividerRow:   { display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" },
  dividerLine:  { flex: 1, height: 1, background: "rgba(255,255,255,0.07)" },
  dividerText:  { fontSize: 12, color: "#4b5563" },
  switchText:   { textAlign: "center" as const, fontSize: 13, color: "#6b7280" },
  switchLink:   { color: "#ff6b2b", fontWeight: 700, textDecoration: "none", marginLeft: 4 },
  successBox:   { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center", minHeight: 300 },
  successIcon:  { fontSize: 52, marginBottom: 16, animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both" },
  successPulse: { width: 48, height: 4, borderRadius: 99, background: "linear-gradient(90deg,#ff6b2b,#fb923c)", marginTop: 20, animation: "pulse 1.5s ease-in-out infinite" },
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
  .ls-submit:active:not(:disabled) { transform: translateY(0); }
  .ls-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .ls-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes popIn { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scaleX(1)} 50%{opacity:0.6;transform:scaleX(0.7)} }
  .mobile-logo { display: none; }
  @media (max-width: 768px) {
    .mobile-logo { display: block !important; }
    div[style*="flex: 0 0 360px"] { display: none !important; }
    div[style*="max-width: 1100px"] { padding-left: 16px !important; padding-right: 16px !important; justify-content: center; }
    div[style*="max-width: 420px"] { padding: 36px 24px !important; }
  }
  @media (max-width: 480px) {
    div[style*="max-width: 420px"] { padding: 28px 18px !important; border-radius: 18px !important; }
  }
`;

export default RegisterPage;