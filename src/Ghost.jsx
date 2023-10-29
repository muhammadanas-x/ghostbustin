import * as React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, useTargetStore } from './store';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { damp3 } from 'maath/easing';
import gsap from 'gsap';
import { AdditiveBlending, Vector2 } from 'three';
import { MeshDistortMat } from './mats/MeshDistortMat';

const randX = gsap.utils.random(-10, -3, .1, true);
const randXFlip = gsap.utils.random(3, 10, .1, true);
const randX2 = 'random(3, 6)';
const randX2Flip = 'random(-3, -6)';
const randY = gsap.utils.random(0, 1, .1, true);
const randZ = gsap.utils.random(-12, -7, .1, true);
const xValues = {
  from: {
    left: randX,
    right: randXFlip,
  },
  to: {
    left: randX2,
    right: randX2Flip,
  }
}

const moveGhostTL = (ghost, mat) => {
  const dir = Math.round(Math.random()) ? 'left' : 'right';
  const tl = gsap.timeline({delay: gsap.utils.random(.5, 4), onComplete: () => {moveGhostTL(ghost, mat)}})
  if (dir === 'right') {
    ghost.scale.x = -1;
  } else {
    ghost.scale.x = 1;
  }
  tl
  .set(ghost.position, {x: xValues.from[dir](), y: randY(), z:randZ()})
  .set(ghost.rotation, {y: 0})
  .to(mat, {opacity: 1, duration: .6, ease: 'power2.In'}, 0)
  .to(ghost.position, {
    duration: 'random(1.7, 3)',
    x: xValues.to[dir],
    y: 'random(1, 4)',
    z: 'random(1, 2)',
    ease: 'none',
  }, 0)
  .to(ghost.rotation, {
    duration: 1.8,
    y: ghost.scale.x * -1.3,
  }, .5)
  .to(mat, {opacity: 0, duration: .6, ease: 'none'}, .7)
  .set(ghost.position, {x: -30, y: -30, z:0});
  return tl;
}

const trapGhostTL = (ghost, mat, trapPos, trapCallback) => {
  return gsap.timeline({onComplete: trapCallback})
  .to(ghost.position, {
    duration: .5,
    x: trapPos.x,
    y: trapPos.y,
    z: 0,
    ease: 'power2.In',
  }, 0)
  .to(ghost.scale, {x: 0, y:0, z:0, duration: .7, ease: 'power2.In'}, 0)
  .to(mat, {opacity: 0, duration: .5, ease: 'none'}, .3)
  .set(ghost.position, {x: -30, y: -30, z:0})
  .set(ghost.scale, {x: 1, y: 1, z:1, delay: .5})
}

const letGoTL = (ghost, mat, callback) => {
  return gsap.timeline()
  .to(ghost.position, {
    duration: .4,
    y: '+=2',
    ease: 'sine.Out',
  }, 0)
  .to(mat, {opacity: 0, duration: .3, ease: 'sine.Out'}, 0)
  .set(ghost.position, {x: -30, y: -30, z:0})
  .call(callback, null, '+=1.3');
}

