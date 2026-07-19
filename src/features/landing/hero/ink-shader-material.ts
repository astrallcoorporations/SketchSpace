import * as THREE from 'three'

// Ashima Arts / Ian McEwan simplex noise (MIT) â€” the standard, battle-tested
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
  uniform vec3 uBrand2;
  uniform vec3 uInk;
  // Ink drops from pointer taps: xy = position (aspect space), z = birth time,
  // w = strength (0 = empty slot).
  uniform vec4 uDrops[4];
  varying vec2 vUv;

  ${simplexNoise}

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
      value += amplitude * snoise(p);
      p = p * 2.03 + 19.7;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspectUv = (uv - 0.5) * vec2(1.6, 1.0) + 0.5;

    float t = uTime * 0.03;

    // Paper tooth: fine static grain the pigment settles into.
    float grain = snoise(vec3(aspectUv * 90.0, 7.0)) * 0.5 + 0.5;

    // Double domain warp (warp fed through a second warp) — this folding is
    // what makes the field read as ink filaments spreading in water instead
    // of drifting fog.
    vec2 q = vec2(
      fbm(vec3(aspectUv * 1.3, t)),
      fbm(vec3(aspectUv * 1.3 + 31.4, t))
    );
    vec2 r = vec2(
      fbm(vec3(aspectUv * 1.8 + q * 1.6, t * 1.2)),
      fbm(vec3(aspectUv * 1.8 + q * 1.6 + 47.2, t * 1.2))
    );

    vec2 pointerPull = (uPointer - 0.5) * 0.08;
    vec2 sampleUv = aspectUv + q * 0.12 + r * 0.22 + pointerPull;

    float density = fbm(vec3(sampleUv * 2.1, t)) * 0.5 + 0.5;
    // Tooth slightly resists or accepts ink, breaking up smooth boundaries.
    density += (grain - 0.5) * 0.05;

    // Tap drops: a dark core that thins as an irregular bleed ring expands
    // outward. The ring samples through the flow warp so it deforms with the
    // surrounding ink rather than staying a perfect circle.
    for (int i = 0; i < 4; i++) {
      vec4 drop = uDrops[i];
      float age = uTime - drop.z;
      if (drop.w <= 0.0 || age < 0.0) continue;
      float radius = 0.04 + age * 0.11;
      float fade = exp(-age * 0.5);
      float d = distance(aspectUv + r * 0.07, drop.xy);
      float ring = smoothstep(radius, radius - 0.045, d) * smoothstep(radius - 0.16, radius - 0.045, d);
      float core = smoothstep(0.09, 0.0, d) * exp(-age * 0.85);
      density += (ring * 0.5 + core * 0.4) * drop.w * fade;
    }

    // Feathered body with a darkened rim: pigment pools at the bleed edge,
    // the classic watercolor "edge darkening".
    float body = smoothstep(0.48, 0.75, density);
    float rim = smoothstep(0.48, 0.56, density) * (1.0 - smoothstep(0.56, 0.72, density));

    // Granulation: thin washes show the paper tooth through the pigment.
    float granulation = mix(1.0, grain, 0.4 * (1.0 - body));

    // Thin washes read pink, heavier flow shifts violet, dense pools sink
    // toward near-black ink.
    vec3 wash = mix(uBrand2, uBrand, smoothstep(0.3, 0.8, density));
    vec3 color = mix(uPaper, wash, body * 0.85 * granulation);
    color = mix(color, uInk, smoothstep(0.78, 1.0, density) * 0.55);
    color = mix(color, uInk, rim * 0.22);

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
    uBrand2: { value: THREE.Color }
    uInk: { value: THREE.Color }
    uDrops: { value: THREE.Vector4[] }
  }
}

const MAX_DROPS = 4

/** Fullscreen ink/watercolor flow field, blended through the brand ramp. */
export function createInkShaderMaterial(): InkShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPaper: { value: new THREE.Color('#ffffff') },
      uBrand: { value: new THREE.Color('#a855f7') },
      uBrand2: { value: new THREE.Color('#ec4899') },
      uInk: { value: new THREE.Color('#0a0a0a') },
      uDrops: {
        value: Array.from({ length: MAX_DROPS }, () => new THREE.Vector4(0, 0, -1e3, 0)),
      },
    },
    depthWrite: false,
  }) as InkShaderMaterial
}

/**
 * Register an ink drop at plane UV (0..1). Recycles the oldest slot.
 * Coordinates are converted into the shader's aspect-corrected space here so
 * callers only ever think in plain UVs.
 */
export function addInkDrop(material: InkShaderMaterial, u: number, v: number, strength = 1) {
  const drops = material.uniforms.uDrops.value
  let slot = 0
  for (let i = 1; i < drops.length; i++) {
    if (drops[i].z < drops[slot].z) slot = i
  }
  const x = (u - 0.5) * 1.6 + 0.5
  drops[slot].set(x, v, material.uniforms.uTime.value, strength)
}
