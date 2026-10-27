import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { SHOOT_LETTER_CONFIG } from '../config/shootLetterConfig';
import StickerCat from './StickerCat';

// ── Page 4 Tunables ──────────────────────────────────────────────────
export const BLOW_THRESHOLD   = 0.038; // Sensitive threshold for immediate blow response
export const BLOW_DURATION_MS = 60;    // Rapid blow trigger

export const PAGE4_LINES = [
  "It's October 27th, and I heard pretty girls are born today. 🌸",
  "So no surprise that today belongs to you, Luna.",
  "Make a wish. Blow out the candles. Whatever it is, I'm rooting for it.",
];

/**
 * Concentric Heart Photo Frame SVG Component
 * Pink border (#F06A93), thin white inner ring, tilted -4°, washi tape, and caption.
 */
function HeartPhotoFrame({ photo, caption }) {
  const [imgError, setImgError] = useState(false);

  // Smooth heart paths for viewBox 0 0 320 290
  // Outer pink border
  const outerHeartPath = "M 160 272 C 58 200, 10 142, 10 90 C 10 44, 46 14, 93 14 C 124 14, 148 31, 160 57 C 172 31, 196 14, 227 14 C 274 14, 310 44, 310 90 C 310 142, 262 200, 160 272 Z";
  // Inner white ring
  const innerWhitePath = "M 160 260 C 62 192, 22 136, 22 91 C 22 50, 53 24, 93 24 C 122 24, 145 40, 160 63 C 175 40, 198 24, 227 24 C 267 24, 298 50, 298 91 C 298 136, 238 192, 160 260 Z";
  // Photo clip mask
  const photoClipPath  = "M 160 250 C 66 185, 32 132, 32 92 C 32 54, 60 33, 93 33 C 120 33, 144 48, 160 70 C 176 48, 200 33, 227 33 C 260 33, 288 54, 288 92 C 288 132, 254 185, 160 250 Z";

  return (
    <div
      style={{
        '--photo-focus-x': '8%',
        '--photo-focus-y': '-14%',
        '--photo-scale': '0.92',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: 'rotate(-4deg)',
        filter: 'drop-shadow(0 16px 32px rgba(74, 59, 85, 0.25))',
        margin: '0 auto',
      }}
    >
      {/* Washi tape strip on top */}
      <div
        style={{
          position: 'absolute',
          top: -11,
          zIndex: 10,
          width: 100,
          height: 24,
          background: 'rgba(240, 106, 147, 0.65)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
          transform: 'rotate(2deg)',
          borderRadius: 2,
        }}
      />

      <svg width="320" height="290" viewBox="0 0 320 290" style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id="heart-photo-clip">
            <path d={photoClipPath} />
          </clipPath>
        </defs>

        {/* Outer pink border #F06A93 */}
        <path d={outerHeartPath} fill="#F06A93" />

        {/* Inner white border */}
        <path d={innerWhitePath} fill="#FFFFFF" />

        {/* Photo clipped to heart — perfectly centered face, cheeks, chin, and smile */}
        {!imgError && photo ? (
          <foreignObject
            x="0"
            y="0"
            width="320"
            height="290"
            clipPath="url(#heart-photo-clip)"
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={photo}
                alt={caption || 'Photo'}
                onError={() => setImgError(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: '0% 0%',
                  transform: 'scale(var(--photo-scale, 0.92)) translate(var(--photo-focus-x, 8%), var(--photo-focus-y, -14%))',
                  transformOrigin: 'center center',
                  display: 'block',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </foreignObject>
        ) : (
          /* Fallback cat doodle if image fails */
          <g clipPath="url(#heart-photo-clip)">
            <rect width="320" height="290" fill="#FFF1F5" />
            <text x="160" y="130" textAnchor="middle" fontSize="55">🐱</text>
            <text x="160" y="170" textAnchor="middle" fontFamily="'Caveat', cursive" fontSize="22" fill="#D6174A">
              Sweet Kaouther
            </text>
          </g>
        )}
      </svg>

      {/* Caption */}
      {caption && (
        <div
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 18,
            color: '#4A3B55',
            fontWeight: 700,
            marginTop: 4,
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}

/**
 * Polaroid Photo Frame Component
 * Displays Kaouther's photo in a vintage white polaroid card with washi tape,
 * tilt (+2.5°), and caption.
 */
function PolaroidPhotoFrame({ photo, caption }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: 'rotate(2.5deg)',
        filter: 'drop-shadow(0 12px 24px rgba(74, 59, 85, 0.18))',
        margin: '0 auto',
      }}
    >
      {/* Washi tape strip on top */}
      <div
        style={{
          position: 'absolute',
          top: -10,
          zIndex: 10,
          width: 70,
          height: 19,
          background: 'rgba(240, 106, 147, 0.65)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
          transform: 'rotate(-2.5deg)',
          borderRadius: 2,
        }}
      />

      <div
        style={{
          background: '#FFFFFF',
          padding: '12px 12px 14px',
          borderRadius: 14,
          border: '1.5px solid rgba(240, 106, 147, 0.22)',
          boxShadow: '0 8px 24px rgba(74, 59, 85, 0.12)',
          width: 200,
          textAlign: 'center',
        }}
        className="scrapbook-polaroid-box"
      >
        <div
          style={{
            width: '100%',
            height: 175,
            borderRadius: 8,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #FFF1F5 0%, #F5EEF8 100%)',
          }}
          className="scrapbook-polaroid-img-wrap"
        >
          {!imgError && photo ? (
            <img
              src={photo}
              alt="Memory"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 15%',
                display: 'block',
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
              }}
            >
              🌸
            </div>
          )}
        </div>

        {caption && (
          <div
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 18,
              color: '#4A3B55',
              fontWeight: 700,
              marginTop: 8,
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
          >
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LetterScrapbook({ onComplete, isPlayingMusic = true, onToggleMusic }) {
  const { badge, SIGN_OFF, pages } = SHOOT_LETTER_CONFIG.letter;

  // URL param ?page=1..4 support
  const initialPage = (() => {
    if (typeof window === 'undefined') return 1;
    const p = new URLSearchParams(window.location.search).get('page');
    const num = parseInt(p, 10);
    return num >= 1 && num <= 4 ? num : 1;
  })();

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [direction, setDirection] = useState(1);
  const [typeProgress, setTypeProgress] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Page 4: 23 interactive candles & Web Audio mic blow
  const totalCandles = 23;
  const [blownCandles, setBlownCandles] = useState([]);
  const [isBlowing, setIsBlowing] = useState(false);
  const [allCandlesOut, setAllCandlesOut] = useState(false);
  const [micStatus, setMicStatus] = useState('idle'); // 'idle' | 'listening' | 'denied' | 'unsupported'
  const [liveVolume, setLiveVolume] = useState(0);

  const streamRef       = useRef(null);
  const audioCtxRef     = useRef(null);
  const analyserRef     = useRef(null);
  const rafRef          = useRef(null);
  const blowStartRef    = useRef(null);
  const hasTriggeredRef = useRef(false);

  // Stop mic helper
  const stopMic = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setLiveVolume(0);
    blowStartRef.current = null;
  }, []);

  // Clean up mic when switching away from page 4 or unmounting
  useEffect(() => {
    if (currentPage !== 4) {
      stopMic();
      setMicStatus('idle');
    }
    return () => {
      stopMic();
    };
  }, [currentPage, stopMic]);

  // Wave extinguish of all 23 candles from left to right with small smoke puffs
  const triggerExtinguishAll = useCallback(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    stopMic();
    setMicStatus('idle');
    setIsBlowing(true);

    let idx = 0;
    const waveTimer = setInterval(() => {
      setBlownCandles((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
      idx++;
      if (idx >= totalCandles) {
        clearInterval(waveTimer);
        setIsBlowing(false);
        setAllCandlesOut(true);

        try {
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { x: 0.5, y: 0.45 },
            colors: ['#F06A93', '#FBBF24', '#C084FC', '#38BDF8', '#FFFFFF', '#EC4899'],
          });
        } catch {
          // ignore
        }
      }
    }, 35);
  }, [stopMic]);

  // Turn on mic and listen for sustained blow
  const turnOnMic = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unsupported');
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;

      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.15;
      source.connect(analyser);
      analyserRef.current = analyser;

      setMicStatus('listening');
      hasTriggeredRef.current = false;
      blowStartRef.current = null;

      const timeData = new Uint8Array(analyser.fftSize);
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      let blowHits = 0;

      const loop = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(timeData);
        analyserRef.current.getByteFrequencyData(freqData);

        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const norm = (timeData[i] - 128) / 128;
          sum += norm * norm;
        }
        const rms = Math.sqrt(sum / timeData.length);
        setLiveVolume(rms);

        // Low frequency wind/puff turbulence energy (first 8 bins)
        let lowEnergy = 0;
        for (let i = 0; i < 8; i++) {
          lowEnergy += freqData[i];
        }
        const lowAvg = lowEnergy / 8;

        // Immediate blow detection: trigger as soon as user blows into the mic
        if (rms >= BLOW_THRESHOLD || (rms >= 0.025 && lowAvg > 35)) {
          blowHits++;
          if (blowHits >= 2) { // 2 frames (~30ms) triggers immediately
            triggerExtinguishAll();
            return;
          }
        } else {
          blowHits = 0;
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      console.warn('Microphone permission denied or failed:', err);
      setMicStatus('denied');
    }
  };

  // Fallback tap single candle
  const handleTapCandle = (idx) => {
    if (blownCandles.includes(idx)) return;
    const next = [...blownCandles, idx];
    setBlownCandles(next);
    if (next.length >= totalCandles) {
      hasTriggeredRef.current = true;
      stopMic();
      setMicStatus('idle');
      setAllCandlesOut(true);
      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { x: 0.5, y: 0.45 },
          colors: ['#F06A93', '#FBBF24', '#C084FC', '#38BDF8', '#FFFFFF', '#EC4899'],
        });
      } catch {}
    }
  };

  const activePageData = pages[currentPage - 1] || pages[0];
  const pageText = activePageData.text || '';

  // Typewriter effect (for pages 1-3)
  useEffect(() => {
    setTypeProgress(0);
    setIsTypingComplete(false);

    if (!pageText) {
      setIsTypingComplete(true);
      return;
    }

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx += 4;
      if (currentIdx >= pageText.length) {
        setTypeProgress(pageText.length);
        setIsTypingComplete(true);
        clearInterval(interval);
      } else {
        setTypeProgress(currentIdx);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [currentPage, pageText]);

  const handleSkipTyping = () => {
    if (!isTypingComplete) {
      setTypeProgress(pageText.length);
      setIsTypingComplete(true);
    }
  };

  const goToNextPage = () => {
    if (currentPage < 4) {
      setDirection(1);
      setCurrentPage((prev) => prev + 1);
    } else if (allCandlesOut) {
      onComplete();
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setDirection(-1);
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, allCandlesOut]);

  const pageVariants = {
    enter: (d) => ({
      x: d > 0 ? 55 : -55,
      opacity: 0,
      rotate: d > 0 ? 1.5 : -1.5,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotate: 0,
    },
    exit: (d) => ({
      x: d > 0 ? -55 : 55,
      opacity: 0,
      rotate: d > 0 ? -1.5 : 1.5,
    }),
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(43, 26, 61, 0.65)',
        backdropFilter: 'blur(12px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        userSelect: 'none',
      }}
    >
      {/* ── Scrapbook Card Container (92vw max 1080x620) ── */}
      <div
        style={{
          width: '92vw',
          maxWidth: 1080,
          height: '88dvh',
          maxHeight: 620,
          background: '#FDF8F5',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(43, 26, 61, 0.4), 0 0 0 1px rgba(240, 106, 147, 0.22)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
        }}
        className="scrapbook-card-root"
      >
        {/* Paper texture overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(74, 59, 85, 0.04) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* ── Animated Page View ── */}
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'row',
              zIndex: 2,
              paddingBottom: 54, // room for bottom nav
            }}
            className="scrapbook-page-split"
          >
            {/* ── LEFT: Collage Area ── */}
            <div
              style={{
                flex: '0 0 42%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                borderRight: '1.5px dashed rgba(240, 106, 147, 0.22)',
                overflow: 'hidden',
              }}
              className={`scrapbook-collage-side ${currentPage === 4 ? 'has-page4' : ''}`}
            >
              {/* PAGE 1 COLLAGE: Heart Photo & Scrapbook Stickers */}
              {currentPage === 1 && (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HeartPhotoFrame
                    photo={activePageData.photo}
                    caption={activePageData.photoCaption}
                  />

                  {/* Scattered Stickers (flower bouquet, cake, stars, sparkles, paws - NO hearts) */}
                  <span style={{ position: 'absolute', top: '7%', left: '8%', fontSize: 30, transform: 'rotate(-12deg)' }}>🌸</span>
                  <span style={{ position: 'absolute', top: '10%', right: '10%', fontSize: 28, transform: 'rotate(15deg)' }}>✨</span>
                  <span style={{ position: 'absolute', bottom: '12%', left: '10%', fontSize: 26, transform: 'rotate(-8deg)' }}>⭐</span>
                  <span style={{ position: 'absolute', bottom: '10%', right: '8%', fontSize: 26, transform: 'rotate(10deg)' }}>🐾</span>
                  <span style={{ position: 'absolute', top: '48%', left: '3%', fontSize: 24 }}>💐</span>
                </div>
              )}

              {/* PAGE 2 COLLAGE: Polaroid Photo & Star Stickers */}
              {currentPage === 2 && (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {activePageData.photo ? (
                    <PolaroidPhotoFrame
                      photo={activePageData.photo}
                      caption={activePageData.photoCaption}
                    />
                  ) : (
                    <div
                      style={{
                        background: '#FFFFFF',
                        padding: '16px 16px 20px',
                        borderRadius: 16,
                        boxShadow: '0 12px 30px rgba(74, 59, 85, 0.15)',
                        transform: 'rotate(-3deg)',
                        border: '1px solid rgba(240, 106, 147, 0.2)',
                        width: 220,
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: 145,
                          background: 'linear-gradient(135deg, #FFF1F5 0%, #F5EEF8 100%)',
                          borderRadius: 12,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <span style={{ fontSize: 44 }}>✨</span>
                        <span style={{ fontFamily: "'Abril Fatface', serif", fontSize: 22, color: '#D6174A' }}>
                          Chapter 23
                        </span>
                      </div>
                      <div style={{ marginTop: 10, fontFamily: "'Caveat', cursive", fontSize: 18, color: '#4A3B55', fontWeight: 600 }}>
                        a tiny world for you 🌸
                      </div>
                    </div>
                  )}

                  <span style={{ position: 'absolute', top: '9%', right: '12%', fontSize: 30, transform: 'rotate(15deg)' }}>🌟</span>
                  <span style={{ position: 'absolute', bottom: '12%', left: '10%', fontSize: 28, transform: 'rotate(-10deg)' }}>🎂</span>
                  <span style={{ position: 'absolute', bottom: '14%', right: '10%', fontSize: 26, transform: 'rotate(8deg)' }}>🐾</span>
                  <span style={{ position: 'absolute', top: '12%', left: '10%', fontSize: 24 }}>🌸</span>
                </div>
              )}

              {/* PAGE 3 COLLAGE: Mochi and Biscuit as cute scrapbook stickers */}
              {currentPage === 3 && (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      filter: 'drop-shadow(0 8px 18px rgba(74, 59, 85, 0.15))',
                    }}
                  >
                    <div style={{ transform: 'rotate(-5deg)' }}>
                      <StickerCat cat="mochi" pose="groom" size={110} />
                    </div>
                    <div style={{ transform: 'rotate(6deg)' }}>
                      <StickerCat cat="biscuit" pose="loaf" size={105} />
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: 18,
                      color: '#4A3B55',
                      fontWeight: 700,
                      background: 'rgba(255, 255, 255, 0.85)',
                      padding: '5px 16px',
                      borderRadius: 14,
                      border: '1px solid rgba(240, 106, 147, 0.22)',
                      boxShadow: '0 4px 10px rgba(74, 59, 85, 0.08)',
                    }}
                  >
                    Mochi & Biscuit approved 🐾
                  </div>

                  <span style={{ position: 'absolute', top: '8%', left: '8%', fontSize: 26 }}>✨</span>
                  <span style={{ position: 'absolute', top: '10%', right: '10%', fontSize: 26 }}>⭐</span>
                  <span style={{ position: 'absolute', bottom: '10%', left: '10%', fontSize: 24 }}>🌸</span>
                  <span style={{ position: 'absolute', bottom: '12%', right: '8%', fontSize: 24 }}>🌟</span>
                </div>
              )}

              {/* PAGE 4 COLLAGE: Interactive Birthday Cake with 23 Candles */}
              {currentPage === 4 && (() => {
                const flameTilt = Math.min(25, (liveVolume / BLOW_THRESHOLD) * 20);

                const renderCandle = (idx) => {
                  const isOut = blownCandles.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleTapCandle(idx)}
                      title={isOut ? 'Extinguished' : 'Tap candle to blow it out'}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: 6,
                        cursor: isOut ? 'default' : 'pointer',
                        position: 'relative',
                      }}
                    >
                      {/* Smoke puff */}
                      {isOut && (
                        <motion.span
                          initial={{ opacity: 0.85, y: 0, scale: 0.5 }}
                          animate={{ opacity: 0, y: -18, scale: 2 }}
                          transition={{ duration: 0.85, ease: 'easeOut' }}
                          style={{
                            position: 'absolute',
                            top: -6,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'rgba(215, 205, 200, 0.75)',
                            pointerEvents: 'none',
                          }}
                        />
                      )}

                      {/* Flame */}
                      <motion.span
                        animate={
                          isOut
                            ? { opacity: 0, y: -4, scale: 0.2 }
                            : {
                                opacity: 1,
                                scale: [1, 1.08, 0.95, 1],
                                rotate: [
                                  flameTilt - 2,
                                  flameTilt + 2,
                                  flameTilt - 1,
                                  flameTilt,
                                ],
                              }
                        }
                        transition={
                          isOut
                            ? { duration: 0.2 }
                            : { repeat: Infinity, duration: 0.5 + (idx % 4) * 0.1 }
                        }
                        style={{
                          width: 5,
                          height: 7,
                          borderRadius: '50% 50% 20% 20%',
                          background: isOut
                            ? 'transparent'
                            : 'radial-gradient(circle, #FDE047 30%, #F97316 100%)',
                          boxShadow: isOut ? 'none' : '0 0 6px rgba(249, 115, 22, 0.85)',
                          marginBottom: 1,
                          transformOrigin: 'bottom center',
                        }}
                      />

                      {/* Candle stick */}
                      <div
                        style={{
                          width: 4.5,
                          height: 16,
                          background: idx % 2 === 0 ? '#F472B6' : '#C084FC',
                          borderRadius: '2px 2px 1px 1px',
                        }}
                      />
                    </div>
                  );
                };

                return (
                  <div
                    className="page4-collage"
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Cake & Candles unified container so they never drift apart */}
                    <div
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      {/* 23 Candles sitting directly on top of the cake, bottoms touching the frosting */}
                      <div
                        style={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1.5,
                          marginBottom: -3, // Sits directly flush into the frosting!
                          zIndex: 5,
                        }}
                      >
                        {/* Row 1: Back row of 11 candles */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 5.5,
                            zIndex: 1,
                          }}
                        >
                          {Array.from({ length: 11 }).map((_, i) => renderCandle(i))}
                        </div>

                        {/* Row 2: Front row of 12 candles */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 5,
                            zIndex: 2,
                          }}
                        >
                          {Array.from({ length: 12 }).map((_, i) => renderCandle(11 + i))}
                        </div>
                      </div>

                      {/* Cake top tier */}
                      <div
                        style={{
                          width: 175,
                          height: 50,
                          background: 'linear-gradient(180deg, #FFF1F5 0%, #FDE2E8 100%)',
                          borderRadius: '12px 12px 6px 6px',
                          border: '2px solid #F06A93',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(74, 59, 85, 0.1)',
                        }}
                      >
                        <div style={{ position: 'absolute', top: -5, display: 'flex', gap: 6 }}>
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#FFFFFF',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                              }}
                            />
                          ))}
                        </div>
                        <span style={{ fontFamily: "'Abril Fatface', serif", fontSize: 22, color: '#D6174A' }}>
                          23
                        </span>
                      </div>

                      {/* Cake bottom tier */}
                      <div
                        style={{
                          width: 215,
                          height: 54,
                          background: 'linear-gradient(180deg, #FDE2E8 0%, #F8BDCC 100%)',
                          borderRadius: '6px 6px 14px 14px',
                          border: '2px solid #F06A93',
                          borderTop: 'none',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 6px 16px rgba(74, 59, 85, 0.15)',
                        }}
                      >
                        <span style={{ fontSize: 14, fontFamily: "'Caveat', cursive", color: '#4A3B55', fontWeight: 700 }}>
                          {allCandlesOut ? 'Wish made! ✨' : 'Make a wish 🌟'}
                        </span>
                      </div>

                      {/* Cake stand */}
                      <div style={{ width: 235, height: 8, background: '#FFFFFF', borderRadius: 6, border: '1px solid rgba(74, 59, 85, 0.15)', marginTop: 2 }} />
                    </div>

                    {/* Mic Blow Controls */}
                    {!allCandlesOut ? (
                      <>
                        {micStatus === 'idle' && (
                          <button
                            onClick={turnOnMic}
                            disabled={isBlowing}
                            style={{
                              marginTop: 14,
                              padding: '9px 24px',
                              background: 'linear-gradient(135deg, #D6174A 0%, #B80F3C 100%)',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: 16,
                              fontFamily: "'Quicksand', 'Outfit', sans-serif",
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 4px 14px rgba(214, 23, 74, 0.35)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <span>🎤 Turn on mic & blow</span>
                          </button>
                        )}

                        {micStatus === 'listening' && (
                          <div
                            style={{
                              marginTop: 12,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                              background: 'rgba(255, 255, 255, 0.95)',
                              padding: '8px 20px',
                              borderRadius: 20,
                              border: '1.5px solid rgba(240, 106, 147, 0.35)',
                              boxShadow: '0 4px 14px rgba(74, 59, 85, 0.08)',
                              fontSize: 13,
                              fontWeight: 700,
                              color: '#D6174A',
                              fontFamily: "'Quicksand', sans-serif",
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#10B981',
                                display: 'inline-block',
                                boxShadow: '0 0 6px #10B981',
                              }}
                            />
                            <span>Listening... blow on your mic! 🌬️</span>
                          </div>
                        )}

                        {(micStatus === 'denied' || micStatus === 'unsupported') && (
                          <div
                            style={{
                              marginTop: 10,
                              fontSize: 12,
                              color: '#831843',
                              background: 'rgba(255, 241, 242, 0.95)',
                              padding: '6px 14px',
                              borderRadius: 14,
                              border: '1px solid rgba(244, 63, 94, 0.25)',
                              textAlign: 'center',
                              maxWidth: 220,
                              fontFamily: "'Quicksand', sans-serif",
                              fontWeight: 600,
                            }}
                          >
                            Mic access not available — tap each candle to put it out! 🕯️
                          </div>
                        )}
                      </>
                    ) : (
                      <div
                        style={{
                          marginTop: 14,
                          padding: '7px 18px',
                          background: 'rgba(240, 106, 147, 0.15)',
                          color: '#D6174A',
                          border: '1.5px dashed #D6174A',
                          borderRadius: 14,
                          fontFamily: "'Quicksand', sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        ✨ All 23 candles blown! ✨
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* ── RIGHT: Text Area ── */}
            <div
              onClick={handleSkipTyping}
              style={{
                flex: '0 0 58%',
                padding: '28px 36px 20px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: isTypingComplete ? 'default' : 'pointer',
                position: 'relative',
              }}
              className="scrapbook-text-side"
            >
              {/* Top Badge */}
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#D6174A',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{badge}</span>
                  <span style={{ fontSize: 10, color: '#A092A6' }}>•</span>
                  <span style={{ fontSize: 10, color: '#A092A6', letterSpacing: '0.04em' }}>PAGE {currentPage} OF 4</span>
                </div>

                {/* PAGE 1 TEXT */}
                {currentPage === 1 && (
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Abril Fatface', serif",
                        fontSize: 27,
                        color: '#2B1A3D',
                        margin: '0 0 16px',
                        lineHeight: 1.25,
                      }}
                    >
                      {activePageData.title}
                    </h2>
                    <div
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: 22,
                        color: '#4A3B55',
                        lineHeight: 1.65,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {pageText.slice(0, typeProgress)}
                    </div>
                  </div>
                )}

                {/* PAGE 2 TEXT */}
                {currentPage === 2 && (
                  <div>
                    <div
                      className="scrapbook-page2-text"
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: 21,
                        color: '#4A3B55',
                        lineHeight: 1.65,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {pageText.slice(0, typeProgress)}
                    </div>
                  </div>
                )}

                {/* PAGE 3: {n} little things about you */}
                {currentPage === 3 && (
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Abril Fatface', serif",
                        fontSize: 25,
                        color: '#2B1A3D',
                        margin: '0 0 16px',
                      }}
                    >
                      {activePageData.listTitle.replace('{n}', activePageData.listItems.length)}
                    </h2>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '10px 18px',
                        marginTop: 10,
                      }}
                    >
                      {activePageData.listItems.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 + 0.05, duration: 0.3 }}
                          style={{
                            fontFamily: "'Caveat', cursive",
                            fontSize: 19,
                            color: '#4A3B55',
                            lineHeight: 1.35,
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'Abril Fatface', serif",
                              fontSize: 14,
                              color: '#D6174A',
                              background: 'rgba(214, 23, 74, 0.08)',
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {index + 1}
                          </span>
                          <span>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PAGE 4 TEXT & WISH (Centered Vertically on Right Half) */}
                {currentPage === 4 && (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '12px 0',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      {PAGE4_LINES.map((line, idx) => (
                        <motion.p
                          key={idx}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: idx * 0.6,
                            duration: 0.5,
                            ease: 'easeOut',
                          }}
                          style={{
                            fontFamily: "'Caveat', cursive",
                            fontSize: 24,
                            color: '#4A3B55',
                            lineHeight: 1.5,
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {line}
                        </motion.p>
                      ))}

                      {/* Line pops in after candles are blown out */}
                      <AnimatePresence>
                        {allCandlesOut && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: [0.8, 1.08, 1], y: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 260,
                              damping: 18,
                              delay: 0.25,
                            }}
                            style={{
                              marginTop: 10,
                              padding: '12px 20px',
                              background: 'linear-gradient(135deg, rgba(240, 106, 147, 0.12) 0%, rgba(192, 132, 252, 0.12) 100%)',
                              borderRadius: 16,
                              border: '2px solid rgba(240, 106, 147, 0.4)',
                              textAlign: 'center',
                              boxShadow: '0 4px 14px rgba(240, 106, 147, 0.15)',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'Caveat', cursive",
                                fontSize: 29,
                                fontWeight: 700,
                                color: '#D6174A',
                                letterSpacing: '0.02em',
                              }}
                            >
                              Happy Birthday, Luna! 🎉
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>

              {/* Click to skip typewriter hint (subtle, pages 1-3 only) */}
              {!isTypingComplete && currentPage !== 4 && (
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "'Quicksand', sans-serif",
                    color: '#A092A6',
                    marginTop: 8,
                  }}
                >
                  Click to show all text
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── BOTTOM CONTROLS ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 52,
            borderTop: '1px solid rgba(240, 106, 147, 0.15)',
            background: 'rgba(253, 248, 245, 0.95)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            zIndex: 10,
          }}
        >
          {/* Back button & Mute button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
            {currentPage > 1 && (
              <button
                onClick={goToPrevPage}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Caveat', cursive",
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#6B5B6E',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 4,
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#D6174A')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6B5B6E')}
              >
                &lt;&lt; Back
              </button>
            )}

            {onToggleMusic && (
              <button
                onClick={onToggleMusic}
                aria-label={isPlayingMusic ? "Mute music" : "Unmute music"}
                title={isPlayingMusic ? "Mute music" : "Unmute music"}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1.5px solid rgba(240, 106, 147, 0.35)',
                  borderRadius: 16,
                  padding: '3px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  color: isPlayingMusic ? '#D6174A' : '#6B5B6E',
                  fontFamily: "'Quicksand', sans-serif",
                  boxShadow: '0 2px 6px rgba(74, 59, 85, 0.08)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{isPlayingMusic ? '🔊 Mute' : '🔇 Unmute'}</span>
              </button>
            )}
          </div>

          {/* Page Indicator Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {[1, 2, 3, 4].map((pNum) => (
              <button
                key={pNum}
                onClick={() => {
                  setDirection(pNum > currentPage ? 1 : -1);
                  setCurrentPage(pNum);
                }}
                style={{
                  width: currentPage === pNum ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: currentPage === pNum ? '#D6174A' : 'rgba(240, 106, 147, 0.3)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                title={`Go to page ${pNum}`}
              />
            ))}
          </div>

          {/* Next >> or Continue >> button */}
          <div style={{ width: 110, display: 'flex', justifyContent: 'flex-end' }}>
            {currentPage < 4 ? (
              <button
                onClick={goToNextPage}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Caveat', cursive",
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#D6174A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 4,
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(3px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
              >
                Next &gt;&gt;
              </button>
            ) : (
              <button
                onClick={onComplete}
                disabled={!allCandlesOut}
                style={{
                  background: allCandlesOut
                    ? 'linear-gradient(135deg, #D6174A 0%, #B80F3C 100%)'
                    : 'rgba(240, 106, 147, 0.2)',
                  color: allCandlesOut ? '#FFFFFF' : '#A092A6',
                  opacity: allCandlesOut ? 1 : 0.45,
                  border: 'none',
                  borderRadius: 14,
                  fontFamily: "'Caveat', cursive",
                  fontSize: 19,
                  fontWeight: 700,
                  padding: '6px 16px',
                  cursor: allCandlesOut ? 'pointer' : 'not-allowed',
                  boxShadow: allCandlesOut ? '0 4px 14px rgba(214, 23, 74, 0.35)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                Continue &gt;&gt;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Responsive styling for mobile */}
      <style>{`
        @media (max-width: 640px) {
          .scrapbook-card-root {
            width: 95vw !important;
            height: 94dvh !important;
            max-height: none !important;
          }
          .scrapbook-page-split {
            flex-direction: column !important;
            padding-bottom: 52px !important;
            overflow-y: auto !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .scrapbook-page-split::-webkit-scrollbar {
            display: none !important;
          }
          .scrapbook-collage-side {
            flex: 0 0 auto !important;
            min-height: 160px !important;
            max-height: 180px !important;
            border-right: none !important;
            border-bottom: 1.5px dashed rgba(240, 106, 147, 0.22) !important;
            padding: 8px !important;
          }
          .scrapbook-collage-side:has(.page4-collage),
          .scrapbook-collage-side.has-page4 {
            min-height: 230px !important;
            max-height: 250px !important;
          }
          .scrapbook-collage-side svg {
            width: 150px !important;
            height: 135px !important;
          }
          .scrapbook-text-side {
            flex: 1 1 auto !important;
            padding: 12px 16px 20px !important;
          }
          .scrapbook-page2-text {
            font-size: 17.5px !important;
            line-height: 1.48 !important;
          }
          .scrapbook-polaroid-box {
            width: 145px !important;
            padding: 8px 8px 10px !important;
          }
          .scrapbook-polaroid-img-wrap {
            height: 115px !important;
          }
        }
      `}</style>
    </div>
  );
}
