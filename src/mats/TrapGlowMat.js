import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import guid from 'short-uuid';

const uniforms = {
  uBrightness: 0,
};

const vertex = /*glsl*/`
varying vec3 vObjCoords;

  void main() {
    vObjCoords = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

const fragment = /*glsl*/`
varying vec3 vObjCoords;
uniform float uBrightness;

void main() {
  float grad = 1. - smoothstep(0., 1.3, pow(vObjCoords.y, .5));
  grad = max( 0., grad);

  gl_FragColor = vec4(vec3(grad * uBrightness), 1);
  #include <colorspace_fragment> 
} 
`;

const TrapGlowMat = shaderMaterial(
  uniforms,
  vertex,
  fragment
);

TrapGlowMat.key = guid.generate();

extend({ TrapGlowMat });

export default TrapGlowMat;
