import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BALLOON_POP_CONFIG } from '../config/balloonPopConfig';
import StickerCat from './StickerCat';

// ── Rigging constants ──────────────────────────────────────────────
const POP_SHOT_MIN    = 6;   // earliest shot a balloon can pop
const POP_SHOT_MAX    = 7;   // shot by which it definitely pops
const BALLOON_W       = 88;
const BALLOON_H       = 130;
const DODGE_DISTANCE  = 180; // px the balloon jumps when it dodges
const BULLET_SPEED_MS = 230;

// ── Audio ──────────────────────────────────────────────────────────
function playGunshot(isMuted) {
  if (isMuted) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.45, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    src.connect(g); g.connect(ctx.destination);
    src.start(now); src.stop(now + 0.13);
  } catch {}
}

function playSynthPop(isMuted) {
  if (isMuted) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(460, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.09);
  } catch {}
}

// ── Balloon SVG ────────────────────────────────────────────────────
function BalloonSVG({ theme }) {
  return (
    <svg
      width={BALLOON_W}
      height={BALLOON_H}
      viewBox="0 0 100 148"
      style={{ overflow: 'visible', filter: 'drop-shadow(0 14px 22px rgba(43,26,61,0.18))', display: 'block' }}
    >
      <defs>
        <radialGradient id={`bgrad-${theme.id}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor={theme.gradient[0]} />
          <stop offset="60%"  stopColor={theme.gradient[1]} />
          <stop offset="100%" stopColor={theme.gradient[2]} />
        </radialGradient>
        <linearGradient id={`kgrad-${theme.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={theme.gradient[1]} />
          <stop offset="100%" stopColor={theme.knotColor} />
        </linearGradient>
      </defs>
      <path d="M 50 8 C 22 8, 8 32, 8 62 C 8 92, 34 108, 47 112 L 45 116 L 55 116 L 53 112 C 66 108, 92 92, 92 62 C 92 32, 78 8, 50 8 Z" fill={`url(#bgrad-${theme.id})`} />
      <path d="M 28 24 C 20 36, 18 54, 22 68 C 21 54, 25 36, 36 28 C 33 26, 30 25, 28 24 Z" fill="rgba(255,255,255,0.65)" />
      <ellipse cx="32" cy="26" rx="5" ry="9" transform="rotate(-30 32 26)" fill="rgba(255,255,255,0.55)" />
      <polygon points="46,116 54,116 50,121" fill={`url(#kgrad-${theme.id})`} />
      <path d="M 50 121 Q 42 129 52 137 T 48 147" fill="none" stroke="rgba(100,80,110,0.45)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ── Gun SVG (horizontal, rotated via parent) ───────────────────────
function GunSVG({ recoil }) {
  return (
    <svg
      width="90" height="46" viewBox="0 0 90 46"
      style={{ display: 'block', transform: recoil ? 'translateX(-8px)' : 'translateX(0)', transition: 'transform 0.1s ease', filter: 'drop-shadow(0 6px 14px rgba(43,26,61,0.35))' }}
    >
      {/* barrel */}
      <rect x="32" y="18" width="54" height="10" rx="3" fill="#4A3B55" />
      {/* body */}
      <rect x="10" y="14" width="38" height="18" rx="5" fill="#6B5B6E" />
      {/* grip */}
      <rect x="16" y="32" width="20" height="13" rx="4" fill="#4A3B55" />
      {/* guard */}
      <path d="M 28 32 Q 36 40 44 32" stroke="#4A3B55" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* trigger */}
      <line x1="35" y1="26" x2="32" y2="36" stroke="#9B82AB" strokeWidth="2.5" strokeLinecap="round" />
      {/* muzzle detail */}
      <rect x="83" y="20" width="5" height="6" rx="2" fill="#C4B0D0" opacity="0.6" />
    </svg>
  );
}

// ── Pop burst particles ────────────────────────────────────────────
function PopBurst({ x, y, color }) {
  const pieces = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * Math.PI * 2,
    dist:  45 + Math.random() * 40,
  }));
  return (
    <>
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          initial={{ left: x, top: y, opacity: 1, scale: 1 }}
          animate={{ left: x + Math.cos(p.angle) * p.dist, top: y + Math.sin(p.angle) * p.dist, opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{ position: 'fixed', width: 12, height: 12, borderRadius: '50%', background: color, pointerEvents: 'none', zIndex: 200, transform: 'translate(-50%,-50%)' }}
        />
      ))}
    </>
  );
}

