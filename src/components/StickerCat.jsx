import React, { useMemo } from 'react';

/**
 * Sticker-Style Thick-Outline Cartoon Cat
 * Shared rig for Mochi (orange/cream tabby) and Biscuit (periwinkle/indigo).
 * Thick dark navy outline (#1E1B4B), round linecaps/joins, chubby rounded shapes,
 * separate layered SVG parts supporting:
 * - walk (4-frame leg cycle + body bob + tail sway)
 * - sit (neat seated paws + wrapped tail)
 * - loaf (tucked paws on belly + perked tail tip)
 * - stretch (front paws extended, arched back, rump up)
 * - groom (seated, raised licking paw, bliss eyes)
 * - jump (airborne leap, perked tail, happy ^^ eyes)
 * - hmm (ear-back reaction, tilted head, curious look)
 * - talk (mouth open/close synced to dialogue, head bob)
 */

export const CAT_PALETTES = {
  fubu: {
    name: 'Fubu',
    body: '#FFB26B',       // warm vibrant orange
    belly: '#FFF1D6',      // warm cream belly & muzzle
    spot: '#D9531E',       // darker saturated orange spot patch
    innerEar: '#FFA5B5',   // soft pink inner ear
    pad: '#FB7185',        // pink paw pad
    nose: '#FB7185',       // pink nose
    eye: '#1E1B4B',        // dark navy dot
    sparkle: '#FFFFFF',    // eye highlight
    outline: '#1E1B4B',    // unified thick outline
    whiskers: '#1E1B4B',
  },
  mochi: {
    name: 'Fubu',
    body: '#FFB26B',       // warm vibrant orange
    belly: '#FFF1D6',      // warm cream belly & muzzle
    spot: '#D9531E',       // darker saturated orange spot patch
    innerEar: '#FFA5B5',   // soft pink inner ear
    pad: '#FB7185',        // pink paw pad
    nose: '#FB7185',       // pink nose
    eye: '#1E1B4B',        // dark navy dot
    sparkle: '#FFFFFF',    // eye highlight
    outline: '#1E1B4B',    // unified thick outline
    whiskers: '#1E1B4B',
  },
  biscuit: {
    name: 'Biscuit',
    body: '#A8B4E5',       // periwinkle/lavender-grey
    belly: '#F0F3FF',      // soft lighter cream/white
    spot: '#3730A3',       // deep indigo spot patch
    innerEar: '#FDA4AF',   // soft pink inner ear
    pad: '#FB7185',        // pink paw pad
    nose: '#FB7185',       // pink nose
    eye: '#1E1B4B',        // dark navy dot
    sparkle: '#FFFFFF',    // eye highlight
    outline: '#1E1B4B',    // unified thick outline
    whiskers: '#1E1B4B',
  },
};

