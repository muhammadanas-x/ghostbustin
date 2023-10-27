import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './store';

export function Hud() {
  const { trappedTotal } = useGameStore(
    useShallow((s) => ({ 
      setTrapBB: s.setTrapBB,
      trappedTotal: s.trappedTotal,
    })
  ));

  return (
    <div className="hud">
      <div className='score'>
        <img src="/noghost.svg" width="50" height="50" alt="" />
        &nbsp;{trappedTotal}
      </div>
    </div>
  )
}
