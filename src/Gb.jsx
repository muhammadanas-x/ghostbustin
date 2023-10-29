import { EffectComposer } from "@react-three/postprocessing";
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
      <Ghost color="#10ff00" />
      <Ghost color="#10ff00" />
      <Ghost color="#ccff00" />
      <Trap />
      <Background />
    </>
  )
}
