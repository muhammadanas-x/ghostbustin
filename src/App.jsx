import { Canvas } from '@react-three/fiber';
import './App.css';
import Gb from './Gb';
import { Hud } from './Hud';
import { Intro } from './Intro';
import { GameOver } from "./GameOver";
import { Help } from "./Help";
import { Suspense } from 'react';
import { Effects } from './Effects';

const camProps = { fov: 40, position: [0, .06, 10.2], near: 0.05, far: 100 };

function App() {

  return (
    <>
      <Canvas 
        camera={camProps}
        dpr={1}
      >
        <Suspense fallback={null}>
          <Effects />
          <Gb />
        </Suspense>
      </Canvas>
      <Hud />
      <Intro />
      <GameOver />
      <Help />
    </>
  )
}

export default App
