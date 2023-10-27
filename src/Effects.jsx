import { EffectComposer, Bloom } from '@react-three/postprocessing'

export function Effects() {
  return (
    <EffectComposer>

      <Bloom
        luminanceThreshold={1}
        mipmapBlur
        luminanceSmoothing={.7}
        intensity={5}
        radius={.4}
        //kernelSize={KernelSize.MEDIUM}
      /> 

    </EffectComposer>
  )
}
