import React, { useState } from 'react';
import AudioPlayer from './components/AudioPlayer';
import PasswordGate from './components/PasswordGate';
import ShootLetterScene from './components/ShootLetterScene';
import BalloonPopScene from './components/BalloonPopScene';
import BoardGameScene from './components/BoardGameScene';
import FinaleScene from './components/scenes/FinaleScene';

export default function App() {
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);

  // Dev shortcuts: ?skiptoletter=1 | ?scene=balloons | ?scene=board | ?scene=finale
  const skipToLetter   = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('skiptoletter');
  const skipToBalloons = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('scene') === 'balloons';
  const skipToBoard    = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('scene') === 'board';
  const skipToFinale   = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('scene') === 'finale';

  const [isGateUnlocked, setIsGateUnlocked] = useState(() => {
    if (skipToLetter || skipToBalloons || skipToBoard || skipToFinale) return true;
    const forceGate = new URLSearchParams(window.location.search).has('lock');
    const saved = sessionStorage.getItem('gate_unlocked') === '1';
    return saved && !forceGate;
  });

  const [hasCompletedLetterGame,  setHasCompletedLetterGame]  = useState(() => skipToBalloons || skipToBoard || skipToFinale);
  const [hasCompletedBalloonScene, setHasCompletedBalloonScene] = useState(() => skipToBoard || skipToFinale);
  const [hasCompletedBoardGame,    setHasCompletedBoardGame]    = useState(() => skipToFinale);

  const hasReachedBoardGame = hasCompletedLetterGame && hasCompletedBalloonScene;

  return (
    <div className="relative min-h-screen font-body selection:bg-pink-200 selection:text-pink-900 bg-[#fdeee3]">

      {/* Global Background Music:
          - Starts at the beginning of the page: She and Him - I Thought I Saw Your Face Today
          - Stops when reaching the board game, switching to Indila - Love Story (Orchestral)
      */}
      <AudioPlayer
        key={hasReachedBoardGame ? "board-music" : "intro-music"}
        src={
          hasReachedBoardGame
            ? "/M_-_Indila_-Love_Story_Version_Orchestrale_(mp3.pm).mp3"
            : "/She_and_Him_-_I_Thought_I_Saw_Your_Face_Today_(mp3.pm).mp3"
        }
        fallbackSrc={
          hasReachedBoardGame
            ? "/music.mp3"
            : "/intro_music.mp3"
        }
        isPlaying={isPlayingMusic}
        onTogglePlay={() => setIsPlayingMusic(p => !p)}
        bottomOffset="bottom-4 sm:bottom-6"
      />

      {/* 0. Password Gate */}
      {!isGateUnlocked && (
        <PasswordGate key="password-gate" onUnlock={() => setIsGateUnlocked(true)} />
      )}

      {/* 1. Shoot the Letter Mini-Game */}
      {isGateUnlocked && !hasCompletedLetterGame && (
        <ShootLetterScene
          key="shoot-letter-scene"
          onComplete={() => setHasCompletedLetterGame(true)}
          isPlayingMusic={isPlayingMusic}
          onToggleMusic={() => setIsPlayingMusic(p => !p)}
        />
      )}

      {/* 2. Pop the Balloons Scene */}
      {isGateUnlocked && hasCompletedLetterGame && !hasCompletedBalloonScene && (
        <BalloonPopScene
          key="balloon-pop-scene"
          onComplete={() => setHasCompletedBalloonScene(true)}
          isMuted={!isPlayingMusic}
        />
      )}

      {/* 3. Board Game Scene */}
      {isGateUnlocked && hasCompletedLetterGame && hasCompletedBalloonScene && !hasCompletedBoardGame && (
        <BoardGameScene
          key="board-game-scene"
          onComplete={() => setHasCompletedBoardGame(true)}
        />
      )}

      {/* 4. Finale — directly after board game, no intermediate landing page */}
      {isGateUnlocked && hasCompletedLetterGame && hasCompletedBalloonScene && hasCompletedBoardGame && (
        <main className="relative z-10 w-full overflow-hidden">
          <FinaleScene id="finale" />
        </main>
      )}

    </div>
  );
}
