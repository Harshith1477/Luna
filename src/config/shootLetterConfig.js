import { RECIPIENT_NAME } from './content';

/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  "Shoot the Letter" mini-game — master config file        │
 * │  Edit numbers, lines, and dodge defs all in ONE place.    │
 * └──────────────────────────────────────────────────────────┘
 */
export const SHOOT_LETTER_CONFIG = {

  // ── GAME RULES ──────────────────────────────────────────────
  /** How many shots the letter actively DODGES before it holds still. */
  riggedMisses: 7,

  /**
   * Radius (px) within which the letter detects the arrow path and
   * triggers a dodge. Larger = the letter dodges earlier (more reliable).
   */
  DODGE_RADIUS: 140,

  /**
   * Hit tolerance (px) for shot 8 onward — NO aim-assist.
   * Arrow tip must pass within this distance of the envelope center.
   */
  HIT_TOLERANCE: 35,

  /**
   * How long (ms) a player can hold the drag before Fubu makes
   * the "take your time" comment (fires once per shot).
   */
  longDragMs: 5000,

  /**
   * Delay (ms) before the cat speech bubble appears after a miss.
   * Duration (ms) the bubble stays visible.
   */
  catBubbleDelayMs: 400,
  catBubbleDurationMs: 3500,

  // ── CAT LINES ───────────────────────────────────────────────
  catLines: {
    /** Per-shot miss lines (index = shot number - 1). */
    perShot: [
      `Warm up shot. I'll allow it 😼`,                                    // shot 1
      `${RECIPIENT_NAME}... even the letter is laughing at your aim 😹`,   // shot 2
      `Are you aiming at the letter or the wall? 🧐`,                      // shot 3
      `My grandma's yarn ball has better aim 🧶`,                          // shot 4
      `Plot twist: the letter is faster than you ⚡`,                      // shot 5
      `I'm not saying you're bad... I'm just saying the wall is proud of you 🧱`, // shot 6
      `Seven. Misses. I'm counting. 🙄`,                                   // shot 7
    ],

    /** Pool for shot 8 and any later misses (picked at random, no repeat). */
    laterPool: [
      `So close... and yet SO far 😏`,
      `Breathe. Aim. Don't blink. 😼`,
      `The letter is literally standing still, ${RECIPIENT_NAME} 😭`,
      `Again. I believe in you. Slightly. 🐱`,
      `That arrow had a mind of its own 🫠`,
    ],

    /** Said right before shot 8 (after 7-miss bubble clears). */
    pre8: `Okay okay. I'll make the letter hold still. Don't embarrass me 🙄`,

    /** Said on a successful hit. */
    hit: `BULLSEYE!! Look at you go!! 🎯✨`,

    /** Shown once if player holds the slingshot > longDragMs without releasing. */
    longDrag: `Take your time, the letter isn't going anywhere... right? 😼`,

    /** Lines shouted when player shoots Fubu the cat — roasts the player and teases their aim! */
    catShot: [
      `Missed a giant stationary letter by a mile and sniped a cat?! Master archer ${RECIPIENT_NAME} strikes again! 😹🎯`,
      `The letter is UP THERE, ${RECIPIENT_NAME}! Did you graduate from the Stormtrooper Archery Academy?! 💀🏹`,
      `0 out of 10 aim! A blindfolded kitten with a slingshot has better accuracy than you! 😾💥`,
      `Did you think I was the target?! Your aim is officially an endangered species hazard! 🚨😹`,
      `The envelope didn't even have to dodge that time... your aim did all the dodging for it! 💀🎯`,
      `Are you playing archery or trying to assassinate your emotional support cat, ${RECIPIENT_NAME}?! 🙀🏹`,
      `Task failed successfully: missed the giant envelope, sniped innocent cat. Truly gifted aim! 😾🏆`,
      `Next time close your eyes and spin around, honestly your aim might actually improve! 😹💀`,
      `Your aim is so crooked that arrow needed a GPS navigation system! 🗺️😹`,
      `Breaking news: ${RECIPIENT_NAME}'s aim claims another feline victim! Turn on aim-assist! 🙀🎯`,
      `I'm sitting 80 feet away from the target and you STILL hit me?! How is that mathematically possible?! 😾📐`,
      `Are you aiming with your elbows, ${RECIPIENT_NAME}?! That wasn't even in the same zip code! 😹📮`,
    ],

    /** Recovery line after Fubu gets back up. */
    catShotRecovery: [
      `...I'm buying a helmet. Aim for the ACTUAL envelope this time, ${RECIPIENT_NAME}! 🪖😼`,
      `If you hit me again I'm revoking your archery license forever 🙄`,
      `Okay, I survived your terrible aim. Try shooting UP toward the sky next time! 😼`,
      `...My pride is wounded, but your aim is wounded worse. Try again! 😒`,
      `Breathe in. Breathe out. Now aim at the ENVELOPE, not the furry orange spectator! 🐱`,
    ],
  },

  /** Hitbox radius for shooting the cat (px). */
  CAT_HIT_RADIUS: 65,

  // ── 7 DODGE ANIMATIONS ──────────────────────────────────────
  /**
   * Each entry drives triggerLetterDodge(tryNum) in ShootLetterScene.
   * 'type' is matched by name; 'emote' appears in the cheeky bubble.
   */
  dodges: [
    { type: 'slide',       emote: 'hehe 💨'          }, // shot 1
    { type: 'teleport',    emote: 'poof! ✨'          }, // shot 2
    { type: 'loop',        emote: 'wheee! 🌀'         }, // shot 3
    { type: 'shrinkVanish',emote: 'now you see me 👻' }, // shot 4
    { type: 'flipDrift',   emote: 'upside down! 🙃'  }, // shot 5
    { type: 'bounceEdge',  emote: 'bonk! 🪃'         }, // shot 6
    { type: 'matrixLean',  emote: 'woah. 🕶️'        }, // shot 7
  ],

  // ── LETTER CARD (4-page scrapbook) ───────────────────────────
  letter: {
    badge: '✉️ SPECIAL DELIVERY',
    SIGN_OFF: 'With Kylo 🐾',
    pages: [
      {
        id: 1,
        title: `Happy 23rd Birthday, ${RECIPIENT_NAME}! 🎂`,
        text: `If you're reading this, you got past the lock, the cats, and a very rigged archery game. Sorry about the arrows. (I'm not.)`,
        photo: '/photos/luna-childhood-2.jpeg',
        photoCaption: `Little ${RECIPIENT_NAME} 🌸`,
      },
      {
        id: 2,
        photo: '/photos/img-1.jpeg',
        photoCaption: `${RECIPIENT_NAME} ✨`,
        text: `Twenty-three. I wanted to give you something that felt like you, so I built you a tiny world instead of just sending a message.\n\nYou make ordinary days feel lighter, and I don't think you realise how much that matters to the people around you.\n\nI hope this year is kind to you, that the things you've been working toward finally fall into place, and that you laugh so hard at least once a week it hurts.\n\nThank you for being you. Please never change the parts that make you you.`,
      },
      {
        id: 3,
        listTitle: '{n} little things about you',
        listItems: [
          'Your laugh',
          'How you notice the small things',
          'The way you light up when you talk about something you love',
          'Your kindness, even when nobody\'s watching',
          'How you make people feel welcome',
          'Your stubbornness (the good kind)',
          'Your smile',
          'You\'re easy to be around',
        ],
      },
      {
        id: 4,
        text: `Make a wish. Blow out the candles. Whatever it is, I'm rooting for it.`,
        candleCount: 23,
      },
    ],
  },
};

