import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  CloudRain,
  Moon,
  Trophy,
  Dices,
  ChevronRight,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import {
  TOTAL_TILES,
  COLS_DESKTOP, ROWS_DESKTOP,
  COLS_MOBILE, ROWS_MOBILE,
  BOT_MAX_TILE,
  BOOST_AMOUNT, OOPS_AMOUNT,
  SPECIAL_TILES,
  PLAYERS,
  DICE_SIDES, DICE_ROLL_DELAY_MS, MOVE_STEP_DELAY_MS,
  TILE_MESSAGES, WIN_MESSAGE,
  ROUND1_TEASE_MESSAGES,
  ROUND1_BOT_WIN_QUOTES,
  ROUND1_BOT_SIDELINES,
  ROUND2_COMPETITION_MESSAGES,
  ROUND2_WIN_CHEERS,
} from '../config/boardGameConfig';

/* ─────────────────────────────────────────────────────────────────
   VIEWPORT HOOK
   ─────────────────────────────────────────────────────────────────*/
function useIsMobile() {
  const [mobile, setMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
}

/* ─────────────────────────────────────────────────────────────────
   SNAKE PATH BUILDER
   Row 4 (bottom): 1 (left) → 10 (right)
   Row 3: 20 (left) ← 11 (right)
   Row 2: 21 (left) → 30 (right)
   Row 1: 40 (left) ← 31 (right)
   Row 0: 41 (left) → 50 (right, Gold Treasure)
   ─────────────────────────────────────────────────────────────────*/
function buildSnakePath(cols, rows) {
  const cells = Array(rows * cols).fill(0);
  let tileNum = 1;
  for (let row = rows - 1; row >= 0; row--) {
    const leftToRight = (rows - 1 - row) % 2 === 0;
    for (let col = 0; col < cols; col++) {
      const c = leftToRight ? col : cols - 1 - col;
      cells[row * cols + c] = tileNum;
      tileNum++;
      if (tileNum > TOTAL_TILES) break;
    }
    if (tileNum > TOTAL_TILES) break;
  }
  return cells;
}

const clamp = (n) => Math.max(0, Math.min(TOTAL_TILES, n));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* Non-repeating quote picker — shuffles queue when exhausted so same line won't show twice in a row */
function makeBanterQueues() {
  const shuffle = (a) => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  };
  const queues = {}; // keyed by `${playerId}_${round}` e.g. "kylo_1"
  return {
    next(playerId, round, pool) {
      const key = `${playerId}_${round}`;
      if (!queues[key] || queues[key].length === 0) {
        queues[key] = shuffle([...pool]);
      }
      return queues[key].shift();
    },
    reset() { Object.keys(queues).forEach(k => delete queues[k]); },
  };
}

/* ─────────────────────────────────────────────────────────────────
   AVATARS (Custom SVGs and Photos for Exactly 4 Players)
   Kaouther: /photos/img-1.jpeg (fallback pink "K")
   Kylo: /photos/kylo.jpg (fallback indigo "K")
   Fubu: Real Orange Tabby Cat SVG Face
   Biscuit: Real Periwinkle Cat SVG Face
   ─────────────────────────────────────────────────────────────────*/
function FubuAvatar({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <polygon points="6,15 11,4 18,12" fill="#FFB26B" stroke="#1E1B4B" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="8,13 12,6 16,11" fill="#FFA5B5" />
      <polygon points="30,15 25,4 18,12" fill="#FFB26B" stroke="#1E1B4B" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="28,13 24,6 20,11" fill="#FFA5B5" />
      <circle cx="18" cy="20" r="14" fill="#FFB26B" stroke="#1E1B4B" strokeWidth="2" />
      <path d="M 12 8 Q 18 13 24 8 Q 21 15 18 16 Q 15 15 12 8 Z" fill="#D9531E" />
      <ellipse cx="18" cy="23" rx="7" ry="5.5" fill="#FFF1D6" stroke="#1E1B4B" strokeWidth="1.5" />
      <polygon points="17,21 19,21 18,22.5" fill="#FB7185" />
      <path d="M 16 23.5 Q 18 25 18 23.5 Q 18 25 20 23.5" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="13" cy="18" r="2.2" fill="#1E1B4B" />
      <circle cx="13.7" cy="17.3" r="0.8" fill="#FFFFFF" />
      <circle cx="23" cy="18" r="2.2" fill="#1E1B4B" />
      <circle cx="23.7" cy="17.3" r="0.8" fill="#FFFFFF" />
      <line x1="6" y1="21" x2="11" y2="22" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="6" y1="24" x2="11" y2="24" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="30" y1="21" x2="25" y2="22" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="30" y1="24" x2="25" y2="24" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function BiscuitAvatar({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <polygon points="6,15 11,4 18,12" fill="#A8B4E5" stroke="#1E1B4B" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="8,13 12,6 16,11" fill="#FDA4AF" />
      <polygon points="30,15 25,4 18,12" fill="#3730A3" stroke="#1E1B4B" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="28,13 24,6 20,11" fill="#FDA4AF" />
      <circle cx="18" cy="20" r="14" fill="#A8B4E5" stroke="#1E1B4B" strokeWidth="2" />
      <path d="M 22 8 Q 29 11 30 18 Q 26 21 24 16 Z" fill="#3730A3" />
      <ellipse cx="18" cy="23" rx="7" ry="5.5" fill="#F0F3FF" stroke="#1E1B4B" strokeWidth="1.5" />
      <polygon points="17,21 19,21 18,22.5" fill="#FB7185" />
      <path d="M 16 23.5 Q 18 25 18 23.5 Q 18 25 20 23.5" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="13" cy="18" r="2.2" fill="#1E1B4B" />
      <circle cx="13.7" cy="17.3" r="0.8" fill="#FFFFFF" />
      <circle cx="23" cy="18" r="2.2" fill="#1E1B4B" />
      <circle cx="23.7" cy="17.3" r="0.8" fill="#FFFFFF" />
      <line x1="6" y1="21" x2="11" y2="22" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="6" y1="24" x2="11" y2="24" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="30" y1="21" x2="25" y2="22" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="30" y1="24" x2="25" y2="24" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function KaoutherAvatar({ size = 32 }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', background: '#F06A93',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#FFFFFF', fontWeight: 800, fontSize: size * 0.48, fontFamily: "'Outfit', sans-serif"
      }}>
        K
      </div>
    );
  }
  return (
    <img
      src="/photos/img-1.jpeg"
      alt="Kaouther"
      onError={() => setErr(true)}
      style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        objectPosition: '35% 35%', display: 'block'
      }}
    />
  );
}