// ── Main Scene ─────────────────────────────────────────────────────
export default function BalloonPopScene({ onComplete, isMuted = false }) {
  const { header, balloonThemes, catLines, idleTimeoutMs } = BALLOON_POP_CONFIG;

  // Gun state
  const [gunAngle, setGunAngle] = useState(-Math.PI / 4);
  const gunAngleRef = useRef(-Math.PI / 4);
  const gunPosRef   = useRef({ x: 120, y: 500 });
  const [gunPosState, setGunPosState] = useState({ x: 120, y: 500 });
  const [recoil, setRecoil] = useState(false);

  // Balloon state
  const initBalloons = () =>
    balloonThemes.map((theme, idx) => ({
      id: theme.id, theme, idx,
      x: 18 + idx * 22, y: 24 + (idx % 2) * 14,
      driftSeed: idx, driftX: 0, driftY: 0,
      shots: 0, popped: false, dodging: false,
    }));

  const [balloons, setBalloons] = useState(initBalloons);
  const balloonsRef = useRef(balloons);
  useEffect(() => { balloonsRef.current = balloons; }, [balloons]);

  // FX state
  const [popBursts, setPopBursts] = useState([]);
  const [bullets, setBullets]     = useState([]);
  const bulletId = useRef(0);

  // Word slots
  const [slottedWords, setSlottedWords] = useState({});
  const slottedCountRef = useRef(0);
  const [flyingWord, setFlyingWord] = useState(null);
  const slotRefs = useRef([]);

  // Cat
  const [catSpeech, setCatSpeech] = useState('');
  const [catPose, setCatPose]     = useState('sit');
  const catTimerRef  = useRef(null);
  const idleTimerRef = useRef(null);

  // Completion
  const [isCompleted, setIsCompleted]         = useState(false);
  const isCompletedRef                        = useRef(false);
  const [showContinueBtn, setShowContinueBtn] = useState(false);

  const poppedCount = balloons.filter(b => b.popped).length;

  // Cat speech helper
  const showCatSpeech = useCallback((line, pose = 'talk', duration = 3000) => {
    clearTimeout(catTimerRef.current);
    setCatSpeech(line); setCatPose(pose);
    catTimerRef.current = setTimeout(() => { setCatSpeech(''); setCatPose('sit'); }, duration);
  }, []);

  // Idle timer
  useEffect(() => {
    clearTimeout(idleTimerRef.current);
    if (poppedCount < balloonThemes.length && !isCompletedRef.current) {
      idleTimerRef.current = setTimeout(() => showCatSpeech(catLines.idle, 'talk'), idleTimeoutMs);
    }
    return () => { clearTimeout(idleTimerRef.current); clearTimeout(catTimerRef.current); };
  }, [poppedCount]);

  // Gun position (bottom-left)
  useEffect(() => {
    const update = () => {
      const pos = { x: 110, y: window.innerHeight - 68 };
      gunPosRef.current = pos;
      setGunPosState({ ...pos });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Aim gun toward cursor / touch
  useEffect(() => {
    const handle = (e) => {
      const { clientX, clientY } = e.touches ? e.touches[0] : e;
      const dx = clientX - gunPosRef.current.x;
      const dy = clientY - gunPosRef.current.y;
      const a  = Math.atan2(dy, dx);
      gunAngleRef.current = a;
      setGunAngle(a);
    };
    window.addEventListener('mousemove', handle);
    window.addEventListener('touchmove', handle, { passive: true });
    return () => { window.removeEventListener('mousemove', handle); window.removeEventListener('touchmove', handle); };
  }, []);

  // Drift animation loop
  useEffect(() => {
    let frame;
    const start = Date.now();
    const tick = () => {
      const t = (Date.now() - start) / 1000;
      setBalloons(prev => prev.map(b => {
        if (b.popped || b.dodging) return b;
        return {
          ...b,
          driftX: Math.sin(t * (0.4 + b.driftSeed * 0.13) + b.driftSeed) * 6,
          driftY: Math.sin(t * (0.3 + b.driftSeed * 0.1)  + b.driftSeed * 1.3) * 7,
        };
      }));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // All popped
  const handleAllPopped = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setIsCompleted(true);
    clearTimeout(idleTimerRef.current);
    setCatPose('jump');
    showCatSpeech(catLines.complete, 'jump', 6000);
    setTimeout(() => {
      try {
        confetti({ particleCount: 100, spread: 85, origin: { x: 0.5, y: 0.5 }, colors: ['#F472B6','#C084FC','#34D399','#FBBF24','#FFFFFF'], disableForReducedMotion: true });
      } catch {}
    }, 200);
    setTimeout(() => setShowContinueBtn(true), 2000);
  }, [showCatSpeech, catLines.complete]);

  // Shoot handler
  const handleShoot = useCallback((e) => {
    if (isCompletedRef.current) return;
    e.preventDefault();

    playGunshot(isMuted);
    setRecoil(true);
    setTimeout(() => setRecoil(false), 140);

    const gunPos = gunPosRef.current;
    const angle  = gunAngleRef.current;
    const cur    = balloonsRef.current;

    const muzzleX = gunPos.x + Math.cos(angle) * 90;
    const muzzleY = gunPos.y + Math.sin(angle) * 90;

    // Find balloon on aim ray
    let aimed = null;
    let bestDist = Infinity;
    cur.forEach(b => {
      if (b.popped) return;
      const bx = (b.x / 100) * window.innerWidth  + (b.driftX || 0);
      const by = (b.y / 100) * window.innerHeight + (b.driftY || 0);
      const dx = bx - gunPos.x;
      const dy = by - gunPos.y;
      const proj = dx * Math.cos(angle) + dy * Math.sin(angle);
      if (proj < 0) return;
      const perp = Math.abs(-dy * Math.cos(angle) + dx * Math.sin(angle));
      if (perp < 82 && proj < bestDist) { bestDist = proj; aimed = b; }
    });

    const endX = aimed
      ? (aimed.x / 100) * window.innerWidth  + (aimed.driftX || 0)
      : muzzleX + Math.cos(angle) * 1000;
    const endY = aimed
      ? (aimed.y / 100) * window.innerHeight + (aimed.driftY || 0)
      : muzzleY + Math.sin(angle) * 1000;

    const bid = bulletId.current++;
    setBullets(prev => [...prev, { id: bid, x1: muzzleX, y1: muzzleY, x2: endX, y2: endY }]);
    setTimeout(() => setBullets(prev => prev.filter(b => b.id !== bid)), BULLET_SPEED_MS + 120);

    if (!aimed) return;

    const newShots = aimed.shots + 1;
    const willPop  = newShots >= POP_SHOT_MAX || (newShots >= POP_SHOT_MIN && Math.random() < 0.65);

    if (willPop) {
      setTimeout(() => {
        playSynthPop(isMuted);
        const bx = (aimed.x / 100) * window.innerWidth  + (aimed.driftX || 0);
        const by = (aimed.y / 100) * window.innerHeight + (aimed.driftY || 0);

        // Particle burst
        const burstId = Date.now() + Math.random();
        setPopBursts(prev => [...prev, { id: burstId, x: bx, y: by, color: aimed.theme.gradient[1] }]);
        setTimeout(() => setPopBursts(prev => prev.filter(pb => pb.id !== burstId)), 600);

        // Confetti
        try {
          confetti({ particleCount: 35, spread: 65, startVelocity: 18, origin: { x: bx / window.innerWidth, y: by / window.innerHeight }, colors: aimed.theme.confetti, disableForReducedMotion: true });
        } catch {}

        // Mark popped
        setBalloons(prev => prev.map(b => b.id === aimed.id ? { ...b, popped: true, shots: newShots } : b));
        showCatSpeech('\uD83C\uDF89 Nice shot!', 'jump', 2000);

        // Fly word to slot
        const slotEl = slotRefs.current[aimed.idx];
        if (slotEl) {
          const sr = slotEl.getBoundingClientRect();
          const word = aimed.theme.word;
          setFlyingWord({ index: aimed.idx, word, fromX: bx, fromY: by, toX: sr.left + sr.width / 2, toY: sr.top + sr.height / 2 });
          setTimeout(() => {
            setSlottedWords(prev => {
              const next = { ...prev, [aimed.idx]: word };
              slottedCountRef.current = Object.keys(next).length;
              if (slottedCountRef.current === balloonThemes.length) handleAllPopped();
              return next;
            });
            setFlyingWord(fw => fw && fw.index === aimed.idx ? null : fw);
          }, 680);
        }
      }, BULLET_SPEED_MS);

    } else {
      // DODGE
      setBalloons(prev => prev.map(b => {
        if (b.id !== aimed.id) return b;
        const dodgeAngle = angle + Math.PI + (Math.random() - 0.5) * 1.5;
        let nx = b.x + (Math.cos(dodgeAngle) * DODGE_DISTANCE / window.innerWidth)  * 100;
        let ny = b.y + (Math.sin(dodgeAngle) * DODGE_DISTANCE / window.innerHeight) * 100;
        nx = Math.max(8, Math.min(88, nx));
        ny = Math.max(8, Math.min(58, ny));
        return { ...b, shots: newShots, x: nx, y: ny, dodging: true };
      }));
      setTimeout(() => setBalloons(prev => prev.map(b => b.id === aimed.id ? { ...b, dodging: false } : b)), 500);

      const taunts = [
        'Missed! \uD83D\uDE39',
        'Too slow! \uD83D\uDC3E',
        'Haha nope~',
        'Try harder! \uD83D\uDE38',
        'Woosh! \uD83D\uDCA8',
        "Can't catch me!",
      ];
      showCatSpeech(taunts[Math.floor(Math.random() * taunts.length)], 'talk', 1800);
    }
  }, [isMuted, showCatSpeech, handleAllPopped, balloonThemes.length]);

  const clampedAngle = Math.max(-Math.PI * 0.95, Math.min(-Math.PI * 0.05, gunAngle));

  return (
    <div
      onClick={handleShoot}
      onTouchStart={handleShoot}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', background: 'linear-gradient(180deg,#F2EBFA 0%,#FBF0F5 100%)', overflow: 'hidden', zIndex: 9999, userSelect: 'none', cursor: 'crosshair', fontFamily: "'Quicksand','Outfit',sans-serif" }}
    >
      {/* Header */}
      <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#6B5B6E', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.72)', padding: '6px 16px', borderRadius: 16, backdropFilter: 'blur(4px)', border: '1px solid rgba(240,106,147,0.2)' }}>
          {header}
        </span>
      </div>

      {/* Instruction hint */}
      <AnimatePresence>
        {poppedCount === 0 && !isCompleted && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1.2, duration: 0.6 }}
            style={{ position: 'absolute', bottom: '7%', left: '50%', transform: 'translateX(-50%)', fontFamily: "'Caveat',cursive", fontSize: 18, fontWeight: 700, color: 'rgba(107,91,110,0.5)', pointerEvents: 'none', zIndex: 5, whiteSpace: 'nowrap' }}
          >
            Aim &amp; click to shoot the balloons!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Balloons */}
      {balloons.map(b => (
        <AnimatePresence key={b.id}>
          {!b.popped && (
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{
                x: (b.x / 100) * window.innerWidth  + (b.driftX || 0) - BALLOON_W / 2,
                y: (b.y / 100) * window.innerHeight + (b.driftY || 0) - BALLOON_H / 2,
                opacity: 1, scale: 1,
              }}
              exit={{ scale: [1, 1.4, 0], opacity: [1, 0.8, 0], transition: { duration: 0.2 } }}
              transition={{
                x: b.dodging ? { type: 'spring', stiffness: 270, damping: 18 } : { duration: 0.07 },
                y: b.dodging ? { type: 'spring', stiffness: 270, damping: 18 } : { duration: 0.07 },
                opacity: { duration: 0.6 }, scale: { duration: 0.6 },
              }}
              style={{ position: 'absolute', top: 0, left: 0, width: BALLOON_W, height: BALLOON_H, zIndex: 20, pointerEvents: 'none' }}
            >
              <BalloonSVG theme={b.theme} />
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* Bullets */}
      {bullets.map(bul => (
        <motion.div
          key={bul.id}
          initial={{ left: bul.x1, top: bul.y1, opacity: 1, scale: 1 }}
          animate={{ left: bul.x2, top: bul.y2, opacity: 0, scale: 0.3 }}
          transition={{ duration: BULLET_SPEED_MS / 1000, ease: 'linear' }}
          style={{ position: 'fixed', width: 10, height: 10, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.9) 30%,#F06A93)', boxShadow: '0 0 8px 3px rgba(240,106,147,0.7)', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 150 }}
        />
      ))}

      {/* Pop bursts */}
      {popBursts.map(burst => <PopBurst key={burst.id} x={burst.x} y={burst.y} color={burst.color} />)}

      {/* Flying word */}
      {flyingWord && (
        <motion.div
          initial={{ left: flyingWord.fromX, top: flyingWord.fromY, x: '-50%', y: '-50%', scale: 0.4, opacity: 0 }}
          animate={{ left: [flyingWord.fromX, flyingWord.fromX, flyingWord.toX], top: [flyingWord.fromY, flyingWord.fromY - 30, flyingWord.toY], scale: [0.4, 1.4, 1.0], opacity: [0, 1, 1] }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'fixed', zIndex: 100, fontFamily: "'Caveat',cursive", fontSize: 34, fontWeight: 700, color: '#2B1A3D', pointerEvents: 'none', textShadow: '0 2px 10px rgba(255,255,255,0.9)' }}
        >
          {flyingWord.word}
        </motion.div>
      )}

      {/* Word slots (bottom center) */}
      <div style={{ position: 'absolute', bottom: '14%', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 30 }}>
        <motion.div
          animate={isCompleted ? { scale: [1, 1.08, 1.05], y: -10, transition: { duration: 0.6 } } : {}}
          style={{ display: 'flex', flexDirection: 'row', gap: 12, justifyContent: 'center', padding: '10px 18px', background: isCompleted ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)', borderRadius: 22, border: isCompleted ? '2px solid rgba(240,106,147,0.6)' : '1.5px dashed rgba(240,106,147,0.3)', boxShadow: isCompleted ? '0 12px 35px rgba(240,106,147,0.25)' : '0 4px 14px rgba(74,59,85,0.06)', transition: 'all 0.4s ease' }}
        >
          {balloonThemes.map((theme, idx) => {
            const word = slottedWords[idx];
            return (
              <div
                key={theme.id}
                ref={el => (slotRefs.current[idx] = el)}
                style={{ width: 95, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: word ? 'none' : '1.5px dashed rgba(240,106,147,0.35)', background: word ? 'linear-gradient(135deg,#FFF1F5 0%,#F5EEF8 100%)' : 'rgba(255,255,255,0.4)', boxShadow: word ? '0 2px 8px rgba(74,59,85,0.08)' : 'none', transition: 'all 0.3s ease' }}
              >
                {word
                  ? <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 14, stiffness: 220 }} style={{ fontFamily: "'Caveat',cursive", fontSize: 27, fontWeight: 700, color: '#2B1A3D' }}>{word}</motion.span>
                  : <span style={{ fontSize: 16, color: 'rgba(107,91,110,0.3)', fontFamily: "'Outfit',sans-serif" }}>•</span>
                }
              </div>
            );
          })}
        </motion.div>

        <div style={{ height: 52 }}>
          <AnimatePresence>
            {showContinueBtn && (
              <motion.button
                onClick={e => { e.stopPropagation(); onComplete(); }}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                style={{ background: 'linear-gradient(135deg,#D6174A 0%,#B80F3C 100%)', color: '#FFFFFF', border: 'none', borderRadius: 16, fontFamily: "'Caveat',cursive", fontSize: 22, fontWeight: 700, padding: '8px 24px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(214,23,74,0.35)' }}
              >
                Continue &gt;&gt;
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Gun (bottom-left, rotates toward cursor) */}
      <div
        style={{ position: 'fixed', left: gunPosState.x, top: gunPosState.y, transform: `translate(-50%,-50%) rotate(${clampedAngle}rad)`, transformOrigin: 'center center', zIndex: 80, pointerEvents: 'none' }}
      >
        <GunSVG recoil={recoil} />
      </div>

      {/* Cat (bottom-right) */}
      <div style={{ position: 'absolute', bottom: 12, right: 18, zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
        <AnimatePresence>
          {catSpeech && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 8 }} transition={{ duration: 0.25 }}
              style={{ background: '#FFFFFF', padding: '6px 14px', borderRadius: 14, boxShadow: '0 6px 20px rgba(43,26,61,0.12)', border: '1.5px solid rgba(240,106,147,0.25)', fontFamily: "'Caveat',cursive", fontSize: 18, fontWeight: 700, color: '#4A3B55', marginBottom: 6, whiteSpace: 'nowrap', position: 'relative' }}
            >
              {catSpeech}
              <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #FFFFFF' }} />
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ transform: 'scaleX(-1)' }}>
          <StickerCat cat="fubu" pose={catPose} size={110} />
        </div>
      </div>
    </div>
  );
}
