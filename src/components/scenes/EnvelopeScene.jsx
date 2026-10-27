import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { BIRTHDAY_CONTENT } from '../../config/content';
import AnimatedCats from '../cats/AnimatedCats';
import LetterModal from './LetterModal';

export default function EnvelopeScene({ onProceedToMemories }) {
  const { envelopeScene, recipient } = BIRTHDAY_CONTENT;
  const [isOpening, setIsOpening] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [catSpeech, setCatSpeech] = useState("Meow! We've been guarding this letter for you! 🐾");

  const handleEnvelopeClick = () => {
    if (isOpening || isLetterOpen) return;
    setIsOpening(true);
    setCatSpeech("Look! The flap is opening! 🎉");

    // Dramatic cinematic sequence: flap opens, paws pull letter out
    setTimeout(() => {
      setIsLetterOpen(true);
      setIsOpening(false);
    }, 900);
  };

  const handleCatInteract = (catName) => {
    const quotes = {
      Fubu: "Fubu purrs happily: Happy birthday! 🎂",
      Mochi: "Fubu purrs happily: Happy birthday! 🎂",
      Biscuit: "Biscuit nudges your hand: Open the letter! ✨",
      Boba: "Boba rolls over: Best human ever! 💕",
    };
    setCatSpeech(quotes[catName] || "Purr... meow! 🐾");
  };

  const handleLetterClose = () => {
    setIsLetterOpen(false);
  };

  const handleLetterContinue = () => {
    setIsLetterOpen(false);
    if (onProceedToMemories) {
      setTimeout(onProceedToMemories, 300);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-between py-12 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-[#fff6f0] via-[#fdf2f4] to-[#fbf1f8]">
      {/* Background Fairy Lights Hanging from Top */}
      <div className="absolute top-0 inset-x-0 flex justify-around pointer-events-none z-10 opacity-70">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-[1px] h-6 sm:h-10 bg-amber-300/40" />
            <motion.div
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.9, 1.15, 0.9],
              }}
              transition={{
                duration: 1.8 + (i % 3) * 0.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3.5 h-3.5 rounded-full bg-amber-200 shadow-md shadow-amber-300/80 border border-amber-100"
            />
          </div>
        ))}
      </div>

      {/* Top Banner and Cat Speech Bubble */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-lg mt-6">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-100 border border-pink-200 text-pink-700 text-xs sm:text-sm font-medium mb-3 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>{envelopeScene.title}</span>
        </motion.div>

        {/* Dynamic Cat speech bubble */}
        <motion.div
          key={catSpeech}
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative px-5 py-2.5 rounded-2xl bg-white/90 border border-pink-200 text-pink-900 text-sm font-body shadow-sm backdrop-blur-xs max-w-xs sm:max-w-md"
        >
          <p>{catSpeech}</p>
          {/* Speech bubble beak */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 border-r border-b border-pink-200 rotate-45" />
        </motion.div>
      </div>

      {/* CENTER: The Desk / Windowsill with Sealed Envelope */}
      <div className="relative z-20 w-full max-w-lg flex flex-col items-center my-auto py-8">
        {/* Soft Glow behind envelope */}
        <div className="absolute inset-0 max-w-xs mx-auto h-48 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />

        {/* Envelope Container */}
        <motion.div
          onClick={handleEnvelopeClick}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          animate={
            isOpening
              ? { scale: [1, 1.08, 1.04], y: -8 }
              : { y: [0, -6, 0] }
          }
          transition={{
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 0.3 }
          }}
          className="relative cursor-pointer group select-none"
        >
          {/* Floating hint over envelope */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-10 inset-x-0 flex justify-center pointer-events-none"
          >
            <span className="px-3 py-1 rounded-full bg-pink-500/90 text-white text-xs font-medium shadow-md flex items-center gap-1.5">
              <span>Tap to open</span>
              <Sparkles className="w-3 h-3 text-yellow-200" />
            </span>
          </motion.div>

          {/* Envelope Graphic */}
          <div className="relative w-72 sm:w-84 h-48 sm:h-54 bg-[#fdf8f4] rounded-2xl border-2 border-[#eddcd2] shadow-2xl shadow-pink-200/60 overflow-visible flex items-center justify-center [perspective:1000px]">
            {/* Diagonal envelope fold lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl overflow-hidden"
              preserveAspectRatio="none"
              viewBox="0 0 320 200"
            >
              <line x1="0" y1="0" x2="160" y2="120" stroke="#ebd1c3" strokeWidth="2" />
              <line x1="320" y1="0" x2="160" y2="120" stroke="#ebd1c3" strokeWidth="2" />
              <line x1="0" y1="200" x2="140" y2="105" stroke="#e8cbba" strokeWidth="1.5" />
              <line x1="320" y1="200" x2="180" y2="105" stroke="#e8cbba" strokeWidth="1.5" />
            </svg>

            {/* Envelope Flap (lifts when opening) */}
            <motion.div
              animate={{
                rotateX: isOpening ? -160 : 0,
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
              className="absolute top-0 inset-x-0 h-1/2 bg-[#f9eee7] rounded-t-2xl border-b border-[#eddcd2] z-20 flex items-center justify-center shadow-xs"
            >
              {/* Flap triangle decorative stitch */}
              <div className="w-full h-full flex items-center justify-center border-b border-pink-200/50" />
            </motion.div>

            {/* Emerging Letter preview when opening */}
            <motion.div
              animate={{
                y: isOpening ? -70 : 0,
                opacity: isOpening ? 1 : 0,
              }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute inset-x-4 h-44 paper-texture rounded-lg border border-pink-200/80 z-[15] flex flex-col items-center justify-center p-4 text-center shadow-md"
            >
              <span className="text-sm font-handwriting text-pink-700 font-bold">
                Dearest {recipient.name}...
              </span>
            </motion.div>

            {/* Center Wax Heart Seal */}
            <motion.div
              animate={
                isOpening
                  ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] }
                  : { scale: [1, 1.04, 1] }
              }
              transition={{
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="relative z-30 w-16 h-16 rounded-full wax-seal flex items-center justify-center cursor-pointer shadow-lg group-hover:scale-105 transition-transform"
            >
              <Heart className="w-8 h-8 text-rose-100 fill-rose-100/90 filter drop-shadow-sm" />
            </motion.div>

            {/* Recipient Name embossed on front */}
            <div className="absolute bottom-3 right-5 z-25 text-right pointer-events-none">
              <span className="text-xs uppercase tracking-widest text-[#a88d80] font-mono font-medium">
                To: {recipient.name} 💌
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM: Cozy Windowsill / Desk Base with the Three Cats */}
      <div className="relative z-20 w-full max-w-2xl flex flex-col items-center mt-2">
        {/* The Animated Cats */}
        <AnimatedCats
          mode={isOpening ? 'opening' : 'sitting'}
          onCatClick={handleCatInteract}
        />

        {/* Windowsill / Desk Platform */}
        <div className="w-full h-8 sm:h-10 bg-gradient-to-r from-[#e7cbba] via-[#f3decb] to-[#e7cbba] rounded-t-xl border-t-2 border-[#d5b39e] shadow-lg flex items-center justify-between px-6 text-stone-500 text-xs">
          <div className="flex items-center gap-2">
            <span className="select-none">🪴</span>
            <span className="text-[11px] font-mono text-stone-600 hidden sm:inline">cozy windowsill</span>
          </div>
          <div className="flex items-center gap-2 select-none">
            <span title="Warm tea">☕</span>
            <span title="Cat treats">🐟</span>
          </div>
        </div>
      </div>

      {/* Full Screen Unfolded Letter Modal */}
      <LetterModal
        isOpen={isLetterOpen}
        onClose={handleLetterClose}
        onContinue={handleLetterContinue}
      />
    </section>
  );
}
