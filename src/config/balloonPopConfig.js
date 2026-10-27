import { RECIPIENT_NAME } from './content';

/**
 * Balloon Pop Scene Configuration
 */
export const BALLOON_POP_CONFIG = {
  header: 'Pop the balloons 🎈',

  /**
   * Words to pop into the sentence row, in index order.
   * Exactly 4 words: "You are so special".
   */
  BALLOON_WORDS: ['You', 'are', 'so', 'special'],

  /**
   * 4 Pastel themes (pink, lilac, mint, yellow)
   */
  balloonThemes: [
    {
      id: 'pink',
      word: 'You',
      color: '#F472B6',
      gradient: ['#FBCFE8', '#F472B6', '#DB2777'],
      knotColor: '#BE185D',
      confetti: ['#F472B6', '#FB7185', '#FCE7F3', '#FFFFFF'],
      initX: 22, // % from left
      baseY: 34, // % from top
    },
    {
      id: 'lilac',
      word: 'are',
      color: '#C084FC',
      gradient: ['#E9D5FF', '#C084FC', '#9333EA'],
      knotColor: '#7E22CE',
      confetti: ['#C084FC', '#A855F7', '#F3E8FF', '#FFFFFF'],
      initX: 42,
      baseY: 26,
    },
    {
      id: 'mint',
      word: 'so',
      color: '#34D399',
      gradient: ['#A7F3D0', '#34D399', '#059669'],
      knotColor: '#047857',
      confetti: ['#34D399', '#6EE7B7', '#ECFDF5', '#FFFFFF'],
      initX: 62,
      baseY: 36,
    },
    {
      id: 'yellow',
      word: 'special',
      color: '#FBBF24',
      gradient: ['#FEF08A', '#FBBF24', '#D97706'],
      knotColor: '#B45309',
      confetti: ['#FBBF24', '#FDE047', '#FEF9C3', '#FFFFFF'],
      initX: 80,
      baseY: 24,
    },
  ],

  catLines: {
    idle: 'Psst, pop one 🐾',
    complete: `Happy birthday, ${RECIPIENT_NAME} 🎉`,
  },

  idleTimeoutMs: 8000,
};
