import { useGLTF } from '@react-three/drei'

export default function Background() {
  const { nodes } = useGLTF('/graves.glb');

  return (
    <>
      <color args={['#271c38']} attach="background" />
      {/*<fog attach="fog" color="#21103a" near={0} far={43} /> */}
      <fogExp2 attach="fog" color="#271c38" density={.04 } />      

      <group rotation-x={.1}>
        <mesh position={[0, -2.7, 6]} rotation-x={-Math.PI/2}>
          <planeGeometry args={[100, 100]} />
          <meshLambertMaterial color="#141414" />
        </mesh>

        <mesh geometry={nodes.graves.geometry} scale={1.2} position={[0, -3.4, - 7]} rotation={[0, 0, 0]}>
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>
    </>
  )
}
