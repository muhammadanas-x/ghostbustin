import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'

export default function FullQuad({
  children, distance = 5, ...props
}) {
  const { camera } = useThree();

  const viewSize = useMemo(() => {
    const fovInRadians = (camera.fov * Math.PI) / 180;
    const height = Math.abs(
      distance * Math.tan(fovInRadians / 2) * 2,
    );

    return [ height * camera.aspect, height ];
  }, [camera.aspect, camera.fov, distance]);

  return (
    <mesh {...props}>
      <planeGeometry args={viewSize} />
      {children}
    </mesh>
  )
}
