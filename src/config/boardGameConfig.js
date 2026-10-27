/**
 * boardGameConfig.js
 * ─────────────────────────────────────────────────────────────────
 * All board-game settings in ONE place.  Edit here, nothing else.
 * ─────────────────────────────────────────────────────────────────
 */

// ── Board dimensions ─────────────────────────────────────────────
export const TOTAL_TILES = 50;          // Tile 50 = TREASURE chest
export const COLS_DESKTOP = 10;         // 10 columns × 5 rows on desktop
export const ROWS_DESKTOP = 5;
export const COLS_MOBILE = 5;           // 5 columns × 10 rows on mobile
export const ROWS_MOBILE = 10;

// ── Bot limit: can't pass tile (TOTAL_TILES - 4) until Kaouther wins
export const BOT_MAX_TILE = TOTAL_TILES - 4;   // = 46

// ── Kaouther catch-up rule ────────────────────────────────────────
// If she has been behind EVERY other player for this many turns in a row,
// her next roll is forced to 5 or 6.
export const CATCHUP_TURNS_THRESHOLD = 3;

// ── Special tile effects ──────────────────────────────────────────
// "boost"  → move forward  BOOST_AMOUNT steps
// "oops"   → move backward OOPS_AMOUNT steps
// "nap"    → lose next turn
export const BOOST_AMOUNT = 4;
export const OOPS_AMOUNT  = 3;

export const SPECIAL_TILES = {
   6: 'boost',
  11: 'oops',
  15: 'nap',
  22: 'boost',
  27: 'oops',
  31: 'nap',
  36: 'boost',
  41: 'oops',
  45: 'boost',
};

// ── Players ───────────────────────────────────────────────────────
// Exactly 4 players in turn order: Kaouther, Fubu, Biscuit, Kylo
export const PLAYERS = [
  { id: 'kaouther', name: 'Kaouther', human: true,  isBot: false, color: '#F06A93', avatar: '/photos/img-1.jpeg', fallback: 'K' },
  { id: 'fubu',     name: 'Fubu',     human: false, isBot: true,  color: '#F59E42', avatar: 'fubu' },
  { id: 'biscuit',  name: 'Biscuit',  human: false, isBot: true,  color: '#8E9BFF', avatar: 'biscuit' },
  { id: 'kylo',     name: 'Kylo',     human: false, isBot: true,  color: '#5B6CFF', avatar: '/photos/image.png', fallback: 'K' },
];

// ── Dice ──────────────────────────────────────────────────────────
export const DICE_SIDES = 6;
export const DICE_ROLL_DELAY_MS   = 600;   // how long the dice "spins" before result
export const MOVE_STEP_DELAY_MS   = 120;   // delay between each step when token moves

// ── URL test params ───────────────────────────────────────────────
// ?tile=48  → start Kaouther at tile 48
// ?roll=6   → force her next roll to 6
// (These only apply in development; ignored in prod if you remove this section.)

// ── Flavor text ──────────────────────────────────────────────────
export const TILE_MESSAGES = {
  boost: ['🚀 Zoom!', '✨ Lucky!', '🎉 Flying!'],
  oops:  ['😅 Oops!', '🐾 Slipped!', '😬 Uh oh!'],
  nap:   ['😴 Nap time…', '💤 Zzz…', '🛏 Taking a break…'],
};

// ── Round 1 Teasing Quotes (when Kaouther is behind) ──────────────
export const ROUND1_TEASE_MESSAGES = {
  kylo: [
    "Too slow, Kaouther! Did you forget to hit the gas? 🏎️💨",
    "Kylo in the lead! Can you even see me from all the way back there? 🔭😂",
    "Don't worry Kaouther, I'll save you some treasure... maybe! 😜",
    "Need a map back there, Kaouther? 🗺️😏",
    "Is that your top speed? Step on it! ⚡",
  ],
  fubu: [
    "Meow~ Catch up, Kaouther! My little paws are way faster! 🐾",
    "Hehehe, eating cat dust already? 😼💨",
    "Are you taking a stroll or racing, Kaouther? 😸",
    "I'm already smelling the victory tuna from here! 🐟🐾",
    "Keep up, human! Fubu waits for no one! 🐾🔥",
  ],
  biscuit: [
    "Purrr... is that a snail behind me or Kaouther? 🐌😹",
    "Hurry up sleepyhead, the treasure's almost mine! 💤✨",
    "Meow! Even my tail is further ahead than you! 🐾",
    "Better ask for a head start next time, Kaouther! 😽",
    "Paws over hooves! You're lagging behind! 🐾🎈",
  ],
};

// ── Round 1 Bot Victory Celebration Quotes (On Bot Win Modal) ─────
export const ROUND1_BOT_WIN_QUOTES = {
  kylo: "Haha I took 1st place! 🏆 You gotta be quicker than that, Kaouther! Rematch? 😎",
  fubu: "Meow! Victory belongs to Fubu! 🐾 What happened to you back there, Kaouther? 😸",
  biscuit: "Purrrr, I reached the treasure first! 🏆 Were you walking backwards, Kaouther? 😹",
};

export const ROUND1_BOT_SIDELINES = {
  kylo: "Rematch! Let's see if you can even keep up this time! 😜🔥",
  fubu: "Give it another try, maybe you'll reach halfway! 🐾😼",
  biscuit: "Round 2! Don't cry if you lose again, birthday girl! 😽✨",
};

// ── Round 2 Tough Competition Quotes (Neck-and-neck / sweating) ────
export const ROUND2_COMPETITION_MESSAGES = {
  kylo: [
    "Wait, how did you get so fast?! 😱",
    "No way you're passing me, Kaouther! 🏃💨",
    "This is way too close! My heart is pounding! 💓",
    "Push harder! Don't let her take the lead! ⚡🔥",
  ],
  fubu: [
    "MEOW! She's zooming right past us! 🙀💨",
    "Wait up, my paws can't run any faster! 🐾💦",
    "Neck and neck! Nobody blink! 👀",
    "She's too fast this round! Hold the line! 🐾🔥",
  ],
  biscuit: [
    "Purrr-iceless comeback! But I'm not giving up! 😼🔥",
    "Ahhh she's right next to me! 🐾😱",
    "Hold on, don't let Kaouther grab that treasure! 🏆",
    "Fierce competition! Watch out! ⚡✨",
  ],
};

// ── Round 2 Kaouther Victory Praise (Bots conceding defeat) ─────────
export const ROUND2_WIN_CHEERS = {
  kylo: "You actually smoked us! Incredible race, birthday girl! You're unstoppable! 👑💖",
  fubu: "Meow! What a comeback! All hail Queen Kaouther! 🐾🎉",
  biscuit: "Purrr, respect! You totally earned this treasure! Happy Birthday! 🎂✨",
};

export const WIN_MESSAGE = "🎉 You found the treasure! Happy birthday, Kaouther! 🎀";

