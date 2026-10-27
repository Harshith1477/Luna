import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Animated cute cats with reactive behaviors:
 * - Tail swishing
 * - Ear twitching
 * - Blinking eyes
 * - Paws tapping envelope
 * - Peeking mode for letter reading
 * - Dancing celebration mode for finale
 */
export default function AnimatedCats({
  mode = 'sitting', // 'sitting' | 'opening' | 'peeking' | 'dancing'
  onCatClick,
}) {
  const [blink, setBlink] = useState(false);

  // Periodic blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // 1. FUBU: Cream Calico Cat
  const renderMochi = () => (
    <motion.div
      animate={
        mode === 'dancing'
          ? { y: [0, -18, 0], rotate: [-6, 6, -6] }
          : { y: [0, -4, 0] }
      }
      transition={{
        repeat: Infinity,
        duration: mode === 'dancing' ? 0.6 : 3.5,
        ease: 'easeInOut',
      }}
      className="relative select-none cursor-pointer"
      onClick={() => onCatClick && onCatClick('Fubu')}
      title="Fubu says: Meow! 💕"
    >
      <svg width="125" height="135" viewBox="0 0 130 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tail */}
        <motion.path
          d="M25 110C10 100 12 75 22 70C30 65 35 85 28 105"
          stroke="#fed7aa"
          strokeWidth="10"
          strokeLinecap="round"
          className="animate-tail-wag"
        />

        {/* Calico spot on tail */}
        <circle cx="20" cy="80" r="5" fill="#ea580c" />

        {/* Body */}
        <ellipse cx="68" cy="98" rx="42" ry="36" fill="#fffbeb" />
        {/* Calico Patch on back */}
        <path d="M78 72C88 74 98 84 94 98C90 106 82 104 80 95Z" fill="#ea580c" />
        <path d="M42 85C38 95 44 105 52 105C55 98 50 90 42 85Z" fill="#78350f" />

        {/* Head */}
        <circle cx="68" cy="56" r="32" fill="#fffbeb" />
        {/* Calico patch over left eye/ear */}
        <path d="M40 38C42 28 55 26 62 34C58 48 45 52 40 38Z" fill="#ea580c" />
        <path d="M78 30C86 28 96 34 94 48C88 48 80 40 78 30Z" fill="#78350f" />

        {/* Ears with twitch animation */}
        <polygon points="40,42 42,16 60,34" fill="#fed7aa" className="animate-ear-twitch" />
        <polygon points="44,38 46,22 56,34" fill="#fbcfe8" />

        <polygon points="76,34 94,16 96,42" fill="#fed7aa" />
        <polygon points="80,34 90,22 92,38" fill="#fbcfe8" />

        {/* Party Hat for dancing mode */}
        {mode === 'dancing' && (
          <g>
            <polygon points="68,6 52,36 84,36" fill="#ec4899" />
            <circle cx="68" cy="6" r="4.5" fill="#facc15" />
            <polygon points="56,22 80,22 78,26 58,26" fill="#38bdf8" />
          </g>
        )}

        {/* Eyes (Blinking support) */}
        {blink ? (
          <g stroke="#451a03" strokeWidth="2.5" strokeLinecap="round">
            <path d="M54 58C56 61 60 61 62 58" />
            <path d="M74 58C76 61 80 61 82 58" />
          </g>
        ) : (
          <g>
            <ellipse cx="58" cy="58" rx="5" ry="6" fill="#15803d" />
            <circle cx="59.5" cy="56" r="2.2" fill="#ffffff" />
            <circle cx="56.5" cy="59.5" r="1.2" fill="#ffffff" />

            <ellipse cx="78" cy="58" rx="5" ry="6" fill="#15803d" />
            <circle cx="79.5" cy="56" r="2.2" fill="#ffffff" />
            <circle cx="76.5" cy="59.5" r="1.2" fill="#ffffff" />
          </g>
        )}

        {/* Rosy Cheeks */}
        <ellipse cx="50" cy="65" rx="5" ry="3" fill="#fb7185" opacity="0.45" />
        <ellipse cx="86" cy="65" rx="5" ry="3" fill="#fb7185" opacity="0.45" />

        {/* Nose & Mouth */}
        <polygon points="67,64 69,64 68,66" fill="#f43f5e" />
        <path d="M64 67C66 69.5 68 68.5 68 67C68 68.5 70 69.5 72 67" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />

        {/* Whiskers */}
        <line x1="38" y1="62" x2="48" y2="64" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="37" y1="68" x2="48" y2="68" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="88" y1="64" x2="98" y2="62" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="88" y1="68" x2="99" y2="68" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Cute Front Paws */}
        <ellipse cx="56" cy="118" rx="8" ry="6" fill="#ffffff" stroke="#fbcfe8" strokeWidth="1.5" className={mode === 'sitting' ? 'animate-paw-tap' : ''} />
        <ellipse cx="80" cy="118" rx="8" ry="6" fill="#ffffff" stroke="#fbcfe8" strokeWidth="1.5" />
      </svg>
    </motion.div>
  );

  // 2. LUNA: Sleek Tuxedo Cat
  const renderLuna = () => (
    <motion.div
      animate={
        mode === 'dancing'
          ? { y: [0, -20, 0], rotate: [6, -6, 6] }
          : { y: [0, -3, 0] }
      }
      transition={{
        repeat: Infinity,
        duration: mode === 'dancing' ? 0.65 : 4.2,
        delay: 0.2,
        ease: 'easeInOut',
      }}
      className="relative select-none cursor-pointer"
      onClick={() => onCatClick && onCatClick('Biscuit')}
      title="Biscuit purrs softly 🐾"
    >
      <svg width="120" height="135" viewBox="0 0 125 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tail curling */}
        <motion.path
          d="M102 112C118 100 122 75 114 65C108 58 98 70 102 85"
          stroke="#1e293b"
          strokeWidth="9"
          strokeLinecap="round"
          className="animate-tail-wag"
        />

        {/* Body */}
        <ellipse cx="62" cy="98" rx="40" ry="35" fill="#1e293b" />
        {/* White Tuxedo Chest */}
        <path d="M52 76C56 94 62 108 62 115C62 108 68 94 72 76C68 78 56 78 52 76Z" fill="#f8fafc" />

        {/* Head */}
        <circle cx="62" cy="56" r="30" fill="#1e293b" />

        {/* Ears */}
        <polygon points="36,40 38,14 54,32" fill="#1e293b" />
        <polygon points="40,36 42,20 50,32" fill="#f472b6" opacity="0.6" />

        <polygon points="70,32 86,14 88,40" fill="#1e293b" className="animate-ear-twitch" />
        <polygon points="74,32 82,20 84,36" fill="#f472b6" opacity="0.6" />

        {/* Party Hat */}
        {mode === 'dancing' && (
          <g>
            <polygon points="62,4 48,34 76,34" fill="#a855f7" />
            <circle cx="62" cy="4" r="4.5" fill="#f43f5e" />
            <circle cx="56" cy="20" r="2" fill="#ffffff" />
            <circle cx="68" cy="22" r="2.5" fill="#ffffff" />
          </g>
        )}

        {/* Golden Eyes */}
        {blink ? (
          <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M48 58C50 61 54 61 56 58" />
            <path d="M68 58C70 61 74 61 76 58" />
          </g>
        ) : (
          <g>
            <ellipse cx="52" cy="58" rx="5" ry="6" fill="#fbbf24" />
            <circle cx="53.5" cy="56" r="2.2" fill="#ffffff" />
            <ellipse cx="72" cy="58" rx="5" ry="6" fill="#fbbf24" />
            <circle cx="73.5" cy="56" r="2.2" fill="#ffffff" />
          </g>
        )}

        {/* Cheeks */}
        <ellipse cx="46" cy="65" rx="4.5" ry="2.5" fill="#fb7185" opacity="0.3" />
        <ellipse cx="78" cy="65" rx="4.5" ry="2.5" fill="#fb7185" opacity="0.3" />

        {/* Pink Nose & Whiskers */}
        <polygon points="61,64 63,64 62,66" fill="#fb7185" />
        <path d="M59 67C60.5 69 62 68 62 67C62 68 63.5 69 65 67" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />

        <line x1="34" y1="63" x2="44" y2="65" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        <line x1="33" y1="68" x2="44" y2="68" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        <line x1="80" y1="65" x2="90" y2="63" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        <line x1="80" y1="68" x2="91" y2="68" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

        {/* White Socks Paws */}
        <ellipse cx="50" cy="116" rx="7.5" ry="5.5" fill="#ffffff" />
        <ellipse cx="74" cy="116" rx="7.5" ry="5.5" fill="#ffffff" />
      </svg>
    </motion.div>
  );

  // 3. BOBA: Ginger Tabby Cat
  const renderBoba = () => (
    <motion.div
      animate={
        mode === 'dancing'
          ? { y: [0, -16, 0], rotate: [-8, 8, -8] }
          : { y: [0, -5, 0] }
      }
      transition={{
        repeat: Infinity,
        duration: mode === 'dancing' ? 0.7 : 3.8,
        delay: 0.4,
        ease: 'easeInOut',
      }}
      className="relative select-none cursor-pointer"
      onClick={() => onCatClick && onCatClick('Boba')}
      title="Boba is excited! 🐾"
    >
      <svg width="120" height="135" viewBox="0 0 125 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tail */}
        <motion.path
          d="M20 108C8 96 10 70 20 62C28 56 34 78 26 98"
          stroke="#f97316"
          strokeWidth="9"
          strokeLinecap="round"
          className="animate-tail-wag"
        />
        {/* Tail Stripes */}
        <circle cx="16" cy="78" r="4.5" fill="#c2410c" />
        <circle cx="21" cy="92" r="4.5" fill="#c2410c" />

        {/* Body */}
        <ellipse cx="64" cy="98" rx="41" ry="35" fill="#fdba74" />
        {/* Tabby Stripes on Back */}
        <path d="M45 88L55 92" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
        <path d="M73 88L83 92" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
        <path d="M48 98L60 102" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />

        {/* Head */}
        <circle cx="64" cy="56" r="31" fill="#fdba74" />
        {/* Tabby forehead stripes (M shape) */}
        <path d="M54 36L58 46L64 40L70 46L74 36" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Ears */}
        <polygon points="38,40 40,15 56,33" fill="#ea580c" />
        <polygon points="42,37 44,21 52,33" fill="#fecdd3" />

        <polygon points="72,33 88,15 90,40" fill="#ea580c" className="animate-ear-twitch" />
        <polygon points="76,33 84,21 86,37" fill="#fecdd3" />

        {/* Party Hat */}
        {mode === 'dancing' && (
          <g>
            <polygon points="64,5 50,35 78,35" fill="#10b981" />
            <circle cx="64" cy="5" r="4.5" fill="#fbbf24" />
            <polygon points="54,23 74,23 72,27 56,27" fill="#f43f5e" />
          </g>
        )}

        {/* Blue / Aqua Eyes */}
        {blink ? (
          <g stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round">
            <path d="M50 58C52 61 56 61 58 58" />
            <path d="M70 58C72 61 76 61 78 58" />
          </g>
        ) : (
          <g>
            <ellipse cx="54" cy="58" rx="5" ry="6" fill="#0284c7" />
            <circle cx="55.5" cy="56" r="2.2" fill="#ffffff" />
            <ellipse cx="74" cy="58" rx="5" ry="6" fill="#0284c7" />
            <circle cx="75.5" cy="56" r="2.2" fill="#ffffff" />
          </g>
        )}

        {/* Cheeks */}
        <ellipse cx="46" cy="65" rx="5" ry="3" fill="#fb7185" opacity="0.4" />
        <ellipse cx="82" cy="65" rx="5" ry="3" fill="#fb7185" opacity="0.4" />

        {/* Nose & Mouth */}
        <polygon points="63,64 65,64 64,66" fill="#f43f5e" />
        <path d="M60 67C62 69.5 64 68.5 64 67C64 68.5 66 69.5 68 67" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />

        {/* Whiskers */}
        <line x1="36" y1="63" x2="46" y2="65" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="35" y1="68" x2="46" y2="68" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="82" y1="65" x2="92" y2="63" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="82" y1="68" x2="93" y2="68" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Paws */}
        <ellipse cx="52" cy="116" rx="8" ry="6" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.2" />
        <ellipse cx="76" cy="116" rx="8" ry="6" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.2" className="animate-paw-tap" />
      </svg>
    </motion.div>
  );

  // If in peeking mode (e.g. while she is reading the letter)
  if (mode === 'peeking') {
    return (
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none">
        {/* Left corner peeking cat */}
        <motion.div
          initial={{ y: 80, x: -20, rotate: -15 }}
          animate={{ y: 0, x: 0, rotate: -5 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="absolute -bottom-6 left-2 md:left-10"
        >
          {renderMochi()}
        </motion.div>

        {/* Right corner peeking cat */}
        <motion.div
          initial={{ y: 80, x: 20, rotate: 15 }}
          animate={{ y: 0, x: 0, rotate: 5 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="absolute -bottom-6 right-2 md:right-10"
        >
          {renderLuna()}
        </motion.div>
      </div>
    );
  }

  // Normal sitting or dancing scene
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 md:gap-10">
      {renderMochi()}
      {renderLuna()}
      {renderBoba()}
    </div>
  );
}
