/**
 * CakeWithCandles.jsx
 * Unified Cake & 3 Candles component
 * - Single grouped SVG ensures candles sit directly on top of the frosting at all screen widths (375px to 1440px+)
 * - Web Audio API blow-to-extinguish detection with live mic level meter
 * - Flames lean & flicker in proportion to mic volume while blowing
 * - Staggered flame extinction with smoke puffs
 * - Tap candle fallback (always active, works if mic is denied or unavailable)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================================
// 🎛️ TUNABLE BLOW DETECTION CONSTANTS
// ==========================================
// 🎛️ TUNABLE BLOW DETECTION CONSTANTS
// ==========================================
export const BLOW_RMS_THRESHOLD = 0.038; // Sensitive threshold for immediate blow response

export default function CakeWithCandles({ onBlownOut, isReset = false }) {
  // 3 candles: true = lit, false = extinguished
  const [candles, setCandles] = useState([true, true, true]);
  const [micStatus, setMicStatus] = useState('idle'); // 'idle' | 'listening' | 'denied' | 'unsupported'
  const [liveVolume, setLiveVolume] = useState(0);

  const streamRef    = useRef(null);
  const audioCtxRef  = useRef(null);
  const analyserRef  = useRef(null);
  const rafRef       = useRef(null);
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
  }, []);

  // Reset when parent requests it
  useEffect(() => {
    setCandles([true, true, true]);
    hasTriggeredRef.current = false;
    stopMic();
    setMicStatus('idle');
  }, [isReset, stopMic]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopMic();
    };
  }, [stopMic]);

  // Staggered extinguish of all candles
  const extinguishAll = useCallback(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    stopMic();
    setMicStatus('idle');

    // Stagger candle 0, then 1, then 2
    setCandles([false, true, true]);
    setTimeout(() => {
      setCandles([false, false, true]);
      setTimeout(() => {
        setCandles([false, false, false]);
        if (onBlownOut) onBlownOut();
      }, 130);
    }, 130);
  }, [stopMic, onBlownOut]);

  // Tap a single candle fallback
  const handleTapCandle = (index) => {
    if (!candles[index]) return; // already out
    const next = [...candles];
    next[index] = false;
    setCandles(next);

    // If all are now out
    if (next.every((c) => !c)) {
      hasTriggeredRef.current = true;
      stopMic();
      setMicStatus('idle');
      if (onBlownOut) onBlownOut();
    }
  };

  // Start listening to microphone
  const turnOnMic = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unsupported');
      return;
    }

    try {
      // Disable noiseSuppression & echoCancellation so breathing/puffing isn't filtered out by the browser
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
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);
      analyserRef.current = analyser;

      setMicStatus('listening');
      hasTriggeredRef.current = false;

      const timeData = new Uint8Array(analyser.fftSize);
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      let blowHits = 0;

      const loop = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(timeData);
        analyserRef.current.getByteFrequencyData(freqData);

        // Compute RMS
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const norm = (timeData[i] - 128) / 128;
          sum += norm * norm;
        }
        const rms = Math.sqrt(sum / timeData.length);
        setLiveVolume(rms);

        // Low frequency wind/puff energy (first 8 bins ~ 0-700Hz)
        let lowEnergy = 0;
        for (let i = 0; i < 8; i++) {
          lowEnergy += freqData[i];
        }
        const lowAvg = lowEnergy / 8;

        // Immediate blow detection: trigger as soon as user blows into the mic
        if (rms >= BLOW_RMS_THRESHOLD || (rms >= 0.025 && lowAvg > 35)) {
          blowHits++;
          if (blowHits >= 2) { // 2 frames (~30ms) triggers immediately
            extinguishAll();
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

  const allOut = candles.every((c) => !c);

  // Flame lean angle in degrees based on live volume
  const flameTilt = Math.min(32, (liveVolume / BLOW_RMS_THRESHOLD) * 26);

  // Candle X positions in the 340x240 SVG coordinate system
  // Frosting top surface is at y = 110.
  // Candle bottom sits at y = 112 (anchored into frosting).
  const candleConfigs = [
    { x: 115, color: '#fbcfe8', stripe: '#f43f5e' }, // Left candle
    { x: 170, color: '#fef08a', stripe: '#eab308' }, // Center candle
    { x: 225, color: '#bae6fd', stripe: '#0284c7' }, // Right candle
  ];

  return (
    <div className="flex flex-col items-center w-full select-none">
      <style>{`
        @keyframes flameFlickerA {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25%      { transform: scale(1.06, 0.94) rotate(-2.5deg); }
          50%      { transform: scale(0.95, 1.05) rotate(2deg); }
          75%      { transform: scale(1.03, 0.97) rotate(-1deg); }
        }
        @keyframes flameFlickerB {
          0%, 100% { transform: scale(0.97, 1.03) rotate(1.5deg); }
          30%      { transform: scale(1.05, 0.95) rotate(-2deg); }
          60%      { transform: scale(0.98, 1.02) rotate(2.5deg); }
          85%      { transform: scale(1.02, 0.98) rotate(-1deg); }
        }
        @keyframes smokeFloat1 {
          0%   { opacity: 0.85; transform: translateY(0) scale(0.5); }
          100% { opacity: 0;    transform: translateY(-35px) scale(2); }
        }
        @keyframes smokeFloat2 {
          0%   { opacity: 0.75; transform: translateY(0) scale(0.6); }
          100% { opacity: 0;    transform: translateY(-45px) scale(2.4); }
        }
        .flame-anim-0 { animation: flameFlickerA 1.8s infinite ease-in-out; }
        .flame-anim-1 { animation: flameFlickerB 1.6s infinite ease-in-out; }
        .flame-anim-2 { animation: flameFlickerA 2.1s infinite ease-in-out; }
        .smoke-1 { animation: smokeFloat1 1.4s ease-out forwards; }
        .smoke-2 { animation: smokeFloat2 1.6s 0.15s ease-out forwards; }
      `}</style>

      {/* ==================================================== */}
      {/* 🎂 UNIFIED SVG CAKE & 3 CANDLES (CAN NEVER DRIFT)    */}
      {/* ==================================================== */}
      <div className="relative w-full max-w-[340px] px-2">
        <svg
          viewBox="0 0 340 240"
          className="w-full h-auto overflow-visible drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Flame color gradient */}
            <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffb703" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#fb8500" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#fb8500" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="flameCore" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ff5400" />
              <stop offset="40%" stopColor="#ffb703" />
              <stop offset="85%" stopColor="#ffea79" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            {/* Frosting drop shadow */}
            <filter id="frostingShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="#2b140d" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* 1. PLATE */}
          <rect x="40" y="212" width="260" height="12" rx="6" fill="#f8ede3" />
          <rect x="34" y="220" width="272" height="5" rx="2.5" fill="#e5d4c6" />

          {/* 2. BOTTOM CAKE LAYER (Cocoa Brown) */}
          <rect x="58" y="166" width="224" height="48" rx="6" fill="#6d3e30" />
          {/* Subtle highlight sheen */}
          <rect x="62" y="169" width="216" height="6" rx="3" fill="#804a3b" opacity="0.6" />

          {/* 3. MIDDLE CHOCOLATE FUDGE FILLING STRIPE */}
          <rect x="58" y="186" width="224" height="10" fill="#442116" />

          {/* 4. TOP CAKE LAYER (Cocoa Brown) */}
          <rect x="58" y="120" width="224" height="48" rx="6" fill="#6d3e30" />
          {/* Highlight sheen */}
          <rect x="62" y="123" width="216" height="5" rx="2.5" fill="#804a3b" opacity="0.6" />

          {/* 5. LUSCIOUS WHITE/CREAM FROSTING WITH DRIPS */}
          {/* Top frosting surface sits flat at y=110, drips hang down to y=168 */}
          <path
            d="
              M 55 125
              C 55 113 65 110 78 110
              L 262 110
              C 275 110 285 113 285 125
              L 285 138
              C 281 148 275 152 268 142
              C 261 132 255 162 243 164
              C 233 166 227 136 217 136
              C 207 136 201 166 189 168
              C 179 170 173 138 163 138
              C 153 138 147 162 137 164
              C 127 166 121 136 111 136
              C 101 136 95 158 85 160
              C 75 162 69 134 55 138
              Z
            "
            fill="#fffdf9"
            filter="url(#frostingShadow)"
          />

          {/* 6. THREE CANDLES (EVENLY SPACED, SITTING ON FROSTING SURFACE) */}
          {candleConfigs.map((cfg, idx) => {
            const isLit = candles[idx];
            const cx = cfg.x;
            const candleTop = 68;
            const candleBottom = 112; // Touches into the frosting at y=110!
            const candleH = candleBottom - candleTop; // 44px
            const wickTop = 58;

            // Tilt flame towards the right when blowing
            const leanAngle = liveVolume > 0.04 ? flameTilt : 0;

            return (
              <g
                key={idx}
                className="cursor-pointer transition-transform active:scale-95"
                onClick={() => handleTapCandle(idx)}
                role="button"
                tabIndex={0}
                aria-label={`Candle ${idx + 1}, ${isLit ? 'lit - click to extinguish' : 'extinguished'}`}
              >
                {/* Candle body (white with colored stripes) */}
                <rect
                  x={cx - 5.5}
                  y={candleTop}
                  width="11"
                  height={candleH}
                  rx="3.5"
                  fill="#ffffff"
                  stroke="#f1e6db"
                  strokeWidth="0.8"
                />

                {/* Decorative diagonal stripes */}
                <path
                  d={`
                    M ${cx - 5.5} ${candleTop + 8}  L ${cx + 5.5} ${candleTop + 4}
                    M ${cx - 5.5} ${candleTop + 18} L ${cx + 5.5} ${candleTop + 14}
                    M ${cx - 5.5} ${candleTop + 28} L ${cx + 5.5} ${candleTop + 24}
                    M ${cx - 5.5} ${candleTop + 38} L ${cx + 5.5} ${candleTop + 34}
                  `}
                  stroke={cfg.stripe}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  opacity="0.85"
                />

                {/* Wick */}
                <line
                  x1={cx}
                  y1={candleTop}
                  x2={cx}
                  y2={wickTop}
                  stroke="#3e2d24"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* ================= FLAME (WHEN LIT) ================= */}
                {isLit ? (
                  <g
                    style={{
                      transformOrigin: `${cx}px ${wickTop}px`,
                      transform: `rotate(${leanAngle}deg)`,
                      transition: 'transform 0.08s ease-out',
                    }}
                  >
                    {/* Flame outer warm glow halo */}
                    <circle cx={cx} cy={wickTop - 12} r="18" fill="url(#flameGlow)" />

                    {/* Animated flicker group */}
                    <g className={`flame-anim-${idx}`}>
                      {/* Teardrop flame body */}
                      <path
                        d={`
                          M ${cx} ${wickTop - 24}
                          C ${cx + 6.5} ${wickTop - 14} ${cx + 7.5} ${wickTop - 4} ${cx + 5} ${wickTop - 1}
                          C ${cx + 3} ${wickTop + 1} ${cx - 3} ${wickTop + 1} ${cx - 5} ${wickTop - 1}
                          C ${cx - 7.5} ${wickTop - 4} ${cx - 6.5} ${wickTop - 14} ${cx} ${wickTop - 24}
                          Z
                        `}
                        fill="url(#flameCore)"
                      />

                      {/* White-hot inner core */}
                      <ellipse
                        cx={cx}
                        cy={wickTop - 7}
                        rx="2.6"
                        ry="5.5"
                        fill="#ffffff"
                        opacity="0.9"
                      />
                    </g>
                  </g>
                ) : (
                  /* ================= SMOKE PUFFS (WHEN EXTINGUISHED) ================= */
                  <g>
                    <circle
                      cx={cx - 1}
                      cy={wickTop - 8}
                      r="4"
                      fill="rgba(235, 230, 225, 0.75)"
                      className="smoke-1"
                      style={{ transformOrigin: `${cx}px ${wickTop}px` }}
                    />
                    <circle
                      cx={cx + 2}
                      cy={wickTop - 16}
                      r="6"
                      fill="rgba(220, 215, 210, 0.5)"
                      className="smoke-2"
                      style={{ transformOrigin: `${cx}px ${wickTop}px` }}
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ==================================================== */}
      {/* 🎤 INTERACTIVE BLOW CONTROLS & MIC LEVEL BAR         */}
      {/* ==================================================== */}
      <div className="flex flex-col items-center mt-3 text-center min-h-[78px]">
        {!allOut ? (
          <>
            {micStatus === 'idle' && (
              <div className="flex flex-col items-center">
                <button
                  onClick={turnOnMic}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-semibold text-sm sm:text-base shadow-lg shadow-pink-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 border border-pink-200"
                >
                  <span>🎤</span>
                  <span>Turn on mic & blow</span>
                </button>
                <p className="text-xs text-[#2a1038]/70 mt-2 font-medium">
                  Tap any candle or turn on mic to extinguish them 🌬️
                </p>
              </div>
            )}

            {micStatus === 'listening' && (
              <div className="flex flex-col items-center gap-1.5 bg-white/90 px-6 py-3 rounded-2xl border border-pink-200 shadow-sm backdrop-blur-xs">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#2a1038]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Listening... Blow on your mic! 🌬️</span>
                </div>
                <p className="text-[11px] text-[#2a1038]/60 font-medium">
                  Or tap any candle directly to blow it out
                </p>
              </div>
            )}

            {micStatus === 'denied' && (
              <div className="flex flex-col items-center text-center max-w-xs">
                <p className="text-xs text-[#2a1038] bg-white/90 px-4 py-2 rounded-full border border-pink-200 shadow-xs font-medium">
                  Mic access not available — tap each candle to blow it out! 🕯️
                </p>
              </div>
            )}

            {micStatus === 'unsupported' && (
              <p className="text-xs text-[#2a1038]/80 font-medium">
                Tap each candle to blow it out! 🕯️
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm sm:text-base text-[#2a1038] font-bold bg-white/90 px-5 py-2.5 rounded-full border border-pink-200 shadow-md backdrop-blur-xs">
            <span>✨</span>
            <span>All candles blown out! Wish granted!</span>
            <span>🎉</span>
          </div>
        )}
      </div>
    </div>
  );
}
