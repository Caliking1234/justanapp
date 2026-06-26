/**
 * CoffeeAskOut.jsx
 * A short, ultra-premium single-page ask-out, built for iPhone Safari (430px, notch-safe).
 *
 * Stack: React + Framer Motion. Styling is inline (no Tailwind config required) — swap to
 * Tailwind classes freely if you prefer. Just `npm i framer-motion` and render <CoffeeAskOut />.
 *
 * Flow: Opening (cinematic dark) -> Tulips (ivory bloom) -> The Ask (bouquet + glass buttons,
 * with a "Convince me" path that reveals quips + alternate date ideas) -> Ending (golden petals,
 * one heartbeat). Tap anywhere to advance the first two scenes; buttons drive the rest.
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Art-directed palette (intentional dark -> ivory bloom; not system-dark-driven)
const PALETTE = {
  opening: {
    bg: "radial-gradient(125% 120% at 50% 28%, #1d1613 0%, #0c0908 72%)",
    ink: "#f1ebe3",
    soft: "#b3a698",
    accent: "#e7c98f",
  },
  tulips: {
    bg: "radial-gradient(125% 120% at 50% 30%, #fdf4ea 0%, #f6e4d9 100%)",
    ink: "#4a382f",
    soft: "#8c7163",
    accent: "#bb4659",
  },
  ask: {
    bg: "radial-gradient(120% 100% at 50% 22%, #fffdf9 0%, #f7f0e6 100%)",
    ink: "#3c2d27",
    soft: "#8a7264",
    accent: "#2f5742",
  },
  ending: {
    bg: "radial-gradient(125% 120% at 50% 38%, #fff7e6 0%, #f6e9d2 100%)",
    ink: "#4a3a2a",
    soft: "#9a8468",
    accent: "#c79a4e",
  },
};

const KEYFRAMES = `
@keyframes petalDrift{0%{transform:translate(0,0) rotate(0deg)}20%{transform:translate(26px,22vh) rotate(70deg)}45%{transform:translate(-18px,48vh) rotate(150deg)}70%{transform:translate(22px,78vh) rotate(245deg)}100%{transform:translate(-10px,128vh) rotate(330deg)}}
@keyframes mote{0%,100%{transform:translate(0,0);opacity:.18}50%{transform:translate(9px,-16px);opacity:.55}}
@keyframes orbFloat{0%{transform:translate(0,0) scale(1)}50%{transform:translate(22px,-26px) scale(1.08)}100%{transform:translate(0,0) scale(1)}}
@keyframes corePulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.35);opacity:1}}
@keyframes hintBob{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
@keyframes floatBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@media (prefers-reduced-motion: reduce){.cao-petal,.cao-mote,.cao-orb{animation:none!important;opacity:.35!important}}
`;

const GRAIN =
  "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>\")";

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const PCOLS = [
  ["#ecaeb6", "#b23a52"],
  ["#e29aa6", "#a8324c"],
  ["#f0c2c9", "#c14d5f"],
  ["#d97f8c", "#8f2c44"],
  ["#edb6a8", "#bf5a4e"],
];

function makePetals(n, fast) {
  return Array.from({ length: n }, () => {
    const c = pick(PCOLS);
    const size = rand(11, 22);
    const dur = fast ? rand(5.5, 9.5) : rand(12, 21);
    return {
      position: "absolute",
      top: "-14vh",
      left: rand(-6, 100) + "%",
      width: size + "px",
      height: size * 1.55 + "px",
      background: `linear-gradient(155deg, ${c[0]}, ${c[1]})`,
      borderRadius: "52% 52% 50% 50% / 66% 66% 34% 34%",
      boxShadow: "0 8px 16px rgba(150,55,75,.16)",
      opacity: rand(0.5, 0.88),
      transformOrigin: "center",
      animation: `petalDrift ${dur.toFixed(2)}s linear ${(-rand(0, dur)).toFixed(2)}s infinite`,
      willChange: "transform",
    };
  });
}

const groupV = (delay, stagger) => ({
  hidden: {},
  show: { transition: { delayChildren: delay, staggerChildren: stagger } },
});
const itemV = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 1.4, ease: EASE } },
};

const buzz = (p) => {
  if (navigator.vibrate) navigator.vibrate(p);
};

// ---- Magnetic, press-scaling glass button ----------------------------------
function MagneticButton({
  children,
  onClick,
  style,
  hidden,
  sheenOpacity = 0.5,
}) {
  const ref = useRef(null);
  const mx = useMotionValue(0),
    my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });
  useEffect(() => {
    const onMove = (e) => {
      const el = ref.current;
      if (!el || hidden) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        const f = (1 - dist / 120) * 0.3;
        mx.set(dx * f);
        my.set(dy * f);
      } else {
        mx.set(0);
        my.set(0);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, hidden]);
  return (
    <motion.button
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick(e);
      }}
      whileTap={{ scale: 0.94 }}
      animate={hidden ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        x,
        y,
        appearance: "none",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        pointerEvents: hidden ? "none" : "auto",
        fontFamily: "'Jost',sans-serif",
        ...style,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "48%",
          background: `linear-gradient(180deg,rgba(255,255,255,${sheenOpacity}),transparent)`,
          pointerEvents: "none",
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </motion.button>
  );
}

// ---- Pointer-reactive petal field ------------------------------------------
function PetalField({ petals }) {
  const mx = useMotionValue(0),
    my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 60, damping: 20 });
  const y = useSpring(my, { stiffness: 60, damping: 20 });
  useEffect(() => {
    const onMove = (e) => {
      mx.set(-(e.clientX / window.innerWidth - 0.5) * 22);
      my.set(-(e.clientY / window.innerHeight - 0.5) * 16);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);
  return (
    <motion.div
      style={{ position: "absolute", inset: 0, x, y, pointerEvents: "none" }}
    >
      {petals.map((s, i) => (
        <div key={i} className="cao-petal" style={s} />
      ))}
    </motion.div>
  );
}

// ---- Reusable bits ----------------------------------------------------------
const sceneWrap = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "0 34px",
};

const Hint = () => (
  <motion.div
    variants={itemV}
    style={{
      position: "absolute",
      bottom: "calc(46px + env(safe-area-inset-bottom))",
    }}
  >
    <div
      style={{
        fontFamily: "'Jost',sans-serif",
        fontWeight: 300,
        fontSize: 11,
        letterSpacing: "0.34em",
        textTransform: "uppercase",
        color: "var(--soft)",
        animation: "hintBob 2.6s ease-in-out infinite",
      }}
    >
      tap to continue
    </div>
  </motion.div>
);

const Tulip = ({ transform, leftLeaf, rightLeaf, brightCenter }) => (
  <g transform={transform}>
    <path
      d="M30 96 L30 50"
      stroke="#3c5a45"
      strokeWidth="3.2"
      fill="none"
      strokeLinecap="round"
    />
    {leftLeaf && (
      <path d="M30 72 C20 66 10 70 8 82 C22 84 29 79 30 72 Z" fill="#3c5a45" />
    )}
    {rightLeaf && (
      <path d="M30 70 C40 64 50 68 52 80 C38 82 31 77 30 70 Z" fill="#34503e" />
    )}
    <path
      d="M14 27 C14 15 21 8 30 8 C39 8 46 15 46 27 L46 31 C46 44 39 51 30 51 C21 51 14 44 14 31 Z"
      fill="url(#tg)"
    />
    <path
      d="M30 8 C27 8 25 17 25 28 C25 39 27 50 30 51 C33 50 35 39 35 28 C35 17 33 8 30 8 Z"
      fill={brightCenter ? "#c5566a" : "#9e2f47"}
      opacity={brightCenter ? 0.42 : 0.32}
    />
    <path
      d="M14 28 C16 18 21 15 24 17 C22 23 22 35 24 47 C18 43 14 37 14 31 Z"
      fill="#7e2741"
      opacity=".28"
    />
    <path
      d="M46 28 C44 18 39 15 36 17 C38 23 38 35 36 47 C42 43 46 37 46 31 Z"
      fill="#7e2741"
      opacity=".28"
    />
  </g>
);

const Bouquet = () => (
  <div style={{ animation: "floatBob 5s ease-in-out infinite" }}>
    <svg
      width="148"
      height="170"
      viewBox="0 0 160 196"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dc8893" />
          <stop offset="1" stopColor="#a8324c" />
        </linearGradient>
      </defs>
      <Tulip transform="translate(12,42) rotate(-13 30 30)" leftLeaf />
      <Tulip transform="translate(82,40) rotate(12 30 30)" rightLeaf />
      <Tulip transform="translate(47,2)" leftLeaf rightLeaf brightCenter />
    </svg>
  </div>
);

const Heart = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: [0.9, 1.26, 1, 1.14, 1] }}
    transition={{
      opacity: { duration: 0.6, delay: 0.7 },
      scale: {
        duration: 1.5,
        delay: 0.7,
        ease: EASE,
        times: [0, 0.18, 0.34, 0.52, 1],
      },
    }}
    onAnimationStart={() => setTimeout(() => buzz([12, 46, 18]), 700)}
    style={{ marginBottom: 28 }}
  >
    <svg
      width="64"
      height="58"
      viewBox="0 0 64 58"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e98a98" />
          <stop offset="1" stopColor="#b23a52" />
        </linearGradient>
      </defs>
      <path
        d="M32 56 C8 38 2 24 2 15 C2 6 9 2 16 2 C23 2 29 7 32 13 C35 7 41 2 48 2 C55 2 62 6 62 15 C62 24 56 38 32 56 Z"
        fill="url(#hg)"
        style={{ filter: "drop-shadow(0 6px 18px rgba(178,58,82,.4))" }}
      />
    </svg>
  </motion.div>
);

const PRIMARY_BTN = {
  border: "1px solid rgba(255,255,255,.8)",
  fontWeight: 400,
  fontSize: 16,
  letterSpacing: ".01em",
  color: "#7a2438",
  padding: "15px 26px",
  borderRadius: 999,
  background:
    "linear-gradient(160deg, rgba(255,247,248,.85), rgba(246,210,216,.6))",
  boxShadow:
    "0 10px 30px rgba(168,50,76,.2), inset 0 1px 0 rgba(255,255,255,.9)",
  backdropFilter: "blur(14px) saturate(1.3)",
  WebkitBackdropFilter: "blur(14px) saturate(1.3)",
};
const SECONDARY_BTN = {
  border: "1px solid rgba(255,255,255,.7)",
  fontWeight: 400,
  fontSize: 16,
  letterSpacing: ".01em",
  color: "#5a4a40",
  padding: "15px 24px",
  borderRadius: 999,
  background:
    "linear-gradient(160deg, rgba(255,255,255,.6), rgba(255,255,255,.32))",
  boxShadow:
    "0 8px 24px rgba(120,90,70,.14), inset 0 1px 0 rgba(255,255,255,.85)",
  backdropFilter: "blur(14px) saturate(1.2)",
  WebkitBackdropFilter: "blur(14px) saturate(1.2)",
};
const CHIP_BTN = {
  border: "1px solid rgba(255,255,255,.7)",
  fontWeight: 400,
  fontSize: 14,
  color: "#5a4a40",
  padding: "11px 17px",
  borderRadius: 999,
  background:
    "linear-gradient(160deg, rgba(255,255,255,.58), rgba(255,255,255,.3))",
  boxShadow:
    "0 6px 18px rgba(120,90,70,.12), inset 0 1px 0 rgba(255,255,255,.85)",
  backdropFilter: "blur(12px) saturate(1.2)",
  WebkitBackdropFilter: "blur(12px) saturate(1.2)",
};

// ---- Main ------------------------------------------------------------------
export default function CoffeeAskOut() {
  const [scene, setScene] = useState("opening");
  const [convince, setConvince] = useState(false);
  const pal = PALETTE[scene];

  const ambient = useMemo(() => makePetals(16, false), []);
  const falling = useMemo(() => makePetals(95, true), []);
  const motes = useMemo(
    () =>
      Array.from({ length: 13 }, () => ({
        position: "absolute",
        left: rand(2, 98) + "%",
        top: rand(4, 96) + "%",
        width: rand(2, 5) + "px",
        height: rand(2, 5) + "px",
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255,240,210,.9), rgba(255,220,170,0))",
        opacity: rand(0.15, 0.5),
        animation: `mote ${rand(7, 15).toFixed(2)}s ease-in-out ${(-rand(0, 10)).toFixed(2)}s infinite`,
      })),
    [],
  );

  const go = (s) => {
    buzz(14);
    setScene(s);
  };
  const onStageTap = () => {
    if (scene === "opening") go("tulips");
    else if (scene === "tulips") go("ask");
  };

  return (
    <div
      onClick={onStageTap}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        fontFamily: "'Jost',sans-serif",
        background: pal.bg,
        transition: "background 1.4s cubic-bezier(.4,0,.2,1)",
        ["--ink"]: pal.ink,
        ["--soft"]: pal.soft,
        ["--accent"]: pal.accent,
        paddingTop: "env(safe-area-inset-top)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Floating blurred orbs */}
      <div
        className="cao-orb"
        style={{
          position: "absolute",
          top: -60,
          left: -44,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(243,220,174,.5), transparent 70%)",
          filter: "blur(46px)",
          animation: "orbFloat 16s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        className="cao-orb"
        style={{
          position: "absolute",
          bottom: -72,
          right: -52,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(244,201,210,.45), transparent 70%)",
          filter: "blur(52px)",
          animation: "orbFloat 20s ease-in-out -4s infinite",
          pointerEvents: "none",
        }}
      />
      <div
        className="cao-orb"
        style={{
          position: "absolute",
          top: "40%",
          right: -86,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(188,208,191,.34), transparent 70%)",
          filter: "blur(50px)",
          animation: "orbFloat 22s ease-in-out -8s infinite",
          pointerEvents: "none",
        }}
      />

      {/* Film grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.05,
          mixBlendMode: "overlay",
          backgroundSize: "120px",
          backgroundImage: GRAIN,
        }}
      />

      {/* Drifting motes */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {motes.map((s, i) => (
          <div key={i} className="cao-mote" style={s} />
        ))}
      </div>

      <AnimatePresence>
        {scene === "opening" && (
          <motion.div
            key="opening"
            variants={groupV(0.6, 1.45)}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            style={sceneWrap}
          >
            <div
              style={{
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(245,220,170,.5) 0%, rgba(231,201,143,.1) 42%, transparent 70%)",
                filter: "blur(4px)",
                animation: "corePulse 4.6s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "radial-gradient(circle,#fff,#f0d9a6)",
                boxShadow: "0 0 18px 6px rgba(245,220,170,.6)",
                animation: "corePulse 4.6s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <motion.div
                variants={itemV}
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 500,
                  fontSize: 32,
                  lineHeight: 1.32,
                  color: "var(--ink)",
                }}
              >
                Okay, hear me out.
              </motion.div>
              <motion.div
                variants={itemV}
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 500,
                  fontSize: 32,
                  lineHeight: 1.32,
                  color: "var(--ink)",
                }}
              >
                I made you a whole website.
              </motion.div>
              <motion.div
                variants={itemV}
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: 25,
                  lineHeight: 1.4,
                  color: "var(--soft)",
                }}
              >
                Yes, instead of just texting like a normal person.
              </motion.div>
            </div>
            <Hint />
          </motion.div>
        )}

        {scene === "tulips" && (
          <motion.div
            key="tulips"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.9 } }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            style={{ position: "absolute", inset: 0 }}
          >
            <PetalField petals={ambient} />
            <motion.div
              variants={groupV(0.5, 0.9)}
              initial="hidden"
              animate="show"
              style={{ ...sceneWrap, padding: "0 38px", pointerEvents: "none" }}
            >
              <motion.div
                variants={itemV}
                style={{
                  fontFamily: "'Caveat',cursive",
                  fontWeight: 600,
                  fontSize: 44,
                  lineHeight: 1.2,
                  color: "var(--accent)",
                  maxWidth: 320,
                }}
              >
                These cost me nothing and everything.
              </motion.div>
              <motion.div
                variants={itemV}
                style={{
                  marginTop: 20,
                  fontFamily: "'Jost',sans-serif",
                  fontWeight: 300,
                  fontSize: 14.5,
                  letterSpacing: ".02em",
                  color: "var(--soft)",
                }}
              >
                they're digital. but the effort is real.
              </motion.div>
              <Hint />
            </motion.div>
          </motion.div>
        )}

        {scene === "ask" && (
          <motion.div
            key="ask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.9 } }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            style={sceneWrap}
          >
            <motion.div
              initial={{ opacity: 0, y: 42 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.7, delay: 0.15, ease: EASE }}
              style={{ marginBottom: 30 }}
            >
              <Bouquet />
            </motion.div>

            <motion.div
              variants={groupV(0.75, 1.0)}
              initial="hidden"
              animate="show"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <motion.div
                variants={itemV}
                style={{
                  fontFamily: "'Caveat',cursive",
                  fontWeight: 600,
                  fontSize: 42,
                  lineHeight: 1,
                  color: "var(--accent)",
                }}
              >
                So…
              </motion.div>
              <motion.div
                variants={itemV}
                style={{
                  marginTop: 14,
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: 30,
                  lineHeight: 1.3,
                  color: "var(--ink)",
                  maxWidth: 300,
                }}
              >
                Coffee? Before I overthink this any more?
              </motion.div>
              <motion.div
                variants={itemV}
                style={{
                  marginTop: 36,
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                }}
              >
                <MagneticButton
                  onClick={() => go("ending")}
                  style={PRIMARY_BTN}
                  sheenOpacity={0.55}
                >
                  Yes&nbsp;❤️
                </MagneticButton>
                <MagneticButton
                  onClick={() => {
                    buzz(8);
                    setConvince(true);
                  }}
                  hidden={convince}
                  style={SECONDARY_BTN}
                  sheenOpacity={0.45}
                >
                  Convince me&nbsp;😏
                </MagneticButton>
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {convince && (
                <motion.div
                  key="convince"
                  variants={groupV(0.25, 0.78)}
                  initial="hidden"
                  animate="show"
                  style={{
                    marginTop: 26,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                    maxWidth: 330,
                  }}
                >
                  <motion.div
                    variants={itemV}
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontStyle: "italic",
                      fontSize: 21,
                      lineHeight: 1.3,
                      color: "var(--ink)",
                    }}
                  >
                    I'm funnier in person. Allegedly.
                  </motion.div>
                  <motion.div
                    variants={itemV}
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontStyle: "italic",
                      fontSize: 21,
                      lineHeight: 1.3,
                      color: "var(--ink)",
                    }}
                  >
                    I already did the hard part — look at this thing.
                  </motion.div>
                  <motion.div
                    variants={itemV}
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontStyle: "italic",
                      fontSize: 21,
                      lineHeight: 1.3,
                      color: "var(--ink)",
                    }}
                  >
                    Worst case: free coffee and a story.
                  </motion.div>
                  <motion.div
                    variants={itemV}
                    style={{
                      marginTop: 4,
                      fontFamily: "'Caveat',cursive",
                      fontWeight: 600,
                      fontSize: 34,
                      lineHeight: 1,
                      color: "var(--accent)",
                    }}
                  >
                    So… we good?
                  </motion.div>
                  <motion.div
                    variants={itemV}
                    style={{
                      marginTop: 8,
                      fontFamily: "'Cormorant Garamond',serif",
                      fontStyle: "italic",
                      fontSize: 16,
                      lineHeight: 1.4,
                      color: "var(--soft)",
                    }}
                  >
                    or, if coffee's too on-the-nose —
                  </motion.div>
                  <motion.div
                    variants={itemV}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <MagneticButton
                      onClick={() => go("ending")}
                      style={CHIP_BTN}
                      sheenOpacity={0.45}
                    >
                      🏺&nbsp;Pottery
                    </MagneticButton>
                    <MagneticButton
                      onClick={() => go("ending")}
                      style={CHIP_BTN}
                      sheenOpacity={0.45}
                    >
                      🤸&nbsp;Trampoline&nbsp;park
                    </MagneticButton>
                    <MagneticButton
                      onClick={() => go("ending")}
                      style={CHIP_BTN}
                      sheenOpacity={0.45}
                    >
                      ✨&nbsp;Dealer's&nbsp;choice
                    </MagneticButton>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {scene === "ending" && (
          <motion.div
            key="ending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.0 } }}
            style={{ position: "absolute", inset: 0 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.2, delay: 0.1 }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(120% 100% at 50% 42%, rgba(255,228,168,.55) 0%, rgba(247,219,178,.16) 45%, transparent 76%)",
                pointerEvents: "none",
              }}
            />
            <PetalField petals={falling} />
            <div style={{ ...sceneWrap, pointerEvents: "none" }}>
              <Heart />
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.6, delay: 1.55, ease: EASE }}
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: 38,
                  lineHeight: 1.2,
                  color: "var(--ink)",
                }}
              >
                Knew you had taste.
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
