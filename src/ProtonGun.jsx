import * as React from 'react';
import { Vector3, Raycaster, SRGBColorSpace, BackSide } from 'three';
import LaserMat from './mats/LaserMat';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { dampLookAt } from "maath/easing";
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, useTargetStore } from './store';
import { loadAudio, playSample } from './helpers/audio';
import gsap from 'gsap';

const targetPos = new Vector3(0, 0, 0);

export default function ProtonGun() {
  const gl = useThree((state) => state.gl);
  const [buffers, setBuffers] = React.useState();
  const matRef = React.useRef();
  const meshRef = React.useRef();
  const beamRef = React.useRef();
  const guageRef = React.useRef();
  const {nodes} = useGLTF('/gun.glb');
  const {nodes: bNodes} = useGLTF('/beam.glb');
  const colTex = useTexture('/guncol.webp');
  colTex.colorSpace = SRGBColorSpace;
  colTex.flipY = false;

  const emisTex = useTexture('/gunemis.webp');
  emisTex.colorSpace = SRGBColorSpace;
  emisTex.flipY = false;
  
  const { setGameOver, gameOver, isShooting, setIsShooting, isHit, setIsHit, ghosts, trapped, audioCtx, audioElement, introDone } = useGameStore(
    useShallow((s) => ({ 
      isShooting: s.isShooting, 
      setIsShooting: s.setIsShooting,
      isHit: s.isHit,
      setIsHit: s.setIsHit,
      ghosts: s.ghosts,
      trapped: s.trapped,
      audioCtx: s.audioCtx,
      audioElement: s.audioElement,
      introDone: s.introDone,
      setGameOver: s.setGameOver,
      gameOver: s.gameOver,
    })
  ));

  React.useEffect(() => {
    if (audioCtx) {
      const loadAudioFile = async () => {
        const buf = await loadAudio(audioCtx, '/shoot.mp3');
        setBuffers((s) => ({...s, shoot: buf}));
      };
      loadAudioFile();
    }
  }, [setBuffers, audioCtx])

  React.useEffect(() => {
    if (audioCtx) {
      const loadAudioFile = async () => {
        const buf = await loadAudio(audioCtx, '/powerdown.mp3');
        setBuffers((s) => ({...s, powerDown: buf}));
      };
      loadAudioFile();
    }
  }, [setBuffers, audioCtx])

  React.useEffect(() => {
    if (introDone) {
      gsap.to(guageRef.current.scale, {
        duration: 1,
        y: 1,
        ease: 'power2.Out',
      });
    }
  }, [introDone]);

  const setTargetPosition = useTargetStore((s) => s.setTargetPosition);

  const resistance = isShooting ? (isHit ? 1 : .4) : .15;

  const rayCaster = React.useMemo(() => new Raycaster(), []);

  React.useEffect(() => {
  
    const startShoot = (e) => {
      e.stopImmediatePropagation();
      beamRef.current.visible = true;
      playSample(audioCtx, buffers.shoot);
      audioElement.play();
      console.log('start shoot');
      setIsShooting(true);
    }

    const endShoot = () => {
      playSample(audioCtx, buffers.powerDown);
      audioElement.pause();
      // Backup pause: hack to fix audio bug
      setTimeout(() => {
        audioElement.pause();
      }, 50);
      console.log('end shoot');
      beamRef.current.visible = false;
      setIsShooting(false);
      setIsHit(false);
    }
    
    if (gameOver) {
      endShoot() 
      return;
    }
    
    gl.domElement.addEventListener('pointerdown', startShoot);
    gl.domElement.addEventListener('pointerup', endShoot);

    return () => {
      gl.domElement.removeEventListener('pointerdown', startShoot);
      gl.domElement.removeEventListener('pointerup', endShoot);
    }
  }, [setIsShooting, setIsHit, audioCtx, buffers, audioElement, gl, gameOver]);

  useFrame(({ pointer, viewport }, delta) => {
    matRef.current.uniforms.uTime.value += delta;
    targetPos.x = pointer.x * (viewport.width * .5);
    targetPos.y = pointer.y * (viewport.height * .5);
    setTargetPosition([targetPos.x, targetPos.y]);
    dampLookAt(meshRef.current, targetPos, resistance, delta);
    beamRef.current.rotation.z += delta * 5;
    if (isShooting) {
      const power = guageRef.current.scale.y;
      if (power <= 0) {
        setGameOver(true)
      }
      guageRef.current.scale.y = Math.max(0, power - (delta * .05));
      
    }
    if (isShooting && !isHit) {
      rayCaster.set(meshRef.current.position, meshRef.current.getWorldDirection(new Vector3(0, 0, 1)));
      const intersects = rayCaster.intersectObjects(ghosts, false);
      if (intersects.length > 0 && !(trapped.includes(intersects[0].object))) {
        setIsHit(intersects[0].object);
      }
    }
  });

  return (
    <group position={[0, 0, 10]} ref={meshRef}>
      <mesh position={[0, 0, .05]} ref={beamRef} visible={false} geometry={bNodes.beam.geometry}>
         <laserMat uBrightness={17} ref={matRef} vertexColors={true} />        
      </mesh>

      <mesh geometry={nodes.gun.geometry}>
        <meshStandardMaterial 
          map={colTex} 
          emissive="#fff" 
          emissiveMap={emisTex} 
          emissiveIntensity={1.5} 
          roughness={.3} 
        />
      </mesh>

      <group ref={guageRef} rotation-x={0.74} scale-y={0} position={[-0.002218, 0.009808, -0.065494]}>
        <mesh position-y={.0065}>
          <planeGeometry args={[.002, .0135]} />
          <meshLambertMaterial emissive="#f6ff00" emissiveIntensity={1} side={BackSide} />
        </mesh>
      </group>

    </group>
  )
}

useGLTF.preload('/gun.glb');




/*
<tubeGeometry args={[helicalCurve, 150, .002, 3]} />

class HelixCurve extends Curve {

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const a = .004; // radius
		const b = 5; // height

		const t2 = 2 * Math.PI * t * b / .7;

		const x = Math.cos( t2 ) * a;
		const y = Math.sin( t2 ) * a;
		const z = b * t;

		return point.set( x, y, z );

	}

}

class HelixCurve extends Curve {

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const a = 30; // radius
		const b = 150; // height

		const t2 = 2 * Math.PI * t * b / 30;

		const x = Math.cos( t2 ) * a;
		const y = Math.sin( t2 ) * a;
		const z = b * t;

		return point.set( x, y, z );

	}

}

  const curve = React.useMemo(
    () => new LineCurve3(new Vector3(0, 0, 0), new Vector3(0, 0, 10)),
    []
  );
  const helicalCurve = React.useMemo(
    () => new HelixCurve(),
    []
  );




*/





