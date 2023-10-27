import Background from "./Background";
import Ghost from "./Ghost";
import ProtonGun from "./ProtonGun";
import Trap from "./Trap";

export default function Gb() {  

  return (
    <>
      <ambientLight intensity={.3} />
      <directionalLight position={[-2, 2, 0]} intensity={1.4} castShadow={false} />

      <ProtonGun />
      <Ghost />
      <Ghost color="yellow" />
      <Ghost color="blue" />
      <Trap />
      <Background />
    </>
  )
}
