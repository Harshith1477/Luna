import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 350 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Check if the device has a mouse / fine pointer
    const hasPointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasPointer) return;

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check if hovering over clickable element
      const target = e.target;
      const isClickable = 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('[role="button"]') ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsPointer(!!isClickable);

      // Subtle sparkle trail (rate limited)
      if (Math.random() < 0.12) {
        const newSparkle = {
          id: Math.random(),
          x: e.clientX,
          y: e.clientY,
          symbol: Math.random() > 0.5 ? '✨' : '💖',
        };
        setSparkles((prev) => [...prev.slice(-8), newSparkle]);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  // Clean up sparkles
  useEffect(() => {
    if (sparkles.length === 0) return;
    const timer = setTimeout(() => {
      setSparkles((prev) => prev.slice(1));
    }, 700);
    return () => clearTimeout(timer);
  }, [sparkles]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none hidden md:block">
      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          initial={{ opacity: 1, scale: 0.8, y: 0 }}
          animate={{ opacity: 0, scale: 1.4, y: -20 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ left: sparkle.x, top: sparkle.y }}
          className="absolute text-xs"
        >
          {sparkle.symbol}
        </motion.span>
      ))}

      {/* Paw Cursor */}
      <motion.div
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
        }}
        className="fixed top-0 left-0 -ml-3 -mt-3"
      >
        <motion.div
          animate={{
            scale: isPointer ? 1.25 : 1,
            rotate: isPointer ? 15 : 0,
          }}
          transition={{ duration: 0.18 }}
          className="relative drop-shadow-md"
        >
          {/* Cute Cat Paw SVG */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Paw Base */}
            <path
              d="M20 18C13 18 9 24 10 32C11 38 15 39 20 39C25 39 29 38 30 32C31 24 27 18 20 18Z"
              fill="#fed7aa"
              stroke="#fb923c"
              strokeWidth="2"
            />
            {/* Center Main Toe Pad */}
            <path
              d="M20 25C17.5 25 15.5 28 16 32C16.5 35 18 36 20 36C22 36 23.5 35 24 32C24.5 28 22.5 25 20 25Z"
              fill="#fb7185"
            />
            {/* Toe 1 */}
            <ellipse cx="11" cy="14" rx="4" ry="5.5" transform="rotate(-20 11 14)" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />
            <ellipse cx="11" cy="14" rx="2.5" ry="3.5" transform="rotate(-20 11 14)" fill="#fb7185" />
            {/* Toe 2 */}
            <ellipse cx="17" cy="10" rx="4.2" ry="6" transform="rotate(-6 17 10)" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />
            <ellipse cx="17" cy="10" rx="2.7" ry="4" transform="rotate(-6 17 10)" fill="#fb7185" />
            {/* Toe 3 */}
            <ellipse cx="23" cy="10" rx="4.2" ry="6" transform="rotate(6 23 10)" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />
            <ellipse cx="23" cy="10" rx="2.7" ry="4" transform="rotate(6 23 10)" fill="#fb7185" />
            {/* Toe 4 */}
            <ellipse cx="29" cy="14" rx="4" ry="5.5" transform="rotate(20 29 14)" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />
            <ellipse cx="29" cy="14" rx="2.5" ry="3.5" transform="rotate(20 29 14)" fill="#fb7185" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
