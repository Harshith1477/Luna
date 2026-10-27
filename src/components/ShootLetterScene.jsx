import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import StickerCat from './StickerCat';
import LetterScrapbook from './LetterScrapbook';
import { SHOOT_LETTER_CONFIG } from '../config/shootLetterConfig';
import { RECIPIENT_NAME } from '../config/content';

// ─── BOW RIG CONSTANTS (local space, forward = −y) ────────────────────────────
// Bow geometry: wood arc bulges FORWARD (toward target = −y direction)
// Tips at (−55, 10) and (55, 10); belly control point (0, −40) faces the target.
// String connects the two tips; nock rides backwards (+y) when drawn.
const BOW_TIP_L   = { x: -55, y: 10 };
const BOW_TIP_R   = { x:  55, y: 10 };
const BOW_BELLY_CP = { x: 0, y: -40 }; // bulges FORWARD (−y = toward target)

const ARROW_LENGTH  = 110; // shaft + head length in local px
const STRING_BASE_Y = 10;  // y at which string meets the bow tips (at rest, nock here)
const MAX_DRAW      = 90;  // max pull-back in local px (mapped 1:1 to screen px)
const MIN_DRAG      = 25;  // minimum drag distance to fire
const MAX_ANGLE_DEG = 115; // clamp: allows aiming down toward cat while preventing backward shots

// Point-to-segment distance helper for continuous collision checks
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

