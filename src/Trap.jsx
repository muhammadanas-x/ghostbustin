import * as React from 'react';
import { useGameStore } from "./store"
import TrapGlowMat from './mats/TrapGlowMat';
import { Box2, Vector2, MeshStandardMaterial, SRGBColorSpace, AdditiveBlending, BackSide } from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import { useShallow } from 'zustand/react/shallow';
import gsap from 'gsap';
import { loadAudio, playSample } from './helpers/audio';

const floor = -2.4;

const deployTrapTL = (trap, ld, rd, mat, callback) => {
  const randPosNeg = Math.random() > .5 ? 1 : -1;
  const randomX = gsap.utils.random(1.5, 4) * randPosNeg;
  return gsap.timeline({onComplete: callback})
  .set(trap.position, {x: randomX, y: floor, z: 8})
  .to(trap.position, {
    duration: .7,
    z:0,
    ease: 'power2.Out',
  })
  .to(ld.rotation, {
    duration: .3,
    z: 2.3,
    ease: 'power2.In',
  })
  .to(rd.rotation, {
    duration: .3,
    z: -2.3,
    ease: 'power2.In',
  }, '<')
  .to(mat.uniforms.uBrightness, {
    duration: .4,
    value: .5,
    ease: 'power2.Out',
  }, ">-0.2")
}

const returnTrapTL = (trap, ld, rd, mat, callback) => {
  return gsap.timeline({onComplete: callback, delay: .8})
  .to(mat.uniforms.uBrightness, {
    duration: .3,
    value: 0,
    ease: 'power2.In',
  })
  .to(ld.rotation, {
    duration: .3,
    z: 0,
    ease: 'power2.Out',
  }, ">-0.2")
  .to(rd.rotation, {
    duration: .3,
    z: 0,
    ease: 'power2.Out',
  }, '<')
  .to(trap.position, {
    duration: .8,
    z:8,
    ease: 'power2.Out',
  })
}

export default function Trap() {
  const matRef = React.useRef();
  const gRef = React.useRef();
  const ldRef = React.useRef();
  const rdRef = React.useRef();
  const bbRef = React.useRef(new Box2());
  const tlRef = React.useRef();
  const [buffers, setBuffers] = React.useState();

  const { setTrapBB, trappedTotal, trapBB, audioCtx} = useGameStore(
    useShallow((s) => ({ 
      setTrapBB: s.setTrapBB,
      trappedTotal: s.trappedTotal,
      trapBB: s.trapBB,
      audioCtx: s.audioCtx,
    })
  ));

  React.useEffect(() => {
    if (audioCtx) {
      const loadAudioFile = async () => {
        const buf = await loadAudio(audioCtx, '/close.mp3');
        setBuffers((s) => ({...s, trap: buf}));
      };
      loadAudioFile();
    }
  }, [setBuffers, audioCtx])

  React.useEffect(() => {
    if (audioCtx) {
      const loadAudioFile = async () => {
        const buf = await loadAudio(audioCtx, '/open.mp3');
        setBuffers((s) => ({...s, open: buf}));
      };
      loadAudioFile();
    }
  }, [setBuffers, audioCtx])

  React.useEffect(() => {
    const {current: mat} = matRef;
    const {current: ld} = ldRef;
    const {current: rd} = rdRef;
    if (trappedTotal > 0) {
      setTimeout(() => {
        playSample(audioCtx, buffers.trap);
      }, 600);
      if (tlRef.current) tlRef.current.kill();
      tlRef.current = returnTrapTL(gRef.current, ld, rd, mat, () => {
        setTrapBB(null);
      });
    }

  }, [trappedTotal, setTrapBB, buffers, audioCtx]);

  React.useEffect(() => {
    const deployTrap = (e) => {
      if (gRef.current.position.z < 1) return;
      if (e.code === 'Space') {
        const {current: group} = gRef;
        const {current: bb} = bbRef;
        const {current: mat} = matRef;
        const {current: ld} = ldRef;
        const {current: rd} = rdRef;
        if (tlRef.current) tlRef.current.kill();
        tlRef.current = deployTrapTL(group, ld, rd, mat, () => {
          bb.setFromCenterAndSize(new Vector2(group.position.x, group.position.y), new Vector2(2, 4));
          setTrapBB(bb);
        });
        setTimeout(() => {
          playSample(audioCtx, buffers.open);
        }, 600);
      }
    }
    window.addEventListener('keydown', deployTrap);

    return () => {
      window.removeEventListener('keydown', deployTrap);
    };
  }, [setTrapBB, trapBB, buffers, audioCtx]);

  const { nodes } = useGLTF('/trap.glb');
  const colTex = useTexture('/guncol.webp');
  colTex.colorSpace = SRGBColorSpace;
  colTex.flipY = false;

  const emisTex = useTexture('/gunemis.webp');
  emisTex.colorSpace = SRGBColorSpace;
  emisTex.flipY = false;

  const tMat = React.useMemo(() => {
    return new MeshStandardMaterial({
      map: colTex,
      roughness: .3,
      emissiveMap: emisTex,
      emissiveIntensity: 1.2,
      emissive: '#fff',
    });
  }
  , [colTex, emisTex]);

  return (
    <group ref={gRef} position={[-4, floor, 7]}>
      <group>
        <mesh geometry={nodes.box.geometry} material={tMat} position={[0.001, -0.304, 0.122]} />
        <mesh ref={ldRef} geometry={nodes.doorl.geometry} material={tMat} position={[-0.178, 0.177, -0.205]} />
        <mesh ref={rdRef} geometry={nodes.doorr.geometry} material={tMat} position={[0.178, 0.177, -0.205]} />
        <mesh geometry={nodes.glow.geometry} visible={true}>
          <trapGlowMat ref={matRef} blending={AdditiveBlending} transparent side={BackSide} depthTest={false} depthWrite={false} />
        </mesh>
      </group>      
    </group>
  )
}

useGLTF.preload('/trap.glb');
