import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: ""
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
      const res = await axios.post(
        "http://localhost:5000/api/user/login",
        formData
      );

      localStorage.setItem("userInfo", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Login failed");
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
      <div style={styles.grid} />

      <div style={styles.card} className="ls-card">
        {/* Logo */}
        <div style={styles.logoRow}>
          <span style={styles.logoEmoji}>⚡</span>
          <span style={styles.logoText}>LeetStreak</span>
        </div>

        <p style={styles.tagline}>Maintain your coding fire 🔥</p>

        <h2 style={styles.heading}>Welcome back</h2>

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
                Sign In <span style={{ marginLeft: 6 }}>→</span>
              </>
            )}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Create one
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
    overflow: "hidden"
  },

  orb1: {
    position: "absolute" as const,
    width: 420,
    height: 420,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)",
    top: -100,
    right: -80,
    animation: "orbFloat 7s ease-in-out infinite"
  },

  orb2: {
    position: "absolute" as const,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)",
    bottom: -60,
    left: -60,
    animation: "orbFloat 9s ease-in-out infinite reverse"
  },

  grid: {
    position: "absolute" as const,
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(249,115,22,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.04) 1px,transparent 1px)",
    backgroundSize: "44px 44px",
    pointerEvents: "none" as const
  },

  card: {
    position: "relative" as const,
    zIndex: 1,
    width: "100%",
    maxWidth: 400,
    padding: "40px 36px",
    borderRadius: 24,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    backdropFilter: "blur(24px)",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.1)"
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4
  },

  logoEmoji: { fontSize: 26 },

  logoText: {
    fontSize: 20,
    fontWeight: 800,
    color: accent
  },

  tagline: {
    fontSize: 12,
    color: "#666",
    marginBottom: 24
  },

  heading: {
    fontSize: 26,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 28
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 14
  },

  fieldWrap: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "0 14px",
    gap: 10
  },

  fieldIcon: { fontSize: 16, opacity: 0.7 },

  input: {
    flex: 1,
    padding: "14px 0",
    border: "none",
    background: "transparent",
    color: "#fff",
    fontSize: 14,
    outline: "none"
  },

  eyeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    opacity: 0.6
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
    gap: 6,
    boxShadow: "0 8px 24px rgba(249,115,22,0.4)"
  },

  switchText: {
    textAlign: "center" as const,
    marginTop: 20,
    fontSize: 13,
    color: "#777"
  },

  link: {
    color: accent,
    fontWeight: 600,
    textDecoration: "none"
  }
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ls-card { animation: cardIn 0.55s cubic-bezier(0.22,1,0.36,1) both; }

.ls-field:focus-within {
  border-color: rgba(249,115,22,0.5) !important;
  box-shadow: 0 0 0 3px rgba(249,115,22,0.15) !important;
}

.ls-input::placeholder { color: #444; }

.ls-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.ls-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.ls-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
`;

export default LoginPage;