import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import guid from 'short-uuid';
import { Color } from 'three';

const uniforms = {
  uTime: 0,
  uColor: new Color(0xffffff),
  uBrightness: 2.0,
  uNoise: null,
};

const vertex = /*glsl*/`
varying vec2 vUv;
uniform float uTime;

float random(vec2 co){
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float t = uTime * 13.;
  vUv = uv;
  vec3 pos = position;
  float fallOff = smoothstep(10., 9.9, pos.z) * smoothstep(0., 1., pos.z);
  pos.x += sin(pos.z * 1.2 + t) * 0.02 * fallOff;
  pos.x += sin(pos.z + t) * 0.025 * fallOff;
  pos.y += sin(pos.z * .7 + t) * 0.015 * fallOff;
  pos.y += sin(pos.z * 1.1 + t) * 0.025 * fallOff;
  pos.y += sin(pos.z * .3 + t) * 0.04 * fallOff;
  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);  

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
`;

const fragment = /*glsl*/`
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform float uBrightness;

void main() {
  float t = uTime * 0.15;  
  
  gl_FragColor = vec4(uColor * uBrightness, 1.);

  //gl_FragColor = vec4 (vec3(1. - vUv.x), 1.0);
  #include <colorspace_fragment> 
} 
`

const LaserMat = shaderMaterial(
  uniforms,
  vertex,
  fragment
);

LaserMat.key = guid.generate();

extend({ LaserMat });

export default LaserMat;