export default function ShootLetterScene({ onComplete, isPlayingMusic, onToggleMusic }) {
  // ── Dev shortcuts ──────────────────────────────────────────────────────────
  const sp = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const skipToShot8 = sp.has('shot') && Number(sp.get('shot')) >= 8;
  const debugMode   = sp.has('debug');
  const openLetterDirect = sp.has('openletter') || sp.has('letter');

  // ── React state (only what actually drives JSX re-renders) ─────────────────
  const [tries,       setTries]       = useState(() => skipToShot8 ? SHOOT_LETTER_CONFIG.riggedMisses : 0);
  const [arrowState,  setArrowState]  = useState('loaded'); // loaded | flying | hit | reloading
  const [catSpeech,   setCatSpeech]   = useState('');
  const [catPose,     setCatPose]     = useState('sit');
  const [envelopeDodgeEmote, setEnvelopeDodgeEmote] = useState('');
  const [isLetterOpen,    setIsLetterOpen]    = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(() => openLetterDirect);
  const [isLetterStill, setIsLetterStill] = useState(() => skipToShot8);
  const [debugInfo, setDebugInfo] = useState({ angleDeg: 0, draw: 0 });
  const [isCatFallen, setIsCatFallen] = useState(false);
  const isCatFallenRef = useRef(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const containerRef    = useRef(null);
  const envelopeRef     = useRef(null);
  const floatTweenRef   = useRef(null);
  const flyingTweenRef  = useRef(null);
  const catContainerRef = useRef(null);
  const catFallRef      = useRef(null);

  // Bow SVG elements
  const svgHostRef    = useRef(null);  // div that positions the rig (gives us P)
  const rigGroupRef   = useRef(null);  // <g> that rotates — ONLY this moves
  const stringRef     = useRef(null);  // <path> for the bowstring
  const loadedArrRef  = useRef(null);  // <g> for the nocked arrow
  const aimLineRef    = useRef(null);  // <line> for dotted aim preview
  const flyingArrRef  = useRef(null);  // <g> for the flying arrow (full-viewport SVG)

  // Rig logical state — mutated directly (no re-render on every frame)
  const rigState       = useRef({ angle: 0, draw: 0 });
  const isDragging     = useRef(false);
  const pointerIdRef   = useRef(null);

  const triesRef        = useRef(skipToShot8 ? SHOOT_LETTER_CONFIG.riggedMisses : 0);
  triesRef.current      = tries;

  const lastCatLineRef   = useRef('');
  const lastCatRoastRef  = useRef('');
  const catHitCountRef   = useRef(0);
  const longDragTimerRef = useRef(null);
  const longDragFiredRef = useRef(false);
  const catHideTimerRef  = useRef(null);

  // ── renderRig — THE ONLY function that mutates the SVG transform ───────────
  // Call this from anywhere: pointer move, GSAP onUpdate, snap-back, reload.
  function renderRig(angle, draw) {
    if (!rigGroupRef.current) return;

    const deg = (angle * 180) / Math.PI;

    // 1. Rotate the whole rig group (pivot = origin of the viewBox = centre of host div)
    rigGroupRef.current.setAttribute('transform', `rotate(${deg})`);

    // 2. Nock moves BACK (+y) with draw; tip moves with it
    const nockY = STRING_BASE_Y + draw;
    const tipY  = nockY - ARROW_LENGTH;  // tipY < 0 → points forward (−y)

    // 3. Update bowstring: tip-L → nock → tip-R (V shape when drawn)
    if (stringRef.current) {
      stringRef.current.setAttribute(
        'd',
        `M ${BOW_TIP_L.x},${BOW_TIP_L.y} L 0,${nockY} L ${BOW_TIP_R.x},${BOW_TIP_R.y}`
      );
    }

    // 4. Slide loaded arrow group so nock rides the string
    if (loadedArrRef.current) {
      loadedArrRef.current.setAttribute('transform', `translate(0, ${nockY})`);
    }

    // 5. Aim line: from arrow tip straight forward (−y) by 420 local px
    if (aimLineRef.current) {
      aimLineRef.current.setAttribute('y1', String(tipY));
      aimLineRef.current.setAttribute('y2', String(tipY - 420));
    }

    if (debugMode) {
      setDebugInfo({ angleDeg: Math.round(deg), draw: Math.round(draw) });
    }
  }

  // ── Envelope ambient float ─────────────────────────────────────────────────
  useEffect(() => {
    if (isLetterStill || isLetterOpen) {
      floatTweenRef.current?.kill();
      return;
    }
    if (envelopeRef.current) {
      floatTweenRef.current = gsap.to(envelopeRef.current, {
        y: 12, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
    }
    return () => floatTweenRef.current?.kill();
  }, [isLetterStill, isLetterOpen]);

  // ── Pivot helper: world coords of the rig pivot P ─────────────────────────
  function getPivot() {
    const r = svgHostRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // ── Pointer → rig state conversion ────────────────────────────────────────
  // dir = P − pointer  →  shot goes opposite to drag
  // angle: 0 = straight up (−y forward), positive = clockwise
  // formula: angle = atan2(dir.x, −dir.y)
  function pointerToRigState(clientX, clientY) {
    const P  = getPivot();
    const dx = P.x - clientX;   // dir.x
    const dy = P.y - clientY;   // dir.y
    let angle = Math.atan2(dx, -dy);
    const maxRad = (MAX_ANGLE_DEG * Math.PI) / 180;
    angle = Math.max(-maxRad, Math.min(maxRad, angle));
    const draw = Math.min(MAX_DRAW, Math.hypot(dx, dy));
    return { angle, draw };
  }

  // ── Pointer event handlers (raw DOM — bypass React for every-frame perf) ──
  useEffect(() => {
    const hostEl = svgHostRef.current;
    if (!hostEl) return;

    function onDown(e) {
      if (arrowState !== 'loaded' || showLetterModal) return;
      e.preventDefault();
      isDragging.current   = true;
      pointerIdRef.current = e.pointerId;
      hostEl.setPointerCapture(e.pointerId);
      longDragFiredRef.current = false;

      longDragTimerRef.current = setTimeout(() => {
        if (!longDragFiredRef.current) {
          longDragFiredRef.current = true;
          showCatSpeech(SHOOT_LETTER_CONFIG.catLines.longDrag, false);
        }
      }, SHOOT_LETTER_CONFIG.longDragMs);

      const s = pointerToRigState(e.clientX, e.clientY);
      rigState.current = s;
      renderRig(s.angle, s.draw);
      if (aimLineRef.current) aimLineRef.current.style.display = '';
    }

    function onMove(e) {
      if (!isDragging.current || e.pointerId !== pointerIdRef.current) return;
      e.preventDefault();
      const s = pointerToRigState(e.clientX, e.clientY);
      rigState.current = s;
      renderRig(s.angle, s.draw);
    }

    function onUp(e) {
      if (!isDragging.current || e.pointerId !== pointerIdRef.current) return;
      isDragging.current = false;
      clearTimeout(longDragTimerRef.current);
      if (aimLineRef.current) aimLineRef.current.style.display = 'none';

      const { draw } = rigState.current;
      if (draw >= MIN_DRAG) {
        shootArrow();
      } else {
        // Snap rig back to rest
        const proxy = { ...rigState.current };
        gsap.to(proxy, {
          angle: 0, draw: 0, duration: 0.3, ease: 'back.out(2)',
          onUpdate: () => renderRig(proxy.angle, proxy.draw),
          onComplete: () => { rigState.current = { angle: 0, draw: 0 }; },
        });
      }
    }

    hostEl.addEventListener('pointerdown',   onDown,  { passive: false });
    hostEl.addEventListener('pointermove',   onMove,  { passive: false });
    hostEl.addEventListener('pointerup',     onUp);
    hostEl.addEventListener('pointercancel', onUp);
    return () => {
      hostEl.removeEventListener('pointerdown',   onDown);
      hostEl.removeEventListener('pointermove',   onMove);
      hostEl.removeEventListener('pointerup',     onUp);
      hostEl.removeEventListener('pointercancel', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrowState, showLetterModal]);

  // ── Cat speech helpers ─────────────────────────────────────────────────────
  function showCatSpeech(line, withPose = true) {
    if (!line) return;
    clearTimeout(catHideTimerRef.current);
    if (withPose && !isCatFallenRef.current) setCatPose('talk');
    setCatSpeech(line);
    catHideTimerRef.current = setTimeout(() => {
      setCatSpeech('');
      if (!isCatFallenRef.current) setCatPose('sit');
    }, SHOOT_LETTER_CONFIG.catBubbleDurationMs);
  }

  function getCatLine(tryNum) {
    const { perShot, laterPool } = SHOOT_LETTER_CONFIG.catLines;
    if (tryNum <= perShot.length) return perShot[tryNum - 1];
    const pool = laterPool.filter(l => l !== lastCatLineRef.current);
    const line = pool[Math.floor(Math.random() * pool.length)];
    lastCatLineRef.current = line;
    return line;
  }

  // ── Shoot ──────────────────────────────────────────────────────────────────
  function shootArrow() {
    const { angle, draw } = rigState.current;

    setArrowState('flying');
    const currentTry = triesRef.current + 1;
    setTries(currentTry);

    // ── Compute arrow tip world position ANALYTICALLY (no DOM matrix read) ──
    // Local tip = (0, tipLocalY) where tipLocalY = STRING_BASE_Y + draw − ARROW_LENGTH
    // SVG rotate(deg) maps local (lx, ly) → world offset (lx·cos−ly·sin, lx·sin+ly·cos)
    // For (0, tipLocalY): world offset = (−tipLocalY·sin(angle), tipLocalY·cos(angle))
    const tipLocalY = STRING_BASE_Y + draw - ARROW_LENGTH; // negative (pointing up)
    const sinA = Math.sin(angle), cosA = Math.cos(angle);
    const P = getPivot();
    const tipWX = P.x + (-tipLocalY * sinA);   // tipLocalY < 0, so this adds sinA
    const tipWY = P.y + ( tipLocalY * cosA);

    // Shot direction world = (sin(angle), −cos(angle))  [unit vector forward]
    const dirX =  sinA;
    const dirY = -cosA;

    const isRigged = currentTry <= SHOOT_LETTER_CONFIG.riggedMisses;
    const speed    = 500 + draw * 10; // px/s
    const flyDist  = 1500;
    const duration = flyDist / speed;

    // 1. Hide loaded arrow; position & show flying arrow at the tip
    if (loadedArrRef.current) loadedArrRef.current.style.display = 'none';
    const flyEl = flyingArrRef.current;
    if (flyEl) {
      const deg = (angle * 180) / Math.PI;
      flyEl.setAttribute('transform', `translate(${tipWX}, ${tipWY}) rotate(${deg})`);
      flyEl.style.display = '';
    }

    // 2. String-snap animation (draw quickly springs back to 0)
    const snapProxy = { draw };
    gsap.to(snapProxy, {
      draw: 0, duration: 0.14, ease: 'power4.out',
      onUpdate: () => renderRig(angle, snapProxy.draw),
      onComplete: () => {
        // Reset rig to neutral
        rigState.current = { angle: 0, draw: 0 };
        renderRig(0, 0);
      },
    });

    // 3. Fly the arrow across the viewport
    let dodgeTriggered = false;
    let hitChecked     = false;
    let catHitChecked  = false;
    const flyProxy     = { t: 0 };
    let prevPx         = tipWX;
    let prevPy         = tipWY;

    flyingTweenRef.current = gsap.to(flyProxy, {
      t: 1, duration, ease: 'none',
      onUpdate() {
        if (!flyEl) return;
        const px  = tipWX + dirX * flyDist * flyProxy.t;
        const py  = tipWY + dirY * flyDist * flyProxy.t;
        const deg = (angle * 180) / Math.PI;
        flyEl.setAttribute('transform', `translate(${px}, ${py}) rotate(${deg})`);

        // Check Cat Hit (if cat is standing and not hit yet)
        if (!catHitChecked && !isCatFallenRef.current && catContainerRef.current) {
          const catR = catContainerRef.current.getBoundingClientRect();
          const catCX = catR.left + catR.width / 2;
          const catCY = catR.top + catR.height / 2;
          const hitRadius = SHOOT_LETTER_CONFIG.CAT_HIT_RADIUS || 65;
          const distToCat = distToSegment(catCX, catCY, prevPx, prevPy, px, py);

          if (distToCat < hitRadius) {
            catHitChecked = true;
            flyingTweenRef.current?.kill();
            if (flyEl) flyEl.style.display = 'none';
            handleCatHit();
            return;
          }
        }

        // Collision check vs envelope
        const envEl = envelopeRef.current;
        if (!envEl) return;
        const envR  = envEl.getBoundingClientRect();
        const envCX = envR.left + envR.width  / 2;
        const envCY = envR.top  + envR.height / 2;
        const dist  = Math.hypot(px - envCX, py - envCY);

        if (isRigged && !dodgeTriggered && dist < SHOOT_LETTER_CONFIG.DODGE_RADIUS) {
          dodgeTriggered = true;
          // side: which perpendicular direction gets the envelope clear of the arrow
          const side = (dirX * (envCX - P.x) + dirY * (envCY - P.y)) >= 0 ? -1 : 1;
          triggerLetterDodge(currentTry, angle, side);
        }
        if (!isRigged && !hitChecked && dist < SHOOT_LETTER_CONFIG.HIT_TOLERANCE) {
          hitChecked = true;
          flyingTweenRef.current?.kill();
          if (flyEl) flyEl.style.display = 'none';
          handleArrowHit();
        }

        prevPx = px;
        prevPy = py;
      },
      onComplete() {
        if (flyEl) flyEl.style.display = 'none';
        if (!catHitChecked && (!hitChecked || isRigged)) handleArrowMiss(currentTry);
      },
    });
  }

  // ── Reload ─────────────────────────────────────────────────────────────────
  function reloadArrow() {
    setArrowState('reloading');
    rigState.current = { angle: 0, draw: 0 };
    renderRig(0, 0);
    const el = loadedArrRef.current;
    if (el) {
      el.style.display = '';
      el.style.opacity = '0';
      gsap.to(el, {
        opacity: 1, duration: 0.35, ease: 'back.out(2)',
        onComplete: () => setArrowState('loaded'),
      });
    }
  }

  // ── 7 Rigged Letter Dodge Animations ──────────────────────────────────────
  function triggerLetterDodge(tryNum, shootAngle, side) {
    const envEl = envelopeRef.current;
    if (!envEl) return;
    floatTweenRef.current?.pause();

    const dodgeCfg  = SHOOT_LETTER_CONFIG.dodges[(tryNum - 1) % SHOOT_LETTER_CONFIG.dodges.length];
    setEnvelopeDodgeEmote(dodgeCfg.emote);
    const clearEmote   = () => setEnvelopeDodgeEmote('');
    const restoreFloat = () => { if (!isLetterStill && floatTweenRef.current) floatTweenRef.current.play(); };

    switch (dodgeCfg.type) {
      case 'slide': {
        const slideX = Math.cos(shootAngle + Math.PI / 2) * 200 * side;
        gsap.timeline({ onComplete: () => { clearEmote(); restoreFloat(); } })
          .to(envEl, { x: slideX, duration: 0.18, ease: 'power3.out' })
          .to(envEl, { x: 0, duration: 0.35, ease: 'back.out(1.5)', delay: 0.15 });
        break;
      }
      case 'teleport': {
        const offsetX = (Math.random() > 0.5 ? 1 : -1) * 160;
        gsap.timeline({ onComplete: () => { clearEmote(); restoreFloat(); } })
          .to(envEl, { y: -50, scale: 0.15, opacity: 0, duration: 0.18, ease: 'power2.in' })
          .set(envEl, { x: offsetX, y: 0 })
          .to(envEl, { scale: 1, opacity: 1, duration: 0.22, ease: 'back.out(2.5)' })
          .to(envEl, { x: 0, duration: 0.45, ease: 'power2.out', delay: 0.25 });
        break;
      }
      case 'loop': {
        gsap.timeline({ onComplete: () => { gsap.set(envEl, { x: 0, y: 0, rotation: 0 }); clearEmote(); restoreFloat(); } })
          .to(envEl, { rotation: 360, y: -130, scale: 1.15, duration: 0.35, ease: 'power1.inOut' })
          .to(envEl, { y: 0, rotation: 720, scale: 1, x: 0, duration: 0.42, ease: 'power2.out' });
        break;
      }
      case 'shrinkVanish': {
        gsap.timeline({ onComplete: () => { clearEmote(); restoreFloat(); } })
          .to(envEl, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' })
          .set(envEl, { x: (Math.random() > 0.5 ? 1 : -1) * 80 })
          .to({}, { duration: 0.28 })
          .to(envEl, { scale: 1.25, opacity: 1, duration: 0.18, ease: 'back.out(3)' })
          .to(envEl, { scale: 1, x: 0, duration: 0.3, ease: 'power2.out' });
        break;
      }
      case 'flipDrift': {
        gsap.timeline({ onComplete: () => { clearEmote(); restoreFloat(); } })
          .to(envEl, { scaleY: -1, x: side * 120, y: -60, duration: 0.28, ease: 'power2.out' })
          .to(envEl, { scaleY: 1, x: 0, y: 0, duration: 0.38, ease: 'back.out(1.4)', delay: 0.15 });
        break;
      }
      case 'bounceEdge': {
        gsap.timeline({ onComplete: () => { clearEmote(); restoreFloat(); } })
          .to(envEl, { x: -300, duration: 0.2, ease: 'power3.out' })
          .to(envEl, { x: 220,  duration: 0.18, ease: 'power2.in' })
          .to(envEl, { x: 0,   duration: 0.35, ease: 'elastic.out(1, 0.5)' });
        break;
      }
      case 'matrixLean': {
        gsap.timeline({ onComplete: () => { clearEmote(); restoreFloat(); } })
          .to(envEl, { skewX: -35, y: 30, duration: 0.3, ease: 'power2.inOut' })
          .to({}, { duration: 0.22 })
          .to(envEl, { skewX: 15, y: 0, duration: 0.12, ease: 'power4.out' })
          .to(envEl, { skewX: -8, duration: 0.08 })
          .to(envEl, { skewX: 0, duration: 0.14, ease: 'power2.out' });
        break;
      }
      default:
        clearEmote();
        restoreFloat();
    }
  }

  // ── Miss Handling ──────────────────────────────────────────────────────────
  function handleArrowMiss(tryNum) {
    const { riggedMisses, catBubbleDelayMs } = SHOOT_LETTER_CONFIG;

    if (tryNum === riggedMisses) {
      const line = getCatLine(tryNum);
      setTimeout(() => {
        showCatSpeech(line);
        setTimeout(() => {
          showCatSpeech(SHOOT_LETTER_CONFIG.catLines.pre8);
          setTimeout(() => {
            if (envelopeRef.current) gsap.to(envelopeRef.current, { y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' });
            setIsLetterStill(true);
          }, SHOOT_LETTER_CONFIG.catBubbleDurationMs);
        }, SHOOT_LETTER_CONFIG.catBubbleDurationMs + 200);
      }, catBubbleDelayMs);
    } else {
      const line = getCatLine(tryNum);
      setTimeout(() => showCatSpeech(line), catBubbleDelayMs);
    }

    setTimeout(() => reloadArrow(), 600);
  }

  // ── Cat Hit Handling ───────────────────────────────────────────────────────
  function handleCatHit() {
    setArrowState('catHit');
    setIsCatFallen(true);
    isCatFallenRef.current = true;
    setCatPose('hmm');

    // Cat falls sideways with a comic bounce on the floor
    if (catFallRef.current) {
      gsap.killTweensOf(catFallRef.current);
      gsap.timeline()
        .to(catFallRef.current, {
          rotation: 90,
          x: 12,
          y: 14,
          duration: 0.22,
          ease: 'power2.in',
        })
        .to(catFallRef.current, {
          y: 18,
          duration: 0.12,
          ease: 'bounce.out',
        });
    }

    // Mini screen shake for impact
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { x: 0, y: 0 }, {
        x: 4, y: -2, duration: 0.05, repeat: 3, yoyo: true, ease: 'power2.inOut',
        onComplete: () => gsap.set(containerRef.current, { x: 0, y: 0 }),
      });
    }

    // Increment cat hit count
    catHitCountRef.current += 1;
    const hitCount = catHitCountRef.current;

    // Pick roast line teasing their aim without repeating the previous one
    const scoldPool = SHOOT_LETTER_CONFIG.catLines.catShot.filter(l => l !== lastCatRoastRef.current);
    let scoldLine = scoldPool[Math.floor(Math.random() * scoldPool.length)] || SHOOT_LETTER_CONFIG.catLines.catShot[0];
    lastCatRoastRef.current = scoldLine;

    // Prefix with counter if roasted multiple times
    if (hitCount === 2) {
      scoldLine = `AGAIN?! 😾 ` + scoldLine;
    } else if (hitCount >= 3) {
      scoldLine = `[CAT SNIPED x${hitCount}!] 🙀 ` + scoldLine;
    }

    showCatSpeech(scoldLine, false);

    // After 3.4s, cat shakes it off, stands back up, and teases Kaouther again
    setTimeout(() => {
      if (catFallRef.current) {
        gsap.to(catFallRef.current, {
          rotation: 0,
          x: 0,
          y: 0,
          duration: 0.45,
          ease: 'back.out(2)',
          onComplete: () => {
            setIsCatFallen(false);
            isCatFallenRef.current = false;
            setCatPose('sit');
          },
        });
      } else {
        setIsCatFallen(false);
        isCatFallenRef.current = false;
        setCatPose('sit');
      }

      const recoveryPool = SHOOT_LETTER_CONFIG.catLines.catShotRecovery;
      const recoveryLine = recoveryPool[Math.floor(Math.random() * recoveryPool.length)];
      showCatSpeech(recoveryLine, false);

      // Reload arrow for next shot
      setTimeout(() => reloadArrow(), 800);
    }, 3400);
  }

  // ── Hit Handling ───────────────────────────────────────────────────────────
  function handleArrowHit() {
    setArrowState('hit');
    setIsLetterStill(true);

    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { x: 0, y: 0 }, {
        x: 6, y: -4, duration: 0.05, repeat: 7, yoyo: true, ease: 'power2.inOut',
        onComplete: () => gsap.set(containerRef.current, { x: 0, y: 0 }),
      });
    }

    setCatPose('jump');
    showCatSpeech(SHOOT_LETTER_CONFIG.catLines.hit, false);

    const burst = (opts) => confetti({ ...opts, disableForReducedMotion: true });
    burst({ particleCount: 120, spread: 90,  origin: { x: 0.5, y: 0.35 }, colors: ['#D6174A','#F472B6','#FBBF24','#C084FC','#FFF1D6'] });
    setTimeout(() => burst({ particleCount: 60, spread: 120, origin: { x: 0.4, y: 0.32 }, colors: ['#FB7185','#F472B6','#FDE68A'] }), 180);
    setTimeout(() => burst({ particleCount: 60, spread: 120, origin: { x: 0.6, y: 0.32 }, colors: ['#C4B5FD','#818CF8','#FDA4AF'] }), 320);

    setTimeout(() => {
      setIsLetterOpen(true);
      setTimeout(() => setShowLetterModal(true), 700);
    }, 600);
  }


  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100dvh',
        background: 'linear-gradient(180deg, #F6EEF8 0%, #FCEFF5 100%)',
        overflow: 'hidden', zIndex: 9999, userSelect: 'none',
        fontFamily: "'Quicksand', 'Outfit', sans-serif",
      }}
    >
      {/* ── Floating background emoji ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4 }} aria-hidden="true">
        {['💕','✨','🌸','💖','⭐','🌷'].map((emoji, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${12 + i * 16}%`,
            top:  `${14 + (i % 3) * 22}%`,
            fontSize: 16 + (i % 3) * 6,
            animation: `gateFloat ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }}>{emoji}</div>
        ))}
      </div>

      {/* ── TOP HEADER ── */}
      <div style={{ position: 'absolute', top: 18, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(214,23,74,0.18)', boxShadow: '0 4px 14px rgba(43,26,61,0.08)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#2B1A3D', backdropFilter: 'blur(8px)' }}>
          🏹 Tries: <span style={{ color: '#D6174A', fontWeight: 800 }}>{tries}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(214,23,74,0.18)', boxShadow: '0 4px 14px rgba(43,26,61,0.08)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#D6174A', backdropFilter: 'blur(8px)' }}>
          Target: {RECIPIENT_NAME}'s Letter 💌
        </div>
      </div>

      {/* ── ENVELOPE (TOP CENTER) ── */}
      <div
        ref={envelopeRef}
        style={{ position: 'absolute', top: '16%', left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <AnimatePresence>
          {envelopeDodgeEmote && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1.1, y: -10 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{ position: 'absolute', top: -34, background: '#D6174A', color: 'white', padding: '4px 12px', borderRadius: 14, fontSize: 12.5, fontWeight: 800, boxShadow: '0 4px 12px rgba(214,23,74,0.3)', whiteSpace: 'nowrap' }}
            >
              {envelopeDodgeEmote}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ position: 'relative', width: 110, height: 76 }}>
          <svg width="110" height="76" viewBox="0 0 110 76" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="106" height="72" rx="8" fill="#FFFDF9" stroke="#2B1A3D" strokeWidth="3.5" />
            <path d="M 4,72 L 55,38 L 106,72" stroke="#E2D4C6" strokeWidth="2.5" fill="none" />
            <path d="M 4,6 L 42,42"  stroke="#E2D4C6" strokeWidth="2" fill="none" />
            <path d="M 106,6 L 68,42" stroke="#E2D4C6" strokeWidth="2" fill="none" />
            {!isLetterOpen
              ? <path d="M 4,4 L 55,44 L 106,4 Z"   fill="#FDA4AF" stroke="#2B1A3D" strokeWidth="3.5" strokeLinejoin="round" />
              : <path d="M 4,4 L 55,-34 L 106,4 Z"   fill="#FDA4AF" stroke="#2B1A3D" strokeWidth="3.5" strokeLinejoin="round" />}
            {!isLetterOpen && (
              <g transform="translate(46, 33)">
                <circle cx="9" cy="9" r="9" fill="#D6174A" />
                <path d="M 5,8 C 5,6 7,5 9,7 C 11,5 13,6 13,8 C 13,11 9,13 9,13 C 9,13 5,11 5,8 Z" fill="#FFFFFF" />
              </g>
            )}
          </svg>

          {arrowState === 'hit' && (
            <div style={{ position: 'absolute', top: 24, left: 48, transform: 'rotate(-25deg)', zIndex: 30 }}>
              <svg width="24" height="60" viewBox="0 0 24 60" fill="none">
                <line x1="12" y1="0" x2="12" y2="48" stroke="#854D0E" strokeWidth="3" strokeLinecap="round" />
                <polygon points="12,0 7,12 17,12" fill="#D6174A" stroke="#2B1A3D" strokeWidth="1.5" />
                <path d="M 12,48 L 7,58 M 12,48 L 17,58" stroke="#EF4444" strokeWidth="2" />
              </svg>
            </div>
          )}
        </div>

        <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: '#2B1A3D', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.85)', padding: '3px 12px', borderRadius: 16, boxShadow: '0 2px 8px rgba(43,26,61,0.06)' }}>
          <span>💕</span><span>A Little Surprise</span><span>💕</span>
        </div>
      </div>

      {/*
        ── FULL-VIEWPORT SVG: flying arrow lives here ──
        Positioned fixed so its coordinate system = page coords.
        The bow rig SVG is a separate smaller element centered in the host div.
      */}
      <svg
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 40 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/*
          Flying arrow group.
          transform="translate(tipWX, tipWY) rotate(deg)" is set programmatically.
          Local geometry (forward = −y, same as the rig):
            tip at (0, −84), tail at (0, 0)  →  rotated, it points in the shoot direction.
        */}
        <g ref={flyingArrRef} style={{ display: 'none' }}>
          {/* Shaft: from nock (0,0) toward tip (0,−84) */}
          <line x1="0" y1="0" x2="0" y2="-70" stroke="#A16207" strokeWidth="4" strokeLinecap="round" />
          {/* Arrowhead points forward (−y = toward target) */}
          <polygon points="0,-84 -7,-68 7,-68" fill="#D6174A" stroke="#2B1A3D" strokeWidth="2" strokeLinejoin="round" />
          {/* Fletching at the tail (0,0) */}
          <path d="M 0,0 L -7,14 M 0,0 L 7,14" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 0,6 L -7,20 M 0,6 L 7,20" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>

      {/*
        ── BOW RIG HOST DIV ──
        Centers the rig SVG. The center of this div = pivot P.
        touchAction: none prevents scroll interference.
        Pointer events are attached via useEffect (raw DOM).
      */}
      <div
        ref={svgHostRef}
        style={{
          position: 'absolute', bottom: '12%', left: '50%',
          transform: 'translateX(-50%)',
          width: 200, height: 200,
          touchAction: 'none',
          cursor: arrowState === 'loaded' ? 'crosshair' : 'default',
          zIndex: 41,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/*
          Bow SVG. viewBox centred at (0,0) = the pivot.
          The <g ref={rigGroupRef}> only ever gets rotate(deg) set on it — nothing else.
        */}
        <svg
          width="200" height="200"
          viewBox="-100 -120 200 220"
          style={{ overflow: 'visible' }}
        >
          <g ref={rigGroupRef} transform="rotate(0)">

            {/* Dotted aim line — hidden until dragging (toggled via style.display) */}
            <line
              ref={aimLineRef}
              x1="0" y1="-100"
              x2="0" y2="-520"
              stroke="#D6174A" strokeWidth="3"
              strokeDasharray="8 7" opacity="0.72"
              style={{ display: 'none' }}
            />

            {/*
              Wooden bow arc: bezier from tip-L to tip-R with belly CP forward (−y).
              Belly bulges TOWARD the target. Tips are behind (at +y).
            */}
            <path
              d={`M ${BOW_TIP_L.x},${BOW_TIP_L.y} Q ${BOW_BELLY_CP.x},${BOW_BELLY_CP.y} ${BOW_TIP_R.x},${BOW_TIP_R.y}`}
              stroke="#854D0E" strokeWidth="9" strokeLinecap="round" fill="none"
            />
            {/* Gold end-caps */}
            <circle cx={BOW_TIP_L.x} cy={BOW_TIP_L.y} r="5.5" fill="#EAB308" stroke="#2B1A3D" strokeWidth="2" />
            <circle cx={BOW_TIP_R.x} cy={BOW_TIP_R.y} r="5.5" fill="#EAB308" stroke="#2B1A3D" strokeWidth="2" />

            {/* Bowstring — two segments (V shape) updated by renderRig */}
            <path
              ref={stringRef}
              d={`M ${BOW_TIP_L.x},${BOW_TIP_L.y} L 0,${STRING_BASE_Y} L ${BOW_TIP_R.x},${BOW_TIP_R.y}`}
              stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" fill="none"
            />

            {/*
              Loaded arrow group — translate(0, nockY) slides it back with draw.
              Local geometry (relative to the group's origin = nock position):
                tip at (0, −ARROW_LENGTH), tail at (0, 0)
            */}
            <g ref={loadedArrRef} transform={`translate(0, ${STRING_BASE_Y})`}>
              {/* Shaft */}
              <line x1="0" y1="0" x2="0" y2={-(ARROW_LENGTH - 14)}
                stroke="#A16207" strokeWidth="4" strokeLinecap="round" />
              {/* Head — triangle tip points forward (−y) */}
              <polygon
                points={`0,${-ARROW_LENGTH} -7,${-ARROW_LENGTH + 16} 7,${-ARROW_LENGTH + 16}`}
                fill="#D6174A" stroke="#2B1A3D" strokeWidth="2" strokeLinejoin="round"
              />
              {/* Fletching at tail (0,0) */}
              <path d="M 0,0 L -7,14 M 0,0 L 7,14"   stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 0,6 L -7,20 M 0,6 L 7,20"   stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* ?debug=1 overlay */}
            {debugMode && (
              <>
                <circle cx="0" cy="0" r="6" fill="red" opacity="0.85" />
                <line x1="0" y1="0" x2="0" y2="-50" stroke="lime" strokeWidth="2.5" />
                {/* Arrow tip indicator */}
                <circle cx="0" cy={-(ARROW_LENGTH - STRING_BASE_Y)} r="4" fill="cyan" opacity="0.85" />
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Hint text */}
      <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', fontSize: 13, fontWeight: 700, color: '#6B5B6E', background: 'rgba(255,255,255,0.85)', padding: '4px 14px', borderRadius: 14, boxShadow: '0 2px 8px rgba(43,26,61,0.05)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
        🏹 Drag back &amp; release to shoot
      </div>

      {/* Debug panel */}
      {debugMode && (
        <div style={{ position: 'absolute', top: 60, left: 16, background: 'rgba(0,0,0,0.75)', color: '#0f0', fontFamily: 'monospace', fontSize: 12, padding: '6px 10px', borderRadius: 8, zIndex: 9999, pointerEvents: 'none' }}>
          angle: {debugInfo.angleDeg}° | draw: {debugInfo.draw}px
        </div>
      )}

      {/* ── MOCHI CAT (BOTTOM-RIGHT) ── */}
      <div
        ref={catContainerRef}
        style={{
          position: 'absolute',
          bottom: '6%',
          right: '6%',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <AnimatePresence>
          {catSpeech && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                marginBottom: isCatFallen ? 42 : 10,
                minWidth: 170,
                maxWidth: 240,
                background: isCatFallen ? '#FFF1F2' : '#FFFFFF',
                borderRadius: 16,
                padding: '10px 14px',
                fontSize: 13,
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 800,
                color: isCatFallen ? '#9F1239' : '#2B1A3D',
                lineHeight: 1.45,
                boxShadow: isCatFallen
                  ? '0 8px 24px rgba(225,29,72,0.25), 0 0 0 2px #E11D48'
                  : '0 8px 24px rgba(43,26,61,0.16), 0 0 0 2px rgba(214,23,74,0.14)',
                pointerEvents: 'none',
              }}
            >
              {isCatFallen && <span style={{ marginRight: 5 }}>💢</span>}
              {catSpeech}
              <div
                style={{
                  position: 'absolute',
                  bottom: -8,
                  right: 28,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: isCatFallen ? '8px solid #E11D48' : '8px solid #FFFFFF',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* BONK! comic badge when fallen */}
        <AnimatePresence>
          {isCatFallen && (
            <motion.div
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: [0, 1.25, 1], rotate: [0, 12, -8], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{
                position: 'absolute',
                top: -24,
                right: 20,
                background: '#D6174A',
                color: '#FFFFFF',
                padding: '3px 10px',
                borderRadius: 12,
                fontWeight: 900,
                fontSize: 13,
                boxShadow: '0 4px 12px rgba(214,23,74,0.35)',
                letterSpacing: '0.04em',
                zIndex: 60,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>💥</span><span>BONK!</span><span>💫</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ transform: 'scaleX(-1)' }}>
          <div ref={catFallRef} style={{ transformOrigin: 'bottom center' }}>
            <StickerCat cat="mochi" pose={catPose} size={115} />
          </div>
        </div>
      </div>

      {/* ── LETTER CARD MODAL (4-PAGE SCRAPBOOK) ── */}
      <AnimatePresence>
        {showLetterModal && (
          <LetterScrapbook
            onComplete={onComplete}
            isPlayingMusic={isPlayingMusic}
            onToggleMusic={onToggleMusic}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
