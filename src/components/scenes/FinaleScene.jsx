/**
 * FinaleScene.jsx
 * Birthday Celebration Finale Scene
 * - Warm soft night-sky gradient: deep plum (#2a1038) -> rose (#5a2350) -> warm peach glow (#ff9a8b)
 * - Subtler twinkling stars + soft radial glow behind cake
 * - Heading: "Kaouther" never breaks mid-word, scales smoothly via clamp(), centered
 * - 3-Candle unified cake with mic blow detection & tap fallback
 * - Cats wish: Speech bubble "Happy Birthday, Luna! 🎉🎂" + SpeechSynthesis vocal cheer
 * - Revealable quote card & "Relive the magic" full reset
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, ArrowUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BIRTHDAY_CONTENT } from '../../config/content';
import CakeWithCandles from '../CakeWithCandles';
import AnimatedCats from '../cats/AnimatedCats';

// ==========================================
// 🏷️ PERSONALIZED NAME CONSTANTS
// ==========================================
export const NAME      = "Luna";     // Main heading name
export const WISH_NAME = "Luna";     // Wish speech bubble & speech voice name

export default function FinaleScene({ onReplay, id = "finale" }) {
  const { sender, finale } = BIRTHDAY_CONTENT;
  const [hasBlownCandles, setHasBlownCandles] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(false);

  // When all candles are blown out
  const handleBlownOut = useCallback(() => {
    setHasBlownCandles(true);

    // Confetti celebration burst
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ff718d', '#f43f5e', '#fbbf24', '#a855f7', '#38bdf8', '#fff'],
    });

    const end = Date.now() + 3000;
    const iv = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(iv);
        return;
      }
      confetti({
        startVelocity: 28,
        spread: 360,
        ticks: 55,
        origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.45 + 0.1 },
        colors: ['#f43f5e', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
      });
    }, 420);
  }, []);

  // "Relive the magic": Reset everything back to beginning
  const handleReliveMagic = () => {
    setHasBlownCandles(false);
    setResetTrigger((prev) => !prev);

    // Smooth scroll to top of page/scene
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (onReplay) {
      onReplay();
    }
  };

  return (
    <section
      id={id}
      className="relative min-h-screen py-16 px-4 sm:px-6 md:px-12 text-[#2a1038] overflow-x-hidden flex flex-col items-center justify-between"
      style={{
        background: 'linear-gradient(180deg, #FAEEF7 0%, #FFF3F8 100%)',
      }}
    >
      <style>{`
        .birthday-heading {
          font-family: 'Metamorphous', serif;
          font-size: clamp(2.1rem, 6vw, 4.4rem);
          line-height: 1.22;
          letter-spacing: 0.02em;
          text-align: center;
        }
        .birthday-heading .name {
          font-family: 'Metamorphous', serif;
          display: block;
          white-space: nowrap;
          word-break: keep-all;
          overflow-wrap: normal;
        }
      `}</style>

      {/* ==================================================== */}
      {/* 🌸 BACKGROUND: SOFT PINK, WHITE/PEACH GLOW, PASTEL DECOR */}
      {/* ==================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft peach/white ambient glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[380px] bg-white/70 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[360px] h-[360px] bg-pink-200/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[320px] h-[320px] bg-rose-100/50 rounded-full blur-[90px] pointer-events-none" />

        {/* Scattered slowly floating pastel flowers, tulips, stars, and sparkles */}
        {[
          { icon: '🌸', top: '8%',  left: '10%', size: 'text-base sm:text-lg', dur: 5.2 },
          { icon: '🌷', top: '15%', left: '85%', size: 'text-lg sm:text-xl',  dur: 6.0 },
          { icon: '✨', top: '22%', left: '20%', size: 'text-sm sm:text-base', dur: 4.8 },
          { icon: '⭐', top: '12%', left: '72%', size: 'text-xs sm:text-sm',  dur: 5.6 },
          { icon: '🌼', top: '32%', left: '8%',  size: 'text-base sm:text-lg', dur: 6.4 },
          { icon: '🌷', top: '40%', left: '92%', size: 'text-base sm:text-lg', dur: 5.0 },
          { icon: '💖', top: '48%', left: '14%', size: 'text-xs sm:text-sm',  dur: 4.4 },
          { icon: '✨', top: '55%', left: '82%', size: 'text-sm sm:text-base', dur: 5.8 },
          { icon: '🌸', top: '65%', left: '6%',  size: 'text-lg sm:text-xl',  dur: 6.2 },
          { icon: '⭐', top: '72%', left: '88%', size: 'text-xs sm:text-sm',  dur: 4.6 },
          { icon: '🌷', top: '80%', left: '16%', size: 'text-base sm:text-lg', dur: 5.4 },
          { icon: '🌼', top: '88%', left: '78%', size: 'text-sm sm:text-base', dur: 6.6 },
          { icon: '✨', top: '92%', left: '32%', size: 'text-xs sm:text-sm',  dur: 5.0 },
          { icon: '🌸', top: '28%', left: '90%', size: 'text-sm sm:text-base', dur: 5.5 },
          { icon: '⭐', top: '60%', left: '24%', size: 'text-xs sm:text-sm',  dur: 4.9 },
          { icon: '🌷', top: '70%', left: '70%', size: 'text-base sm:text-lg', dur: 5.7 },
        ].map((item, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -16, 0],
              rotate: [-3, 3, -3],
              opacity: [0.45, 0.72, 0.45],
            }}
            transition={{
              duration: item.dur,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (i * 0.35) % 3,
            }}
            style={{
              top: item.top,
              left: item.left,
            }}
            className={`absolute ${item.size} select-none pointer-events-none filter drop-shadow-xs`}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* ==================================================== */}
      {/* 👑 TOP: SUBTITLE BADGE & NON-WRAPPING HEADING        */}
      {/* ==================================================== */}
      <div className="relative z-10 max-w-3xl mx-auto text-center mb-6 pt-2">
        {/* Subtitle Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/85 border border-pink-200/90 text-[#2a1038] text-xs sm:text-sm font-semibold mb-4 shadow-sm backdrop-blur-xs select-none"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{finale.subheading || "Make a birthday wish and blow out the candles! 🕯️"}</span>
        </motion.div>

        {/* Heading: Never breaks mid-word, breaks cleanly between phrase & name */}
        <h1 className="birthday-heading font-metamorphous text-center">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2a1038] via-[#5a1846] to-[#c2185b] pb-1">
            Happy Birthday,
          </span>
          <span className="name text-transparent bg-clip-text bg-gradient-to-r from-[#2a1038] via-[#881337] to-[#c2185b] drop-shadow-xs">
            {NAME}! 🎂
          </span>
        </h1>

        <p className="text-[#2a1038]/75 font-body text-xs sm:text-sm max-w-md mx-auto mt-2 font-medium">
          {finale.cakeHint || "Tap the candles (or blow into your mic) to extinguish them"}
        </p>
      </div>

      {/* ==================================================== */}
      {/* 🎂 CENTER: CAKE WITH 3 CANDLES & SOFT WHITE/PEACH GLOW */}
      {/* ==================================================== */}
      <div className="relative z-10 w-full max-w-md my-2 flex flex-col items-center">
        {/* Soft white / peach radial glow directly behind the cake */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[300px] rounded-full bg-gradient-to-r from-white/90 via-rose-100/50 to-amber-100/40 blur-3xl pointer-events-none" />

        <CakeWithCandles onBlownOut={handleBlownOut} isReset={resetTrigger} />
      </div>

      {/* ==================================================== */}
      {/* 🐱 CATS SECTION WITH SPEECH BUBBLE                   */}
      {/* ==================================================== */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center mt-8">
        {/* Speech Bubble: Pops up when candles are blown out */}
        <AnimatePresence>
          {hasBlownCandles && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: [0.8, 1.08, 1] }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="relative mb-4 px-6 py-3 rounded-2xl bg-white text-[#c2185b] font-bold font-heading text-lg sm:text-xl shadow-xl border-2 border-pink-200 select-none text-center"
            >
              <span>Happy Birthday, {WISH_NAME}! 🎉🎂</span>
              {/* Downward pointer directed at the cats */}
              <div className="absolute left-1/2 -bottom-2.5 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-2 text-center select-none">
          <span className="text-xs font-mono tracking-widest text-[#2a1038]/85 uppercase font-semibold">
            {hasBlownCandles ? '🎉 Party Time! Cats are dancing! 🐱' : 'The cats are waiting for your wish 🎶'}
          </span>
        </div>

        {/* Cats: Idle before blow, jumping/dancing after blow */}
        <AnimatedCats mode={hasBlownCandles ? 'dancing' : 'sitting'} />
      </div>

      {/* ==================================================== */}
      {/* 💌 BOTTOM: REVEALABLE QUOTE CARD & RELIVE MAGIC      */}
      {/* ==================================================== */}
      <AnimatePresence>
        {hasBlownCandles && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 max-w-xl w-full mx-auto text-center mt-12 mb-4"
          >
            {/* Quote Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/85 border border-pink-200 backdrop-blur-md shadow-xl">
              <p className="font-handwriting text-2xl sm:text-3xl text-[#2a1038] font-bold mb-3 leading-snug">
                "{finale.closingLine}"
              </p>
              <p className="text-base sm:text-lg font-script text-[#881337] font-semibold">
                {finale.closingSignature || `${sender.signOff} ${sender.name}`}
              </p>

              {/* Pulsing heart */}
              <div className="flex justify-center mt-4">
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="w-9 h-9 rounded-full bg-pink-100/90 border border-pink-200/90 flex items-center justify-center text-[#c2185b] shadow-xs"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </motion.div>
              </div>
            </div>

            {/* Relive the magic Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleReliveMagic}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/90 hover:bg-white text-[#2a1038] border border-pink-200 text-sm sm:text-base font-semibold transition-all transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm shadow-md hover:shadow-lg"
              >
                <ArrowUp className="w-4 h-4" />
                <span>{finale.replayText || "Relive the magic 💫"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
