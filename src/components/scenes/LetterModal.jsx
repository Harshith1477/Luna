import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, FastForward, Check, X } from 'lucide-react';
import { BIRTHDAY_CONTENT } from '../../config/content';
import AnimatedCats from '../cats/AnimatedCats';

export default function LetterModal({ isOpen, onClose, onContinue }) {
  const { recipient, sender, letter } = BIRTHDAY_CONTENT;
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Initialize or reset when opened
  useEffect(() => {
    if (!isOpen) {
      setDisplayedLines([]);
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
      setIsTypingComplete(false);
      return;
    }

    const lines = letter.paragraphs;
    let timer;

    if (currentLineIndex < lines.length) {
      const fullCurrentLine = lines[currentLineIndex];

      if (currentCharIndex < fullCurrentLine.length) {
        // Typing speed: natural variation between 18ms and 36ms
        timer = setTimeout(() => {
          setDisplayedLines((prev) => {
            const next = [...prev];
            next[currentLineIndex] = fullCurrentLine.slice(0, currentCharIndex + 1);
            return next;
          });
          setCurrentCharIndex((c) => c + 1);
        }, 24);
      } else {
        // Pause between paragraphs
        timer = setTimeout(() => {
          setCurrentLineIndex((l) => l + 1);
          setCurrentCharIndex(0);
        }, 380);
      }
    } else {
      setIsTypingComplete(true);
    }

    return () => clearTimeout(timer);
  }, [isOpen, currentLineIndex, currentCharIndex, letter.paragraphs]);

  // Fast forward to show all paragraphs immediately
  const handleSkipTyping = () => {
    setDisplayedLines(letter.paragraphs);
    setIsTypingComplete(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="letter-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto"
      >
        {/* Peeking Cats in Corners */}
        <AnimatedCats mode="peeking" />

        {/* Unfolding Letter Paper Card */}
        <motion.div
          initial={{ scale: 0.6, y: 80, rotateX: 25, opacity: 0 }}
          animate={{ scale: 1, y: 0, rotateX: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 60, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl paper-texture rounded-2xl p-6 sm:p-10 my-auto text-stone-800 border border-stone-200/80 polaroid-shadow z-50"
        >
          {/* Top Washi Tape Accent */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 washi-tape -rotate-1 rounded-sm border border-pink-200/50 flex items-center justify-center text-[10px] text-pink-700/60 font-mono tracking-widest uppercase">
            ✦ with love ✦
          </div>

          {/* Postal Stamp & Date Header */}
          <div className="flex items-start justify-between border-b border-pink-150/60 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-pink-600 font-semibold font-mono">
                {letter.stamp}
              </p>
              <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                {letter.date}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Cute Heart Stamp */}
              <div className="w-12 h-14 border-2 border-dashed border-pink-300 rounded flex flex-col items-center justify-center bg-pink-50/70 p-1 rotate-3 shadow-xs">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-300" />
                <span className="text-[8px] font-mono font-bold text-pink-600 mt-0.5">FOR YOU</span>
              </div>

              {/* Close Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-pink-100/60 transition-colors cursor-pointer"
                  title="Close letter"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Greeting */}
          <h2 className="text-2xl sm:text-3xl font-handwriting text-pink-900 font-bold mb-4">
            {letter.greeting || `Dearest ${recipient.name},`}
          </h2>

          {/* Typewriter Letter Content */}
          <div className="space-y-3.5 min-h-[160px] text-base sm:text-lg font-handwriting leading-relaxed text-stone-700">
            {letter.paragraphs.map((_, idx) => {
              const text = displayedLines[idx];
              if (!text && idx > currentLineIndex) return null;
              const isCurrentlyTypingThis = idx === currentLineIndex && !isTypingComplete;

              return (
                <p key={idx} className="relative">
                  {text || ''}
                  {isCurrentlyTypingThis && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="inline-block w-1.5 h-4 ml-1 bg-pink-500 rounded-full align-middle"
                    />
                  )}
                </p>
              );
            })}
          </div>

          {/* Sign off and signature */}
          <div className="mt-8 pt-4 border-t border-pink-100 flex flex-col items-end text-right">
            <p className="font-handwriting text-base sm:text-lg text-stone-600">
              {letter.closing}
            </p>
            <p className="font-handwriting text-2xl sm:text-3xl text-pink-800 font-bold mt-1">
              {sender.name} 💕
            </p>
          </div>

          {/* Interactive Action Bar */}
          <div className="mt-8 flex items-center justify-between gap-3 pt-2">
            {/* Skip typing button if still typing */}
            {!isTypingComplete ? (
              <button
                onClick={handleSkipTyping}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors border border-pink-200"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Show full letter</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1 text-xs text-pink-700 font-mono">
                <Check className="w-3.5 h-3.5 text-pink-500" />
                <span>Read with love</span>
              </div>
            )}

            {/* Glowing Continue Button (Appears when finished) */}
            <AnimatePresence>
              {isTypingComplete && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onContinue}
                  className="relative group cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 text-white font-medium text-sm sm:text-base shadow-lg shadow-pink-300/50 border border-pink-300"
                >
                  <span>{letter.continueButton}</span>
                  <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" style={{ animationDuration: '4s' }} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
