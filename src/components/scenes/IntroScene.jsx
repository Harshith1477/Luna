import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import { BIRTHDAY_CONTENT } from '../../config/content';

export default function IntroScene({ onStart }) {
  const { recipient, intro } = BIRTHDAY_CONTENT;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#110e1b] via-[#1c142b] to-[#251733] text-pink-50 px-6 overflow-hidden select-none"
    >
      {/* Background glowing celestial orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-pink-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[260px] h-[260px] bg-purple-600/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Floating subtle star sparkles in background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(14)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0.2, scale: 0.8 }}
            animate={{
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2.5 + (i % 4),
              repeat: Infinity,
              delay: (i * 0.3) % 3,
            }}
            style={{
              top: `${(i * 19 + 7) % 90}%`,
              left: `${(i * 23 + 11) % 92}%`,
            }}
            className="absolute text-yellow-200/60 text-xs sm:text-sm select-none"
          >
            ✦
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md text-center">
        {/* Cute Floating Gift Icon with Pulsing Halo */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, -2, 2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: 'easeInOut',
          }}
          className="relative mb-8"
        >
          {/* Pulsing ring aura */}
          <div className="absolute inset-0 rounded-full bg-pink-500/25 blur-xl animate-pulse" />
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-pink-500/30 to-purple-400/20 border border-pink-400/40 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-pink-500/30">
            <span className="text-5xl sm:text-6xl drop-shadow-lg select-none">
              🎁
            </span>
          </div>

          {/* Floating tiny heart */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              y: [-2, 2, -2],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2 bg-pink-500 text-white p-1.5 rounded-full shadow-lg border border-pink-300"
          >
            <Heart className="w-4 h-4 fill-current" />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-500/15 border border-pink-400/30 text-pink-200 text-xs sm:text-sm mb-4 backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-300" />
          <span>{intro.badge}</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 font-heading"
        >
          For <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-purple-300">{recipient.name}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm sm:text-base text-pink-200/80 mb-8 max-w-xs sm:max-w-sm leading-relaxed font-body"
        >
          {intro.subtext}
        </motion.p>

        {/* Glowing "Tap to open 🎁" button */}
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="relative group cursor-pointer focus:outline-none"
        >
          {/* Animated glow under button */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />

          {/* Button face */}
          <div className="relative flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-base sm:text-lg shadow-xl shadow-pink-900/40 border border-pink-300/40">
            <span>{intro.buttonText}</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              ✨
            </motion.span>
          </div>
        </motion.button>
      </div>

      {/* Subtle hint footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 text-[11px] text-pink-300/60 tracking-wider uppercase font-mono"
      >
        A magical surprise awaits you
      </motion.p>
    </motion.div>
  );
}
