import React, { useEffect, useRef, useState } from "react";

const Homepage: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [counter, setCounter] = useState({ users: 0, solved: 0, streaks: 0 });
  const [typedText, setTypedText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const fullText = "Never break your streak again.";

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.target.id) {
            setVisibleSections((prev) => new Set([...prev, e.target.id]));
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll("[data-observe]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visibleSections.has("stats-section")) return;
    const targets = { users: 12400, solved: 890000, streaks: 34200 };
    const dur = 2000;
    const steps = 80;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const p = 1 - Math.pow(1 - step / steps, 3);
      setCounter({
        users: Math.round(targets.users * p),
        solved: Math.round(targets.solved * p),
        streaks: Math.round(targets.streaks * p),
      });
      if (step >= steps) clearInterval(iv);
    }, dur / steps);
    return () => clearInterval(iv);
  }, [visibleSections]);

  const vis = (id: string) => visibleSections.has(id);
  const px = (mousePos.x / (window.innerWidth || 1) - 0.5) * 24;
  const py = (mousePos.y / (window.innerHeight || 1) - 0.5) * 24;
  const userInfo = localStorage.getItem("userInfo")? JSON.parse(localStorage.getItem("userInfo") as string) : null;
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  }

  return (
    <div style={s.root}>
      <style>{CSS}</style>
      <ParticleField />
      <div className="cursor-dot" style={{ left: mousePos.x, top: mousePos.y }} />
      <div className="cursor-ring" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* ── NAVBAR ── */}
      <nav style={{ ...s.nav, background: scrollY > 60 ? "rgba(6,6,12,0.96)" : "transparent" }}>
        <div style={s.navInner}>
          {/* Logo */}
          <a href="/" style={s.navLogo}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={s.logoWord}>Leet<span style={{ color: "#ff6b2b" }}>Streak</span></span>
          </a>

          {/* Desktop links */}
          <div className="nav-links-desktop" style={s.navLinks}>
            {[["Features", "#features"], ["How it works", "#how-it-works"], ["Stats", "#stats-section"]].map(([label, href]) => (
              <a key={label} href={href} style={s.navLink} className="nav-link"
                onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="nav-ctas-desktop" style={s.navCtas}>
            <a href={userInfo ? "/dashboard" : "/login"} style={s.navSignIn}>{userInfo ? "Dashboard" : "Sign in"}</a>
            <a href={userInfo ? "#logout" : "/register"} style={s.navCta} className="cta-glow" onClick={handleLogout}>{userInfo ? "log out" : "Start Free →"}</a>
          </div>

          {/* Hamburger */}
          <button
            className="hamburger"
            style={s.hamburger}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span style={{ ...s.hamLine, transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ ...s.hamLine, opacity: menuOpen ? 0 : 1 }} />
            <span style={{ ...s.hamLine, transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div style={s.mobileMenu}>
            {[["Features", "#features"], ["How it works", "#how-it-works"], ["Stats", "#stats-section"]].map(([label, href]) => (
              <a key={label} href={href} style={s.mobileLink} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <a href={userInfo ? "/dashboard" : "/login"} style={{ ...s.navSignIn, flex: 1, textAlign: "center", padding: "11px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>{userInfo ? `Dashboard` : "Sign in"}</a>
              <a href={userInfo ? "#logout" : "/register"} style={{ ...s.navCta, flex: 1, textAlign: "center", padding: "11px 0" }} className="cta-glow" onClick={handleLogout}>{userInfo ? "log out" : "Start Free →"}</a>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={s.hero} ref={heroRef}>
        <div className="float-symbols">
          {SYMBOLS.map((sym, i) => (
            <span key={i} className="float-sym" style={{
              left: sym.x + "%", top: sym.y + "%", fontSize: sym.size,
              animationDelay: sym.delay + "s", animationDuration: sym.dur + "s",
              opacity: sym.op, color: sym.color,
            }}>{sym.char}</span>
          ))}
        </div>

        <div style={{ ...s.heroOrb1, transform: `translate(${px * 0.4}px,${py * 0.4}px)` }} />
        <div style={{ ...s.heroOrb2, transform: `translate(${-px * 0.3}px,${-py * 0.3}px)` }} />

        <div style={s.heroContent}>
          <div style={s.heroBadge} className="fade-up-1">
            <span style={{ color: "#ff6b2b" }}>🔥</span>
            <span> Trusted by 12,000+ coders worldwide</span>
          </div>
          <h1 style={s.heroH1} className="fade-up-2">
            <span style={{ color: "#f1f5f9" }}>Master LeetCode.</span>
            <br />
            <span style={{ color: "#f1f5f9" }}>Own Your </span>
            <span className="shimmer-text">Streak.</span>
          </h1>
          <p style={s.heroParagraph} className="fade-up-3">
            <span style={{ color: "#ff9a5c", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
              {typedText}<span className="cursor-blink">|</span>
            </span>
            <br /><br />
            <span style={{ color: "#6b7280", fontSize: 16 }}>
              LeetStreak tracks your daily submissions and sends smart email reminders
              before your streak dies. Built for developers who mean business.
            </span>
          </p>
          <div style={s.heroCtas} className="fade-up-4">
            <a href={userInfo ? "/dashboard" : "/register"} style={s.heroCtaPrimary} className="btn-primary-glow">🚀 Start Tracking Free</a>
            <a href="#how-it-works" style={s.heroCtaSecondary}>▶ See how it works</a>
          </div>
          <div style={s.heroMeta} className="fade-up-5">
            {["No credit card", "Free forever", "2 min setup"].map((t) => (
              <span key={t} style={{ fontSize: 13, color: "#6b7280" }}>✓ {t}</span>
            ))}
          </div>
        </div>

        {/* Hero preview card */}
        <div style={s.heroPreview} className="fade-up-3 hero-float">
          <div style={s.previewCard}>
            <div style={s.previewHeader}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                  <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace" }}>dashboard.leetstreak.dev</span>
            </div>
            <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 26 }}>🔥</span>
                <span style={{ fontSize: 44, fontWeight: 900, color: "#ff6b2b", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>47</span>
                <span style={{ fontSize: 13, color: "#6b7280", alignSelf: "flex-end", paddingBottom: 3 }}>day streak</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[{ label: "Easy", pct: 72, color: "#22c55e" }, { label: "Med", pct: 45, color: "#f59e0b" }, { label: "Hard", pct: 18, color: "#ef4444" }].map((b) => (
                  <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, width: 28, textAlign: "right", color: b.color }}>{b.label}</span>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
                      <div className="preview-bar-fill" style={{ width: b.pct + "%", background: b.color, height: "100%", borderRadius: 99, boxShadow: `0 0 8px ${b.color}88` }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", width: 30, color: b.color }}>{b.pct}%</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "rgba(255,107,43,0.08)", borderRadius: 10, border: "1px solid rgba(255,107,43,0.2)" }}>
                <span>📧</span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>Next reminder in 2h 14m</span>
              </div>
            </div>
          </div>
        </div>

        <div style={s.scrollIndicator} className="bounce">
          <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(255,107,43,0.8), transparent)" }} />
          <span style={{ fontSize: 9, color: "#4b5563", letterSpacing: "2px", textTransform: "uppercase" as const }}>scroll</span>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={s.ticker}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "#9ca3af", whiteSpace: "nowrap" as const }}>
              <span style={{ color: "#ff6b2b" }}>{item.icon}</span> {item.text}
              <span style={{ color: "rgba(255,107,43,0.3)", marginLeft: 16, marginRight: 8 }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS COUNTERS ── */}
      <section
        id="stats-section" data-observe
        style={{ ...s.statsSection, opacity: vis("stats-section") ? 1 : 0, transform: vis("stats-section") ? "none" : "translateY(40px)", transition: "all 0.8s ease" }}
      >
        <div className="stats-grid" style={s.statsGrid}>
          {[
            { num: counter.users.toLocaleString() + "+", label: "Active Users", icon: "👨‍💻", color: "#ff6b2b" },
            { num: counter.solved.toLocaleString() + "+", label: "Problems Tracked", icon: "✅", color: "#22c55e" },
            { num: counter.streaks.toLocaleString() + "+", label: "Streaks Protected", icon: "🔥", color: "#f59e0b" },
            { num: "99.9%", label: "Uptime", icon: "⚡", color: "#60a5fa" },
          ].map((sc, i) => (
            <div key={i} style={s.statCard} className="stat-card-hover">
              <div style={{ fontSize: 30, marginBottom: 8 }}>{sc.icon}</div>
              <div style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6, color: sc.color }}>{sc.num}</div>
              <div style={{ fontSize: 14, color: "#6b7280" }}>{sc.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" data-observe style={s.featSection}>
        <div id="feat-header" data-observe style={{ ...s.sectionHeader, opacity: vis("feat-header") ? 1 : 0, transform: vis("feat-header") ? "none" : "translateY(30px)", transition: "all 0.7s ease" }}>
          <div style={s.sectionBadge}>✦ FEATURES</div>
          <h2 style={s.sectionH2}>Everything you need to <span style={{ color: "#ff6b2b" }}>stay consistent</span></h2>
          <p style={s.sectionSub}>Powerful tools wrapped in a beautiful dashboard. Nothing you don't need.</p>
        </div>
        <div className="feat-grid" style={s.featGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} id={`feat-${i}`} data-observe className="feat-card" style={{
              ...s.featCard,
              borderColor: vis(`feat-${i}`) ? f.color + "44" : "rgba(255,255,255,0.06)",
              opacity: vis(`feat-${i}`) ? 1 : 0,
              transform: vis(`feat-${i}`) ? "none" : "translateY(40px)",
              transition: `all 0.6s ease ${i * 0.1}s`,
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: f.color + "18", border: `1px solid ${f.color}33`, flexShrink: 0 }}>
                <span style={{ fontSize: 26 }}>{f.icon}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.75 }}>{f.desc}</p>
              <div style={{ alignSelf: "flex-start" as const, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, letterSpacing: "0.5px", color: f.color, background: f.color + "15" }}>{f.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" data-observe style={s.howSection}>
        <div id="how-header" data-observe style={{ ...s.sectionHeader, opacity: vis("how-header") ? 1 : 0, transform: vis("how-header") ? "none" : "translateY(30px)", transition: "all 0.7s" }}>
          <div style={s.sectionBadge}>✦ HOW IT WORKS</div>
          <h2 style={s.sectionH2}>Up and running in <span style={{ color: "#ff6b2b" }}>3 minutes</span></h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 48 }}>
          {STEPS.map((step, i) => (
            <div key={i} id={`step-${i}`} data-observe className="step-row" style={{
              display: "flex", alignItems: "center", gap: 36,
              opacity: vis(`step-${i}`) ? 1 : 0,
              transform: vis(`step-${i}`) ? "none" : `translateX(${i % 2 === 0 ? -40 : 40}px)`,
              transition: `all 0.7s ease ${i * 0.12}s`,
              flexDirection: (i % 2 === 0 ? "row" : "row-reverse") as any,
            }}>
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,107,43,0.4)", letterSpacing: "2px", fontFamily: "'JetBrains Mono', monospace" }}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(255,107,43,0.1)", border: "1px solid rgba(255,107,43,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{step.icon}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: "clamp(17px,2.5vw,22px)", fontWeight: 800, color: "#f1f5f9", marginBottom: 8, letterSpacing: "-0.3px" }}>{step.title}</h3>
                <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, marginBottom: 12 }}>{step.desc}</p>
                <div style={{ background: "rgba(255,107,43,0.06)", border: "1px solid rgba(255,107,43,0.15)", borderRadius: 10, padding: "9px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, overflowX: "auto" as const }}>
                  <code style={{ color: "#ff9a5c", whiteSpace: "nowrap" as const }}>{step.code}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={s.testimonialSection}>
        <div id="test-header" data-observe style={{ ...s.sectionHeader, opacity: vis("test-header") ? 1 : 0, transition: "all 0.7s" }}>
          <div style={s.sectionBadge}>✦ TESTIMONIALS</div>
          <h2 style={s.sectionH2}>Loved by <span style={{ color: "#ff6b2b" }}>developers</span></h2>
        </div>
        <div className="test-grid" style={s.testimonialsGrid}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} id={`test-${i}`} data-observe className="test-card" style={{
              ...s.testCard,
              opacity: vis(`test-${i}`) ? 1 : 0,
              transform: vis(`test-${i}`) ? "none" : "translateY(30px)",
              transition: `all 0.6s ease ${i * 0.1}s`,
            }}>
              <div style={{ color: "#f59e0b", fontSize: 13, marginBottom: 12, letterSpacing: 2 }}>★★★★★</div>
              <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.75, marginBottom: 18, flex: 1 }}>"{t.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0, background: t.color }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section id="cta-banner" data-observe style={{
        ...s.ctaBanner,
        opacity: vis("cta-banner") ? 1 : 0,
        transform: vis("cta-banner") ? "none" : "translateY(40px)",
        transition: "all 0.8s ease",
      }}>
        <div style={s.ctaBannerInner}>
          <div style={{ position: "absolute" as const, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,43,0.15) 0%,transparent 70%)", top: -120, right: -120, pointerEvents: "none" as const }} />
          <div style={{ position: "absolute" as const, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.1) 0%,transparent 70%)", bottom: -80, left: -80, pointerEvents: "none" as const }} />
          <div style={s.sectionBadge}>🔥 START TODAY</div>
          <h2 style={{ fontSize: "clamp(24px,4vw,46px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1px", lineHeight: 1.2, marginTop: 14, marginBottom: 14 }}>Your streak is waiting.<br />Don't let it die tonight.</h2>
          <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 28 }}>Join 12,000+ developers who never miss a day.</p>
          <a href={userInfo ? "/dashboard" : "/register"} style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg,#ff6b2b,#ff9a5c)", color: "#fff", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16, marginBottom: 14 }} className="btn-primary-glow">{userInfo ? "Go to Dashboard" : "Start Free Account"}</a>
          <div style={{ fontSize: 13, color: "#4b5563" }}>No credit card · Takes 2 minutes · Cancel anytime</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={{ fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            <span>⚡</span>
            <span style={{ color: "#ff6b2b" }}>LeetStreak</span>
          </div>
          <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 20 }}>Keep the fire burning. One problem at a time.</p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" as const, marginBottom: 18 }}>
            {["Privacy", "Terms", "Contact", "GitHub"].map((l) => (
              <a key={l} href="#" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#374151" }}>© 2025 LeetStreak. Built with ❤️ for coders.</p>
        </div>
      </footer>
    </div>
  );
};

/* ── Particle Field ── */
const ParticleField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 70; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.5 + 0.5, alpha: Math.random() * 0.35 + 0.08 });
    }
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,107,43,${p.alpha})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,107,43,${0.07 * (1 - dist / 110)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
};

/* ── Data ── */
const SYMBOLS = [
  { char: "{}", x: 5, y: 15, size: 24, delay: 0, dur: 8, op: 0.1, color: "#ff6b2b" },
  { char: "=>", x: 88, y: 20, size: 18, delay: 1, dur: 11, op: 0.09, color: "#f59e0b" },
  { char: "[]", x: 12, y: 55, size: 16, delay: 2, dur: 9, op: 0.09, color: "#60a5fa" },
  { char: "&&", x: 80, y: 60, size: 16, delay: 0.5, dur: 13, op: 0.09, color: "#22c55e" },
  { char: "//", x: 92, y: 80, size: 14, delay: 3, dur: 10, op: 0.08, color: "#ff6b2b" },
  { char: "</>", x: 3, y: 80, size: 16, delay: 1.5, dur: 12, op: 0.09, color: "#a78bfa" },
  { char: "fn()", x: 60, y: 10, size: 14, delay: 2, dur: 10, op: 0.08, color: "#a78bfa" },
  { char: "O(n)", x: 20, y: 88, size: 12, delay: 1, dur: 9, op: 0.09, color: "#22c55e" },
  { char: "++", x: 45, y: 88, size: 16, delay: 3.5, dur: 11, op: 0.09, color: "#ff6b2b" },
];

const TICKER_ITEMS = [
  { icon: "🔥", text: "alexkumar solved 3 problems today" },
  { icon: "⚡", text: "priya_codes maintained 60-day streak" },
  { icon: "✅", text: "devraj just submitted a Hard problem" },
  { icon: "🏆", text: "ananya_dev reached top 1% rank" },
  { icon: "💡", text: "rohan_99 solved their first DP problem" },
  { icon: "🚀", text: "sarah_dev unlocked 30-day badge" },
];

const FEATURES = [
  { icon: "📊", title: "Beautiful Dashboard", desc: "See your Easy, Medium & Hard stats with animated counters, progress rings, and a yearly heatmap. Your progress, visualized beautifully.", tag: "Live Stats", color: "#ff6b2b" },
  { icon: "📧", title: "Smart Email Alerts", desc: "Missed a day? We'll ping you every 3-4 hours with a friendly nudge. No spam — alerts auto-pause if you're inactive for 30 days.", tag: "Intelligent", color: "#22c55e" },
  { icon: "🔥", title: "Streak Protection", desc: "Real-time submission detection via LeetCode's API. The moment you solve something, your streak is updated. Zero manual tracking.", tag: "Automated", color: "#f59e0b" },
  { icon: "📅", title: "Activity Heatmap", desc: "GitHub-style contribution graph showing your entire year of LeetCode activity. Watch your consistency grow over time.", tag: "Visual", color: "#60a5fa" },
  { icon: "🏆", title: "Rank Tracking", desc: "See your global rank, contest rating, and submission acceptance rate all in one place. Know exactly where you stand.", tag: "Competitive", color: "#a78bfa" },
  { icon: "📈", title: "Language Insights", desc: "Weekly breakdown charts, language-wise stats, difficulty distribution — full analytics to understand your coding patterns.", tag: "Insights", color: "#ec4899" },
];

const STEPS = [
  { icon: "📝", title: "Create your account", desc: "Sign up with your email and enter your LeetCode username. We validate it instantly against the LeetCode API.", code: "register({ email, leetcodeUsername })" },
  { icon: "🔗", title: "We sync your data", desc: "Your stats are fetched automatically — total solved, difficulty breakdown, streak count, and daily submissions.", code: "GET /api/leetcode/:username" },
  { icon: "📧", title: "Smart alerts kick in", desc: "Every 3-4 hours we check if you've submitted today. If not, we send a gentle reminder to your inbox.", code: "cron('0 */3 * * *', checkStreak)" },
  { icon: "🏆", title: "Watch your stats grow", desc: "Log in anytime to see your beautiful dashboard with animated stats, heatmaps, and your protected streak.", code: "streak.isAlive === true ✓" },
];

const TESTIMONIALS = [
  { quote: "I went from breaking my streak every 2 weeks to maintaining a 90-day streak. This app literally changed my interview prep.", name: "Arjun Sharma", role: "SDE @ Amazon", color: "linear-gradient(135deg,#ff6b2b,#fb923c)" },
  { quote: "The email reminders are perfectly timed. Not too aggressive, not too passive. I actually look forward to them now.", name: "Priya Nair", role: "CS Student, IIT Delhi", color: "linear-gradient(135deg,#22c55e,#4ade80)" },
  { quote: "Best LeetCode companion tool. The dashboard is incredibly clean and seeing my streak number grow every day is addictive.", name: "Rahul Gupta", role: "Frontend Dev @ Razorpay", color: "linear-gradient(135deg,#60a5fa,#818cf8)" },
  { quote: "I was skeptical but within 2 weeks my consistency shot up. Went from ~3 problems/week to 7+. Highly recommend.", name: "Sneha Reddy", role: "Backend Dev @ Zomato", color: "linear-gradient(135deg,#f59e0b,#fb923c)" },
  { quote: "The 30-day inactivity pause is a genius feature. When I was on vacation it just stopped — no spam. Thoughtful design.", name: "Karthik V", role: "Full Stack @ Flipkart", color: "linear-gradient(135deg,#a78bfa,#c084fc)" },
  { quote: "Love the heatmap view. Staring at all those green squares is the best motivation to never skip a day.", name: "Divya Menon", role: "SDE Intern @ Microsoft", color: "linear-gradient(135deg,#ec4899,#f472b6)" },
];

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  root:        { background: "#06060c", minHeight: "100vh", fontFamily: "'Outfit', sans-serif", color: "#e2e8f0", overflowX: "hidden", cursor: "none" },
  nav:         { position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, transition: "background 0.4s", backdropFilter: "blur(14px)" },
  navInner:    { maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 24 },
  navLogo:     { display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginRight: "auto", flexShrink: 0 },
  logoWord:    { fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" },
  navLinks:    { display: "flex", gap: 24 },
  navLink:     { color: "#9ca3af", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" },
  navCtas:     { display: "flex", gap: 10, alignItems: "center" },
  navSignIn:   { color: "#9ca3af", textDecoration: "none", fontSize: 14, fontWeight: 500, padding: "7px 14px" },
  navCta:      { padding: "8px 18px", background: "linear-gradient(135deg,#ff6b2b,#ff9a5c)", color: "#fff", borderRadius: 9, textDecoration: "none", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" as const },
  hamburger:   { display: "none", flexDirection: "column" as const, gap: 5, background: "none", border: "none", cursor: "pointer", padding: 6, marginLeft: "auto" },
  hamLine:     { display: "block", width: 22, height: 2, background: "#9ca3af", borderRadius: 2, transition: "all 0.25s ease", transformOrigin: "center" },
  mobileMenu:  { padding: "16px 24px 20px", display: "flex", flexDirection: "column" as const, gap: 4, background: "rgba(6,6,12,0.98)", borderTop: "1px solid rgba(255,255,255,0.07)" },
  mobileLink:  { padding: "12px 4px", fontSize: 15, fontWeight: 500, color: "#c0c0d0", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  hero:        { minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 24px 80px", maxWidth: 1200, margin: "0 auto", position: "relative", gap: 48, flexWrap: "wrap" as const },
  heroOrb1:    { position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,43,0.11) 0%,transparent 70%)", top: -150, right: -150, pointerEvents: "none", zIndex: 0, transition: "transform 0.1s" },
  heroOrb2:    { position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.07) 0%,transparent 70%)", bottom: 0, left: -100, pointerEvents: "none", zIndex: 0, transition: "transform 0.1s" },
  heroContent: { flex: "1 1 380px", position: "relative", zIndex: 2, minWidth: 0 },
  heroBadge:   { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,107,43,0.1)", border: "1px solid rgba(255,107,43,0.25)", borderRadius: 100, padding: "5px 13px", fontSize: 12, color: "#ff9a5c", marginBottom: 20 },
  heroH1:      { fontSize: "clamp(36px,5.5vw,68px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 20 },
  heroParagraph: { fontSize: 17, lineHeight: 1.7, marginBottom: 32, maxWidth: 520 },
  heroCtas:    { display: "flex", gap: 12, flexWrap: "wrap" as const, marginBottom: 24 },
  heroCtaPrimary:   { padding: "13px 26px", background: "linear-gradient(135deg,#ff6b2b,#ff9a5c)", color: "#fff", borderRadius: 11, textDecoration: "none", fontWeight: 800, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 8 },
  heroCtaSecondary: { padding: "13px 22px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0", borderRadius: 11, textDecoration: "none", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 },
  heroMeta:    { display: "flex", gap: 18, flexWrap: "wrap" as const },
  heroPreview: { flex: "0 0 340px", position: "relative", zIndex: 2 },
  previewCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, overflow: "hidden", backdropFilter: "blur(20px)", boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,107,43,0.1)" },
  previewHeader: { padding: "11px 14px", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 10 },
  scrollIndicator: { position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 5, zIndex: 2 },
  ticker:      { background: "rgba(255,107,43,0.05)", borderTop: "1px solid rgba(255,107,43,0.12)", borderBottom: "1px solid rgba(255,107,43,0.12)", padding: "11px 0", overflow: "hidden", position: "relative", zIndex: 2 },
  statsSection:{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 2 },
  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 },
  statCard:    { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px 20px", textAlign: "center", backdropFilter: "blur(10px)" },
  featSection: { maxWidth: 1200, margin: "0 auto", padding: "60px 24px 80px", position: "relative", zIndex: 2 },
  sectionHeader: { textAlign: "center", marginBottom: 52 },
  sectionBadge: { display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "2px", color: "#ff6b2b", textTransform: "uppercase" as const, marginBottom: 14 },
  sectionH2:   { fontSize: "clamp(24px,3.5vw,42px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1px", lineHeight: 1.2, marginBottom: 14 },
  sectionSub:  { fontSize: 15, color: "#6b7280", maxWidth: 480, margin: "0 auto" },
  featGrid:    { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 },
  featCard:    { padding: "26px", borderRadius: 18, background: "rgba(255,255,255,0.03)", border: "1px solid", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column" as const, gap: 12 },
  howSection:  { maxWidth: 860, margin: "0 auto", padding: "60px 24px 80px", position: "relative", zIndex: 2 },
  testimonialSection: { maxWidth: 1200, margin: "0 auto", padding: "60px 24px 80px", position: "relative", zIndex: 2 },
  testimonialsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 },
  testCard:    { padding: "26px", borderRadius: 18, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column" as const },
  ctaBanner:   { margin: "20px 24px 60px", borderRadius: 24, position: "relative", overflow: "hidden", zIndex: 2 },
  ctaBannerInner: { maxWidth: 660, margin: "0 auto", padding: "72px 36px", textAlign: "center", position: "relative", zIndex: 2, background: "linear-gradient(135deg,rgba(255,107,43,0.11),rgba(255,154,92,0.05))", border: "1px solid rgba(255,107,43,0.2)", borderRadius: 24, backdropFilter: "blur(20px)" },
  footer:      { borderTop: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 2 },
  footerInner: { maxWidth: 560, margin: "0 auto", padding: "44px 24px", textAlign: "center" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #06060c; overflow-x: hidden; }
  ::selection { background: rgba(255,107,43,0.3); color: #fff; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #06060c; }
  ::-webkit-scrollbar-thumb { background: rgba(255,107,43,0.4); border-radius: 99px; }

  .cursor-dot  { position: fixed; width: 6px; height: 6px; background: #ff6b2b; border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%,-50%); }
  .cursor-ring { position: fixed; width: 26px; height: 26px; border: 1.5px solid rgba(255,107,43,0.45); border-radius: 50%; pointer-events: none; z-index: 9998; transform: translate(-50%,-50%); transition: all 0.1s ease; }
  @media (hover: none) { .cursor-dot, .cursor-ring { display: none; } }

  .float-symbols { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .float-sym { position: absolute; font-family: 'JetBrains Mono', monospace; font-weight: 700; animation: floatSym linear infinite; user-select: none; }
  @keyframes floatSym { 0%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-16px) rotate(3deg)} 75%{transform:translateY(10px) rotate(-3deg)} 100%{transform:translateY(0) rotate(0deg)} }

  .shimmer-text { background: linear-gradient(90deg,#ff6b2b,#ff9a5c,#fbbf24,#ff6b2b); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
  @keyframes shimmer { to { background-position: 200% center; } }
  .cursor-blink { animation: blink 1s step-end infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  .fade-up-1 { animation: fadeUp 0.6s ease 0.1s both; }
  .fade-up-2 { animation: fadeUp 0.6s ease 0.25s both; }
  .fade-up-3 { animation: fadeUp 0.6s ease 0.4s both; }
  .fade-up-4 { animation: fadeUp 0.6s ease 0.55s both; }
  .fade-up-5 { animation: fadeUp 0.6s ease 0.7s both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }

  .hero-float { animation: heroFloat 6s ease-in-out infinite; }
  @keyframes heroFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  .preview-bar-fill { animation: barGrow 1.5s cubic-bezier(0.22,1,0.36,1) 1s both; }
  @keyframes barGrow { from{width:0!important} }

  .ticker-track { display: inline-flex; white-space: nowrap; animation: ticker 32s linear infinite; padding-left: 100%; }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .bounce { animation: bounce 2s ease-in-out infinite; }
  @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }

  .nav-link:hover { color: #f1f5f9 !important; }
  .cta-glow { box-shadow: 0 0 18px rgba(255,107,43,0.3); transition: box-shadow 0.3s, opacity 0.2s; }
  .cta-glow:hover { box-shadow: 0 0 30px rgba(255,107,43,0.5); opacity: 0.9; }
  .btn-primary-glow { box-shadow: 0 8px 24px rgba(255,107,43,0.38) !important; transition: transform 0.2s, box-shadow 0.2s !important; }
  .btn-primary-glow:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(255,107,43,0.52) !important; }
  .stat-card-hover { transition: transform 0.22s, border-color 0.22s; }
  .stat-card-hover:hover { transform: translateY(-5px); border-color: rgba(255,107,43,0.28) !important; }
  .feat-card { transition: transform 0.22s, box-shadow 0.22s; }
  .feat-card:hover { transform: translateY(-5px); box-shadow: 0 18px 40px rgba(0,0,0,0.4) !important; }
  .test-card { transition: transform 0.22s, border-color 0.22s; }
  .test-card:hover { transform: translateY(-4px); border-color: rgba(255,107,43,0.22) !important; }

  /* ── RESPONSIVE ── */
  @media (max-width: 1024px) {
    .feat-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .test-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }

  @media (max-width: 768px) {
    .nav-links-desktop { display: none !important; }
    .nav-ctas-desktop  { display: none !important; }
    .hamburger         { display: flex !important; }
    body               { cursor: auto !important; }

    .hero-preview { display: none !important; }
    .step-row     { flex-direction: column !important; align-items: flex-start !important; }
  }

  @media (max-width: 600px) {
    .feat-grid   { grid-template-columns: 1fr !important; }
    .test-grid   { grid-template-columns: 1fr !important; }
    .stats-grid  { grid-template-columns: 1fr 1fr !important; }
  }

  @media (max-width: 400px) {
    .stats-grid { grid-template-columns: 1fr !important; }
  }
`;

export default Homepage;