import * as THREE from 'three'

// Ashima Arts / Ian McEwan simplex noise (MIT) — the standard, battle-tested
// GLSL 3D simplex implementation used across the WebGL ecosystem.
const simplexNoise = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec3 uPaper;
  uniform vec3 uBrand;
  uniform vec3 uInk;
  varying vec2 vUv;

  ${simplexNoise}

  void main() {
    vec2 uv = vUv;
    vec2 aspectUv = (uv - 0.5) * vec2(1.6, 1.0) + 0.5;

    float t = uTime * 0.035;

    // Domain warp: displace the sampling point through a slower noise field
    // so the ramp reads as flowing ink rather than a static gradient.
    vec2 warp = vec2(
      snoise(vec3(aspectUv * 1.4, t)),
      snoise(vec3(aspectUv * 1.4 + 100.0, t))
    ) * 0.18;

    vec2 pointerPull = (uPointer - 0.5) * 0.06;
    vec2 sampleUv = aspectUv + warp + pointerPull;

    float n1 = snoise(vec3(sampleUv * 2.2, t));
    float n2 = snoise(vec3(sampleUv * 4.0 + 50.0, t * 1.3));
    float field = n1 * 0.7 + n2 * 0.3;
    field = field * 0.5 + 0.5; // 0..1

    vec3 color = mix(uPaper, uBrand, smoothstep(0.35, 0.85, field));
    color = mix(color, uInk, smoothstep(0.86, 1.05, field) * 0.4);

    // Soft vignette so type stays readable toward the edges.
    float vignette = smoothstep(1.05, 0.35, distance(uv, vec2(0.5)));
    color = mix(uPaper, color, 0.55 + 0.45 * vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`

export type InkShaderMaterial = THREE.ShaderMaterial & {
  uniforms: {
    uTime: { value: number }
    uPointer: { value: THREE.Vector2 }
    uPaper: { value: THREE.Color }
    uBrand: { value: THREE.Color }
    uInk: { value: THREE.Color }
  }
}

/** Fullscreen ink/watercolor flow field, blended through the brand ramp. */
export function createInkShaderMaterial(): InkShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPaper: { value: new THREE.Color('#f7f2e7') },
      uBrand: { value: new THREE.Color('#a8763a') },
      uInk: { value: new THREE.Color('#1a1613') },
    },
    depthWrite: false,
  }) as InkShaderMaterial
}
