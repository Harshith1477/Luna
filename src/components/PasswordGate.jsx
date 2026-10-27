import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import StickerCat from './StickerCat';
import { RECIPIENT_NAME } from '../config/content';

/* ══════════════════════════════════════════════════════════════
   CRYPTO HELPERS
   Password = "3" OR "1+1=3" (spaces stripped, lowercase)
   Evaluated strictly via SHA-256 hashes — never plaintext in code.
══════════════════════════════════════════════════════════════ */
async function sha256(text) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
const normalize = s => s.toLowerCase().replace(/\s+/g, '');

const VALID_HASHES = new Set([
  '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce', // "3"
  'd66b955be288e70a1ecaf87eb61aa60995f02e321fe230c5cadbdda3e5ca861d', // "1+1=3"
]);

/* ══════════════════════════════════════════════════════════════
   DIALOGUE & HINT (Using RECIPIENT_NAME = Kaouther)
══════════════════════════════════════════════════════════════ */
const DIALOGUE = {
  mochi: [
    `Mrow! Hello, stranger! 🐾`,
    `You want to know the secret? Hmmm~`,
    `Only someone who loves ${RECIPIENT_NAME} can enter this room…`,
    `Think: what does 1 + 1 equal in the language of love? 💕`,
    `The answer is THREE! Two hearts make a family! ✨`,
  ],
  biscuit: [
    `*meows softly* Bonjour, intruder.`,
    `I see you're attempting to breach ${RECIPIENT_NAME}'s perimeter.`,
    `The answer lies in… unconventional arithmetic. 💜`,
    `Two becomes one, and somehow, there are three.`,
    `Today is ${RECIPIENT_NAME}'s special day! Think: what does 1 + 1 equal HERE? 🐾`,
  ],
};

// Hint text left exactly as instructed
const HINT_MSG = "HINT: Luna's law";

/* ══════════════════════════════════════════════════════════════
   REPLY SANITIZER (Cat sounds as small italic 'mrrp' tag)
══════════════════════════════════════════════════════════════ */
export function sanitizeCatReply(text) {
  if (!text) return '';
  // Strip asterisk actions like *purrs* or *meows* and replace with small italic mrrp tag
  let sanitized = text.replace(/\*[^*]+\*/g, '<span style="font-style:italic;color:#D6174A;font-weight:600;">mrrp</span>');
  // Extra safety: sanitize any accidental plaintext password leakage
  sanitized = sanitized.replace(/\b(1\+1=3|3|three)\b/gi, '***');
  return sanitized;
}

/* ══════════════════════════════════════════════════════════════
   LAYOUT CONSTANTS:
   Horizon at 62% of viewport height.
   Wall = top 62%. Floor = bottom 38%.
   Floor bounds for cats: Y: 66% -> 90%, X: 8% -> 92%.
══════════════════════════════════════════════════════════════ */
const FLOOR_BOUNDS = {
  yMin: 66,
  yMax: 90,
  xMin: 8,
  xMax: 92,
};

function getDepthScale(y) {
  const t = Math.max(0, Math.min(1, (y - FLOOR_BOUNDS.yMin) / (FLOOR_BOUNDS.yMax - FLOOR_BOUNDS.yMin)));
  // Depth scale from 0.65 at horizon to 1.35 at bottom of floor
  return 0.65 + t * (1.35 - 0.65);
}

function getDepthZIndex(y) {
  return Math.round(50 + y * 0.5);
}

/* ══════════════════════════════════════════════════════════════
   CUSTOM SVG LOCK (Crimson / Plum with White Highlight)
══════════════════════════════════════════════════════════════ */
function CustomLockIcon({ isUnlocking }) {
  return (
    <motion.svg
      width="46"
      height="50"
      viewBox="0 0 46 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={isUnlocking ? { rotate: [0, -14, 14, -8, 0], scale: [1, 1.25, 1] } : {}}
      transition={{ duration: 0.65 }}
      style={{ display: 'inline-block', marginBottom: 4 }}
      aria-hidden="true"
    >
      {/* Shackle */}
      <motion.path
        d="M 13,22 V 14 C 13,8 17.5,3.5 23,3.5 C 28.5,3.5 33,8 33,14 V 22"
        stroke="#2B1A3D"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        animate={isUnlocking ? { y: -6, rotate: -20, transformOrigin: '13px 14px' } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.4 }}
      />
      {/* Padlock Body */}
      <rect
        x="6"
        y="20"
        width="34"
        height="27"
        rx="9"
        fill="#D6174A"
        stroke="#2B1A3D"
        strokeWidth="4"
      />
      {/* Gloss Highlight */}
      <path
        d="M 12,24 H 34"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Keyhole */}
      <circle cx="23" cy="31" r="3.2" fill="#2B1A3D" />
      <polygon points="21,32 25,32 25.8,39 20.2,39" fill="#2B1A3D" />
    </motion.svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   ENLARGED WINDOW WITH SOFT SUNLIGHT BEAM & DUST PARTICLES
