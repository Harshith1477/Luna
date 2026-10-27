import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader({ onLoaded }) {
  const [progress, setProgress] = useState(15);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Simulate asset preloading and ensure images are cached
    const imageList = [
      '/cake.png',
      '/photos/photo1.jpg',
      '/photos/photo2.jpg',
      '/photos/photo3.jpg',
      '/photos/photo4.jpg',
    ];

    let loadedCount = 0;
    const totalAssets = imageList.length;

    const updateProgress = () => {
      loadedCount++;
      const current = Math.min(100, Math.round((loadedCount / totalAssets) * 85) + 15);
      setProgress(current);
      if (loadedCount >= totalAssets) {
        setTimeout(() => {
          setIsDone(true);
          setTimeout(onLoaded, 600);
        }, 400);
      }
    };

    imageList.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = updateProgress;
      img.onerror = updateProgress;
    });

    // Fallback safety timer so preloader never hangs
    const safetyTimer = setTimeout(() => {
      setProgress(100);
      setIsDone(true);
      setTimeout(onLoaded, 600);
    }, 2800);

    return () => clearTimeout(safetyTimer);
  }, [onLoaded]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fff5f7] text-stone-700 select-none px-6"
        >
          {/* Animated Running Cat with Gift SVG */}
          <div className="relative mb-8">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, -3, 3, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              {/* Cute Cat SVG */}
              <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Tail swishing */}
                <motion.path
                  d="M15 50C10 38 18 20 28 22C34 24 30 38 24 45"
                  stroke="#fb923c"
                  strokeWidth="6"
                  strokeLinecap="round"
                  animate={{
                    d: [
                      "M15 50C10 38 18 20 28 22C34 24 30 38 24 45",
                      "M15 50C8 44 10 26 20 28C26 30 26 42 22 47",
                      "M15 50C10 38 18 20 28 22C34 24 30 38 24 45"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                />

                {/* Cat Body */}
                <ellipse cx="58" cy="52" rx="32" ry="24" fill="#fed7aa" />
                <ellipse cx="60" cy="54" rx="26" ry="18" fill="#ffedd5" />

                {/* Back legs */}
                <path d="M36 68C36 78 30 82 26 82C23 82 22 76 26 70" fill="#fb923c" />
                <path d="M78 68C78 78 72 82 68 82C65 82 64 76 68 70" fill="#fb923c" />

                {/* Head */}
                <circle cx="85" cy="40" r="20" fill="#fed7aa" />

                {/* Ears */}
                <polygon points="73,28 78,10 88,24" fill="#fb923c" />
                <polygon points="76,26 80,14 86,23" fill="#fbcfe8" />
                <polygon points="86,24 96,10 101,28" fill="#fb923c" />
                <polygon points="88,23 94,14 98,26" fill="#fbcfe8" />

                {/* Eyes (Happy Closed Curves) */}
                <path d="M78 40C80 43 83 43 85 40" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M90 40C92 43 95 43 97 40" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />

                {/* Cheeks */}
                <ellipse cx="76" cy="44" rx="3.5" ry="2.5" fill="#f472b6" opacity="0.6" />
                <ellipse cx="98" cy="44" rx="3.5" ry="2.5" fill="#f472b6" opacity="0.6" />

                {/* Nose & Mouth */}
                <polygon points="87,44 89,44 88,46" fill="#f43f5e" />
                <path d="M85 47C86.5 49 88 48 88 47C88 48 89.5 49 91 47" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />

                {/* Front Paws holding gift */}
                <ellipse cx="88" cy="62" rx="6" ry="4" fill="#ffedd5" stroke="#fb923c" strokeWidth="1.5" />
              </svg>

              {/* Tiny Gift Box on cat's back */}
              <motion.div
                animate={{ rotate: [-2, 4, -2] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="absolute top-4 left-10 text-2xl select-none"
              >
                🎁
              </motion.div>

              {/* Floating Hearts popping up */}
              <motion.span
                animate={{
                  y: [-10, -40],
                  x: [0, 10, -5],
                  opacity: [0, 1, 0],
                  scale: [0.6, 1.2, 0.8],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: 'easeOut',
                }}
                className="absolute -top-3 right-0 text-pink-400 text-lg"
              >
                💕
              </motion.span>
            </motion.div>
          </div>

          <h2 className="text-xl font-medium text-pink-900 tracking-wide mb-1 font-heading">
            Getting your surprise ready...
          </h2>
          <p className="text-xs text-pink-600/80 mb-6 font-script text-base">
            The kittens are packing all the love and confetti ✨
          </p>

          {/* Progress Bar */}
          <div className="w-56 h-2 bg-pink-200/60 rounded-full overflow-hidden p-0.5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-full"
              initial={{ width: '15%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            />
          </div>
          <span className="text-[11px] font-mono text-pink-400 mt-2 font-medium">
            {progress}%
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
