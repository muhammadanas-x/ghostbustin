

export default function Ground() {

  return (
    <mesh position={[0, -2.7, 6]} rotation-x={-Math.PI/2}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="green" />
    </mesh>
  )
}
