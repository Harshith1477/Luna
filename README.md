# 🎂 Magical Birthday Surprise Website for Her ✨

A cinematic, cute, and responsive birthday surprise single-page website built with **React**, **Vite**, **Tailwind CSS**, **Framer Motion**, and **GSAP**.

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser (or scan the local network URL on your phone to preview it directly on mobile!).

### 3. Build for Production / Vercel
```bash
npm run build
```
This is a 100% static site with no backend. You can deploy it to **Vercel**, **Netlify**, or **GitHub Pages** by connecting your repository or running `npx vercel`.

---

## 📂 Where to Replace Text, Photos, and Music

Everything you need to customize is kept in **one central configuration file** and two public asset folders:

### 1. 📝 Customize All Text & Captions: `src/config/content.js`
Open `src/config/content.js`. Every setting is clearly commented:
- **`recipient.name`**: Replace `"Sarah"` with her real name or nickname (`[HER NAME]`).
- **`sender.name`**: Replace `"Alex"` with your name (`[MY NAME]`).
- **`letter.paragraphs`**: Replace the letter text with your personal handwritten birthday message (`[YOUR MESSAGE HERE]`).
- **`photos[].caption`**: Replace the captions for each photo (`[PHOTO 1 + CAPTION]`, etc.).
- **`reasons[].title` & `reasons[].text`**: Customize the 6 sweet reasons why you adore her (`[REASON 1]`, `[REASON 2]`, etc.).
- **`finale.closingLine`**: Replace the final heartfelt line before your signature (`[CLOSING LINE]`).

### 2. 📸 Replace Photos: `public/photos/`
Place her photos into the `/public/photos/` folder:
- `public/photos/photo1.jpg`
- `public/photos/photo2.jpg`
- `public/photos/photo3.jpg`
- `public/photos/photo4.jpg`

*(High-aesthetic starter memory images have already been generated and preloaded for you so the site looks gorgeous immediately).*

### 3. 🎵 Background Music: `public/music.mp3`
- Place your audio track at `public/music.mp3`.
- **Built-in Smart Fallback**: If `music.mp3` hasn't been added yet, the website automatically plays a soothing, gentle music-box pentatonic chime melody generated with the browser's Web Audio API so the site is never silent!

---

## 🎬 Scene-by-Scene Flow

1. **Preloader Screen**: Cute animated running cat carrying a gift with a real-time asset loading bar.
2. **Scene 1: Intro / Lock Screen**: Dreamy dark twilight screen with floating stars and a glowing `"Tap to open 🎁"` button. (Tapping initiates background audio to conform with browser autoplay policies).
3. **Scene 2: Cats & Envelope**: Three animated vector cats (*Mochi*, *Luna*, *Boba*) sitting on a cozy windowsill with a wax-sealed envelope. Cats react with tail swishing, ear twitches, eye blinks, and envelope tapping.
4. **Scene 3: Unfolding Letter**: The envelope flap opens, paws reveal the letter, and a full-screen vintage parchment card unfolds. The letter types out line-by-line with a typewriter effect while the cats peek from the corners.
5. **Scene 4: Memories Gallery**: Tilt-and-float Polaroid cards with washi tape, stamps, handwritten notes, and interactive heart likes powered by GSAP ScrollTrigger.
6. **Scene 5: Reasons Why**: 3D interactive flip cards that reveal reasons why she is cherished.
7. **Scene 6: Starry Night Finale**:
   - Big animated letter-by-letter `"Happy Birthday [HER NAME] 🎂"`.
   - Birthday cake with interactive candles (tap to blow out or blow into your microphone!).
   - Confetti bursts and fireworks across the starry night sky.
   - The three cats dancing with colorful party hats.
   - Heartfelt closing line and your signature.

---

## 🎨 Extras & Accessibility
- **Custom Desktop Cursor**: Cute cat paw print with sparkling heart trail.
- **Floating Ambient Particles**: Gentle hearts and sparkles during daylight scenes, transforming into glowing stars and constellations during the night finale.
- **Audio Control**: Sticky bottom-right audio toggle button with visualizer feedback.
- **Mobile-First**: Fully responsive for mobile browsers and touch gestures.
- **Accessibility**: Honors `prefers-reduced-motion`.
