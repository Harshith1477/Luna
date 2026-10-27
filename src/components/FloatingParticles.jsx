import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function FloatingParticles({ isNightMode = false }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(media.matches);
    }
  }, []);

  const [particles, setParticles] = useState(() => {
    const items = [];
    const count = 18;
    const icons = ['💖', '✨', '🌸', '💕', '🌷', '🤍'];

    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        icon: icons[i % icons.length],
        size: Math.random() * 14 + 14,
        left: `${(i * 5.5 + Math.random() * 3) % 95}%`,
        duration: Math.random() * 6 + 10,
        delay: Math.random() * 6,
        xOffset: (Math.random() - 0.5) * 60,
      });
    }
    return items;
  });

  // Adapt particle icons between day and night mode
  useEffect(() => {
    const icons = isNightMode 
      ? ['⭐', '✨', '🌟', '💫', '🌕'] 
      : ['💖', '✨', '🌸', '💕', '🌷', '🤍'];

    setParticles((prev) =>
      prev.map((p, idx) => ({
        ...p,
        icon: icons[idx % icons.length],
      }))
    );
  }, [isNightMode]);

  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden select-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            opacity: 0,
            y: '105vh',
            x: 0,
            rotate: 0,
          }}
          animate={{
            opacity: [0, 0.75, 0.85, 0],
            y: ['105vh', '-10vh'],
            x: [0, p.xOffset, -p.xOffset, 0],
            rotate: [-15, 20, -15, 20],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          style={{
            left: p.left,
            fontSize: `${p.size}px`,
          }}
          className="absolute drop-shadow-sm filter blur-[0.2px]"
        >
          {p.icon}
        </motion.div>
      ))}
    </div>
  );
}