export default function Ghost({color = 'green'}) {
  const matRef = React.useRef();
  const meshRef = React.useRef();
  const gRef = React.useRef();
  const tPos = React.useRef([0, 0]);
  const [wasHit, setWasHit] = React.useState(false);
  const {nodes} = useGLTF('/g2.glb');
  const mcTex = useTexture('/gmatcap.webp');

  const { isHit, setIsHit, trapped, addTrapped, removeTrapped, addGhost, trapBB } = useGameStore(
    useShallow((s) => ({ 
      isHit: s.isHit,
      setIsHit: s.setIsHit,
      trapped: s.trapped,
      addTrapped: s.addTrapped,
      removeTrapped: s.removeTrapped,
      addGhost: s.addGhost,
      trapBB: s.trapBB,
    })
  ));

  const isThisHit = React.useMemo(() => isHit === gRef.current, [isHit]);
  const isThisTrapped = React.useMemo(() => trapped.includes(gRef.current), [trapped]);

  // Normal ghost movement
  React.useLayoutEffect(() => {
    let ctx;
    let moveTL;
    if (!isThisHit && !isThisTrapped & !wasHit) {
      ctx = gsap.context(() => {
        moveGhostTL(gRef.current, matRef.current);
      });
    } else if (isThisHit && !isThisTrapped) { //When the ghost is hit, stop the normal movement animation.
      setWasHit(true);
      gsap.set(matRef.current, {opacity: 1});
      moveTL?.kill();
      moveTL = null;
    }
    return () => ctx?.kill();
  }, [isThisHit, wasHit, isThisTrapped]);

  // The ghost was hit, but then the user let go before the ghost was trapped.
  React.useLayoutEffect(() => {
    let ctx;
    if (!isThisHit && !isThisTrapped & wasHit) {
      ctx = gsap.context(() => {
        letGoTL(gRef.current, matRef.current, () => { setWasHit(false); });
      });
    }
    return () => ctx?.kill();
  }, [isThisHit, wasHit, isThisTrapped, setWasHit]);

  //The ghost was trapped.
  React.useLayoutEffect(() => {
    let ctx;
    if (isThisTrapped && !isThisHit && trapBB) { // do we need to check if it was hit?
      ctx = gsap.context(() => {
        trapGhostTL(gRef.current, matRef.current, trapBB.getCenter(new Vector2()), () => {
          removeTrapped(gRef.current);
        });
      });
      return () => ctx?.kill();
    }
  }, [isThisHit, isThisTrapped, trapBB, removeTrapped]);

  // Update the target position (for the ghost to move towards when tethered)
  React.useEffect(
    () =>
      useTargetStore.subscribe(
        (state) => state.targetPosition,
        (targetPosition) => {
          if (!isThisHit) return;
          tPos.current = targetPosition;
        }
      ),
    [isThisHit]
  )

  React.useEffect(() => {
    addGhost(gRef.current);
    gRef.current.geometry.computeBoundingBox();
  }, [addGhost]);

  React.useEffect(() => {
    if (isThisHit) {
      matRef.current.color.set('#ff8300');
      matRef.current.distort = .5;
      matRef.current.speed = .12;
      matRef.current.scale = 3.3;
      const {current: g} = gRef;
      if (g.scale.x < 0) {
        g.rotation.y = 1;
      } else {
        g.rotation.y = -1;
      }
    } else {
      matRef.current.color.set(color);
      matRef.current.distort = .35;
      matRef.current.speed = .1;
      matRef.current.scale = 1.3;
    }
  }, [isThisHit, color]);

  useFrame((s, delta) => {
    meshRef.current.position.y = Math.sin(s.clock.elapsedTime * 4) * .3;
    if (!isThisHit || isThisTrapped) return;
    damp3(gRef.current.position, [tPos.current[0], tPos.current[1], 0], 1, delta);
    if (trapBB && trapBB.containsPoint(gRef.current.position)) {
      matRef.current.color.set('purple');
      setWasHit(false);
      setIsHit(false);
      addTrapped(gRef.current);
    }
  });

  return (    
    <mesh ref={gRef} position-x={-30}>
      <planeGeometry args={[1.1, 1.1, 1.1]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      <mesh ref={meshRef} geometry={nodes.g2.geometry} position-z={-.01}>
        {/*  
        <meshMatcapMaterial 
          color={color} 
          ref={matRef} 
          blending={AdditiveBlending} 
          transparent 
          opacity={0}
          matcap={mcTex}
        />
        */}
        
        <MeshDistortMat
          ref={matRef} 
          distort={0.35}
          speed={0.1}
          scale={1.3}
          radius={1}
          color={color}
          blending={AdditiveBlending} 
          transparent 
          opacity={0}
          matcap={mcTex}
        />
      </mesh>
    </mesh>
  )
}

useGLTF.preload('/g2.glb');
