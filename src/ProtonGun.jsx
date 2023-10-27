import * as React from 'react';
import { LineCurve3, Vector3, Raycaster, SRGBColorSpace } from 'three';
import LaserMat from './mats/LaserMat';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { dampLookAt } from "maath/easing";
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, useTargetStore } from './store';

const targetPos = new Vector3(0, 0, 0);

export default function ProtonGun() {
  const matRef = React.useRef();
  const meshRef = React.useRef();
  const beamRef = React.useRef();
  const {nodes} = useGLTF('/gun.glb');
  const colTex = useTexture('/guncol.webp');
  colTex.colorSpace = SRGBColorSpace;
  colTex.flipY = false;

  const emisTex = useTexture('/gunemis.webp');
  emisTex.colorSpace = SRGBColorSpace;
  emisTex.flipY = false;
  
  const { isShooting, setIsShooting, isHit, setIsHit, ghosts, trapped } = useGameStore(
    useShallow((s) => ({ 
      isShooting: s.isShooting, 
      setIsShooting: s.setIsShooting,
      isHit: s.isHit,
      setIsHit: s.setIsHit,
      ghosts: s.ghosts,
      trapped: s.trapped,
    })
  ));

  const setTargetPosition = useTargetStore((s) => s.setTargetPosition);

  const resistance = isShooting ? (isHit ? 1 : .4) : .15;

  const curve = React.useMemo(
    () => new LineCurve3(new Vector3(0, 0, 0), new Vector3(0, 0, 10)),
    []
  );

  const rayCaster = React.useMemo(() => new Raycaster(), []);

  React.useEffect(() => {
    document.addEventListener('pointerdown', () => {
      beamRef.current.visible = true;
      setIsShooting(true);
    });
    document.addEventListener('pointerup', () => {
      beamRef.current.visible = false;
      setIsShooting(false);
      setIsHit(false);
    });
  }, [setIsShooting, setIsHit]);

  useFrame(({ pointer, viewport }, delta) => {
    matRef.current.uniforms.uTime.value += delta;
    targetPos.x = pointer.x * (viewport.width * .5);
    targetPos.y = pointer.y * (viewport.height * .5);
    setTargetPosition([targetPos.x, targetPos.y]);
    dampLookAt(meshRef.current, targetPos, resistance, delta);
    beamRef.current.rotation.z += delta * 5;
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
      <mesh position={[0, 0, .05]} ref={beamRef} visible={false}>
        <tubeGeometry args={[curve, 100, .002, 3]} />
        <laserMat uColor="#f25000" uBrightness={7} ref={matRef} />
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
    </group>
  )
}

useGLTF.preload('/gun.glb');
