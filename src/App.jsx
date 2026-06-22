import React, { useState, useEffect, useRef, useCallback } from "react";

/*
  Apology — tuned for iPhone 17 (6.3" ProMotion 120Hz, Dynamic Island).
  - All motion uses translate3d / scale (GPU compositor) — never animates layout props.
  - will-change hints on animated layers so Safari promotes them to their own layer.
  - safe-area-inset padding so nothing hides under the Dynamic Island / home bar.
  - Tap feedback (:active scale) replaces hover, which doesn't exist on touch.
  - -webkit-overflow-scrolling: touch + overscroll containment for native momentum feel.
  - Particle/star counts kept lean so 120fps holds even with backdrop-blur.
*/

function useGlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      :root{
        --safe-t: env(safe-area-inset-top, 0px);
        --safe-b: env(safe-area-inset-bottom, 0px);
        --safe-l: env(safe-area-inset-left, 0px);
        --safe-r: env(safe-area-inset-right, 0px);
      }
      *{ -webkit-tap-highlight-color: transparent; }
      html,body{ margin:0; background:#0F172A; overscroll-behavior-y:none; }
      html{ scroll-behavior:smooth; -webkit-text-size-adjust:100%; }

      /* GPU-friendly keyframes: only transform + opacity */
      @keyframes floatUp { 0%{transform:translate3d(0,0,0)} 50%{transform:translate3d(0,-12px,0)} 100%{transform:translate3d(0,0,0)} }
      @keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.13)} 28%{transform:scale(1)} 42%{transform:scale(1.09)} 70%{transform:scale(1)} }
      @keyframes driftA { from{transform:translate3d(0,0,0)} to{transform:translate3d(50px,-34px,0)} }
      @keyframes driftB { from{transform:translate3d(0,0,0)} to{transform:translate3d(-44px,44px,0)} }
      @keyframes twinkle { 0%,100%{opacity:.2} 50%{opacity:1} }
      @keyframes particleRise { 0%{transform:translate3d(0,0,0) scale(1);opacity:0} 10%{opacity:.7} 90%{opacity:.45} 100%{transform:translate3d(0,-105vh,0) scale(.6);opacity:0} }
      @keyframes heartRise { 0%{transform:translate3d(0,0,0) scale(.6);opacity:0} 15%{opacity:1} 100%{transform:translate3d(0,-78vh,0) scale(1.1);opacity:0} }
      @keyframes dash { to{stroke-dashoffset:0} }

      @media (prefers-reduced-motion: reduce){
        *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
        .reveal{opacity:1!important;transform:none!important}
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);
}

function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setShown(true), ob.disconnect()),
      // rootMargin lifts the trigger above the home bar so reveals fire a touch early
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return [ref, shown];
}

function Reveal({
  children,
  delay = 0,
  y = 26,
  as: Tag = "div",
  className = "",
  style = {},
}) {
  const [ref, shown] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
        transition: `opacity .8s cubic-bezier(.22,1,.36,1) ${delay}s, transform .8s cubic-bezier(.22,1,.36,1) ${delay}s`,
        willChange: shown ? "auto" : "transform, opacity",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

const C = {
  bg: "#0F172A",
  bg2: "#1E293B",
  accent: "#60A5FA",
  pink: "#F9A8D4",
  text: "#FFFFFF",
  sub: "#CBD5E1",
};

const glass = {
  background: "rgba(30,41,59,0.45)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(148,163,184,0.18)",
  borderRadius: 22,
};

// Detect coarse pointer (touch) once, so we can skip hover-only behaviour cleanly.
function useTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  return touch;
}