function KyloAvatar({ size = 32 }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', background: '#5B6CFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#FFFFFF', fontWeight: 800, fontSize: size * 0.48, fontFamily: "'Outfit', sans-serif"
      }}>
        K
      </div>
    );
  }
  return (
    <img
      src="/photos/image.png"
      alt="Kylo"
      onError={() => setErr(true)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        objectPosition: '60% 38%',
        display: 'block',
      }}
    />
  );
}

function PlayerAvatar({ player, size = 32 }) {
  if (player.id === 'kaouther') return <KaoutherAvatar size={size} />;
  if (player.id === 'kylo') return <KyloAvatar size={size} />;
  if (player.id === 'fubu' || player.id === 'mochi') return <FubuAvatar size={size} />;
  if (player.id === 'biscuit') return <BiscuitAvatar size={size} />;
  return <div style={{ width: size, height: size, borderRadius: '50%', background: player.color }} />;
}

/* ─────────────────────────────────────────────────────────────────
   TOKEN COMPONENT (Round avatar with 3px player color ring, white inner border)
   ─────────────────────────────────────────────────────────────────*/
function Token({ player, isMobile = false }) {
  const size = isMobile ? 22 : 28;
  return (
    <motion.div
      layout
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        boxShadow: `0 0 0 2.5px ${player.color}, 0 2px 6px rgba(43,26,61,0.22)`,
        border: '1.5px solid #FFFFFF',
        background: '#FFFFFF',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 5,
      }}
      title={player.name}
    >
      <PlayerAvatar player={player} size={size - 2} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   3D DICE CUBE (CSS 3D, Plum Pips #2B1A3D, Tumbling Bounce Animation)
   ─────────────────────────────────────────────────────────────────*/
const DOT_POSITIONS = {
  1: [[50,50]],
  2: [[25,25],[75,75]],
  3: [[25,25],[50,50],[75,75]],
  4: [[25,25],[75,25],[25,75],[75,75]],
  5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
  6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
};

function Dice3D({ value, rolling, size = 62 }) {
  const faceRotations = {
    1: { x: 0,   y: 0 },
    2: { x: 0,   y: 180 },
    3: { x: 0,   y: -90 },
    4: { x: 0,   y: 90 },
    5: { x: -90, y: 0 },
    6: { x: 90,  y: 0 },
  };

  const targetRot = faceRotations[value] || faceRotations[1];
  const half = size / 2;
  const pipColor = '#2B1A3D';

  const renderFacePips = (num) => {
    const dots = DOT_POSITIONS[num] || DOT_POSITIONS[1];
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="8.5" fill={pipColor} />
        ))}
      </svg>
    );
  };

  const faceStyle = (transform) => ({
    position: 'absolute',
    width: size,
    height: size,
    background: '#FFFFFF',
    border: '1.5px solid #E5D3E6',
    borderRadius: size * 0.22,
    boxShadow: 'inset 0 0 8px rgba(229, 211, 230, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    transform,
  });

  return (
    <div style={{ position: 'relative', width: size, height: size + 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: size, height: size, perspective: 450 }}>
        <motion.div
          animate={
            rolling
              ? {
                  rotateX: [0, 360, 720, 1080],
                  rotateY: [0, 720, 1440, 2160],
                  rotateZ: [0, 180, 360, 540],
                  y: [0, -20, -5, -16, 0],
                }
              : {
                  rotateX: targetRot.x,
                  rotateY: targetRot.y,
                  rotateZ: 0,
                  y: 0,
                }
          }
          transition={
            rolling
              ? { duration: 0.6, ease: 'linear', repeat: Infinity }
              : { type: 'spring', stiffness: 220, damping: 14 }
          }
          style={{
            width: size,
            height: size,
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
        >
          <div style={faceStyle(`translateZ(${half}px)`)}>{renderFacePips(1)}</div>
          <div style={faceStyle(`rotateY(180deg) translateZ(${half}px)`)}>{renderFacePips(2)}</div>
          <div style={faceStyle(`rotateY(90deg) translateZ(${half}px)`)}>{renderFacePips(3)}</div>
          <div style={faceStyle(`rotateY(-90deg) translateZ(${half}px)`)}>{renderFacePips(4)}</div>
          <div style={faceStyle(`rotateX(90deg) translateZ(${half}px)`)}>{renderFacePips(5)}</div>
          <div style={faceStyle(`rotateX(-90deg) translateZ(${half}px)`)}>{renderFacePips(6)}</div>
        </motion.div>
      </div>

      <motion.div
        animate={rolling ? { scale: [1, 0.55, 0.85, 0.65, 1], opacity: [0.35, 0.15, 0.3, 0.2, 0.35] } : { scale: 1, opacity: 0.35 }}
        transition={rolling ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
        style={{
          width: size * 0.85,
          height: 10,
          marginTop: 6,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(43, 26, 61, 0.35) 0%, transparent 70%)',
          filter: 'blur(1px)',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   BOARD TILE (Checker: Cream #FFF8F3 & Blush #F8E8EF)
   ─────────────────────────────────────────────────────────────────*/
function BoardTile({ num, playersHere, isMobile, tileSize }) {
  const isStart = num === 0;
  const isWin   = num === TOTAL_TILES;
  const special = SPECIAL_TILES[num];

  const isEven = num % 2 === 0;
  let bg = isEven ? '#F8E8EF' : '#FFF8F3';
  let border = '#E5D3E6';
  let ringColor = null;
  let ringBg = 'transparent';

  if (isStart) {
    bg = '#2B1A3D';
    border = '#43285E';
  } else if (isWin) {
    bg = 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)';
    border = '#D97706';
  } else if (special === 'boost') {
    ringColor = '#E8A93A';
    ringBg = 'rgba(232, 169, 58, 0.12)';
  } else if (special === 'oops') {
    ringColor = '#E0607E';
    ringBg = 'rgba(224, 96, 126, 0.12)';
  } else if (special === 'nap') {
    ringColor = '#8E7CC3';
    ringBg = 'rgba(142, 124, 195, 0.12)';
  }

  const iconSize = isMobile ? 18 : 22;

  return (
    <div
      style={{
        position: 'relative',
        width: tileSize,
        height: tileSize,
        borderRadius: isMobile ? 8 : 12,
        background: bg,
        border: `1.5px solid ${border}`,
        boxShadow: isWin ? '0 4px 16px rgba(245, 158, 11, 0.35)' : '0 2px 6px rgba(43, 26, 61, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 2,
        userSelect: 'none',
      }}
    >
      {/* START Tile */}
      {isStart && (
        <span style={{
          fontSize: isMobile ? 10 : 13,
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '0.08em',
          fontFamily: "'Outfit', sans-serif",
          lineHeight: 1,
        }}>
          START
        </span>
      )}

      {/* Number on Path Tiles (Plum Ink #2B1A3D, 14px+ bold) */}
      {!isStart && (
        <span style={{
          position: 'absolute',
          top: isMobile ? 2 : 4,
          left: isMobile ? 4 : 6,
          fontSize: isMobile ? 11 : 14,
          fontWeight: 800,
          color: isWin ? '#78350F' : '#2B1A3D',
          lineHeight: 1,
          fontFamily: "'Outfit', sans-serif",
        }}>
          {num}
        </span>
      )}

      {/* Special Tile Lucide Icon with Thin Ring */}
      {special && !isWin && (
        <div
          style={{
            width: isMobile ? 24 : 32,
            height: isMobile ? 24 : 32,
            borderRadius: '50%',
            border: `2px solid ${ringColor}`,
            background: ringBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: isMobile ? 6 : 8,
          }}
        >
          {special === 'boost' && <Rocket size={iconSize - 2} color="#E8A93A" strokeWidth={2.2} />}
          {special === 'oops' && <CloudRain size={iconSize - 2} color="#E0607E" strokeWidth={2.2} />}
          {special === 'nap' && <Moon size={iconSize - 2} color="#8E7CC3" strokeWidth={2.2} />}
        </div>
      )}

      {/* Treasure Tile Trophy */}
      {isWin && (
        <div style={{ marginTop: isMobile ? 6 : 8 }}>
          <Trophy size={isMobile ? 20 : 26} color="#78350F" strokeWidth={2.5} />
        </div>
      )}

      {/* Token Stack on Tile */}
      {playersHere.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? 2 : 3,
          right: isMobile ? 2 : 4,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'flex-end',
          maxWidth: '92%',
          zIndex: 10,
        }}>
          {playersHere.map(p => (
            <Token key={p.id} player={p} isMobile={isMobile} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SCOREBOARD / SIDEBAR PLAYER CARDS (Turn order: Kaouther, Fubu, Biscuit, Kylo)
   ─────────────────────────────────────────────────────────────────*/
function Scoreboard({ players, positions, currentTurn, napTurns, isMobile }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      gap: isMobile ? 6 : 10,
      width: '100%',
      flexWrap: isMobile ? 'nowrap' : 'wrap',
      overflowX: isMobile ? 'auto' : 'visible',
      paddingBottom: isMobile ? 4 : 0,
    }}>
      {players.map((p, idx) => {
        const pos = positions[p.id] ?? 0;
        const pct = (pos / TOTAL_TILES) * 100;
        const isMyTurn = currentTurn === idx;
        const napping = napTurns[p.id] > 0;

        return (
          <motion.div
            key={p.id}
            animate={{ scale: isMyTurn ? 1.02 : 1 }}
            style={{
              background: '#FFFFFF',
              border: `2px solid ${isMyTurn ? p.color : '#E5D3E6'}`,
              borderRadius: 16,
              padding: isMobile ? '6px 8px' : '10px 14px',
              minWidth: isMobile ? 120 : 'auto',
              flex: isMobile ? '0 0 auto' : '1 1 auto',
              boxShadow: isMyTurn ? `0 4px 18px ${p.color}35` : '0 2px 8px rgba(43,26,61,0.04)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              position: 'relative',
            }}
          >
            {/* Header: Avatar, Name, Turn Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  boxShadow: `0 0 0 2px ${p.color}`, border: '1.5px solid white',
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <PlayerAvatar player={p} size={26} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 13, color: '#2B1A3D', fontFamily: "'Outfit', sans-serif" }}>
                  {p.name}
                </span>
                {napping && (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Moon size={12} color="#8E7CC3" strokeWidth={2} />
                  </span>
                )}
              </div>

              {/* Turn Tag */}
              {isMyTurn && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  background: `${p.color}18`, color: p.color,
                  padding: '2px 7px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  <span>{p.isBot ? 'Turn' : 'Your turn'}</span>
                  <ChevronRight size={11} strokeWidth={2.5} />
                </div>
              )}
            </div>

            {/* Progress Bar in Player's Bright Color */}
            <div style={{
              height: 6, borderRadius: 3,
              background: '#F3E8F4', overflow: 'hidden', margin: '4px 0 2px',
            }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 90, damping: 20 }}
                style={{ height: '100%', background: p.color, borderRadius: 3 }}
              />
            </div>

            {/* Progress text */}
            <div style={{ fontSize: 10, color: '#6B5B6E', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
              Tile {pos} / {TOTAL_TILES}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TOAST (Handwritten Font 'Caveat')
   ─────────────────────────────────────────────────────────────────*/
function Toast({ msg, color }) {
  return (
    <motion.div
      key={msg}
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.92 }}
      style={{
        position: 'fixed',
        bottom: 90,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.96)',
        border: `2px solid ${color || '#F06A93'}`,
        borderRadius: 20,
        padding: '10px 24px',
        fontWeight: 700,
        fontSize: 18,
        color: '#2B1A3D',
        fontFamily: "'Caveat', cursive",
        boxShadow: `0 8px 30px ${color ? `${color}44` : 'rgba(43,26,61,0.18)'}`,
        zIndex: 9999,
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(10px)',
      }}
    >
      {msg}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   LIVE BANTER BUBBLE (Teasing / Competitive Talk during Race)
   ─────────────────────────────────────────────────────────────────*/
function BanterBubble({ banter, isMobile }) {
  if (!banter || !banter.sender) return null;
  const { sender, text } = banter;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#FFFFFF',
        border: `2px solid ${sender.color}`,
        boxShadow: `0 8px 24px ${sender.color}33`,
        borderRadius: 22,
        padding: isMobile ? '8px 14px' : '10px 20px',
        maxWidth: isMobile ? '94%' : 540,
        margin: '4px auto 10px',
        zIndex: 25,
      }}
    >
      <div style={{
        width: isMobile ? 32 : 38,
        height: isMobile ? 32 : 38,
        borderRadius: '50%',
        boxShadow: `0 0 0 2.5px ${sender.color}`,
        border: '2px solid white',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <PlayerAvatar player={sender} size={isMobile ? 30 : 36} />
      </div>

      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={{
          fontSize: isMobile ? 11 : 12,
          fontWeight: 800,
          color: sender.color,
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          lineHeight: 1.1,
        }}>
          {sender.name}
        </div>
        <div style={{
          fontSize: isMobile ? 14 : 16,
          fontWeight: 700,
          color: '#2B1A3D',
          fontFamily: "'Caveat', cursive",
          lineHeight: 1.25,
          marginTop: 2,
        }}>
          "{text}"
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   WIN CARD (Kaouther Wins in Round 2+)
   ─────────────────────────────────────────────────────────────────*/
function WinCard({ onComplete }) {
  const bots = PLAYERS.filter(p => p.isBot);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 140, damping: 20 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(252, 235, 224, 0.92)',
        backdropFilter: 'blur(20px)',
        padding: 16,
      }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: 32,
        padding: '36px 36px', maxWidth: 480, width: '100%',
        textAlign: 'center',
        boxShadow: '0 32px 80px rgba(240, 106, 147, 0.28)',
        border: '2.5px solid #FCE4EC',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Kaouther Avatar with Gold Trophy Halo */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            boxShadow: '0 0 0 4px #F06A93, 0 8px 24px rgba(240, 106, 147, 0.35)',
            border: '3px solid white', overflow: 'hidden', margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <PlayerAvatar player={PLAYERS[0]} size={68} />
          </div>
          <div style={{
            position: 'absolute', bottom: -6, right: -6,
            background: '#FDE68A', borderRadius: '50%', padding: 6,
            border: '2px solid #D97706', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <Trophy size={20} color="#D97706" strokeWidth={2.5} />
          </div>
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#D6174A', marginBottom: 6, fontFamily: "'Abril Fatface', serif" }}>
          You Win the Race! 🏆
        </h2>
        <p style={{ fontSize: 15, color: '#6B5B6E', marginBottom: 20, lineHeight: 1.5, fontFamily: "'Outfit', sans-serif" }}>
          {WIN_MESSAGE}
        </p>

        {/* Bots Conceding Defeat / Cheering Kaouther */}
        <div style={{
          background: '#FAF2F7', borderRadius: 20, padding: '14px 16px',
          border: '1.5px solid #F0D5E6', marginBottom: 24, textAlign: 'left',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#8E7CC3', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif" }}>
            The Bots Praise the Champion:
          </div>

          {bots.map(bot => {
            const cheer = ROUND2_WIN_CHEERS[bot.id] || "Congratulations Kaouther! 🎉";
            return (
              <div key={bot.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  boxShadow: `0 0 0 2px ${bot.color}`, border: '1.5px solid white',
                  overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <PlayerAvatar player={bot} size={26} />
                </div>
                <div style={{ fontSize: 13, color: '#2B1A3D', fontFamily: "'Outfit', sans-serif", lineHeight: 1.3 }}>
                  <strong style={{ color: bot.color }}>{bot.name}:</strong> "{cheer}"
                </div>
              </div>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onComplete}
          style={{
            background: 'linear-gradient(135deg, #F06A93 0%, #C0396B 100%)',
            border: 'none', borderRadius: 18,
            padding: '14px 40px',
            fontSize: 16, fontWeight: 700, color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(240, 106, 147, 0.35)',
            fontFamily: "'Outfit', sans-serif",
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          <span>Claim Treasure & Continue</span>
          <Sparkles size={18} color="#FFFFFF" />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN BOARD GAME SCENE
   ─────────────────────────────────────────────────────────────────*/
const banterQueues = makeBanterQueues();

export default function BoardGameScene({ onComplete }) {
  const isMobile = useIsMobile();
  const cols = isMobile ? COLS_MOBILE : COLS_DESKTOP;
  const rows = isMobile ? ROWS_MOBILE : ROWS_DESKTOP;
  const cells = buildSnakePath(cols, rows);

  // ── URL test shortcuts ──────────────────────────────────────────
  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const debugTile = params.has('tile') ? parseInt(params.get('tile'), 10) : null;
  const debugRoll = params.has('roll') ? parseInt(params.get('roll'), 10) : null;

  // ── State ───────────────────────────────────────────────────────
  const initPositions = () => {
    const p = {};
    PLAYERS.forEach(pl => { p[pl.id] = 0; });
    if (debugTile) {
      p[PLAYERS[0].id] = clamp(debugTile);
      if (debugTile >= 40) {
        PLAYERS.forEach((pl, idx) => {
          if (idx > 0) p[pl.id] = clamp(debugTile - (idx === 1 ? 2 : idx === 2 ? 1 : 0));
        });
      }
    }
    return p;
  };

  const getInitialAttempt = () => {
    if (typeof window !== 'undefined') {
      const urlAtt = new URLSearchParams(window.location.search).get('attempt');
      if (urlAtt) return parseInt(urlAtt, 10);
      const saved = sessionStorage.getItem('race_treasure_attempt');
      if (saved) return parseInt(saved, 10);
    }
    return 1;
  };

  const [attempt, setAttempt]           = useState(getInitialAttempt);
  const [positions, setPositions]       = useState(initPositions);
  const [currentTurn, setCurrentTurn]   = useState(0); // 0=Kaouther, 1=Fubu, 2=Biscuit, 3=Kylo
  const [napTurns, setNapTurns]         = useState(() => {
    const n = {}; PLAYERS.forEach(p => { n[p.id] = 0; }); return n;
  });
  const [rolling, setRolling]           = useState(false);
  const [diceValue, setDiceValue]       = useState(1);
  const [toast, setToast]               = useState(null);
  const [winner, setWinner]             = useState(null);
  const [gameOver, setGameOver]         = useState(false);
  const [banter, setBanter]             = useState(null);
  const banterTimerRef                  = useRef(null);

  const catchupCount = useRef(0);

  const showToast = useCallback((msg, color, ms = 2200) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), ms);
  }, []);

  const triggerBanter = useCallback((sender, text, ms = 4200) => {
    if (banterTimerRef.current) clearTimeout(banterTimerRef.current);
    setBanter({ sender, text });
    banterTimerRef.current = setTimeout(() => setBanter(null), ms);
  }, []);

  const applySpecial = useCallback((playerId, newPos, playerColor) => {
    const effect = SPECIAL_TILES[newPos];
    if (!effect) return newPos;

    if (playerId === PLAYERS[0].id && attempt >= 2) {
      if (effect === 'oops') {
        showToast('Lucky dodge! 🍀', playerColor);
        return newPos;
      }
      if (effect === 'nap') {
        showToast('Energy boost! ⚡', playerColor);
        return clamp(newPos + 2);
      }
    }

    if (playerId !== PLAYERS[0].id && attempt >= 2) {
      if (effect === 'boost') {
        const boosted = clamp(newPos + BOOST_AMOUNT);
        return Math.min(TOTAL_TILES - 1, boosted);
      }
    }

    const msg = pick(TILE_MESSAGES[effect]);
    showToast(msg, playerColor);

    if (effect === 'boost') {
      return clamp(newPos + BOOST_AMOUNT);
    } else if (effect === 'oops') {
      return clamp(newPos - OOPS_AMOUNT);
    } else if (effect === 'nap') {
      setNapTurns(prev => ({ ...prev, [playerId]: 1 }));
      return newPos;
    }
    return newPos;
  }, [showToast, attempt]);

  const executeRoll = useCallback(async (playerIndex, roll) => {
    const player = PLAYERS[playerIndex];
    const currentPos = positions[player.id];

    if (roll <= 0) {
      setCurrentTurn((playerIndex + 1) % PLAYERS.length);
      setRolling(false);
      return;
    }

    const target = clamp(currentPos + roll);

    for (let step = currentPos + 1; step <= target; step++) {
      await new Promise(r => setTimeout(r, MOVE_STEP_DELAY_MS));
      setPositions(prev => ({ ...prev, [player.id]: step }));
    }

    const finalPos = applySpecial(player.id, target, player.color);
    if (finalPos !== target) {
      await new Promise(r => setTimeout(r, 400));
      setPositions(prev => ({ ...prev, [player.id]: finalPos }));
    }

    if (finalPos >= TOTAL_TILES) {
      setWinner(player.id);
      setGameOver(true);
      return;
    }

    // ── Banter Triggers on Move Completion ──
    const kPos = player.id === PLAYERS[0].id ? finalPos : (positions[PLAYERS[0].id] || 0);

    if (attempt === 1) {
      // Round 1: Bots tease Kaouther for being behind
      if (player.isBot) {
        if (finalPos >= kPos) {
          const pool = ROUND1_TEASE_MESSAGES[player.id];
          if (pool && pool.length) {
            triggerBanter(player, banterQueues.next(player.id, 1, pool));
          }
        }
      } else {
        // Kaouther just rolled. If bots are ahead of her, leading bot teases her:
        const aheadBots = PLAYERS.filter(p => p.isBot && (positions[p.id] || 0) > finalPos);
        if (aheadBots.length > 0) {
          const teaser = pick(aheadBots);
          const pool = ROUND1_TEASE_MESSAGES[teaser.id];
          if (pool && pool.length) {
            setTimeout(() => triggerBanter(teaser, banterQueues.next(teaser.id, 1, pool)), 250);
          }
        }
      }
    } else {
      // Round 2: Tough competition neck-and-neck banter!
      if (player.isBot) {
        const pool = ROUND2_COMPETITION_MESSAGES[player.id];
        if (pool && pool.length) {
          triggerBanter(player, banterQueues.next(player.id, 2, pool));
        }
      } else {
        const reactor = pick(PLAYERS.filter(p => p.isBot));
        const pool = ROUND2_COMPETITION_MESSAGES[reactor.id];
        if (pool && pool.length) {
          setTimeout(() => triggerBanter(reactor, banterQueues.next(reactor.id, 2, pool)), 250);
        }
      }
    }

    setCurrentTurn((playerIndex + 1) % PLAYERS.length);
    setRolling(false);
  }, [positions, applySpecial, attempt, triggerBanter]);

  // ── Bot auto-play ────────────────────────────────────────────────
  useEffect(() => {
    if (rolling || gameOver) return;
    const player = PLAYERS[currentTurn];
    if (!player.isBot) return;

    const timer = setTimeout(() => {
      const pos = positions[player.id];

      if (napTurns[player.id] > 0) {
        setNapTurns(prev => ({ ...prev, [player.id]: prev[player.id] - 1 }));
        showToast(`${player.name} is napping 💤`, player.color);
        setCurrentTurn((currentTurn + 1) % PLAYERS.length);
        return;
      }

      let roll;
      if (attempt === 1) {
        // Round 1: Bots rush to win!
        roll = randInt(4, 6);
        const distToWin = TOTAL_TILES - pos;
        if (distToWin <= 6) {
          roll = distToWin;
        }
      } else {
        // Round 2: Fierce, tough competition right on Kaouther's heels!
        const kPos = positions[PLAYERS[0].id] || 0;
        const botCap = TOTAL_TILES - 1; // 49
        const distToCap = Math.max(0, botCap - pos);

        if (distToCap <= 0) {
          showToast(`${player.name} is waiting near the treasure 🐾`, player.color);
          setCurrentTurn((currentTurn + 1) % PLAYERS.length);
          return;
        }

        if (pos < kPos - 1) {
          // Lagging behind Kaouther: roll 4 to 6 to stay right on her heels!
          roll = Math.min(randInt(4, 6), distToCap);
        } else if (pos <= kPos + 1) {
          // Neck-and-neck with Kaouther: roll 2 to 4!
          roll = Math.min(randInt(2, 4), distToCap);
        } else {
          // Ahead of Kaouther by 2+ tiles: roll 1 to 2 so she can overtake!
          roll = Math.min(randInt(1, 2), distToCap);
        }
        if (roll <= 0) roll = 1;
      }

      setDiceValue(roll);
      setRolling(true);
      setTimeout(() => {
        setRolling(false);
        executeRoll(currentTurn, roll);
      }, DICE_ROLL_DELAY_MS);
    }, 850);

    return () => clearTimeout(timer);
  }, [currentTurn, rolling, gameOver, positions, napTurns, showToast, executeRoll, attempt]);

  // ── Human roll ──────────────────────────────────────────────────
  const handleRoll = () => {
    if (rolling || gameOver) return;
    const player = PLAYERS[currentTurn];
    if (player.isBot) return;

    if (napTurns[player.id] > 0) {
      setNapTurns(prev => ({ ...prev, [player.id]: prev[player.id] - 1 }));
      showToast('You are napping 💤', player.color);
      setCurrentTurn((currentTurn + 1) % PLAYERS.length);
      return;
    }

    const currentPos = positions[player.id];
    let roll;

    if (debugRoll) {
      roll = debugRoll;
    } else if (attempt === 1) {
      // Round 1: Kaouther must NOT win!
      const maxAllowed = Math.max(0, (TOTAL_TILES - 3) - currentPos);
      if (currentPos >= TOTAL_TILES - 3) {
        showToast('The treasure chest is locked... almost there! 🗝️', player.color);
        setCurrentTurn((currentTurn + 1) % PLAYERS.length);
        return;
      }
      roll = Math.min(randInt(2, 4), maxAllowed);
      if (roll <= 0) roll = 1;
    } else {
      // Round 2: Tough competition and Kaouther SHOULD WIN!
      const dist = TOTAL_TILES - currentPos;
      if (dist <= 6) {
        roll = dist; // Guaranteed winning roll to Tile 50!
      } else {
        roll = randInt(4, 6);
      }
    }

    setDiceValue(roll);
    setRolling(true);
    setTimeout(() => {
      setRolling(false);
      executeRoll(currentTurn, roll);
    }, DICE_ROLL_DELAY_MS);
  };

  // ── Responsive sizing: scales to fill height ────────────────────
  const tileSize = isMobile ? 54 : 76;
  const gap = isMobile ? 5 : 8;
  const gridWidth = cols * tileSize + (cols - 1) * gap;
  const gridHeight = rows * tileSize + (rows - 1) * gap;

  const playersAtTile = (tileNum) =>
    PLAYERS.filter(p => (positions[p.id] ?? 0) === tileNum);

  const currentPlayer = PLAYERS[currentTurn];
  const isHumanTurn = !currentPlayer.isBot;

  // Compute map of coordinates for all tiles from 1 to 50
  const coordsMap = useMemo(() => {
    const map = {};
    for (let num = 1; num <= TOTAL_TILES; num++) {
      const idx = cells.indexOf(num);
      if (idx !== -1) {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const cx = col * (tileSize + gap) + tileSize / 2;
        const cy = row * (tileSize + gap) + tileSize / 2;
        map[num] = { x: cx, y: cy, row, col };
      }
    }
    return map;
  }, [cells, cols, tileSize, gap]);

  // Compute SVG polyline points connecting tile 1 to 50
  const trailPoints = useMemo(() => {
    const pts = [];
    for (let num = 1; num <= TOTAL_TILES; num++) {
      if (coordsMap[num]) {
        pts.push(`${coordsMap[num].x},${coordsMap[num].y}`);
      }
    }
    return pts.join(' ');
  }, [coordsMap]);

  // Compute directional markers (arrows on turns / intervals and soft dots) along the trail
  const trailMarkers = useMemo(() => {
    const markers = [];
    for (let num = 1; num < TOTAL_TILES; num++) {
      const c1 = coordsMap[num];
      const c2 = coordsMap[num + 1];
      if (!c1 || !c2) continue;
      const mx = (c1.x + c2.x) / 2;
      const my = (c1.y + c2.y) / 2;

      // Vertical transition (moving up to the next row)
      if (c1.col === c2.col) {
        markers.push(
          <path
            key={`marker-v-${num}`}
            d={`M ${mx - 3.5} ${my + 2.5} L ${mx} ${my - 2.5} L ${mx + 3.5} ${my + 2.5}`}
            stroke="#9B82AB"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      } else {
        // Horizontal transition
        if (num % 3 === 0) {
          if (c2.x > c1.x) {
            // Moving right
            markers.push(
              <path
                key={`marker-r-${num}`}
                d={`M ${mx - 2.5} ${my - 3.5} L ${mx + 2.5} ${my} L ${mx - 2.5} ${my + 3.5}`}
                stroke="#9B82AB"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            );
          } else {
            // Moving left
            markers.push(
              <path
                key={`marker-l-${num}`}
                d={`M ${mx + 2.5} ${my - 3.5} L ${mx - 2.5} ${my} L ${mx + 2.5} ${my + 3.5}`}
                stroke="#9B82AB"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            );
          }
        } else {
          markers.push(
            <circle
              key={`dot-${num}`}
              cx={mx}
              cy={my}
              r={isMobile ? 2.5 : 3.5}
              fill="#C4B0D0"
            />
          );
        }
      }
    }
    return markers;
  }, [coordsMap, isMobile]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FCEBE0 0%, #EDE4F7 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: isMobile ? '12px 10px 125px' : '16px 24px 24px',
      position: 'relative',
      fontFamily: "'Outfit', 'Quicksand', sans-serif",
      color: '#2B1A3D',
      boxSizing: 'border-box',
    }}>
      {/* Subtle background sprinkles */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `radial-gradient(#E8D3EB 1.2px, transparent 1.2px), radial-gradient(#F5D6DF 1.2px, transparent 1.2px)`,
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px',
        opacity: 0.5,
      }} />

      {/* Header: Title + Legend pills */}
      <div style={{ zIndex: 1, textAlign: 'center', marginBottom: isMobile ? 8 : 12 }}>
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: isMobile ? 22 : 32,
            fontWeight: 800,
            color: '#2B1A3D',
            fontFamily: "'Abril Fatface', serif",
            margin: '0 0 6px',
            letterSpacing: '0.01em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Dices size={isMobile ? 22 : 28} color="#F06A93" strokeWidth={2} />
          <span>Race to the Treasure</span>
          <Trophy size={isMobile ? 22 : 28} color="#E8A93A" strokeWidth={2} />
        </motion.h1>

        {/* Legend Pills with Lucide Icons */}
        <div style={{
          display: 'flex',
          gap: isMobile ? 6 : 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 4,
        }}>
          {[
            { label: 'Boost +4', icon: <Rocket size={16} color="#E8A93A" strokeWidth={2} />, border: '#E8A93A' },
            { label: 'Oops -3', icon: <CloudRain size={16} color="#E0607E" strokeWidth={2} />, border: '#E0607E' },
            { label: 'Nap (skip a turn)', icon: <Moon size={16} color="#8E7CC3" strokeWidth={2} />, border: '#8E7CC3' },
            { label: 'Treasure', icon: <Trophy size={16} color="#D97706" strokeWidth={2} />, border: '#D97706' },
          ].map(({ label, icon, border }) => (
            <div
              key={label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(255, 255, 255, 0.85)',
                border: `1.5px solid ${border}55`,
                borderRadius: 20,
                padding: '4px 11px',
                fontSize: isMobile ? 11 : 12,
                fontWeight: 600,
                color: '#2B1A3D',
                backdropFilter: 'blur(6px)',
              }}
            >
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Banter Bubble */}
      <AnimatePresence>
        {banter && (
          <BanterBubble banter={banter} isMobile={isMobile} />
        )}
      </AnimatePresence>

      {/* Main Game Container */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 12 : 20,
        zIndex: 1,
        width: '100%',
        maxWidth: 1220,
        alignItems: isMobile ? 'center' : 'stretch',
        justifyContent: 'center',
      }}>
        {/* Board Card: Frosted white (92% opacity), 28px radius, soft lilac shadow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            borderRadius: 28,
            border: '1.5px solid rgba(229, 211, 230, 0.8)',
            boxShadow: '0 16px 40px rgba(180, 160, 210, 0.2)',
            backdropFilter: 'blur(16px)',
            padding: isMobile ? 12 : 18,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Grid Wrapper with SVG Snake Trail */}
          <div style={{
            position: 'relative',
            width: gridWidth,
            height: gridHeight,
          }}>
            {/* SVG Trail line connecting all tiles from 1 to 50 */}
            <svg style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: gridWidth,
              height: gridHeight,
              pointerEvents: 'none',
              zIndex: 1,
              overflow: 'visible',
            }}>
              {/* Connector line from START tile (below Tile 1) into Tile 1 */}
              {coordsMap[1] && (
                <>
                  <line
                    x1={coordsMap[1].x}
                    y1={coordsMap[1].y + tileSize / 2 + gap + 8}
                    x2={coordsMap[1].x}
                    y2={coordsMap[1].y}
                    stroke="#EBDCEF"
                    strokeWidth={isMobile ? 12 : 18}
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${coordsMap[1].x - 3.5} ${coordsMap[1].y + tileSize / 2 + 6} L ${coordsMap[1].x} ${coordsMap[1].y + tileSize / 2 + 1} L ${coordsMap[1].x + 3.5} ${coordsMap[1].y + tileSize / 2 + 6}`}
                    stroke="#9B82AB"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </>
              )}
              {/* Polyline connecting all tiles */}
              <polyline
                points={trailPoints}
                fill="none"
                stroke="#EBDCEF"
                strokeWidth={isMobile ? 12 : 18}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Direction markers along trail */}
              {trailMarkers}
            </svg>

            {/* 50 Path Tiles Grid (Snake Path) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
                gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
                gap: `${gap}px`,
                zIndex: 2,
                position: 'relative',
              }}
            >
              {cells.map((tileNum, idx) => (
                <BoardTile
                  key={idx}
                  num={tileNum}
                  playersHere={tileNum > 0 ? playersAtTile(tileNum) : []}
                  isMobile={isMobile}
                  tileSize={tileSize}
                />
              ))}
            </div>
          </div>

          {/* START Tile Dock at the Bottom (Entrance before Tile 1) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 14,
            width: '100%',
            justifyContent: 'flex-start',
            zIndex: 3,
            paddingLeft: 2,
          }}>
            {/* START Tile: plum #2B1A3D with white START text */}
            <div style={{
              width: isMobile ? 124 : 156,
              height: isMobile ? 44 : 52,
              borderRadius: 14,
              background: '#2B1A3D',
              border: '2px solid rgba(255, 255, 255, 0.22)',
              boxShadow: '0 8px 20px rgba(43, 26, 61, 0.26)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '0 10px' : '0 12px',
              boxSizing: 'border-box',
              position: 'relative',
            }}>
              <span style={{
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: isMobile ? 12 : 14,
                letterSpacing: '0.08em',
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1,
              }}>
                START
              </span>

              {/* Stacked player tokens at position 0 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: 4,
              }}>
                {playersAtTile(0).map((player, idx) => (
                  <div
                    key={player.id}
                    style={{
                      marginLeft: idx === 0 ? 0 : -8,
                      zIndex: 10 + idx,
                    }}
                  >
                    <Token player={player} isMobile={isMobile} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#8E7CC3',
              fontWeight: 800,
              fontSize: isMobile ? 11 : 13,
              fontFamily: "'Outfit', sans-serif",
            }}>
              <ChevronUp size={isMobile ? 16 : 20} strokeWidth={3} color="#8E7CC3" />
              <span style={{ color: '#2B1A3D' }}>Entrance to Tile 1</span>
            </div>
          </div>
        </motion.div>

        {/* Side Panel (Desktop): 4 Player Cards + 3D Dice Area (Matches Board Height) */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              width: 320,
              background: 'rgba(255, 255, 255, 0.92)',
              borderRadius: 28,
              border: '1.5px solid rgba(229, 211, 230, 0.8)',
              boxShadow: '0 16px 40px rgba(180, 160, 210, 0.2)',
              backdropFilter: 'blur(16px)',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            {/* Top: 4 Player Cards */}
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#6B5B6E',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 10,
                fontFamily: "'Outfit', sans-serif"
              }}>
                PLAYERS (Turn Order)
              </div>

              <Scoreboard
                players={PLAYERS}
                positions={positions}
                currentTurn={currentTurn}
                napTurns={napTurns}
                isMobile={isMobile}
              />
            </div>

            {/* Bottom: 3D Dice Cube & Pink Gradient Roll Button */}
            <div style={{
              background: '#FAF2F7',
              borderRadius: 22,
              padding: '16px 16px 18px',
              border: '1.5px solid #E5D3E6',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              marginTop: 14,
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 800,
                color: currentPlayer.color,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontFamily: "'Outfit', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span>{isHumanTurn ? 'Your turn to roll!' : `${currentPlayer.name}'s turn`}</span>
              </div>

              <Dice3D
                value={diceValue}
                rolling={rolling}
                size={58}
              />

              <motion.button
                whileHover={isHumanTurn && !rolling && !gameOver ? { scale: 1.05, y: -2 } : {}}
                whileTap={isHumanTurn && !rolling && !gameOver ? { scale: 0.96 } : {}}
                onClick={handleRoll}
                disabled={!isHumanTurn || rolling || gameOver}
                style={{
                  width: '100%',
                  background: isHumanTurn && !rolling && !gameOver
                    ? 'linear-gradient(135deg, #F06A93 0%, #C0396B 100%)'
                    : '#E5D3E6',
                  border: 'none',
                  borderRadius: 16,
                  padding: '12px 20px',
                  fontSize: 15,
                  fontWeight: 800,
                  color: isHumanTurn && !rolling && !gameOver ? '#FFFFFF' : '#8E7CC3',
                  cursor: isHumanTurn && !rolling && !gameOver ? 'pointer' : 'not-allowed',
                  boxShadow: isHumanTurn && !rolling && !gameOver
                    ? '0 6px 20px rgba(240, 106, 147, 0.38)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s',
                }}
              >
                <Dices size={18} strokeWidth={2.2} />
                <span>{rolling ? 'Rolling…' : isHumanTurn ? 'Roll Dice!' : `${currentPlayer.name} rolling…`}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky Bottom Control Bar on Mobile (390px) */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: '1.5px solid #E5D3E6',
          boxShadow: '0 -4px 20px rgba(43, 26, 61, 0.08)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100,
        }}>
          {/* Active Player Mini Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              boxShadow: `0 0 0 2.5px ${currentPlayer.color}`,
              border: '2px solid white', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <PlayerAvatar player={currentPlayer} size={28} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#2B1A3D' }}>{currentPlayer.name}</div>
              <div style={{ fontSize: 10, color: currentPlayer.color, fontWeight: 700 }}>
                {isHumanTurn ? 'Your turn!' : 'Waiting…'}
              </div>
            </div>
          </div>

          {/* Mini 3D Dice */}
          <div style={{ transform: 'scale(0.72)', transformOrigin: 'center center' }}>
            <Dice3D value={diceValue} rolling={rolling} size={46} />
          </div>

          {/* Mobile Roll Button */}
          <motion.button
            whileTap={isHumanTurn && !rolling && !gameOver ? { scale: 0.95 } : {}}
            onClick={handleRoll}
            disabled={!isHumanTurn || rolling || gameOver}
            style={{
              background: isHumanTurn && !rolling && !gameOver
                ? 'linear-gradient(135deg, #F06A93 0%, #C0396B 100%)'
                : '#E5D3E6',
              border: 'none',
              borderRadius: 14,
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 700,
              color: isHumanTurn && !rolling && !gameOver ? '#FFFFFF' : '#8E7CC3',
              cursor: isHumanTurn && !rolling && !gameOver ? 'pointer' : 'not-allowed',
              boxShadow: isHumanTurn && !rolling && !gameOver
                ? '0 4px 14px rgba(240, 106, 147, 0.35)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Dices size={16} strokeWidth={2.2} />
            <span>{rolling ? '…' : 'Roll!'}</span>
          </motion.button>
        </div>
      )}

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} color={toast.color} />}
      </AnimatePresence>

      {/* Win Modal Card (Player Wins) */}
      <AnimatePresence>
        {gameOver && winner === PLAYERS[0].id && (
          <WinCard onComplete={onComplete} />
        )}

        {/* Bot Wins Modal (Round 1 - Bots tease Kaouther and invite Rematch) */}
        {gameOver && winner !== PLAYERS[0].id && (() => {
          const winnerObj = PLAYERS.find(p => p.id === winner) || PLAYERS[1];
          const otherBots = PLAYERS.filter(p => p.isBot && p.id !== winner);
          const winQuote = ROUND1_BOT_WIN_QUOTES[winnerObj.id] || "Too fast for you, Kaouther! 🏆";

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(252, 235, 224, 0.92)', backdropFilter: 'blur(18px)',
                padding: 16,
              }}
            >
              <div style={{
                background: '#FFFFFF', borderRadius: 32, padding: '36px 36px',
                textAlign: 'center', boxShadow: '0 28px 70px rgba(43,26,61,0.18)',
                border: `2.5px solid ${winnerObj.color}40`, maxWidth: 480, width: '100%',
                maxHeight: '90vh', overflowY: 'auto',
              }}>
                {/* Winner Avatar with Trophy Badge */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    boxShadow: `0 0 0 4px ${winnerObj.color}, 0 8px 24px ${winnerObj.color}40`,
                    border: '3px solid white', overflow: 'hidden', margin: '0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <PlayerAvatar player={winnerObj} size={68} />
                  </div>
                  <div style={{
                    position: 'absolute', bottom: -6, right: -6,
                    background: '#FDE68A', borderRadius: '50%', padding: 6,
                    border: '2px solid #D97706', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    <Trophy size={20} color="#D97706" strokeWidth={2.5} />
                  </div>
                </div>

                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2B1A3D', marginBottom: 6, fontFamily: "'Abril Fatface', serif" }}>
                  {winnerObj.name} got there first! 🏆
                </h2>
                <p style={{ color: '#6B5B6E', marginBottom: 18, fontSize: 14, fontFamily: "'Outfit', sans-serif" }}>
                  Round 1: The bots beat you to the treasure! Can you beat them in Round 2?
                </p>

                {/* Teasing Speech Cards from the Bots */}
                <div style={{
                  background: '#FAF2F7', borderRadius: 20, padding: '14px 16px',
                  border: '1.5px solid #F0D5E6', marginBottom: 22, textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#8E7CC3', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif" }}>
                    The Bots Tease You:
                  </div>

                  {/* Winner's Tease */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      boxShadow: `0 0 0 2px ${winnerObj.color}`, border: '1.5px solid white',
                      overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2
                    }}>
                      <PlayerAvatar player={winnerObj} size={28} />
                    </div>
                    <div style={{ fontSize: 13, color: '#2B1A3D', fontFamily: "'Outfit', sans-serif", lineHeight: 1.35 }}>
                      <strong style={{ color: winnerObj.color }}>{winnerObj.name} (Winner):</strong> "{winQuote}"
                    </div>
                  </div>

                  {/* Sideliners Teasing */}
                  {otherBots.map(bot => {
                    const sideline = ROUND1_BOT_SIDELINES[bot.id] || "Try to keep up next round! 🐾";
                    return (
                      <div key={bot.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          boxShadow: `0 0 0 2px ${bot.color}`, border: '1.5px solid white',
                          overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2
                        }}>
                          <PlayerAvatar player={bot} size={26} />
                        </div>
                        <div style={{ fontSize: 13, color: '#2B1A3D', fontFamily: "'Outfit', sans-serif", lineHeight: 1.35 }}>
                          <strong style={{ color: bot.color }}>{bot.name}:</strong> "{sideline}"
                        </div>
                      </div>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    const nextAtt = attempt + 1;
                    setAttempt(nextAtt);
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('race_treasure_attempt', nextAtt.toString());
                    }
                    setPositions(initPositions());
                    setCurrentTurn(0);
                    setNapTurns(() => { const n = {}; PLAYERS.forEach(p => { n[p.id] = 0; }); return n; });
                    setWinner(null);
                    setGameOver(false);
                    setDiceValue(1);
                    catchupCount.current = 0;
                    setBanter({
                      sender: PLAYERS[3], // Kylo
                      text: "Round 2! Let's see if you can take the treasure this time, Kaouther! 🏎️💨"
                    });
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #F06A93 0%, #C0396B 100%)',
                    border: 'none', borderRadius: 18, padding: '14px 34px',
                    fontSize: 16, fontWeight: 800, color: '#FFFFFF', cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(240, 106, 147, 0.38)',
                    fontFamily: "'Outfit', sans-serif",
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <Dices size={18} strokeWidth={2.2} />
                  <span>Round 2: Rematch! (I'll beat you this time!) 🎲🔥</span>
                </motion.button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