══════════════════════════════════════════════════════════════ */
function RoomWindow() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '5%',
        left: 'max(4%, 3vw)',
        width: 'clamp(85px, 12vw, 126px)',
        height: 'clamp(115px, 16vh, 164px)',
        pointerEvents: 'none',
        zIndex: 4,
      }}
    >
      {/* Wooden curtain rod */}
      <div
        style={{
          position: 'absolute',
          top: -8,
          left: -14,
          right: -14,
          height: 6,
          background: 'var(--gate-window-frame, #F0E0D6)',
          borderRadius: 3,
          boxShadow: '0 2px 6px rgba(43,26,61,0.08)',
        }}
      />
      {/* Left Curtain */}
      <div
        style={{
          position: 'absolute',
          top: -5,
          left: -12,
          width: 'clamp(16px, 2.5vw, 24px)',
          height: '95%',
          background: 'linear-gradient(90deg, #F9D2E2 0%, #F5B8D0 60%, #EFC2D6 100%)',
          borderRadius: '0 0 10px 0',
          opacity: 0.92,
          boxShadow: '2px 4px 10px rgba(180,120,150,0.18)',
        }}
      />
      {/* Right Curtain */}
      <div
        style={{
          position: 'absolute',
          top: -5,
          right: -12,
          width: 'clamp(16px, 2.5vw, 24px)',
          height: '95%',
          background: 'linear-gradient(270deg, #F9D2E2 0%, #F5B8D0 60%, #EFC2D6 100%)',
          borderRadius: '0 0 0 10px',
          opacity: 0.92,
          boxShadow: '-2px 4px 10px rgba(180,120,150,0.18)',
        }}
      />
      {/* Glass Pane */}
      <div
        style={{
          width: '100%',
          height: '100%',
          border: '3.5px solid var(--gate-window-frame, #F0E0D6)',
          borderRadius: '12px 12px 6px 6px',
          background: 'linear-gradient(175deg, #FFE9B8 0%, #FFDF99 45%, #FFD180 100%)',
          boxShadow: '0 0 32px 12px rgba(255,233,184,0.36), inset 0 0 20px rgba(255,245,210,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2.5, background: 'var(--gate-window-frame, #F0E0D6)', transform: 'translateY(-50%)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2.5, background: 'var(--gate-window-frame, #F0E0D6)', transform: 'translateX(-50%)' }} />
        {/* Soft pulse glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 35%, rgba(255,255,225,0.65) 0%, transparent 70%)',
            animation: 'gatePulseGlow 3.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Enlarged Soft Sunlight Beam falling diagonally onto floor */}
      <div
        style={{
          position: 'absolute',
          top: '75%',
          left: '15%',
          width: 'clamp(200px, 30vw, 340px)',
          height: 'clamp(180px, 28vh, 310px)',
          background: 'linear-gradient(135deg, rgba(255,233,184,0.35) 0%, rgba(255,233,184,0.10) 55%, transparent 100%)',
          clipPath: 'polygon(10% 0%, 55% 0%, 100% 100%, 0% 100%)',
          transformOrigin: 'top left',
          animation: 'gateBeamShimmer 8s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {/* Animated dust motes in sunbeam */}
        {[
          { x: '25%', y: '25%', d: '0s', s: 3 },
          { x: '45%', y: '45%', d: '1.2s', s: 2.5 },
          { x: '65%', y: '20%', d: '2.5s', s: 3.2 },
          { x: '35%', y: '65%', d: '3.8s', s: 2 },
          { x: '55%', y: '75%', d: '0.6s', s: 2.8 },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: m.x,
              top: m.y,
              width: m.s,
              height: m.s,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 0 5px rgba(255,245,200,0.8)',
              animation: 'gateMoteFloat 5.5s ease-in-out infinite',
              animationDelay: m.d,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BOOKSHELF ANCHORED TO A FLOOR CABINET (Baseboard at 62%)
══════════════════════════════════════════════════════════════ */
function RoomShelfAndCabinet() {
  const books = [
    { c: '#D6174A', h: 44 },
    { c: '#4338CA', h: 38 },
    { c: '#F59E0B', h: 50 },
    { c: '#9333EA', h: 42 },
    { c: '#10B981', h: 34 },
    { c: '#EC4899', h: 46 },
  ];
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 'calc(62% - 78px)',
        right: 'max(4%, 3vw)',
        width: 'clamp(72px, 9vw, 92px)',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {/* Books row */}
      <div style={{ position: 'relative', height: 52, display: 'flex', alignItems: 'flex-end', gap: 2, padding: '0 3px' }}>
        {books.map((b, i) => (
          <div
            key={i}
            style={{
              width: '14%',
              height: b.h,
              background: b.c,
              borderRadius: '2px 2px 0 0',
              opacity: 0.88,
              flexShrink: 0,
            }}
          />
        ))}
        {/* Potted plant on bookshelf edge */}
        <div style={{ position: 'absolute', left: -12, bottom: 4, fontSize: 16, lineHeight: 1 }}>🪴</div>
      </div>

      {/* Bookshelf wooden shelf board */}
      <div
        style={{
          height: 7,
          background: '#C4A282',
          borderRadius: '3px 3px 0 0',
          boxShadow: '0 3px 8px rgba(120,70,50,0.18)',
        }}
      />

      {/* Grounded Floor Cabinet sitting on baseboard/floor line */}
      <div
        style={{
          height: 48,
          background: 'linear-gradient(180deg, #E2CDBC 0%, #D4BCAB 100%)',
          borderRadius: '0 0 4px 4px',
          border: '1.5px solid #BA9E89',
          borderTop: 'none',
          boxShadow: '0 6px 14px rgba(43,26,61,0.12)',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 4px',
        }}
      >
        <div style={{ width: '42%', height: '78%', border: '1px solid rgba(130,90,60,0.25)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 3 }}>
          <div style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: '#7A5C45' }} />
        </div>
        <div style={{ width: '42%', height: '78%', border: '1px solid rgba(130,90,60,0.25)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 3 }}>
          <div style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: '#7A5C45' }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SPEECH BUBBLE COMPONENT
══════════════════════════════════════════════════════════════ */
function SpeechBubble({ text, side = 'left' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.75, y: 10 }}
      transition={{ type: 'spring', damping: 20, stiffness: 240 }}
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 14px)',
        left: side === 'right' ? 'auto' : '-20px',
        right: side === 'right' ? '-20px' : 'auto',
        minWidth: 170,
        maxWidth: 240,
        background: 'rgba(255, 253, 252, 0.98)',
        borderRadius: 16,
        padding: '11px 15px',
        fontSize: 13.5,
        fontFamily: "'Quicksand', sans-serif",
        color: '#2B1A3D',
        fontWeight: 600,
        lineHeight: 1.5,
        whiteSpace: 'pre-line',
        boxShadow: '0 8px 26px rgba(43,26,61,0.16), 0 0 0 2px rgba(214,23,74,0.12)',
        zIndex: 240,
        pointerEvents: 'none',
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: sanitizeCatReply(text) }} />
      {/* Speech pointer tail */}
      <div
        style={{
          position: 'absolute',
          bottom: -8,
          left: side === 'right' ? 'auto' : 32,
          right: side === 'right' ? 32 : 'auto',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(255, 253, 252, 0.98)',
        }}
      />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FLOATING [E] BADGE
══════════════════════════════════════════════════════════════ */
function FloatingEBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 4 }}
      transition={{ duration: 0.22 }}
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 10px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#2B1A3D',
        color: '#FFFFFF',
        borderRadius: 8,
        padding: '3px 8px',
        fontSize: 11,
        fontFamily: "'Quicksand', sans-serif",
        fontWeight: 800,
        letterSpacing: '0.04em',
        boxShadow: '0 4px 12px rgba(0,0,0,0.22)',
        zIndex: 230,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <span>[E]</span>
      <span style={{ fontSize: 9.5, opacity: 0.85 }}>chat</span>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PASSWORD GATE COMPONENT
══════════════════════════════════════════════════════════════ */
export default function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | checking | error | unlocking
  const [chatState, setChatState] = useState({ cat: null, msgIdx: 0 });
  const [hintShown, setHintShown] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [blink, setBlink] = useState({ mochi: false, biscuit: false });
  const [talkFrame, setTalkFrame] = useState(0);

  // Debug overlay flag (?debug=1)
  const isDebug = typeof window !== 'undefined' && window.location.search.includes('debug=1');

  // Cat State Engines (Position X, Y in %, pose, facing, walkFrame)
  const [catPos, setCatPos] = useState({
    mochi: { x: 22, y: 74 },
    biscuit: { x: 76, y: 78 },
  });
  const [catFacing, setCatFacing] = useState({ mochi: 1, biscuit: -1 });
  const [catPose, setCatPose] = useState({ mochi: 'walk', biscuit: 'walk' });
  const [catWalkFrame, setCatWalkFrame] = useState({ mochi: 0, biscuit: 0 });
  const [mouseNear, setMouseNear] = useState({ mochi: false, biscuit: false });
  const [meetingBubble, setMeetingBubble] = useState(false);

  // Refs for animation and coordination
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const isRoamingRef = useRef({ mochi: true, biscuit: true });
  const isTalkingRef = useRef({ mochi: false, biscuit: false });
  const currentPosRef = useRef({
    mochi: { x: 22, y: 74 },
    biscuit: { x: 76, y: 78 },
  });
  const targetPosRef = useRef({
    mochi: { x: 35, y: 75 },
    biscuit: { x: 65, y: 75 },
  });
  const tweenRef = useRef({ mochi: null, biscuit: null });

  // 2-minute timed hint from URL or default 120s
  const hintDelay = (() => {
    const p = new URLSearchParams(window.location.search).get('hint');
    return p ? Math.max(2, parseInt(p, 10)) * 1000 : 120_000;
  })();

  /* ── Random Blinking ── */
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.4) {
        setBlink(b => ({ ...b, mochi: true }));
        setTimeout(() => setBlink(b => ({ ...b, mochi: false })), 140);
      }
      if (Math.random() > 0.4) {
        setBlink(b => ({ ...b, biscuit: true }));
        setTimeout(() => setBlink(b => ({ ...b, biscuit: false })), 140);
      }
    }, 3200);
    return () => clearInterval(id);
  }, []);

  /* ── Talk Cadence (mouth open/close synced to chat) ── */
  useEffect(() => {
    if (!chatState.cat && !hintShown) return;
    const interval = setInterval(() => {
      setTalkFrame(f => (f + 1) % 4);
    }, 180);
    return () => clearInterval(interval);
  }, [chatState.cat, hintShown]);

  /* ── 2D Waypoint-Based Bezier Roaming Engine ── */
  const pickTargetWaypoint = useCallback((catKey) => {
    const otherCat = catKey === 'mochi' ? 'biscuit' : 'mochi';
    const otherPos = currentPosRef.current[otherCat];

    let targetX, targetY;
    let attempts = 0;

    // Biased target zones on the floor (Y: 66% -> 90%):
    // 35% near rug (center 42-58% X, 74-84% Y)
    // 30% near window light beam (left 16-35% X, 68-82% Y)
    // 20% near bookshelf cabinet (right 68-84% X, 68-80% Y)
    // 15% random floor
    do {
      attempts++;
      const rand = Math.random();
      if (rand < 0.35) {
        targetX = 40 + Math.random() * 20;
        targetY = 74 + Math.random() * 10;
      } else if (rand < 0.65) {
        targetX = 16 + Math.random() * 20;
        targetY = 68 + Math.random() * 14;
      } else if (rand < 0.85) {
        targetX = 66 + Math.random() * 20;
        targetY = 68 + Math.random() * 14;
      } else {
        targetX = FLOOR_BOUNDS.xMin + Math.random() * (FLOOR_BOUNDS.xMax - FLOOR_BOUNDS.xMin);
        targetY = FLOOR_BOUNDS.yMin + Math.random() * (FLOOR_BOUNDS.yMax - FLOOR_BOUNDS.yMin);
      }
    } while (
      attempts < 10 &&
      otherPos &&
      Math.hypot(targetX - otherPos.x, targetY - otherPos.y) < 16
    );

    targetPosRef.current[catKey] = { x: targetX, y: targetY };
    return { x: targetX, y: targetY };
  }, []);

  const walkAlongCurvedPath = useCallback((catKey, targetPt, onComplete) => {
    if (!isRoamingRef.current[catKey] || isTalkingRef.current[catKey]) return;

    const startPt = { ...currentPosRef.current[catKey] };
    const dx = targetPt.x - startPt.x;
    const dy = targetPt.y - startPt.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 2) {
      if (onComplete) onComplete();
      return;
    }

    // Perpendicular curve offset for Catmull-Rom / Bezier natural curve
    const len = dist || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const curveAmp = (Math.random() - 0.5) * 12;

    const p1x = Math.max(FLOOR_BOUNDS.xMin, Math.min(FLOOR_BOUNDS.xMax, (startPt.x + targetPt.x) / 2 + nx * curveAmp));
    const p1y = Math.max(FLOOR_BOUNDS.yMin, Math.min(FLOOR_BOUNDS.yMax, (startPt.y + targetPt.y) / 2 + ny * curveAmp));

    // Facing direction
    const goingRight = targetPt.x >= startPt.x;
    setCatFacing(f => ({ ...f, [catKey]: goingRight ? 1 : -1 }));
    setCatPose(p => ({ ...p, [catKey]: 'walk' }));

    // Depth-scaled speed: far cats take appropriate time
    const avgY = (startPt.y + targetPt.y) / 2;
    const scale = getDepthScale(avgY);
    const speed = 9.5; // % per second
    const duration = Math.max(2.4, dist / (speed * Math.max(0.65, scale)));

    const progress = { t: 0 };
    let frameTicker = 0;

    if (tweenRef.current[catKey]) {
      tweenRef.current[catKey].kill();
    }

    tweenRef.current[catKey] = gsap.to(progress, {
      t: 1,
      duration,
      ease: 'power1.inOut',
      onUpdate() {
        if (isTalkingRef.current[catKey]) {
          tweenRef.current[catKey]?.kill();
          return;
        }

        const t = progress.t;
        // Quadratic Bezier interpolation: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
        const curX = (1 - t) * (1 - t) * startPt.x + 2 * (1 - t) * t * p1x + t * t * targetPt.x;
        const curY = (1 - t) * (1 - t) * startPt.y + 2 * (1 - t) * t * p1y + t * t * targetPt.y;

        currentPosRef.current[catKey] = { x: curX, y: curY };
        setCatPos(pos => ({ ...pos, [catKey]: { x: curX, y: curY } }));

        // 4-frame walk cycle cadence
        frameTicker++;
        if (frameTicker % 6 === 0) {
          setCatWalkFrame(w => ({ ...w, [catKey]: (w[catKey] + 1) % 4 }));
        }
      },
      onComplete() {
        currentPosRef.current[catKey] = { ...targetPt };
        setCatPos(pos => ({ ...pos, [catKey]: { ...targetPt } }));

        // Pick pause pose: sit, groom, loaf, stretch, or hmm
        const pausePoses = ['sit', 'sit', 'groom', 'loaf', 'stretch', 'hmm'];
        const chosenPose = pausePoses[Math.floor(Math.random() * pausePoses.length)];
        setCatPose(p => ({ ...p, [catKey]: chosenPose }));

        // Stay in pause pose for 1.8s - 3.2s, then wander again
        const pauseDuration = 1.8 + Math.random() * 1.4;
        gsap.delayedCall(pauseDuration, () => {
          if (isRoamingRef.current[catKey] && !isTalkingRef.current[catKey]) {
            if (onComplete) onComplete();
          }
        });
      },
    });
  }, []);

  // Roam Loop
  const startRoamingCat = useCallback((catKey) => {
    const nextStep = () => {
      if (!isRoamingRef.current[catKey] || isTalkingRef.current[catKey]) return;
      const target = pickTargetWaypoint(catKey);
      walkAlongCurvedPath(catKey, target, nextStep);
    };
    nextStep();
  }, [pickTargetWaypoint, walkAlongCurvedPath]);

  useEffect(() => {
    startRoamingCat('mochi');
    startRoamingCat('biscuit');

    return () => {
      isRoamingRef.current = { mochi: false, biscuit: false };
      tweenRef.current.mochi?.kill();
      tweenRef.current.biscuit?.kill();
    };
  }, [startRoamingCat]);

  /* ── Periodic "Meeting" on Rug ── */
  useEffect(() => {
    const meetInterval = setInterval(() => {
      if (isTalkingRef.current.mochi || isTalkingRef.current.biscuit || hintShown) return;

      const meetPt = { x: 50, y: 78 };
      isRoamingRef.current.mochi = false;
      isRoamingRef.current.biscuit = false;

      walkAlongCurvedPath('mochi', { x: meetPt.x - 7, y: meetPt.y }, null);
      walkAlongCurvedPath('biscuit', { x: meetPt.x + 7, y: meetPt.y }, () => {
        setCatFacing({ mochi: 1, biscuit: -1 });
        setCatPose({ mochi: 'sit', biscuit: 'sit' });
        setMeetingBubble(true);

        setTimeout(() => {
          setMeetingBubble(false);
          setCatPose({ mochi: 'jump', biscuit: 'jump' });

          setTimeout(() => {
            isRoamingRef.current.mochi = true;
            isRoamingRef.current.biscuit = true;
            startRoamingCat('mochi');
            startRoamingCat('biscuit');
          }, 800);
        }, 2000);
      });
    }, 40_000);

    return () => clearInterval(meetInterval);
  }, [walkAlongCurvedPath, startRoamingCat, hintShown]);

  /* ── Cursor Proximity (Cats turn head & show [E] badge within ~160px) ── */
  useEffect(() => {
    const onMouseMove = (e) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mousePixelX = e.clientX;
      const mousePixelY = e.clientY;

      // Check Mochi
      const mPixelX = (currentPosRef.current.mochi.x / 100) * vw;
      const mPixelY = (currentPosRef.current.mochi.y / 100) * vh;
      const mDist = Math.hypot(mousePixelX - mPixelX, mousePixelY - mPixelY);

      // Check Biscuit
      const bPixelX = (currentPosRef.current.biscuit.x / 100) * vw;
      const bPixelY = (currentPosRef.current.biscuit.y / 100) * vh;
      const bDist = Math.hypot(mousePixelX - bPixelX, mousePixelY - bPixelY);

      setMouseNear({
        mochi: mDist < 160,
        biscuit: bDist < 160,
      });

      if (mDist < 160 && catPose.mochi !== 'walk') {
        setCatFacing(f => ({ ...f, mochi: mousePixelX > mPixelX ? 1 : -1 }));
      }
      if (bDist < 160 && catPose.biscuit !== 'walk') {
        setCatFacing(f => ({ ...f, biscuit: mousePixelX > bPixelX ? 1 : -1 }));
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [catPose]);

  /* ── Floor Click Interaction (One cat walks over to clicked spot!) ── */
  const handleFloorClick = useCallback((e) => {
    if (e.target.closest('#password-card') || e.target.closest('button') || e.target.closest('input')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp to floor area
    if (clickY < FLOOR_BOUNDS.yMin || clickY > FLOOR_BOUNDS.yMax) return;
    const targetX = Math.max(FLOOR_BOUNDS.xMin, Math.min(FLOOR_BOUNDS.xMax, clickX));
    const targetY = Math.max(FLOOR_BOUNDS.yMin, Math.min(FLOOR_BOUNDS.yMax, clickY));

    const mDist = Math.hypot(targetX - currentPosRef.current.mochi.x, targetY - currentPosRef.current.mochi.y);
    const bDist = Math.hypot(targetX - currentPosRef.current.biscuit.x, targetY - currentPosRef.current.biscuit.y);

    const chosenCat = (!isTalkingRef.current.mochi && (mDist <= bDist || isTalkingRef.current.biscuit)) ? 'mochi' : 'biscuit';
    if (isTalkingRef.current[chosenCat]) return;

    walkAlongCurvedPath(chosenCat, { x: targetX, y: targetY }, () => {
      startRoamingCat(chosenCat);
    });
  }, [walkAlongCurvedPath, startRoamingCat]);

  /* ── 2:00 Timed Hint Cat (Biscuit walks to front-center of floor) ── */
  useEffect(() => {
    const hintTimer = setTimeout(() => {
      if (status === 'unlocking') return;

      isTalkingRef.current.biscuit = true;
      isRoamingRef.current.biscuit = false;
      tweenRef.current.biscuit?.kill();

      // Biscuit walks along curved path to front center (X: 50%, Y: 84%)
      const hintDest = { x: 50, y: 84 };
      walkAlongCurvedPath('biscuit', hintDest, () => {
        setCatFacing(f => ({ ...f, biscuit: 1 }));
        setCatPose(p => ({ ...p, biscuit: 'talk' }));
        setHintShown(true);

        setTimeout(() => {
          setHintShown(false);
          setCatPose(p => ({ ...p, biscuit: 'hmm' }));
          isTalkingRef.current.biscuit = false;
          isRoamingRef.current.biscuit = true;
          startRoamingCat('biscuit');
        }, 9500);
      });
    }, hintDelay);

    return () => clearTimeout(hintTimer);
  }, [hintDelay, status, walkAlongCurvedPath, startRoamingCat]);

  /* ── Cat Talk & Click/Tap Handler ── */
  const startChatWithCat = useCallback((catKey) => {
    isTalkingRef.current[catKey] = true;
    tweenRef.current[catKey]?.kill();
    setCatPose(p => ({ ...p, [catKey]: 'talk' }));

    setChatState(prev => {
      if (prev.cat === catKey) {
        const next = prev.msgIdx + 1;
        if (next >= DIALOGUE[catKey].length) {
          isTalkingRef.current[catKey] = false;
          setCatPose(p => ({ ...p, [catKey]: 'sit' }));
          startRoamingCat(catKey);
          return { cat: null, msgIdx: 0 };
        }
        return { cat: catKey, msgIdx: next };
      }
      return { cat: catKey, msgIdx: 0 };
    });
  }, [startRoamingCat]);

  /* ── Keyboard <kbd>E</kbd> Handler ── */
  useEffect(() => {
    const onKey = (e) => {
      if (document.activeElement === inputRef.current) return;
      if (e.key !== 'e' && e.key !== 'E') return;

      const mDist = Math.hypot(currentPosRef.current.mochi.x - 50, currentPosRef.current.mochi.y - 75);
      const bDist = Math.hypot(currentPosRef.current.biscuit.x - 50, currentPosRef.current.biscuit.y - 75);

      const targetCat = mDist <= bDist ? 'mochi' : 'biscuit';
      startChatWithCat(targetCat);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [startChatWithCat]);

  /* ── Password Submission ── */
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    if (status !== 'idle' || !password.trim()) return;

    setStatus('checking');
    const hash = await sha256(normalize(password));

    if (VALID_HASHES.has(hash)) {
      setStatus('unlocking');
      sessionStorage.setItem('gate_unlocked', '1');

      // Both cats jump happily!
      setCatPose({ mochi: 'jump', biscuit: 'jump' });

      // Celebratory triple confetti burst
      const burst = (opts) => confetti({ ...opts, disableForReducedMotion: true });
      burst({ particleCount: 130, spread: 80, origin: { x: 0.5, y: 0.5 }, colors: ['#D6174A', '#F472B6', '#FBBF24', '#A855F7', '#FCEBE0'] });
      setTimeout(() => burst({ particleCount: 65, spread: 110, origin: { x: 0.28, y: 0.55 }, colors: ['#FB7185', '#F472B6', '#FDE68A'] }), 200);
      setTimeout(() => burst({ particleCount: 65, spread: 110, origin: { x: 0.72, y: 0.55 }, colors: ['#C4B5FD', '#818CF8', '#FDA4AF'] }), 350);

      // Smooth fade into the main cake scene
      setTimeout(() => onUnlock(), 2200);
    } else {
      setStatus('error');
      // Cats react startled/curious!
      setCatPose({ mochi: 'hmm', biscuit: 'hmm' });

      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { x: 0 },
          { x: 10, duration: 0.07, repeat: 5, yoyo: true, ease: 'power2.inOut', onComplete: () => {
            setStatus('idle');
            inputRef.current?.focus();
          }}
        );
      } else {
        setTimeout(() => {
          setStatus('idle');
          inputRef.current?.focus();
        }, 600);
      }
    }
  }, [password, status, onUnlock]);

  const isUnlocking = status === 'unlocking';

  // Cat 1.6x base size on desktop (170px), nicely proportioned on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const CAT_BASE_SIZE = isMobile ? 110 : 170;
  const mochiScale = getDepthScale(catPos.mochi.y);
  const mochiZ = getDepthZIndex(catPos.mochi.y);

  const biscuitScale = getDepthScale(catPos.biscuit.y);
  const biscuitZ = getDepthZIndex(catPos.biscuit.y);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      onClick={handleFloorClick}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100dvh',
        zIndex: 9999,
        background: '#EDE4F7',
        overflow: 'hidden',
        fontFamily: "'Quicksand', 'Outfit', sans-serif",
      }}
    >
      {/* ─── WALL: Top 62% of viewport (dusk-lavender to blush with subtle dots) ─── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '62%',
          background: 'linear-gradient(180deg, var(--gate-wall-top, #EDE4F7) 0%, var(--gate-wall-bottom, #F8E6EF) 100%)',
          backgroundImage: `
            radial-gradient(var(--gate-wall-pattern, rgba(120, 90, 160, 0.045)) 1.2px, transparent 1.2px)
          `,
          backgroundSize: '24px 24px',
          zIndex: 1,
        }}
      />

      {/* ─── BASEBOARD: Horizon at 62% (Translucent White with Lavender Rim Line) ─── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '62%',
          left: 0,
          right: 0,
          height: 18,
          background: 'var(--gate-baseboard-bg, rgba(255, 255, 255, 0.72))',
          borderTop: '1.5px solid var(--gate-baseboard-line, #D9C7E6)',
          boxShadow: '0 4px 12px var(--gate-baseboard-shadow, rgba(140, 110, 180, 0.12))',
          zIndex: 3,
        }}
      />

      {/* ─── FLOOR: Bottom 38% (Clean cream-peach to soft lilac wood with plank lines) ─── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 'calc(62% + 18px)',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, var(--gate-floor-top, #FAF2EE) 0%, #F4E8EE 50%, var(--gate-floor-bottom, #EDE2EA) 100%)',
          boxShadow: 'inset 0 6px 16px rgba(43, 26, 61, 0.05)',
          zIndex: 2,
        }}
      >
        {/* Perspective plank lines converging toward horizon */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.45, pointerEvents: 'none' }}>
          <line x1="10%" y1="0" x2="1%" y2="100%" stroke="var(--gate-floor-plank, rgba(180, 140, 175, 0.22))" strokeWidth="1.5" />
          <line x1="26%" y1="0" x2="20%" y2="100%" stroke="var(--gate-floor-plank, rgba(180, 140, 175, 0.22))" strokeWidth="1.5" />
          <line x1="42%" y1="0" x2="40%" y2="100%" stroke="var(--gate-floor-plank, rgba(180, 140, 175, 0.22))" strokeWidth="1.5" />
          <line x1="58%" y1="0" x2="60%" y2="100%" stroke="var(--gate-floor-plank, rgba(180, 140, 175, 0.22))" strokeWidth="1.5" />
          <line x1="74%" y1="0" x2="80%" y2="100%" stroke="var(--gate-floor-plank, rgba(180, 140, 175, 0.22))" strokeWidth="1.5" />
          <line x1="90%" y1="0" x2="99%" y2="100%" stroke="var(--gate-floor-plank, rgba(180, 140, 175, 0.22))" strokeWidth="1.5" />
        </svg>
      </div>

      {/* ─── DUSTY ROSE OVAL RUG (Centered on Floor) ─── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '80%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(72vw, 560px)',
          height: 'min(20vh, 115px)',
          background: 'radial-gradient(ellipse at center, var(--gate-rug, #E8B4C8) 0%, var(--gate-rug-deep, #D49BAF) 80%, rgba(180,120,150,0.85) 100%)',
          borderRadius: '50%',
          opacity: 0.9,
          boxShadow: '0 14px 34px var(--gate-rug-shadow, rgba(170, 110, 140, 0.24))',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        {/* Cream dashed inner ring */}
        <div
          style={{
            position: 'absolute',
            inset: '14%',
            borderRadius: '50%',
            border: '2px dashed var(--gate-rug-ring, rgba(255, 248, 250, 0.70))',
          }}
        />
      </div>

      {/* ─── ROOM DECOR: Enlarged Window + Anchored Bookshelf ─── */}
      <RoomWindow />
      <RoomShelfAndCabinet />

      {/* ─── PASSWORD CARD (Fully on Wall at Top 31%, Never overlaps floor) ─── */}
      <div
        id="password-card"
        style={{
          position: 'absolute',
          top: '31%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          width: 'calc(100% - 32px)',
          maxWidth: 440,
          boxSizing: 'border-box',
        }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'var(--gate-card-bg, rgba(255, 255, 255, 0.94))',
            backdropFilter: 'blur(22px)',
            borderRadius: 'clamp(20px, 4vw, 26px)',
            padding: 'clamp(18px, 4vw, 26px) clamp(16px, 4.5vw, 28px) clamp(16px, 3.5vw, 22px)',
            boxShadow: 'var(--gate-card-shadow, 0 16px 48px rgba(180, 160, 210, 0.24), 0 4px 12px rgba(43, 26, 61, 0.06))',
            border: '1px solid var(--gate-card-border, rgba(214, 23, 74, 0.12))',
            textAlign: 'center',
          }}
        >
          {/* Custom SVG Padlock */}
          <CustomLockIcon isUnlocking={isUnlocking} />

          {/* Heading with RECIPIENT_NAME (Kaouther) */}
          <h1
            style={{
              fontFamily: "'Abril Fatface', serif",
              fontSize: 'clamp(21px, 4.8vw, 26px)',
              color: 'var(--gate-text-plum, #2B1A3D)',
              margin: '0 0 3px',
              letterSpacing: '0.01em',
              lineHeight: 1.2,
            }}
          >
            A Secret for {RECIPIENT_NAME}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 18.5,
              color: 'var(--gate-accent-crimson, #D6174A)',
              margin: '0 0 16px',
              fontWeight: 600,
            }}
          >
            {isUnlocking ? `Welcome in, ${RECIPIENT_NAME}! 💕` : 'ask Fubu & Biscuit for a clue~'}
          </p>

          {/* Form */}
          <AnimatePresence>
            {!isUnlocking && (
              <motion.form
                ref={formRef}
                onSubmit={handleSubmit}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.24 } }}
                noValidate
              >
                <div style={{ marginBottom: 12 }}>
                  <input
                    ref={inputRef}
                    id="gate-password-input"
                    type="text"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Enter the secret password…"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    aria-label={`Secret password for ${RECIPIENT_NAME}`}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: status === 'error'
                        ? '2px solid #ef4444'
                        : inputFocused
                          ? '2px solid var(--gate-accent-crimson, #D6174A)'
                          : '1.5px solid rgba(214,23,74,0.24)',
                      background: inputFocused ? '#FFFFFF' : 'rgba(255,255,255,0.88)',
                      fontSize: 14.5,
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 600,
                      color: '#2B1A3D',
                      outline: 'none',
                      textAlign: 'center',
                      boxShadow: inputFocused ? '0 0 0 4px rgba(214,23,74,0.12)' : 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Submit button (brand crimson #D6174A with hover lift) */}
                <button
                  type="submit"
                  disabled={status === 'checking' || !password.trim()}
                  style={{
                    width: '100%',
                    padding: '12.5px 20px',
                    borderRadius: 14,
                    border: 'none',
                    background: 'linear-gradient(135deg, #D6174A 0%, #b80f3c 100%)',
                    color: '#ffffff',
                    fontSize: 14.5,
                    fontFamily: "'Outfit', 'Quicksand', sans-serif",
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    cursor: (!password.trim() || status === 'checking') ? 'default' : 'pointer',
                    opacity: (!password.trim() || status === 'checking') ? 0.6 : 1,
                    boxShadow: '0 6px 20px rgba(214,23,74,0.30)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={e => {
                    if (password.trim() && status === 'idle') {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 9px 24px rgba(214,23,74,0.42)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(214,23,74,0.30)';
                  }}
                >
                  {status === 'checking' ? 'Checking… ✨' : 'Unlock Birthday Surprise 🌸'}
                </button>

                {/* Helper text under Unlock button */}
                <p
                  style={{
                    margin: '10px 0 0',
                    fontSize: 12,
                    fontFamily: "'Quicksand', sans-serif",
                    color: '#6B5B6E',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                  }}
                >
                  Press E near a cat · tap on mobile
                </p>

                {/* Error feedback */}
                {status === 'error' && (
                  <p
                    style={{
                      margin: '8px 0 0',
                      fontSize: 12.5,
                      color: '#dc2626',
                      fontWeight: 700,
                    }}
                  >
                    Not quite! Ask Fubu & Biscuit roaming the room 🐾
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {/* Unlocking feedback */}
          {isUnlocking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: 14.5,
                color: 'var(--gate-accent-crimson, #D6174A)',
                fontWeight: 700,
                padding: '10px 0 4px',
              }}
            >
              Opening {RECIPIENT_NAME}'s birthday world… ✨
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ─── CAT 1: FUBU (warm orange/cream tabby) ─── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Chat with Fubu"
        onClick={(e) => {
          e.stopPropagation();
          startChatWithCat('mochi');
        }}
        onKeyDown={(e) => e.key === 'Enter' && startChatWithCat('mochi')}
        style={{
          position: 'absolute',
          left: `${catPos.mochi.x}%`,
          top: `${catPos.mochi.y}%`,
          transform: 'translate(-50%, -85%)',
          zIndex: mochiZ,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Soft oval contact shadow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${mochiScale * 96}px`,
            height: `${mochiScale * 18}px`,
            borderRadius: '50%',
            background: 'var(--gate-outline, #1E1B4B)',
            opacity: 0.16 + (catPos.mochi.y - FLOOR_BOUNDS.yMin) * 0.003,
            filter: 'blur(2px)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating [E] badge within ~160px */}
        <AnimatePresence>
          {mouseNear.mochi && chatState.cat !== 'mochi' && !isUnlocking && (
            <FloatingEBadge />
          )}
        </AnimatePresence>

        {/* Dialogue speech bubble */}
        <AnimatePresence>
          {chatState.cat === 'mochi' && !isUnlocking && (
            <SpeechBubble text={DIALOGUE.mochi[chatState.msgIdx]} side={catFacing.mochi === 1 ? 'right' : 'left'} />
          )}
        </AnimatePresence>

        {/* Meeting bubble */}
        <AnimatePresence>
          {meetingBubble && (
            <SpeechBubble text="mrrp? 🐾" side="right" />
          )}
        </AnimatePresence>

        {/* 1.6x Scaled Sticker Cat SVG */}
        <div
          style={{
            transform: `scaleX(${catFacing.mochi}) scale(${mochiScale})`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.15s ease-out',
            animation: catPose.mochi !== 'walk' ? 'catBreathing 4s ease-in-out infinite' : 'none',
          }}
        >
          <StickerCat
            cat="mochi"
            pose={catPose.mochi}
            walkFrame={catWalkFrame.mochi}
            blink={blink.mochi}
            talking={chatState.cat === 'mochi'}
            talkFrame={talkFrame}
            happy={isUnlocking}
            size={CAT_BASE_SIZE}
          />
        </div>
      </div>

      {/* ─── CAT 2: BISCUIT (periwinkle/indigo) ─── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Chat with Biscuit"
        onClick={(e) => {
          e.stopPropagation();
          startChatWithCat('biscuit');
        }}
        onKeyDown={(e) => e.key === 'Enter' && startChatWithCat('biscuit')}
        style={{
          position: 'absolute',
          left: `${catPos.biscuit.x}%`,
          top: `${catPos.biscuit.y}%`,
          transform: 'translate(-50%, -85%)',
          zIndex: biscuitZ,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Soft oval contact shadow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${biscuitScale * 96}px`,
            height: `${biscuitScale * 18}px`,
            borderRadius: '50%',
            background: 'var(--gate-outline, #1E1B4B)',
            opacity: 0.16 + (catPos.biscuit.y - FLOOR_BOUNDS.yMin) * 0.003,
            filter: 'blur(2px)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating [E] badge within ~160px */}
        <AnimatePresence>
          {mouseNear.biscuit && chatState.cat !== 'biscuit' && !hintShown && !isUnlocking && (
            <FloatingEBadge />
          )}
        </AnimatePresence>

        {/* Timed Hint Speech Bubble (HINT: Luna's law) */}
        <AnimatePresence>
          {hintShown && !isUnlocking && (
            <SpeechBubble text={HINT_MSG} side="left" />
          )}
        </AnimatePresence>

        {/* Dialogue speech bubble */}
        <AnimatePresence>
          {chatState.cat === 'biscuit' && !hintShown && !isUnlocking && (
            <SpeechBubble text={DIALOGUE.biscuit[chatState.msgIdx]} side={catFacing.biscuit === 1 ? 'right' : 'left'} />
          )}
        </AnimatePresence>

        {/* Meeting bubble */}
        <AnimatePresence>
          {meetingBubble && (
            <SpeechBubble text="mrrp? 💕" side="left" />
          )}
        </AnimatePresence>

        {/* 1.6x Scaled Sticker Cat SVG */}
        <div
          style={{
            transform: `scaleX(${catFacing.biscuit}) scale(${biscuitScale})`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.15s ease-out',
            animation: catPose.biscuit !== 'walk' ? 'catBreathing 4s ease-in-out infinite' : 'none',
          }}
        >
          <StickerCat
            cat="biscuit"
            pose={catPose.biscuit}
            walkFrame={catWalkFrame.biscuit}
            blink={blink.biscuit}
            talking={chatState.cat === 'biscuit' || hintShown}
            talkFrame={talkFrame}
            happy={isUnlocking}
            size={CAT_BASE_SIZE}
          />
        </div>
      </div>

      {/* ─── DEBUG OVERLAY (?debug=1) ─── */}
      {isDebug && (
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {/* Floor boundary rect */}
          <rect
            x={`${FLOOR_BOUNDS.xMin}%`}
            y={`${FLOOR_BOUNDS.yMin}%`}
            width={`${FLOOR_BOUNDS.xMax - FLOOR_BOUNDS.xMin}%`}
            height={`${FLOOR_BOUNDS.yMax - FLOOR_BOUNDS.yMin}%`}
            fill="rgba(56, 189, 248, 0.08)"
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <text x="9%" y="68%" fill="#0284c7" fontSize="11" fontWeight="bold">Floor Roam Area (66% - 90%)</text>

          {/* Mochi waypoint line & marker */}
          <line
            x1={`${catPos.mochi.x}%`}
            y1={`${catPos.mochi.y}%`}
            x2={`${targetPosRef.current.mochi.x}%`}
            y2={`${targetPosRef.current.mochi.y}%`}
            stroke="#EA580C"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <circle cx={`${targetPosRef.current.mochi.x}%`} cy={`${targetPosRef.current.mochi.y}%`} r="6" fill="#EA580C" />
          <text x={`${targetPosRef.current.mochi.x + 1}%`} y={`${targetPosRef.current.mochi.y}%`} fill="#EA580C" fontSize="10" fontWeight="bold">Mochi Dest</text>

          {/* Biscuit waypoint line & marker */}
          <line
            x1={`${catPos.biscuit.x}%`}
            y1={`${catPos.biscuit.y}%`}
            x2={`${targetPosRef.current.biscuit.x}%`}
            y2={`${targetPosRef.current.biscuit.y}%`}
            stroke="#4338CA"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <circle cx={`${targetPosRef.current.biscuit.x}%`} cy={`${targetPosRef.current.biscuit.y}%`} r="6" fill="#4338CA" />
          <text x={`${targetPosRef.current.biscuit.x + 1}%`} y={`${targetPosRef.current.biscuit.y}%`} fill="#4338CA" fontSize="10" fontWeight="bold">Biscuit Dest</text>

          {/* HUD Info */}
          <rect x="12" y="12" width="220" height="74" rx="8" fill="rgba(0,0,0,0.75)" />
          <text x="20" y="32" fill="#38bdf8" fontSize="11" fontWeight="bold">DEBUG MODE (?debug=1)</text>
          <text x="20" y="50" fill="#ffffff" fontSize="10">Mochi: ({catPos.mochi.x.toFixed(1)}%, {catPos.mochi.y.toFixed(1)}%) [{catPose.mochi}]</text>
          <text x="20" y="66" fill="#ffffff" fontSize="10">Biscuit: ({catPos.biscuit.x.toFixed(1)}%, {catPos.biscuit.y.toFixed(1)}%) [{catPose.biscuit}]</text>
        </svg>
      )}

      {/* ─── UNLOCK TRANSITION BLUSH OVERLAY ─── */}
      <AnimatePresence>
        {isUnlocking && (
          <motion.div
            key="unlock-fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.75, duration: 0.55 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'var(--gate-transition-blush, #FCEBE0)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
