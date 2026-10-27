import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Pixel-accurate Landing Page Component
 * Props:
 * - name: optional string
 * - onOpen: callback function when "Open my gift" is clicked
 */
export default function Landing({ name, onOpen }) {
  const shouldReduceMotion = useReducedMotion();

  // 35 deterministic confetti sprinkles spread naturally around margins and midground
  const confettiList = useMemo(() => {
    const colors = [
      '#f472b6', // pink
      '#c084fc', // lavender
      '#fde047', // yellow
      '#86efac', // mint
      '#93c5fd', // blue
      '#fb7185', // rose
      '#d8b4fe', // light lavender
    ];

    // Fixed coordinates avoiding the center content
    const items = [
      { x: '8%', y: '12%', w: 5, h: 11, rot: 18, color: colors[0], delay: 0.1, dur: 4.2 },
      { x: '18%', y: '8%', w: 4, h: 13, rot: -25, color: colors[1], delay: 0.4, dur: 4.8 },
      { x: '28%', y: '15%', w: 5, h: 10, rot: 40, color: colors[2], delay: 0.7, dur: 3.9 },
      { x: '72%', y: '10%', w: 4, h: 12, rot: -15, color: colors[3], delay: 0.3, dur: 4.5 },
      { x: '84%', y: '14%', w: 6, h: 11, rot: 32, color: colors[4], delay: 0.8, dur: 5.1 },
      { x: '92%', y: '22%', w: 4, h: 14, rot: -45, color: colors[0], delay: 0.2, dur: 4.0 },
      { x: '6%', y: '26%', w: 5, h: 9, rot: 55, color: colors[2], delay: 0.9, dur: 4.6 },
      { x: '14%', y: '34%', w: 4, h: 12, rot: -18, color: colors[3], delay: 0.5, dur: 3.8 },
      { x: '88%', y: '36%', w: 5, h: 13, rot: 22, color: colors[1], delay: 0.6, dur: 4.3 },
      { x: '94%', y: '44%', w: 6, h: 10, rot: -30, color: colors[5], delay: 1.1, dur: 4.9 },
      { x: '5%', y: '48%', w: 4, h: 11, rot: 12, color: colors[4], delay: 0.3, dur: 4.1 },
      { x: '12%', y: '56%', w: 5, h: 14, rot: -35, color: colors[0], delay: 0.8, dur: 5.2 },
      { x: '86%', y: '54%', w: 4, h: 10, rot: 48, color: colors[2], delay: 0.2, dur: 3.7 },
      { x: '93%', y: '62%', w: 5, h: 12, rot: -20, color: colors[3], delay: 0.7, dur: 4.4 },
      { x: '7%', y: '68%', w: 6, h: 11, rot: 38, color: colors[1], delay: 1.0, dur: 4.7 },
      { x: '16%', y: '74%', w: 4, h: 13, rot: -50, color: colors[6], delay: 0.4, dur: 4.0 },
      { x: '82%', y: '72%', w: 5, h: 9, rot: 15, color: colors[4], delay: 0.9, dur: 5.0 },
      { x: '91%', y: '78%', w: 4, h: 14, rot: -28, color: colors[0], delay: 0.5, dur: 4.2 },
      { x: '10%', y: '86%', w: 5, h: 12, rot: 42, color: colors[2], delay: 0.3, dur: 4.6 },
      { x: '22%', y: '90%', w: 6, h: 10, rot: -12, color: colors[3], delay: 0.8, dur: 3.9 },
      { x: '78%', y: '88%', w: 4, h: 13, rot: 25, color: colors[1], delay: 0.6, dur: 4.8 },
      { x: '88%', y: '92%', w: 5, h: 11, rot: -40, color: colors[5], delay: 0.2, dur: 4.3 },
      { x: '2%', y: '38%', w: 4, h: 12, rot: 19, color: colors[6], delay: 1.2, dur: 4.5 },
      { x: '96%', y: '30%', w: 5, h: 10, rot: -22, color: colors[4], delay: 0.7, dur: 5.3 },
      { x: '25%', y: '6%', w: 4, h: 13, rot: 35, color: colors[0], delay: 0.4, dur: 4.1 },
      { x: '64%', y: '8%', w: 5, h: 11, rot: -14, color: colors[2], delay: 0.9, dur: 4.7 },
      { x: '35%', y: '92%', w: 4, h: 12, rot: 29, color: colors[3], delay: 0.5, dur: 3.8 },
      { x: '68%', y: '94%', w: 6, h: 9, rot: -33, color: colors[1], delay: 1.1, dur: 4.9 },
      { x: '19%', y: '42%', w: 4, h: 10, rot: 45, color: colors[5], delay: 0.3, dur: 4.2 },
      { x: '80%', y: '40%', w: 5, h: 13, rot: -17, color: colors[0], delay: 0.8, dur: 4.6 },
      { x: '15%', y: '64%', w: 4, h: 11, rot: 26, color: colors[4], delay: 0.6, dur: 5.1 },
      { x: '84%', y: '66%', w: 5, h: 12, rot: -38, color: colors[2], delay: 0.2, dur: 4.0 },
      { x: '4%', y: '80%', w: 6, h: 10, rot: 14, color: colors[3], delay: 1.0, dur: 4.4 },
      { x: '95%', y: '84%', w: 4, h: 14, rot: -24, color: colors[1], delay: 0.5, dur: 4.8 },
      { x: '50%', y: '5%', w: 5, h: 11, rot: 8, color: colors[6], delay: 0.7, dur: 4.3 },
    ];

    return items;
  }, []);

  // Smooth custom cubic bezier easing
  const entranceEase = [0.22, 1, 0.36, 1];

  const fadeUpVariant = (delay) => ({
    initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: {
      duration: 0.85,
      delay,
      ease: entranceEase,
    },
  });

  return (
    <div className="relative w-full h-screen min-h-screen overflow-hidden bg-[#fdeee3] flex flex-col items-center justify-between py-8 px-4 select-none">
      {/* BACKGROUND BLOBS: Two big soft pink radial-gradient blobs fading from edges at ~55% height */}
      <div
        className="pointer-events-none absolute left-[-110px] top-[55%] -translate-y-1/2 w-[380px] sm:w-[460px] h-[380px] sm:h-[460px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #f9c9cf 0%, rgba(249, 201, 207, 0) 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute right-[-110px] top-[55%] -translate-y-1/2 w-[380px] sm:w-[460px] h-[380px] sm:h-[460px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #f9c9cf 0%, rgba(249, 201, 207, 0) 70%)',
        }}
      />

      {/* CONFETTI SPRINKLES: ~35 rounded rectangles drifting gently */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confettiList.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.7 }
                : {
                    opacity: 0.7,
                    y: [0, -7, 0],
                    rotate: [c.rot - 8, c.rot + 8, c.rot - 8],
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.6 }
                : {
                    opacity: { duration: 0.6, delay: c.delay },
                    y: {
                      repeat: Infinity,
                      duration: c.dur,
                      ease: 'easeInOut',
                      delay: c.delay,
                    },
                    rotate: {
                      repeat: Infinity,
                      duration: c.dur + 0.6,
                      ease: 'easeInOut',
                      delay: c.delay,
                    },
                  }
            }
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y,
              width: `${c.w}px`,
              height: `${c.h}px`,
              backgroundColor: c.color,
              borderRadius: '9999px',
            }}
          />
        ))}
      </div>

      {/* TOP HEADER BLOCK: Stacked and centered */}
      <header className="relative z-10 flex flex-col items-center text-center mt-2 max-w-md">
        {/* 1. Tiny Label: "A GIFT FOR YOU" */}
        <motion.p
          {...fadeUpVariant(0.1)}
          className="font-inter font-semibold uppercase text-[#e11d48] text-[10px] sm:text-[11px] tracking-[0.3em] mb-2 sm:mb-2.5"
        >
          A GIFT FOR YOU
        </motion.p>

        {/* 2. Heading: "Happy birthday!" */}
        <motion.h1
          {...fadeUpVariant(0.25)}
          className="font-abril text-[#2d1b3d] text-[44px] sm:text-[54px] md:text-[58px] leading-[1.08] tracking-tight mb-1"
        >
          {name ? `Happy birthday, ${name}!` : 'Happy birthday!'}
        </motion.h1>

        {/* 3. Handwritten line: "for being so bright" */}
        <motion.div
          {...fadeUpVariant(0.4)}
          className="font-caveat text-[#2d1b3d] text-[26px] sm:text-[30px] leading-tight mb-2 flex items-center justify-center gap-1.5"
        >
          <span>for being so</span>
          <span
            className="text-[#e11d48] font-semibold px-1"
            style={{
              backgroundImage: 'linear-gradient(transparent 60%, #fde68a 60%)',
              display: 'inline-block',
            }}
          >
            bright
          </span>
        </motion.div>

        {/* 4. Subtext: "Someone threw a little party just for you." */}
        <motion.p
          {...fadeUpVariant(0.55)}
          className="font-inter text-[#6b5b6e] text-[13px] sm:text-[14px] leading-normal font-normal max-w-xs sm:max-w-sm"
        >
          Someone threw a little party just for you.
        </motion.p>
      </header>

      {/* CENTER: 3D Pastel Birthday Cake with candles */}
      <div className="relative z-10 flex items-center justify-center my-auto py-2">
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.85 }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -8, 0],
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0.8, delay: 0.7 }
              : {
                  opacity: { duration: 0.9, delay: 0.7, ease: entranceEase },
                  scale: { duration: 0.9, delay: 0.7, ease: entranceEase },
                  y: {
                    repeat: Infinity,
                    duration: 4,
                    ease: 'easeInOut',
                    delay: 1.2,
                  },
                }
          }
          className="relative flex items-center justify-center"
        >
          <img
            src="/cake.png"
            alt="3D Pastel Birthday Cake on Stand"
            className="w-[250px] sm:w-[310px] md:w-[330px] h-auto object-contain select-none pointer-events-none"
            style={{
              filter: 'drop-shadow(0 20px 28px rgba(244, 114, 182, 0.32))',
            }}
            loading="eager"
          />
        </motion.div>
      </div>

      {/* BOTTOM: Pill button "Open my gift" */}
      <footer className="relative z-10 flex flex-col items-center mb-3 sm:mb-5">
        <motion.button
          onClick={onOpen}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, ease: entranceEase }}
          whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
          className="group relative cursor-pointer focus:outline-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Soft red glow shadow pulsing behind button */}
          <div
            className="absolute -inset-1 rounded-full opacity-60 blur-md group-hover:opacity-90 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(to right, #e11d48, #be123c)',
              boxShadow: '0 10px 25px -4px rgba(225, 29, 72, 0.45)',
            }}
          />

          {/* Pill button body */}
          <div
            className="relative flex items-center justify-center gap-2.5 px-8 py-3.5 sm:px-9 sm:py-4 rounded-full text-white font-inter font-semibold text-[15px] sm:text-[16px] tracking-wide"
            style={{
              background: 'linear-gradient(to right, #e11d48, #be123c)',
              boxShadow: '0 8px 20px -3px rgba(225, 29, 72, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
            }}
          >
            {/* Inline SVG Gift Icon */}
            <svg
              className="w-4 h-4 text-white shrink-0 drop-shadow-xs"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="8" width="18" height="4" rx="1" />
              <path d="M12 8v13" />
              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
              <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
            </svg>

            <span>Open my gift</span>
          </div>
        </motion.button>
      </footer>
    </div>
  );
}