function Ambient() {
  // Leaner counts for mobile so blur + compositing stay at 120fps.
  const particles = React.useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        dur: 18 + Math.random() * 20,
        delay: -Math.random() * 30,
        pink: i % 3 === 0,
      })),
    [],
  );
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-12%",
          width: 460,
          height: 460,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(96,165,250,0.20), transparent 70%)",
          animation: "driftA 26s ease-in-out infinite alternate",
          willChange: "transform",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-14%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(249,168,212,0.15), transparent 70%)",
          animation: "driftB 32s ease-in-out infinite alternate",
          willChange: "transform",
        }}
      />
      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            bottom: -10,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.pink ? C.pink : C.accent,
            opacity: 0.5,
            boxShadow: `0 0 ${p.size * 2}px ${p.pink ? C.pink : C.accent}`,
            willChange: "transform, opacity",
            animation: `particleRise ${p.dur}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

const Heart = ({ size = 92, beat = true, glow = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden
    style={{
      animation: beat ? "heartbeat 2.4s ease-in-out infinite" : "none",
      willChange: beat ? "transform" : "auto",
      filter: glow ? `drop-shadow(0 0 20px rgba(249,168,212,.55))` : "none",
    }}
  >
    <defs>
      <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={C.pink} />
        <stop offset="100%" stopColor={C.accent} />
      </linearGradient>
    </defs>
    <path
      fill="url(#hg)"
      d="M12 21s-7.2-4.6-9.6-9.2C.9 8.3 2.5 5 5.7 5c2 0 3.4 1.2 4.3 2.6C10.9 6.2 12.3 5 14.3 5c3.2 0 4.8 3.3 3.3 6.8C19.2 16.4 12 21 12 21z"
    />
  </svg>
);

const Section = ({ children, style = {}, ...rest }) => (
  <section
    {...rest}
    style={{
      position: "relative",
      zIndex: 1,
      maxWidth: 860,
      margin: "0 auto",
      padding: "clamp(72px, 14vh, 120px) clamp(22px, 6vw, 24px)",
      ...style,
    }}
  >
    {children}
  </section>
);

const H = ({ children, style = {} }) => (
  <h2
    style={{
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      color: C.text,
      fontSize: "clamp(2.1rem, 8vw, 3.6rem)",
      lineHeight: 1.12,
      letterSpacing: "-0.01em",
      margin: 0,
      textWrap: "balance",
      ...style,
    }}
  >
    {children}
  </h2>
);

// Pressable button with tactile scale-down on touch.
function Pressable({ children, onClick, ariaLabel, gradient, shadow }) {
  const [down, setDown] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      style={{
        marginTop: 44,
        padding: "16px 50px",
        minHeight: 52,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        fontFamily: "Inter",
        fontSize: "1.05rem",
        fontWeight: 500,
        color: "#0F172A",
        background: gradient,
        boxShadow: shadow,
        touchAction: "manipulation",
        transform: down ? "scale(0.96)" : "scale(1)",
        transition: "transform .18s cubic-bezier(.22,1,.36,1), filter .2s ease",
        filter: down ? "brightness(1.05)" : "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      {children}
    </button>
  );
}

function Letter() {
  const [open, setOpen] = useState(false);
  const [down, setDown] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        onPointerDown={() => setDown(true)}
        onPointerUp={() => setDown(false)}
        onPointerLeave={() => setDown(false)}
        aria-expanded={open}
        aria-label={open ? "Close the letter" : "Open the letter"}
        style={{
          position: "relative",
          width: "min(260px, 72vw)",
          height: 168,
          cursor: "pointer",
          border: "none",
          background: "transparent",
          touchAction: "manipulation",
          WebkitUserSelect: "none",
          userSelect: "none",
          transform: down ? "scale(0.97)" : "scale(1)",
          transition: "transform .2s cubic-bezier(.22,1,.36,1)",
          animation: open || down ? "none" : "floatUp 4s ease-in-out infinite",
          willChange: "transform",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            ...glass,
            background:
              "linear-gradient(160deg, rgba(96,165,250,.25), rgba(249,168,212,.18))",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: 0,
            height: 0,
            marginLeft: -130,
            borderLeft: "130px solid transparent",
            borderRight: "130px solid transparent",
            borderTop: `82px solid rgba(148,163,184,${open ? 0 : 0.35})`,
            transformOrigin: "top",
            transform: open ? "rotateX(180deg)" : "rotateX(0deg)",
            transition: "all .6s ease",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Heart size={34} beat={false} glow />
        </div>
        <span
          style={{
            position: "absolute",
            bottom: 14,
            left: 0,
            right: 0,
            color: C.sub,
            fontSize: 13,
            fontFamily: "Inter",
          }}
        >
          {open ? "Tap to close" : "Tap to open"}
        </span>
      </button>

      <div
        style={{
          maxHeight: open ? 600 : 0,
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition:
            "max-height .9s cubic-bezier(.22,1,.36,1), opacity .7s ease",
          width: "100%",
        }}
      >
        <div
          style={{
            ...glass,
            padding: "clamp(28px,7vw,40px) clamp(24px,6vw,34px)",
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          {[
            "No matter what happens, I wanted to say this properly.",
            // "Thank you for being part of my life.",
            "You matter to me.",
            "And I truly am sorry.",
          ].map((l, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "clamp(1.15rem,4.5vw,1.5rem)",
                color: C.text,
                lineHeight: 1.6,
                margin: "0 0 14px",
                textAlign: "center",
              }}
            >
              {l}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stars() {
  const stars = React.useMemo(
    () =>
      Array.from({ length: 55 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        s: Math.random() * 2 + 0.5,
        dur: 2 + Math.random() * 4,
        delay: Math.random() * 4,
      })),
    [],
  );
  const [ref, shown] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        height: "clamp(340px, 52vh, 420px)",
        borderRadius: 26,
        overflow: "hidden",
        background: "linear-gradient(180deg,#0B1120,#1E293B)",
        border: "1px solid rgba(148,163,184,.15)",
      }}
    >
      {stars.map((st, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: `${st.top}%`,
            left: `${st.left}%`,
            width: st.s,
            height: st.s,
            borderRadius: "50%",
            background: "#fff",
            willChange: "opacity",
            animation: `twinkle ${st.dur}s ease-in-out ${st.delay}s infinite`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(24px,7vw,40px)",
          opacity: shown ? 1 : 0,
          transition: "opacity 1.6s ease",
        }}
      >
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            textAlign: "center",
            fontSize: "clamp(1.35rem,5.5vw,2.1rem)",
            color: C.text,
            maxWidth: 540,
            lineHeight: 1.4,
            margin: 0,
            textShadow: "0 0 24px rgba(96,165,250,.4)",
            textWrap: "balance",
          }}
        >
          “Some people become important chapters in our lives.”
        </p>
      </div>
    </div>
  );
}

function GlassCard({ children, delay = 0, touch }) {
  const [active, setActive] = useState(false);
  // On touch we use a brief press-lift; on desktop, hover-lift.
  const handlers = touch
    ? {
        onPointerDown: () => setActive(true),
        onPointerUp: () => setActive(false),
        onPointerLeave: () => setActive(false),
      }
    : {
        onMouseEnter: () => setActive(true),
        onMouseLeave: () => setActive(false),
      };
  return (
    <Reveal delay={delay}>
      <div
        {...handlers}
        style={{
          ...glass,
          padding: "clamp(24px,6vw,30px) clamp(22px,5vw,26px)",
          height: "100%",
          transform: active ? "translate3d(0,-6px,0)" : "translate3d(0,0,0)",
          boxShadow: active
            ? "0 18px 50px rgba(96,165,250,.18)"
            : "0 6px 20px rgba(0,0,0,.25)",
          transition:
            "transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease",
          touchAction: "manipulation",
        }}
      >
        {children}
      </div>
    </Reveal>
  );
}

export default function ApologyApp() {
  useGlobalStyles();
  const touch = useTouch();
  const [entered, setEntered] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [thanked, setThanked] = useState(false);
  const startRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setShowOpen(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const enter = useCallback(() => {
    setEntered(true);
    setTimeout(
      () =>
        startRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      60,
    );
  }, []);

  const understand = [
    "I understand that my actions affected your feelings.",
    "I understand that trust takes time to rebuild.",
    "I understand that apologies mean nothing without change.",
  ];
  // Replace these with your own — example text shows as a fallback until you do.
  const memories = [
    "{{MEMORY_1}}",
    "{{MEMORY_2}}",
    "{{MEMORY_3}}",
    "{{MEMORY_4}}",
    "{{MEMORY_5}}",
  ];
  const memoryFallback = [
    "Your kindness.",
    "The way you always listen to me",
    "The conversations we shared.",
    "The crazy you offer",
    "The way you make me laugh",
  ];
  const timeline = [
    "The day we started talking",
    "A difficult moment we overcame(this one if we do)",
    "Today",
  ];
  const changes = [
    "Listen better.",
    "Communicate honestly.",
    "Respect your feelings.",
    "Learn from my mistakes.",
    "Let actions speak louder than words.",
  ];

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        overflowX: "hidden",
        position: "relative",
        WebkitOverflowScrolling: "touch",
        paddingLeft: "var(--safe-l)",
        paddingRight: "var(--safe-r)",
      }}
    >
      <Ambient />

      {/* Landing — uses 100svh so it fits exactly between Dynamic Island and home bar */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "calc(var(--safe-t) + 24px) 24px calc(var(--safe-b) + 24px)",
          textAlign: "center",
        }}
      >
        <Reveal y={18}>
          <div style={{ marginBottom: 30 }}>
            <Heart />
          </div>
        </Reveal>
        <Reveal delay={0.15} y={18}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(2.3rem,9vw,4.2rem)",
              margin: "0 0 18px",
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            I Made This For You <span style={{ color: C.pink }}>❤️</span>
          </h1>
        </Reveal>
        <Reveal delay={0.3} y={18}>
          <p
            style={{
              color: C.sub,
              fontSize: "clamp(1rem,4vw,1.3rem)",
              fontWeight: 300,
              margin: 0,
            }}
          >
            Because a simple text never felt enough.
          </p>
        </Reveal>
        <div
          style={{
            opacity: showOpen ? 1 : 0,
            transform: showOpen
              ? "translate3d(0,0,0)"
              : "translate3d(0,14px,0)",
            transition: "opacity .9s ease, transform .9s ease",
            pointerEvents: showOpen ? "auto" : "none",
          }}
        >
          <Pressable
            onClick={enter}
            ariaLabel="Open"
            gradient={`linear-gradient(135deg, ${C.accent}, ${C.pink})`}
            shadow="0 10px 30px rgba(96,165,250,.35)"
          >
            Open
          </Pressable>
        </div>
      </main>

      <div
        ref={startRef}
        style={{
          opacity: entered ? 1 : 0.001,
          transition: "opacity 1.2s ease",
          pointerEvents: entered ? "auto" : "none",
        }}
        aria-hidden={!entered}
      >
        {/* 1 — Apology */}
        <Section>
          <Reveal>
            <H>I'm Sorry.</H>
          </Reveal>
          <div
            style={{
              marginTop: 36,
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            {[
              "I know I hurt you.",
              "I know words alone cannot undo what happened.",
              "I am not here to make excuses or ask you to forget everything immediately.",
              "I simply want to acknowledge my mistake, take responsibility, and tell you how deeply sorry I am.",
              "You deserved better from me.",
            ].map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p
                  style={{
                    fontSize: "clamp(1.1rem,4vw,1.35rem)",
                    lineHeight: 1.7,
                    color: C.sub,
                    fontWeight: 300,
                    margin: 0,
                  }}
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 2 — What I understand now */}
        <Section>
          <Reveal>
            <H>What I Understand Now</H>
          </Reveal>
          <div
            style={{
              marginTop: 44,
              display: "grid",
              gap: 20,
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
            }}
          >
            {understand.map((t, i) => (
              <GlassCard key={i} delay={i * 0.12} touch={touch}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.12rem",
                    lineHeight: 1.6,
                    color: C.text,
                    fontWeight: 400,
                  }}
                >
                  {t}
                </p>
              </GlassCard>
            ))}
          </div>
        </Section>

        {/* 3 — Things I appreciate */}
        <Section>
          <Reveal>
            <H>Things I Appreciate About You</H>
          </Reveal>
          <div
            style={{
              marginTop: 44,
              display: "grid",
              gap: 18,
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            }}
          >
            {memories.map((m, i) => {
              const text = m.startsWith("{{") ? memoryFallback[i] : m;
              return (
                <GlassCard key={i} delay={i * 0.12} touch={touch}>
                  <Heart size={26} beat={false} glow={false} />
                  <p
                    style={{
                      margin: "12px 0 0",
                      fontSize: "1.1rem",
                      lineHeight: 1.5,
                      fontStyle: "italic",
                      color: C.text,
                    }}
                  >
                    {text}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </Section>

        {/* 4 — Timeline */}
        <Section>
          <Reveal>
            <H>Our Timeline</H>
          </Reveal>
          <div style={{ marginTop: 48, position: "relative", paddingLeft: 8 }}>
            <div
              style={{
                position: "absolute",
                left: 19,
                top: 6,
                bottom: 6,
                width: 2,
                background: `linear-gradient(${C.accent}, ${C.pink})`,
                opacity: 0.4,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
              {timeline.map((t, i) => (
                <Reveal key={i} delay={i * 0.14} y={18}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 18 }}
                  >
                    <span
                      style={{
                        flex: "0 0 auto",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 18,
                        ...glass,
                        boxShadow: `0 0 18px rgba(96,165,250,.45)`,
                      }}
                    >
                      🌸
                    </span>
                    <div
                      style={{
                        ...glass,
                        padding: "16px 20px",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "clamp(1rem,3.6vw,1.1rem)",
                          color: C.text,
                        }}
                      >
                        {t}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* 5 — What I'll do differently */}
        <Section>
          <Reveal>
            <H>What I Will Do Differently</H>
          </Reveal>
          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {changes.map((c, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  style={{
                    ...glass,
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    aria-hidden
                    style={{ flex: "0 0 auto" }}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="11"
                      fill="none"
                      stroke={C.accent}
                      strokeWidth="1.5"
                      opacity="0.5"
                    />
                    <path
                      d="M7 12.5l3.2 3.2L17 8.5"
                      fill="none"
                      stroke={C.pink}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="20"
                      strokeDashoffset="20"
                      style={{
                        animation: "dash 1s ease forwards",
                        animationDelay: `${0.3 + i * 0.12}s`,
                      }}
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: "clamp(1.02rem,3.8vw,1.12rem)",
                      color: C.text,
                    }}
                  >
                    {c}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 6 — Letter */}
        <Section>
          <Reveal style={{ textAlign: "center" }}>
            <H style={{ marginBottom: 40 }}>A Letter</H>
          </Reveal>
          <Letter />
        </Section>

        {/* 7 — Starry night */}
        <Section>
          <Reveal>
            <Stars />
          </Reveal>
        </Section>

        {/* Final */}
        <Section
          style={{
            textAlign: "center",
            paddingBottom: "calc(var(--safe-b) + 140px)",
          }}
        >
          <Reveal>
            <H>No Pressure.</H>
          </Reveal>
          <div
            style={{
              marginTop: 32,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              alignItems: "center",
            }}
          >
            {[
              "I am not asking for an immediate response.",
              "Take all the time you need.",
              "Whatever you decide, I will respect it.",
              "I simply wanted to tell you this from my heart.",
            ].map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p
                  style={{
                    fontSize: "clamp(1.05rem,4vw,1.3rem)",
                    color: C.sub,
                    fontWeight: 300,
                    margin: 0,
                    maxWidth: 560,
                  }}
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>

          {!thanked ? (
            <Pressable
              onClick={() => setThanked(true)}
              ariaLabel="Thank you for reading"
              gradient={`linear-gradient(135deg, ${C.pink}, ${C.accent})`}
              shadow="0 10px 30px rgba(249,168,212,.35)"
            >
              Thank You For Reading ❤️
            </Pressable>
          ) : (
            <div style={{ marginTop: 48, position: "relative" }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${(i / 12) * 100 - 50}%`,
                    bottom: 0,
                    fontSize: 12 + Math.random() * 14,
                    willChange: "transform, opacity",
                    animation: `heartRise ${4 + Math.random() * 3}s ease-in ${Math.random() * 2}s infinite`,
                  }}
                >
                  ❤️
                </span>
              ))}
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.3rem,5vw,1.9rem)",
                  color: C.text,
                  margin: 0,
                  animation: "floatUp 4s ease-in-out infinite",
                }}
              >
                Thank you for giving my words your time.
              </p>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
