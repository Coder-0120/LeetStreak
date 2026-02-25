import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

interface RegisterForm {
  email: string;
  password: string;
  leetcodeUsername: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    password: "",
    leetcodeUsername: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/user/register", formData);
      alert("Registration successful 🎉");
      navigate("/login");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{globalCSS}</style>

      {/* Background Effects */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />
      <div style={styles.grid} />

      <div style={styles.card} className="ls-card">
        <div style={styles.logoRow}>
          <span style={styles.logoEmoji}>⚡</span>
          <span style={styles.logoText}>LeetStreak</span>
        </div>

        <p style={styles.tagline}>Start your streak journey today 🚀</p>

        <h2 style={styles.heading}>Create account</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email */}
          <div style={styles.fieldWrap} className="ls-field">
            <span style={styles.fieldIcon}>✉️</span>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              className="ls-input"
            />
          </div>

          {/* Password */}
          <div style={styles.fieldWrap} className="ls-field">
            <span style={styles.fieldIcon}>🔒</span>
            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              className="ls-input"
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              style={styles.eyeBtn}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>

          {/* LeetCode Username */}
          <div style={styles.fieldWrap} className="ls-field">
            <span style={styles.fieldIcon}>👤</span>
            <input
              type="text"
              name="leetcodeUsername"
              placeholder="LeetCode Username"
              required
              value={formData.leetcodeUsername}
              onChange={handleChange}
              style={styles.input}
              className="ls-input"
            />
          </div>

          <div style={styles.hint}>
            📧 We'll send streak reminders every 3–4 hours if you haven't coded today
          </div>

          <button
            type="submit"
            style={styles.submitBtn}
            className="ls-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="ls-spinner" />
            ) : (
              <>
                Create Account <span style={{ marginLeft: 6 }}>→</span>
              </>
            )}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

const accent = "#f97316";
const accent2 = "#fb923c";

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#09090f",
    fontFamily: "'Outfit', sans-serif",
    position: "relative" as const,
    overflow: "hidden",
    padding: "20px",
  },

  orb1: {
    position: "absolute" as const,
    width: 400,
    height: 400,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 70%)",
    top: -120,
    right: -80,
    animation: "orbFloat 7s ease-in-out infinite",
  },

  orb2: {
    position: "absolute" as const,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(251,146,60,0.1) 0%, transparent 70%)",
    bottom: -60,
    left: -40,
    animation: "orbFloat 10s ease-in-out infinite reverse",
  },

  orb3: {
    position: "absolute" as const,
    width: 180,
    height: 180,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
    top: "50%",
    left: -80,
    animation: "orbFloat 8s ease-in-out infinite 2s",
  },

  grid: {
    position: "absolute" as const,
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(249,115,22,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.04) 1px,transparent 1px)",
    backgroundSize: "44px 44px",
    pointerEvents: "none" as const,
  },

  card: {
    position: "relative" as const,
    zIndex: 1,
    width: "100%",
    maxWidth: 420,
    padding: "40px 36px",
    borderRadius: 24,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    backdropFilter: "blur(24px)",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.1)",
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },

  logoEmoji: { fontSize: 26 },

  logoText: {
    fontSize: 20,
    fontWeight: 800,
    color: accent,
  },

  tagline: {
    fontSize: 12,
    color: "#666",
    marginBottom: 24,
  },

  heading: {
    fontSize: 26,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 28,
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
  },

  fieldWrap: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "0 14px",
    gap: 10,
  },

  fieldIcon: { fontSize: 16, opacity: 0.7 },

  input: {
    flex: 1,
    padding: "14px 0",
    border: "none",
    background: "transparent",
    color: "#fff",
    fontSize: 14,
    outline: "none",
  },

  eyeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    opacity: 0.6,
  },

  hint: {
    fontSize: 12,
    color: "#555",
    background: "rgba(249,115,22,0.08)",
    border: "1px solid rgba(249,115,22,0.15)",
    borderRadius: 10,
    padding: "10px 12px",
    lineHeight: 1.6,
  },

  submitBtn: {
    marginTop: 6,
    padding: "15px",
    borderRadius: 12,
    border: "none",
    background: `linear-gradient(135deg, ${accent}, ${accent2})`,
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(249,115,22,0.4)",
  },

  switchText: {
    textAlign: "center" as const,
    marginTop: 20,
    fontSize: 13,
    color: "#777",
  },

  link: {
    color: accent,
    fontWeight: 600,
    textDecoration: "none",
  },
};

const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #09090f; }

@keyframes orbFloat {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(28px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes spin { to { transform: rotate(360deg); } }

.ls-card { animation: cardIn 0.55s cubic-bezier(0.22,1,0.36,1) both; }

.ls-field:focus-within {
  border-color: rgba(249,115,22,0.55) !important;
  box-shadow: 0 0 0 3px rgba(249,115,22,0.14) !important;
}

.ls-input::placeholder { color: #444; }

.ls-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.ls-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.ls-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
`;

export default RegisterPage;