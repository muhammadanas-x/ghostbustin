import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';


export const useGameStore = create((set) => ({
  isShooting: false,
  setIsShooting: (isShooting) => set({ isShooting }),
  
  isHit: false,
  setIsHit: (isHit) => set({ isHit }),

  isTrapped: false,
  setIsTrapped: (isTrapped) => set({ isTrapped }),

  trappedTotal: 0,
  trapped: [],
  addTrapped: (ghost) => set((s) => ({ trapped: [...s.trapped, ghost], trappedTotal: s.trappedTotal + 1 })),
  removeTrapped: (ghost) => set((s) => ({ trapped: s.trapped.filter((g) => g !== ghost) })),

  ghosts: [],
  setGhosts: (ghosts) => set({ ghosts }),
  addGhost: (ghost) => set((s) => ({ ghosts: [...s.ghosts, ghost] })),
  removeGhost: (ghost) => set((s) => ({ ghosts: s.ghosts.filter((g) => g !== ghost) })),

  trapBB: null,
  setTrapBB: (trapBB) => set({ trapBB }),

  audioCtx: null,
  setAudioCtx: (audioCtx) => set({ audioCtx }),

  audioElement: null,
  setAudioElement: (audioElement) => set({ audioElement }),

  introDone: false,
  setIntroDone: (introDone) => set({ introDone }),

  gameOver: false,
  setGameOver: (gameOver) => set({ gameOver }),
}));

export const useTargetStore = create(subscribeWithSelector((set) => ({
  targetPosition: [0, 0],
  setTargetPosition: (targetPosition) => set({ targetPosition }),
})));
