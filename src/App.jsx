import { Canvas } from '@react-three/fiber';
import './App.css';
import Gb from './Gb';
import { Hud } from './Hud';
import { Suspense } from 'react';
import { Effects } from './Effects';

const camProps = { fov: 40, position: [0, .06, 10.2], near: 0.05, far: 100 };
const dpr = [1, 1.5];

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
    </>
  )
}

export default App
