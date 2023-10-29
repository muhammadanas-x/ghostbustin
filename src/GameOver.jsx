import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './store';
import * as React from 'react';
import gsap from 'gsap';

export function GameOver() {
  const { gameOver } = useGameStore(
    useShallow((s) => ({ 
      gameOver: s.gameOver,
    })
  ));

  const restart = (e) => {
    e.nativeEvent.stopImmediatePropagation();
    window.location.reload();
  }

  React.useEffect(() => {
    if (gameOver) {
      gsap.to('.game-over', {
        autoAlpha: 1,
        duration: .5,
      })
    }
  }, [gameOver]);

  return (
    <div className="game-over overlay">
      <img src="/noghost.svg" width="50" height="50" alt="" className="intro-img" />
      <h1>Game Over</h1>
      <button className="start-btn" onClick={restart}>Restart</button>
    </div>
  )
}
