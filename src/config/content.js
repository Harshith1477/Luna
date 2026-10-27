/**
 * ===================================================================
 * 🎂 BIRTHDAY SURPRISE WEBSITE CONFIGURATION (content.js)
 * ===================================================================
 * Replace the bracketed placeholders below with your personal details,
 * photos, and heartfelt memories.
 * 
 * 📁 Photos go into: /public/photos/ (e.g. photo1.jpg, photo2.jpg, etc.)
 * 🎵 Background music goes into: /public/music.mp3
 * ===================================================================
 */

export const RECIPIENT_NAME = "Luna";

export const BIRTHDAY_CONTENT = {
  // 1. Recipient and Sender Info
  recipient: {
    name: RECIPIENT_NAME,
    title: "Happy Birthday",
    nickname: "my favorite human",
  },
  
  sender: {
    name: "Kylo", // <-- [MY NAME]: Change this to your name!
    signOff: "With all my love & always by your side,",
  },

  // 2. Intro / Lock Screen Scene
  intro: {
    badge: "Special Delivery For You 💌",
    heading: "A little birthday surprise...",
    subtext: "Put on your headphones or turn up your volume for the best experience.",
    buttonText: "Tap to open 🎁",
  },

  // 3. Cats & Envelope Scene
  envelopeScene: {
    title: "Psst... the kitties have brought you something!",
    instruction: "Tap the sealed envelope to open it together 🐾",
    cats: [
      { name: "Fubu", color: "cream-calico", role: "holding the letter" },
      { name: "Biscuit", color: "periwinkle-indigo", role: "waving tail" },
      { name: "Boba", color: "ginger-tabby", role: "tapping envelope" },
    ],
  },

  // 4. Handwritten Letter
  // [YOUR MESSAGE HERE] - Types out line by line with authentic typewriter effect
  letter: {
    stamp: "FIRST CLASS LOVE",
    date: "A Very Special Day ✨",
    greeting: `Dearest ${RECIPIENT_NAME},`,

    paragraphs: [
      "Happy, happy Birthday! Today is all about celebrating the most radiant, wonderful, and extraordinary person in my universe.",
      "From your contagious laugh to the quiet kindness you bring into every room, having you in my life makes every ordinary day feel like poetry.",
      "Thank you for being my anchor, my sweetest adventure, and the reason my world is so full of warmth and color.",
      "May this upcoming year shower you with all the magic, cozy coffee mornings, boundless joy, and huge dreams your heart can hold.",
      "Always remember how deeply you are cherished—today and every single day that follows.",
    ],
    closing: "Forever & always,",
    continueButton: "Look at our memories ✨",
  },

  // 5. Memories Gallery
  // Add your photos to /public/photos/photo1.jpg, photo2.jpg, etc.
  photos: [
    {
      id: "photo-1",
      src: "/photos/photo1.jpg", // [PHOTO 1]
      caption: "Sunny picnics & endless laughter in the park 🌸", // [CAPTION 1]
      date: "Spring Afternoon",
      rotation: -3,
    },
    {
      id: "photo-2",
      src: "/photos/photo2.jpg", // [PHOTO 2]
      caption: "That golden sunset by the sea and iced drinks 🌊☕", // [CAPTION 2]
      date: "Summer Memories",
      rotation: 2.5,
    },
    {
      id: "photo-3",
      src: "/photos/photo3.jpg", // [PHOTO 3]
      caption: "Sparkler wishes under the twilight sky ✨", // [CAPTION 3]
      date: "Stargazing Night",
      rotation: -2,
    },
    {
      id: "photo-4",
      src: "/photos/photo4.jpg", // [PHOTO 4]
      caption: "Cozy blanket snuggles and soft sleepy mornings 🐾", // [CAPTION 4]
      date: "December Days",
      rotation: 3,
    },
  ],

  // 6. Reasons Why Section
  // [REASON 1], [REASON 2], [REASON 3]...
  reasons: [
    {
      number: "01",
      emoji: "✨",
      title: "Your Electric Smile",
      text: "The way your entire face lights up whenever you laugh makes every tough day instantly disappear.",
      color: "from-pink-100 to-rose-150",
    },
    {
      number: "02",
      emoji: "☕",
      title: "Our Quiet Moments",
      text: "Even doing absolutely nothing with you feels like the best plan in the whole wide world.",
      color: "from-amber-100 to-orange-100",
    },
    {
      number: "03",
      emoji: "🌷",
      title: "Your Gentle Heart",
      text: "You care so deeply about the people and creatures around you. Your kindness inspires me constantly.",
      color: "from-purple-100 to-pink-100",
    },
    {
      number: "04",
      emoji: "🐱",
      title: "Your Silly Side",
      text: "From funny animal impressions to random kitchen dances, you make life unapologetically fun.",
      color: "from-rose-100 to-peach-100",
    },
    {
      number: "05",
      emoji: "🌟",
      title: "You Believe in Magic",
      text: "You notice the tiny beauties in life—a pretty sunset, a cute leaf, a starry sky—and bring them to life.",
      color: "from-indigo-100 to-purple-100",
    },
    {
      number: "06",
      emoji: "💖",
      title: "Simply You",
      text: "Out of 8 billion people, there's not a single soul quite like you. I'm endlessly grateful for you.",
      color: "from-pink-100 to-fuchsia-100",
    },
  ],

  // 7. Finale Section
  finale: {
    heading: "Happy Birthday",
    subheading: "Make a birthday wish and blow out the candles! 🕯️",
    cakeHint: "Tap the candles (or blow into your mic) to extinguish them",
    closingLine: "You deserve all the happiness the universe has to offer", // [CLOSING LINE]
    closingSignature: "With all my heart, Kylo", // /[MY NAME]
    replayText: "Relive the magic 💫",
  },

  // 8. Music & Extras
  audio: {
    src: "/music.mp3", // Path to your music file in /public/music.mp3
    autoplayOnOpen: true,
  },
};
