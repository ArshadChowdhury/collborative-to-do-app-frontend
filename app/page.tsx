"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity=".9" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity=".5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity=".5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity=".25" />
      </svg>
    ),
    title: "Kanban Boards",
    desc: "Visualize work across Todo, In Progress, and Done columns. Drag, drop, and stay organized.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Real-Time Sync",
    desc: "Every change propagates instantly across all teammates — no refresh, no lag, no conflicts.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Multi-Tenant Workspaces",
    desc: "Each organization gets an isolated workspace. Invite members, manage roles, keep data separate.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Secure by Default",
    desc: "JWT auth, bcrypt hashing, schema-level isolation, and Row-Level Security on every table.",
  },
];

const steps = [
  { n: "01", label: "Create your workspace", sub: "Sign up and provision your tenant in seconds." },
  { n: "02", label: "Build a board", sub: "Add columns, invite teammates, and set priorities." },
  { n: "03", label: "Ship together", sub: "Watch tasks move in real time as your team works." },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: "#0d0f14",
        color: "#e8eaf0",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --accent: #6c63ff;
          --accent-bright: #8b85ff;
          --accent-dim: rgba(108,99,255,0.18);
          --surface: #13161d;
          --surface2: #1a1d26;
          --border: rgba(255,255,255,0.07);
          --muted: #7b7f8e;
        }

        .nav-blur {
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          background: rgba(13,15,20,0.85);
          border-bottom: 1px solid var(--border);
        }

        .btn-primary {
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
        }
        .btn-primary:hover { background: var(--accent-bright); transform: translateY(-1px); }

        .btn-ghost {
          background: transparent;
          color: #c8cad4;
          border: 1px solid var(--border);
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          font-family: inherit;
        }
        .btn-ghost:hover { border-color: var(--accent); color: #fff; transform: translateY(-1px); }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(42px, 6vw, 76px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #fff 40%, #a09aff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
        }

        .feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 28px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .feature-card:hover {
          border-color: rgba(108,99,255,0.4);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(108,99,255,0.1);
        }

        .board-preview {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }

        .col-header {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--muted);
          padding: 14px 16px 10px;
          border-bottom: 1px solid var(--border);
        }

        .todo-card {
          margin: 10px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: #d0d3df;
          line-height: 1.45;
        }

        .badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          margin-top: 8px;
          letter-spacing: 0.3px;
        }

        .step-num {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: var(--accent);
          opacity: 0.7;
          letter-spacing: 1px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float { animation: float 5s ease-in-out infinite; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.35s; opacity: 0; }
        .delay-4 { animation-delay: 0.5s; opacity: 0; }

        .divider { width: 100%; height: 1px; background: var(--border); }

        .cta-box {
          background: linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(108,99,255,0.04) 100%);
          border: 1px solid rgba(108,99,255,0.25);
          border-radius: 20px;
          padding: 64px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
      `}</style>

      {/* NAV */}
      <nav
        className={scrolled ? "nav-blur" : ""}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 5%",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "background 0.3s",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--accent)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" fill="white" />
              <rect x="14" y="3" width="7" height="7" rx="1" fill="white" opacity=".6" />
              <rect x="3" y="14" width="7" height="7" rx="1" fill="white" opacity=".6" />
              <rect x="14" y="14" width="7" height="7" rx="1" fill="white" opacity=".3" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.5px" }}>
            TaskFlow
          </span>
        </div>

        {/* Auth links */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/login" className="btn-ghost">Log in</Link>
          <Link href="/signup" className="btn-primary">
            Get started
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 5% 80px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Background orbs */}
        <div className="glow-orb" style={{ width: 500, height: 500, background: "rgba(108,99,255,0.18)", top: "5%", left: "50%", transform: "translateX(-50%)" }} />
        <div className="glow-orb" style={{ width: 300, height: 300, background: "rgba(99,180,255,0.08)", bottom: "10%", left: "10%" }} />

        <div className="fade-up delay-1" style={{ marginBottom: 20 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-dim)", border: "1px solid rgba(108,99,255,0.3)",
            borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600,
            color: "var(--accent-bright)", letterSpacing: "0.3px"
          }}>
            <span style={{ width: 6, height: 6, background: "var(--accent-bright)", borderRadius: "50%", display: "inline-block" }} />
            Real-time collaboration · Multi-tenant · Kanban
          </span>
        </div>

        <h1 className="hero-title fade-up delay-2" style={{ maxWidth: 780, marginBottom: 24 }}>
          Where teams move<br />work forward
        </h1>

        <p className="fade-up delay-3" style={{
          fontSize: 18, color: "var(--muted)", maxWidth: 520,
          lineHeight: 1.7, marginBottom: 40, fontWeight: 300
        }}>
          TaskFlow gives your team shared boards, live updates, and a clean workspace to ship faster — no noise, no friction.
        </p>

        <div className="fade-up delay-4" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
          <Link href="/signup" className="btn-primary" style={{ padding: "13px 28px", fontSize: 15 }}>
            Start for free
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/login" className="btn-ghost" style={{ padding: "13px 28px", fontSize: 15 }}>
            Log in to your workspace
          </Link>
        </div>

        {/* Board preview mock */}
        <div className="float fade-up delay-4" style={{ width: "100%", maxWidth: 780, position: "relative" }}>
          <div style={{
            position: "absolute", inset: -1,
            background: "linear-gradient(135deg, rgba(108,99,255,0.35), transparent 60%)",
            borderRadius: 18, zIndex: 0
          }} />
          <div className="board-preview" style={{ position: "relative", zIndex: 1 }}>
            {/* Mock top bar */}
            <div style={{
              padding: "12px 16px", display: "flex", alignItems: "center",
              justifyContent: "space-between", borderBottom: "1px solid var(--border)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Q3 Sprint · sazzada_rnh7</span>
              <div style={{ width: 60 }} />
            </div>

            {/* 3 columns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
              {/* Todo */}
              <div style={{ borderRight: "1px solid var(--border)" }}>
                <div className="col-header" style={{ display: "flex", justifyContent: "space-between" }}>
                  Todo <span style={{ background: "var(--accent-dim)", color: "var(--accent-bright)", borderRadius: 4, padding: "1px 6px", fontSize: 10 }}>3</span>
                </div>
                <div className="todo-card">Set up CI/CD pipeline<span className="badge" style={{ background: "rgba(255,193,7,0.12)", color: "#f5c842" }}>medium</span></div>
                <div className="todo-card">Write onboarding docs<span className="badge" style={{ background: "rgba(108,99,255,0.15)", color: "var(--accent-bright)" }}>low</span></div>
                <div className="todo-card" style={{ opacity: 0.6 }}>Review PR #42</div>
              </div>

              {/* In Progress */}
              <div style={{ borderRight: "1px solid var(--border)" }}>
                <div className="col-header" style={{ display: "flex", justifyContent: "space-between" }}>
                  In Progress <span style={{ background: "rgba(99,180,255,0.12)", color: "#63b4ff", borderRadius: 4, padding: "1px 6px", fontSize: 10 }}>2</span>
                </div>
                <div className="todo-card">Deploy to production<span className="badge" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>high</span></div>
                <div className="todo-card">Socket.io integration<span className="badge" style={{ background: "rgba(99,180,255,0.12)", color: "#63b4ff" }}>medium</span></div>
              </div>

              {/* Done */}
              <div>
                <div className="col-header" style={{ display: "flex", justifyContent: "space-between" }}>
                  Done <span style={{ background: "rgba(40,200,100,0.12)", color: "#4ade80", borderRadius: 4, padding: "1px 6px", fontSize: 10 }}>4</span>
                </div>
                <div className="todo-card" style={{ opacity: 0.55 }}>Auth module<span className="badge" style={{ background: "rgba(40,200,100,0.1)", color: "#4ade80" }}>done</span></div>
                <div className="todo-card" style={{ opacity: 0.55 }}>DB schema design</div>
                <div className="todo-card" style={{ opacity: 0.45 }}>API scaffolding</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "96px 5%", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "1.5px", color: "var(--accent-bright)", textTransform: "uppercase", marginBottom: 12 }}>Everything you need</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            Built for how teams actually work
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: "var(--accent-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--accent-bright)", marginBottom: 18
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 16, color: "#fff", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1100, margin: "0 auto" }} />

      {/* HOW IT WORKS */}
      <section style={{ padding: "96px 5%", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "1.5px", color: "var(--accent-bright)", textTransform: "uppercase", marginBottom: 12 }}>Simple by design</p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: 56 }}>
          Up and running in minutes
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ position: "relative" }}>
              {i < steps.length - 1 && (
                <div style={{
                  display: "none", // shown via css below on wider screens
                  position: "absolute", top: 22, left: "calc(50% + 36px)",
                  width: "calc(100% - 72px)", height: 1,
                  background: "linear-gradient(90deg, var(--accent), transparent)",
                  opacity: 0.3
                }} />
              )}
              <div style={{ marginBottom: 16 }}>
                <span className="step-num">{s.n}</span>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                border: "1px solid rgba(108,99,255,0.3)",
                background: "var(--accent-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", color: "var(--accent-bright)", fontSize: 20, fontWeight: 700, fontFamily: "'Syne', sans-serif"
              }}>
                {i + 1}
              </div>
              <h3 style={{ fontWeight: 600, color: "#fff", marginBottom: 8, fontSize: 16 }}>{s.label}</h3>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1100, margin: "0 auto" }} />

      {/* CTA */}
      <section style={{ padding: "96px 5%", maxWidth: 900, margin: "0 auto" }}>
        <div className="cta-box">
          <div className="glow-orb" style={{ width: 300, height: 300, background: "rgba(108,99,255,0.2)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#fff", letterSpacing: "-1.5px", marginBottom: 16 }}>
              Ready to move faster?
            </h2>
            <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
              Create your workspace, invite your team, and start shipping — all in under a minute.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" className="btn-primary" style={{ padding: "14px 32px", fontSize: 15 }}>
                Create your workspace
              </Link>
              <Link href="/login" className="btn-ghost" style={{ padding: "14px 32px", fontSize: 15 }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "32px 5%", borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, background: "var(--accent)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" fill="white" />
              <rect x="14" y="3" width="7" height="7" rx="1" fill="white" opacity=".6" />
              <rect x="3" y="14" width="7" height="7" rx="1" fill="white" opacity=".6" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>TaskFlow</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/login" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>Log in</Link>
          <Link href="/signup" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>Sign up</Link>
        </div>
      </footer>
    </div>
  );
}