import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Camera } from 'lucide-react';
import { BIRTHDAY_CONTENT } from '../../config/content';

export default function MemoriesScene({ id = "memories" }) {
  const { photos, recipient } = BIRTHDAY_CONTENT;
  const [likedPhotos, setLikedPhotos] = useState({});

  const handleLike = (photoId) => {
    setLikedPhotos((prev) => ({
      ...prev,
      [photoId]: (prev[photoId] || 0) + 1,
    }));
  };

  return (
    <section
      id={id}
      className="relative min-h-screen py-20 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-[#fbf1f8] via-[#fff7f4] to-[#fcf0f5] overflow-hidden"
    >
      {/* Background soft ambient orbs */}
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 max-w-xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200/80 text-pink-700 text-xs sm:text-sm font-medium mb-3 shadow-xs"
        >
          <Camera className="w-3.5 h-3.5 text-pink-500" />
          <span>Little Moments We Cherish</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-3xl sm:text-4xl font-bold text-stone-800 font-heading mb-3 tracking-tight"
        >
          Favorite Memories with <span className="text-pink-600">{recipient.name}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-stone-600 font-body text-sm sm:text-base leading-relaxed"
        >
          A tiny collection of smiles, sunny afternoons, and unforgettable adventures.
        </motion.p>
      </div>

      {/* Polaroid Gallery Grid */}
      <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
        {photos.map((item, index) => {
          const rotationClass = index % 2 === 0 ? '-rotate-1 sm:-rotate-2' : 'rotate-1 sm:rotate-2';
          const likes = likedPhotos[item.id] || 0;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: (index % 2) * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.03, rotate: 0, zIndex: 20 }}
                transition={{ duration: 0.3 }}
                className={`relative group w-full max-w-sm bg-white p-4 sm:p-5 pb-6 sm:pb-8 rounded-xl polaroid-shadow border border-stone-200/60 ${rotationClass} transition-shadow hover:shadow-2xl hover:shadow-pink-200/60`}
              >
                {/* Washi Tape at Top */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-6 washi-tape -rotate-1 rounded-xs border border-pink-200/40 shadow-xs pointer-events-none" />

                {/* Photo Frame */}
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-stone-100 border border-stone-200/80 mb-4 shadow-inner">
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Soft film vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                  {/* Date badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs text-[11px] text-white font-mono">
                    {item.date}
                  </div>

                  {/* Interactive Heart Like Button */}
                  <button
                    onClick={() => handleLike(item.id)}
                    className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-xs font-medium text-pink-600 shadow-md hover:bg-white active:scale-90 transition-all cursor-pointer"
                    title="Tap to send love"
                  >
                    <Heart className={`w-3.5 h-3.5 ${likes > 0 ? 'fill-pink-500 text-pink-500' : 'text-pink-500'}`} />
                    <span>{likes > 0 ? likes : ''}</span>
                  </button>
                </div>

                {/* Handwritten Polaroid Caption */}
                <div className="text-center px-2">
                  <p className="font-handwriting text-xl sm:text-2xl text-stone-800 leading-snug">
                    {item.caption}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Sweet Footer Note */}
      <div className="relative z-10 text-center mt-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 text-xs font-mono text-pink-600/80 bg-pink-50/80 px-4 py-2 rounded-full border border-pink-200/60"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>And a million more happy memories waiting to be made...</span>
        </motion.div>
      </div>
    </section>
  );
}
