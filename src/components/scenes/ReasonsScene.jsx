import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, RefreshCw } from 'lucide-react';
import { BIRTHDAY_CONTENT } from '../../config/content';

export default function ReasonsScene({ id = "reasons" }) {
  const { reasons } = BIRTHDAY_CONTENT;
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const flipAll = () => {
    const allFlipped = Object.keys(flippedCards).length === reasons.length && 
      Object.values(flippedCards).every(Boolean);

    if (allFlipped) {
      setFlippedCards({});
    } else {
      const next = {};
      reasons.forEach((_, i) => { next[i] = true; });
      setFlippedCards(next);
    }
  };

  return (
    <section
      id={id}
      className="relative min-h-screen py-20 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-[#fcf0f5] via-[#fbf3fa] to-[#1e152f] text-stone-800 transition-colors duration-1000 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-xl mx-auto text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-100 border border-pink-200 text-pink-700 text-xs sm:text-sm font-medium mb-3 shadow-xs"
        >
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-300" />
          <span>Things I Adore About You</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold font-heading mb-3 text-stone-900 tracking-tight"
        >
          Reasons Why You're Special 💖
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-stone-600 font-body text-sm sm:text-base leading-relaxed mb-6"
        >
          Tap any card to flip it over and uncover a sweet note written just for you.
        </motion.p>

        {/* Flip All quick action button */}
        <button
          onClick={flipAll}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-pink-700 bg-white/80 hover:bg-white border border-pink-200 shadow-xs cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Flip all cards</span>
        </button>
      </div>

      {/* Reasons Grid (Cards with 3D Flip) */}
      <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {reasons.map((item, index) => {
          const isFlipped = !!flippedCards[index];

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-64 sm:h-72 [perspective:1000px] cursor-pointer select-none"
              onClick={() => toggleFlip(index)}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative w-full h-full"
              >
                {/* FRONT SIDE */}
                <div
                  style={{ backfaceVisibility: 'hidden' }}
                  className="absolute inset-0 rounded-2xl bg-white/90 backdrop-blur-md p-6 border-2 border-pink-200/70 shadow-lg shadow-pink-100/50 flex flex-col justify-between hover:border-pink-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-pink-500 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-150">
                      REASON #{item.number}
                    </span>
                    <span className="text-3xl">{item.emoji}</span>
                  </div>

                  <div className="my-auto text-center py-2">
                    <h3 className="text-xl sm:text-2xl font-bold font-heading text-stone-800 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-500 font-body">
                      Tap card to reveal note ✨
                    </p>
                  </div>

                  <div className="flex items-center justify-center pt-2 border-t border-pink-100">
                    <span className="inline-flex items-center gap-1.5 text-xs text-pink-600 font-medium font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>Tap to flip 💌</span>
                    </span>
                  </div>
                </div>

                {/* BACK SIDE (REVEALED NOTE) */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-6 border-2 border-pink-300 shadow-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-500">
                      NOTE #{item.number}
                    </span>
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </div>

                  <div className="my-auto">
                    <p className="font-handwriting text-xl sm:text-2xl text-stone-800 leading-snug">
                      "{item.text}"
                    </p>
                  </div>

                  <div className="text-right pt-2 border-t border-pink-200/50">
                    <span className="text-[11px] font-script text-pink-700 font-semibold">
                      Always true for you 🌸
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Transition to Night Sky Indicator */}
      <div className="relative z-10 text-center mt-20">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-flex flex-col items-center gap-2 text-pink-200/80"
        >
          <span className="text-xs font-mono tracking-widest uppercase text-pink-300">
            Scroll down for the grand birthday finale
          </span>
          <span className="text-xl">🌙 ✨</span>
        </motion.div>
      </div>
    </section>
  );
}
