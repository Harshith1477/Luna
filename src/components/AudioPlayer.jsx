import React, { useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * AudioPlayer with automatic playback & full user control:
 * 1. Plays the background orchestral music (Indila - Love Story).
 * 2. Automatically attempts playback on page load. If the browser blocks
 *    unprompted autoplay before interaction, it seamlessly plays on the
 *    very first tap or click anywhere on the page.
 * 3. Immediately silences all sound whenever the user clicks "Turn Off Music".
 */
export default function AudioPlayer({
  src = "/M_-_Indila_-Love_Story_Version_Orchestrale_(mp3.pm).mp3",
  fallbackSrc = "/music.mp3",
  isPlaying,
  onTogglePlay,
  bottomOffset = "bottom-4 sm:bottom-6",
}) {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const synthTimerRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  const synthActiveRef = useRef(false);

  // Immediately stop all synthesized sounds and clear interval
  const stopSynthMelody = () => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      try {
        audioContextRef.current.suspend();
      } catch (e) {
        console.warn("Error suspending AudioContext:", e);
      }
    }

    synthActiveRef.current = false;
  };

  // Web Audio Music Box Synth (Fallback if MP3 audio is unsupported)
  const startSynthMelody = () => {
    if (!isPlayingRef.current) return;
    if (synthActiveRef.current) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      synthActiveRef.current = true;

      const notes = [
        261.63, 329.63, 392.00, 523.25, 659.25, 783.99,
        220.00, 261.63, 329.63, 440.00, 523.25, 659.25,
        174.61, 220.00, 261.63, 349.23, 440.00, 523.25,
        196.00, 246.94, 293.66, 392.00, 493.88, 587.33
      ];

      let noteIndex = 0;
      const playChime = () => {
        if (!isPlayingRef.current) {
          stopSynthMelody();
          return;
        }

        if (!audioContextRef.current || audioContextRef.current.state !== 'running') return;

        const now = audioContextRef.current.currentTime;
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();

        osc.type = 'sine';
        const freq = notes[noteIndex % notes.length];
        noteIndex = (noteIndex + 1 + Math.floor(Math.random() * 2)) % notes.length;
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);

        osc.start(now);
        osc.stop(now + 1.8);
      };

      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }

      playChime();
      synthTimerRef.current = setInterval(playChime, 650);
    } catch (e) {
      console.warn("Web Audio synth error:", e);
    }
  };

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isPlaying;

    let interactionCleanup = null;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            stopSynthMelody();
          })
          .catch((err) => {
            // User turned off while play() was pending
            if (!isPlayingRef.current || err.name === 'AbortError') {
              return;
            }

            // Browser blocked autoplay due to user gesture requirement:
            // listen for the very first interaction anywhere on page and start immediately
            if (err.name === 'NotAllowedError') {
              const handleFirstInteraction = () => {
                if (isPlayingRef.current && audioRef.current) {
                  audioRef.current
                    .play()
                    .then(() => {
                      stopSynthMelody();
                    })
                    .catch(() => {});
                }
              };

              window.addEventListener('click', handleFirstInteraction, { once: true });
              window.addEventListener('touchstart', handleFirstInteraction, { once: true });
              window.addEventListener('keydown', handleFirstInteraction, { once: true });

              interactionCleanup = () => {
                window.removeEventListener('click', handleFirstInteraction);
                window.removeEventListener('touchstart', handleFirstInteraction);
                window.removeEventListener('keydown', handleFirstInteraction);
              };
              return;
            }

            console.log("Audio file play failed, using gentle synth fallback:", err);
            startSynthMelody();
          });
      }
    } else {
      // User clicked Mute
      audio.pause();
      stopSynthMelody();
    }

    return () => {
      if (interactionCleanup) interactionCleanup();
      stopSynthMelody();
    };
  }, [isPlaying, src]);

  const handleAudioError = () => {
    if (isPlayingRef.current) {
      startSynthMelody();
    }
  };

  return (
    <div className={`fixed ${bottomOffset} right-4 sm:right-6 z-[2000] flex items-center gap-2 pointer-events-auto`}>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src={src}
        onError={handleAudioError}
      >
        <source src={src} type="audio/mpeg" />
        {fallbackSrc && <source src={fallbackSrc} type="audio/mpeg" />}
      </audio>

      <button
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Mute music" : "Unmute music"}
        title={isPlaying ? "Click to mute music" : "Click to unmute music"}
        className={`group relative flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-md border transition-all duration-300 backdrop-blur-md cursor-pointer select-none active:scale-95 text-[#2a1038] ${
          isPlaying
            ? 'bg-white/90 border-pink-200/90 shadow-pink-100 hover:bg-pink-50/80 hover:border-pink-300'
            : 'bg-white/90 border-pink-200/70 text-[#2a1038]/75 shadow-pink-100 hover:bg-pink-50/60 hover:text-[#2a1038]'
        }`}
      >
        {isPlaying ? (
          <div className="relative flex items-center justify-center">
            <Volume2 className="w-4 h-4 animate-pulse text-[#c2185b]" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c2185b]"></span>
            </span>
          </div>
        ) : (
          <VolumeX className="w-4 h-4 text-[#2a1038]/60" />
        )}

        <span className="text-xs font-bold tracking-wide text-[#2a1038]">
          {isPlaying ? "Mute" : "Unmute"}
        </span>

        {/* Musical note floating while playing */}
        {isPlaying && (
          <span className="inline-block text-xs animate-bounce select-none">
            🎵
          </span>
        )}
      </button>
    </div>
  );
}