export default function StickerCat({
  cat = 'mochi',
  pose = 'walk',
  walkFrame = 0,
  blink = false,
  talking = false,
  talkFrame = 0,
  happy = false,
  size = 110,
}) {
  const p = CAT_PALETTES[cat] || CAT_PALETTES.mochi;
  const strokeProps = {
    stroke: p.outline,
    strokeWidth: '4.5',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  // Eyes rendering helper
  const renderEyes = (cx1, cy1, cx2, cy2, isCurved = false) => {
    if (blink) {
      return (
        <g {...strokeProps} fill="none">
          <path d={`M ${cx1 - 4},${cy1} Q ${cx1},${cy1 + 3} ${cx1 + 4},${cy1}`} />
          <path d={`M ${cx2 - 4},${cy2} Q ${cx2},${cy2 + 3} ${cx2 + 4},${cy2}`} />
        </g>
      );
    }
    if (isCurved || happy || pose === 'groom' || pose === 'loaf') {
      return (
        <g {...strokeProps} fill="none">
          <path d={`M ${cx1 - 4},${cy1 + 2} Q ${cx1},${cy1 - 3} ${cx1 + 4},${cy1 + 2}`} />
          <path d={`M ${cx2 - 4},${cy2 + 2} Q ${cx2},${cy2 - 3} ${cx2 + 4},${cy2 + 2}`} />
        </g>
      );
    }
    return (
      <g>
        <circle cx={cx1} cy={cy1} r="3.6" fill={p.eye} />
        <circle cx={cx1 + 1.2} cy={cy1 - 1.2} r="1.3" fill={p.sparkle} />
        <circle cx={cx2} cy={cy2} r="3.6" fill={p.eye} />
        <circle cx={cx2 + 1.2} cy={cy2 - 1.2} r="1.3" fill={p.sparkle} />
      </g>
    );
  };

  // Mouth rendering helper
  const renderMouth = (mx, my) => {
    if ((pose === 'talk' || talking) && talkFrame % 2 === 1) {
      // Open mouth for speech
      return (
        <g>
          <ellipse cx={mx} cy={my + 2} rx="3.5" ry="3.8" fill="#F43F5E" {...strokeProps} strokeWidth="3" />
          <ellipse cx={mx} cy={my + 3.2} rx="2.4" ry="1.6" fill="#FFA5B5" />
        </g>
      );
    }
    if (happy || pose === 'jump') {
      return (
        <path
          d={`M ${mx - 4},${my - 1} Q ${mx},${my + 4} ${mx + 4},${my - 1}`}
          fill="none"
          {...strokeProps}
          strokeWidth="3.2"
        />
      );
    }
    // Classic cute ":3" / "w" smile
    return (
      <path
        d={`M ${mx - 4.5},${my} Q ${mx - 2.2},${my + 3.2} ${mx},${my} Q ${mx + 2.2},${my + 3.2} ${mx + 4.5},${my}`}
        fill="none"
        {...strokeProps}
        strokeWidth="3.2"
      />
    );
  };

  // Whiskers helper (3 whiskers per side)
  const renderWhiskers = (lx, ly, rx, ry) => (
    <g stroke={p.whiskers} strokeWidth="2.4" strokeLinecap="round" opacity="0.9">
      {/* Left side */}
      <line x1={lx} y1={ly - 3} x2={lx - 12} y2={ly - 6} />
      <line x1={lx} y1={ly} x2={lx - 14} y2={ly} />
      <line x1={lx} y1={ly + 3} x2={lx - 12} y2={ly + 6} />
      {/* Right side */}
      <line x1={rx} y1={ry - 3} x2={rx + 12} y2={ry - 6} />
      <line x1={rx} y1={ry} x2={rx + 14} y2={ry} />
      <line x1={rx} y1={ry + 3} x2={rx + 12} y2={ry + 6} />
    </g>
  );

  return (
    <svg
      width={size}
      height={Math.round(size * 0.85)}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', pointerEvents: 'none' }}
      aria-label={`${p.name} cat`}
    >
      {/* ─── POSE: WALK ─── */}
      {pose === 'walk' && (
        <g className="cat-rig-walk">
          {/* Back legs (drawn behind body) */}
          {walkFrame === 0 && (
            <path d="M 44,62 L 36,83 C 35,87 43,89 45,84 L 52,64 Z" fill={p.body} {...strokeProps} />
          )}
          {walkFrame === 1 && (
            <path d="M 46,62 L 42,78 C 41,82 48,84 50,79 L 54,64 Z" fill={p.body} {...strokeProps} />
          )}
          {walkFrame === 2 && (
            <path d="M 46,62 L 55,83 C 56,87 64,86 63,81 L 56,64 Z" fill={p.body} {...strokeProps} />
          )}
          {walkFrame === 3 && (
            <path d="M 44,62 L 48,79 C 49,83 56,82 55,78 L 52,64 Z" fill={p.body} {...strokeProps} />
          )}

          {/* Rear Leg 2 */}
          {walkFrame % 2 === 0 ? (
            <path d="M 72,62 L 70,82 C 69,86 77,88 79,83 L 80,63 Z" fill={p.body} {...strokeProps} />
          ) : (
            <path d="M 74,62 L 82,82 C 83,86 91,85 89,80 L 82,63 Z" fill={p.body} {...strokeProps} />
          )}

          {/* Tail */}
          <path
            className="animate-tail-wag"
            d={
              walkFrame % 2 === 0
                ? "M 36,54 C 20,52 12,34 20,22 C 25,16 33,20 29,28 C 25,34 30,46 38,54 Z"
                : "M 36,54 C 22,50 16,38 22,28 C 26,22 34,26 30,34 C 26,40 32,48 38,54 Z"
            }
            fill={p.body}
            {...strokeProps}
          />
          {/* Tail tip spot */}
          <path d="M 20,22 C 25,16 33,20 29,28 C 27,24 24,22 20,22 Z" fill={p.spot} />

          {/* Chubby Body */}
          <path
            d="M 38,44 C 38,28 82,28 90,44 C 95,54 91,72 74,74 C 54,75 36,72 38,44 Z"
            fill={p.body}
            {...strokeProps}
          />

          {/* Darker Spot Patch on Body */}
          <path
            d="M 38,44 C 44,32 58,32 56,48 C 54,56 42,58 38,50 Z"
            fill={p.spot}
            {...strokeProps}
          />

          {/* Cream Belly */}
          <path
            d="M 50,54 C 50,46 72,46 78,56 C 80,64 76,71 66,72 C 54,72 49,67 50,54 Z"
            fill={p.belly}
          />

          {/* Front Legs (drawn in foreground) */}
          {walkFrame === 0 && (
            <path d="M 82,62 L 94,84 C 95,88 103,87 101,82 L 90,62 Z" fill={p.body} {...strokeProps} />
          )}
          {walkFrame === 1 && (
            <path d="M 82,62 L 88,81 C 89,85 96,84 95,80 L 88,62 Z" fill={p.body} {...strokeProps} />
          )}
          {walkFrame === 2 && (
            <path d="M 82,62 L 76,84 C 75,88 83,89 85,84 L 88,62 Z" fill={p.body} {...strokeProps} />
          )}
          {walkFrame === 3 && (
            <path d="M 82,62 L 84,79 C 85,83 92,83 91,79 L 88,62 Z" fill={p.body} {...strokeProps} />
          )}

          {/* Pink Paw Pad on walking foot */}
          <ellipse cx="94" cy="85" rx="3" ry="2" fill={p.pad} />

          {/* Head */}
          <g transform={`translate(0, ${walkFrame % 2 === 0 ? 0 : 2})`}>
            {/* Left Ear */}
            <path d="M 70,26 L 68,10 L 80,20 Z" fill={p.body} {...strokeProps} />
            <path d="M 71,23 L 69,14 L 78,19 Z" fill={p.innerEar} />
            {/* Right Ear */}
            <path d="M 86,20 L 97,10 L 97,26 Z" fill={p.body} {...strokeProps} />
            <path d="M 88,20 L 95,14 L 95,24 Z" fill={p.innerEar} />

            {/* Head circle */}
            <circle cx="84" cy="36" r="18" fill={p.body} {...strokeProps} />

            {/* Head spot patch */}
            <path d="M 88,18 C 94,18 98,22 98,28 C 96,30 92,26 88,18 Z" fill={p.spot} />

            {/* Muzzle / cheek lighter patch */}
            <ellipse cx="84" cy="42" rx="9" ry="6" fill={p.belly} />

            {/* Nose */}
            <polygon points="84,40 82,37 86,37" fill={p.nose} />

            {/* Eyes */}
            {renderEyes(78, 35, 91, 35)}

            {/* Mouth */}
            {renderMouth(84, 43)}

            {/* Whiskers */}
            {renderWhiskers(70, 42, 98, 42)}
          </g>
        </g>
      )}

      {/* ─── POSE: SIT ─── */}
      {pose === 'sit' && (
        <g className="cat-rig-sit">
          {/* Tail wrapped around paws */}
          <path
            d="M 38,72 C 28,68 28,86 48,88 C 68,90 92,89 96,83 C 98,78 90,75 82,78 C 72,82 52,82 44,76 Z"
            fill={p.body}
            {...strokeProps}
          />
          {/* Tail tip spot */}
          <path d="M 96,83 C 98,78 90,75 88,81 Z" fill={p.spot} />

          {/* Upright Seated Body */}
          <path
            d="M 44,48 C 44,32 78,32 82,48 C 86,64 88,78 80,82 C 64,86 42,84 42,66 Z"
            fill={p.body}
            {...strokeProps}
          />

          {/* Body Spot */}
          <path d="M 42,50 C 48,36 60,36 58,54 C 56,62 46,64 42,50 Z" fill={p.spot} {...strokeProps} />

          {/* Cream Chest / Belly */}
          <path d="M 52,50 C 52,42 72,42 74,54 C 76,66 70,78 62,79 C 54,79 50,68 52,50 Z" fill={p.belly} />

          {/* Front Legs neatly side by side */}
          <path d="M 64,56 L 64,82 C 64,86 72,86 72,82 L 72,56" fill={p.body} {...strokeProps} />
          <path d="M 74,56 L 74,82 C 74,86 82,86 82,82 L 82,56" fill={p.body} {...strokeProps} />
          {/* Paw pads visible */}
          <ellipse cx="68" cy="84" rx="2.5" ry="1.8" fill={p.pad} />
          <ellipse cx="78" cy="84" rx="2.5" ry="1.8" fill={p.pad} />

          {/* Head */}
          <g>
            <path d="M 54,24 L 52,8 L 64,18 Z" fill={p.body} {...strokeProps} className="animate-ear-twitch" />
            <path d="M 55,21 L 53,12 L 62,17 Z" fill={p.innerEar} />
            <path d="M 72,18 L 84,8 L 84,24 Z" fill={p.body} {...strokeProps} />
            <path d="M 74,18 L 82,12 L 82,22 Z" fill={p.innerEar} />

            <circle cx="68" cy="32" r="18" fill={p.body} {...strokeProps} />
            <path d="M 72,14 C 78,14 82,18 82,24 C 80,26 76,22 72,14 Z" fill={p.spot} />

            <ellipse cx="68" cy="38" rx="9" ry="6" fill={p.belly} />
            <polygon points="68,36 66,33 70,33" fill={p.nose} />
            {renderEyes(62, 31, 75, 31)}
            {renderMouth(68, 39)}
            {renderWhiskers(54, 38, 82, 38)}
          </g>
        </g>
      )}

      {/* ─── POSE: LOAF (Lie down / meatloaf pose) ─── */}
      {pose === 'loaf' && (
        <g className="cat-rig-loaf">
          {/* Perked Tail behind body */}
          <path
            d="M 32,68 C 22,66 18,52 24,44 C 28,40 36,44 32,52 C 28,58 34,66 38,70 Z"
            fill={p.body}
            {...strokeProps}
          />
          <path d="M 24,44 C 28,40 36,44 32,52 Z" fill={p.spot} />

          {/* Chubby low loaf body resting flat */}
          <path
            d="M 32,58 C 32,44 78,44 88,56 C 94,66 90,82 76,84 C 50,85 30,82 32,58 Z"
            fill={p.body}
            {...strokeProps}
          />
          {/* Large cozy back spot */}
          <path d="M 36,54 C 44,42 62,42 58,58 C 56,66 42,68 36,54 Z" fill={p.spot} {...strokeProps} />

          {/* Tucked front paws bulge at bottom */}
          <ellipse cx="68" cy="82" rx="7" ry="4" fill={p.belly} {...strokeProps} />
          <ellipse cx="80" cy="82" rx="7" ry="4" fill={p.belly} {...strokeProps} />

          {/* Head resting low and cozy */}
          <g>
            <path d="M 72,34 L 70,18 L 82,28 Z" fill={p.body} {...strokeProps} />
            <path d="M 73,31 L 71,22 L 80,27 Z" fill={p.innerEar} />
            <path d="M 88,28 L 98,18 L 98,34 Z" fill={p.body} {...strokeProps} />
            <path d="M 90,28 L 96,22 L 96,32 Z" fill={p.innerEar} />

            <circle cx="84" cy="44" r="17" fill={p.body} {...strokeProps} />
            <path d="M 88,28 C 94,28 98,32 98,38 Z" fill={p.spot} />

            <ellipse cx="84" cy="50" rx="9" ry="5.5" fill={p.belly} />
            <polygon points="84,48 82,45 86,45" fill={p.nose} />
            {renderEyes(78, 43, 91, 43, true)}
            {renderMouth(84, 51)}
            {renderWhiskers(70, 50, 98, 50)}
          </g>
        </g>
      )}

      {/* ─── POSE: STRETCH ─── */}
      {pose === 'stretch' && (
        <g className="cat-rig-stretch">
          {/* Tail pointed high in the air */}
          <path
            d="M 30,46 C 22,40 18,20 28,12 C 34,8 40,14 36,22 C 32,30 36,40 38,48 Z"
            fill={p.body}
            {...strokeProps}
          />
          <path d="M 28,12 C 34,8 40,14 36,22 Z" fill={p.spot} />

          {/* High rear rump sloping down forward */}
          <path
            d="M 28,52 C 28,34 50,38 66,54 C 80,68 96,74 98,78 C 98,84 80,84 64,82 C 44,80 28,74 28,52 Z"
            fill={p.body}
            {...strokeProps}
          />
          <path d="M 28,50 C 34,36 48,36 46,52 Z" fill={p.spot} {...strokeProps} />

          {/* Front paws extended way forward */}
          <path d="M 76,68 L 104,82 C 108,84 106,90 100,88 L 76,74 Z" fill={p.body} {...strokeProps} />
          <ellipse cx="103" cy="85" rx="3" ry="2" fill={p.pad} />

          {/* Head pressed low to floor */}
          <g>
            <path d="M 80,48 L 78,34 L 88,44 Z" fill={p.body} {...strokeProps} />
            <path d="M 81,45 L 79,38 L 86,43 Z" fill={p.innerEar} />
            <path d="M 94,44 L 104,34 L 104,48 Z" fill={p.body} {...strokeProps} />
            <path d="M 96,44 L 102,38 L 102,46 Z" fill={p.innerEar} />

            <circle cx="92" cy="58" r="16" fill={p.body} {...strokeProps} />
            <ellipse cx="92" cy="63" rx="8" ry="5" fill={p.belly} />
            <polygon points="92,61 90,58 94,58" fill={p.nose} />
            {renderEyes(86, 56, 98, 56, true)}
            {renderMouth(92, 64)}
            {renderWhiskers(80, 63, 104, 63)}
          </g>
        </g>
      )}

      {/* ─── POSE: GROOM ─── */}
      {pose === 'groom' && (
        <g className="cat-rig-groom">
          {/* Seated Body */}
          <path
            d="M 44,48 C 44,32 78,32 82,48 C 86,64 88,78 80,82 C 64,86 42,84 42,66 Z"
            fill={p.body}
            {...strokeProps}
          />
          <path d="M 42,50 C 48,36 60,36 58,54 Z" fill={p.spot} {...strokeProps} />
          <path d="M 52,50 C 52,42 72,42 74,54 C 76,66 70,78 62,79 Z" fill={p.belly} />

          {/* Wrapped Tail */}
          <path
            d="M 38,72 C 28,68 28,86 48,88 C 68,90 92,89 96,83 C 98,78 90,75 82,78 Z"
            fill={p.body}
            {...strokeProps}
          />

          {/* Down leg */}
          <path d="M 62,58 L 62,82 C 62,86 70,86 70,82 L 70,58" fill={p.body} {...strokeProps} />

          {/* Raised grooming paw licking cheek! */}
          <path d="M 72,62 C 74,54 86,46 92,50 C 96,54 94,62 84,66 Z" fill={p.body} {...strokeProps} />
          <ellipse cx="92" cy="52" rx="3.5" ry="2.8" fill={p.pad} />

          {/* Head tilted slightly with blissful closed eyes */}
          <g transform="rotate(8, 68, 32)">
            <path d="M 54,24 L 52,8 L 64,18 Z" fill={p.body} {...strokeProps} />
            <path d="M 55,21 L 53,12 L 62,17 Z" fill={p.innerEar} />
            <path d="M 72,18 L 84,8 L 84,24 Z" fill={p.body} {...strokeProps} />
            <path d="M 74,18 L 82,12 L 82,22 Z" fill={p.innerEar} />

            <circle cx="68" cy="32" r="18" fill={p.body} {...strokeProps} />
            <path d="M 72,14 C 78,14 82,18 82,24 Z" fill={p.spot} />

            <ellipse cx="68" cy="38" rx="9" ry="6" fill={p.belly} />
            <polygon points="68,36 66,33 70,33" fill={p.nose} />
            {renderEyes(62, 31, 75, 31, true)}

            {/* Tiny pink licking tongue */}
            <path d="M 71,39 Q 75,41 73,44 Q 70,43 71,39" fill="#FF6B8B" />
            {renderMouth(68, 40)}
            {renderWhiskers(54, 38, 82, 38)}
          </g>
        </g>
      )}

      {/* ─── POSE: JUMP ─── */}
      {pose === 'jump' && (
        <g className="cat-rig-jump">
          {/* Perked High Tail with exclamation curve */}
          <path
            d="M 30,50 C 18,44 14,24 24,14 C 30,8 38,14 34,24 C 30,34 36,46 40,54 Z"
            fill={p.body}
            {...strokeProps}
          />
          <path d="M 24,14 C 30,8 38,14 34,24 Z" fill={p.spot} />

          {/* Lengthened Airborne Body */}
          <path
            d="M 36,42 C 36,24 82,26 92,38 C 98,48 94,66 78,68 C 56,69 34,66 36,42 Z"
            fill={p.body}
            {...strokeProps}
          />
          <path d="M 36,40 C 44,28 58,28 56,44 Z" fill={p.spot} {...strokeProps} />
          <path d="M 48,50 C 48,40 74,40 80,50 C 82,58 78,65 66,66 Z" fill={p.belly} />

          {/* Tucked happy jumping legs */}
          <path d="M 46,62 L 40,78 C 39,82 46,84 48,80 L 54,64 Z" fill={p.body} {...strokeProps} />
          <path d="M 80,60 L 86,76 C 87,80 94,80 94,76 L 88,60 Z" fill={p.body} {...strokeProps} />
          <ellipse cx="43" cy="80" rx="3" ry="2" fill={p.pad} />
          <ellipse cx="90" cy="78" rx="3" ry="2" fill={p.pad} />

          {/* Head high & joyful */}
          <g>
            <path d="M 72,22 L 70,6 L 82,16 Z" fill={p.body} {...strokeProps} />
            <path d="M 73,19 L 71,10 L 80,15 Z" fill={p.innerEar} />
            <path d="M 88,16 L 99,6 L 99,22 Z" fill={p.body} {...strokeProps} />
            <path d="M 90,16 L 97,10 L 97,20 Z" fill={p.innerEar} />

            <circle cx="86" cy="30" r="18" fill={p.body} {...strokeProps} />
            <path d="M 90,12 C 96,12 100,16 100,22 Z" fill={p.spot} />

            <ellipse cx="86" cy="36" rx="9" ry="6" fill={p.belly} />
            <polygon points="86,34 84,31 88,31" fill={p.nose} />
            {renderEyes(80, 29, 93, 29, true)}
            {renderMouth(86, 37)}
            {renderWhiskers(72, 36, 100, 36)}

            {/* Joyful sparkles above head */}
            <circle cx="106" cy="14" r="2.5" fill="#FBBF24" />
            <circle cx="66" cy="10" r="2" fill="#F472B6" />
          </g>
        </g>
      )}

      {/* ─── POSE: HMM (Ear-Back Reaction) ─── */}
      {pose === 'hmm' && (
        <g className="cat-rig-hmm">
          {/* Seated Body */}
          <path
            d="M 44,48 C 44,32 78,32 82,48 C 86,64 88,78 80,82 C 64,86 42,84 42,66 Z"
            fill={p.body}
            {...strokeProps}
          />
          <path d="M 42,50 C 48,36 60,36 58,54 Z" fill={p.spot} {...strokeProps} />
          <path d="M 52,50 C 52,42 72,42 74,54 Z" fill={p.belly} />

          {/* Tail twitching */}
          <path
            d="M 38,72 C 26,68 22,82 38,86 C 54,90 74,88 80,82 Z"
            fill={p.body}
            {...strokeProps}
          />

          {/* Front Legs */}
          <path d="M 64,56 L 64,82 C 64,86 72,86 72,82 L 72,56" fill={p.body} {...strokeProps} />
          <path d="M 74,56 L 74,82 C 74,86 82,86 82,82 L 82,56" fill={p.body} {...strokeProps} />
          <ellipse cx="68" cy="84" rx="2.5" ry="1.8" fill={p.pad} />
          <ellipse cx="78" cy="84" rx="2.5" ry="1.8" fill={p.pad} />

          {/* Tilted Head with Ear Pinned Back */}
          <g transform="rotate(-12, 68, 32)">
            {/* Pinned-back left ear (airplane ear!) */}
            <path d="M 52,28 L 38,24 L 56,20 Z" fill={p.body} {...strokeProps} />
            <path d="M 50,26 L 42,24 L 54,22 Z" fill={p.innerEar} />
            {/* Alert right ear */}
            <path d="M 74,18 L 86,8 L 86,24 Z" fill={p.body} {...strokeProps} />
            <path d="M 76,18 L 84,12 L 84,22 Z" fill={p.innerEar} />

            <circle cx="68" cy="32" r="18" fill={p.body} {...strokeProps} />
            <path d="M 72,14 C 78,14 82,18 82,24 Z" fill={p.spot} />

            <ellipse cx="68" cy="38" rx="9" ry="6" fill={p.belly} />
            <polygon points="68,36 66,33 70,33" fill={p.nose} />

            {/* Inquisitive mismatched eyes: one slightly larger */}
            {blink ? (
              renderEyes(62, 31, 75, 31)
            ) : (
              <g>
                <circle cx="62" cy="31" r="4.2" fill={p.eye} />
                <circle cx="63.2" cy="29.8" r="1.5" fill={p.sparkle} />
                <circle cx="75" cy="31" r="3.4" fill={p.eye} />
                <circle cx="76" cy="29.8" r="1.2" fill={p.sparkle} />
              </g>
            )}

            {/* Questioning curved mouth */}
            <path d="M 65,39 Q 68,43 73,40" fill="none" {...strokeProps} strokeWidth="3" />
            {renderWhiskers(54, 38, 82, 38)}
          </g>
        </g>
      )}

      {/* ─── POSE: TALK ─── */}
      {pose === 'talk' && (
        <g className="cat-rig-talk">
          {/* Seated Body */}
          <path
            d="M 44,48 C 44,32 78,32 82,48 C 86,64 88,78 80,82 C 64,86 42,84 42,66 Z"
            fill={p.body}
            {...strokeProps}
          />
          <path d="M 42,50 C 48,36 60,36 58,54 Z" fill={p.spot} {...strokeProps} />
          <path d="M 52,50 C 52,42 72,42 74,54 C 76,66 70,78 62,79 Z" fill={p.belly} />

          {/* Tail wrapping around */}
          <path
            d="M 38,72 C 28,68 28,86 48,88 C 68,90 92,89 96,83 Z"
            fill={p.body}
            {...strokeProps}
          />

          {/* Front Legs */}
          <path d="M 64,56 L 64,82 C 64,86 72,86 72,82 L 72,56" fill={p.body} {...strokeProps} />
          <path d="M 74,56 L 74,82 C 74,86 82,86 82,82 L 82,56" fill={p.body} {...strokeProps} />
          <ellipse cx="68" cy="84" rx="2.5" ry="1.8" fill={p.pad} />
          <ellipse cx="78" cy="84" rx="2.5" ry="1.8" fill={p.pad} />

          {/* Head bobbing with speech */}
          <g transform={`translate(0, ${talkFrame % 2 === 1 ? -2 : 0})`}>
            <path d="M 54,24 L 52,8 L 64,18 Z" fill={p.body} {...strokeProps} />
            <path d="M 55,21 L 53,12 L 62,17 Z" fill={p.innerEar} />
            <path d="M 72,18 L 84,8 L 84,24 Z" fill={p.body} {...strokeProps} />
            <path d="M 74,18 L 82,12 L 82,22 Z" fill={p.innerEar} />

            <circle cx="68" cy="32" r="18" fill={p.body} {...strokeProps} />
            <path d="M 72,14 C 78,14 82,18 82,24 Z" fill={p.spot} />

            <ellipse cx="68" cy="38" rx="9" ry="6" fill={p.belly} />
            <polygon points="68,36 66,33 70,33" fill={p.nose} />
            {renderEyes(62, 31, 75, 31)}
            {renderMouth(68, 39)}
            {renderWhiskers(54, 38, 82, 38)}
          </g>
        </g>
      )}
    </svg>
  );
}
