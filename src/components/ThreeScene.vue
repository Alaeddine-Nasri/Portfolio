<template>
  <div class="canvasscooped" ref="wrap"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js' // ⬅ add this
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// import { Water } from 'three/examples/jsm/objects/Water2.js'      // ⬅ remove/keep commented

const wrap = ref<HTMLDivElement | null>(null)
const route = useRoute()

let cube: THREE.Mesh | null = null
let cubeRotationEnabled = true
let ballMatRef: THREE.MeshStandardMaterial | null = null
let ballLightRef: THREE.PointLight | null = null
let flameMat: THREE.ShaderMaterial | null = null
let colorPhase = 0
let floorFXMat: THREE.ShaderMaterial | null = null
const fromPos = new THREE.Vector3()
const toPos = new THREE.Vector3()
const fromScale = new THREE.Vector3()
const toScale = new THREE.Vector3()
let poseStartTime = 0
let poseDuration = 1
let poseAnimating = false

function transitionCube(to: 'home' | 'about') {
  if (!cube) return
  fromPos.copy(cube.position)
  fromScale.copy(cube.scale)

  if (to === 'home') {
    toPos.set(0, 1.3, 0)
    toScale.set(1, 1, 1)
    cubeRotationEnabled = true
  } else {
    toPos.set(-2.5, -1.2, 0)
    toScale.set(1.6, 1.6, 1.6)
    cubeRotationEnabled = false
  }

  poseStartTime = performance.now() / 1000
  poseDuration = 0.7
  poseAnimating = true
}

watch(
  () => route.name,
  (name) => {
    if (name === 'about') transitionCube('about')
    else transitionCube('home')
  },
)

onMounted(() => {
  // --- Scene / Renderer / Camera
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(4.46, 0.153, 4.59)
  camera.lookAt(0, 1.85, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true })

  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.4 // was 1.0 – makes everything brighter
  renderer.outputColorSpace = THREE.SRGBColorSpace

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  wrap.value?.appendChild(renderer.domElement)

  // --- Post-processing (Bloom Glow)
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.25, // softer glow
    0.15, // smaller blur
    0.8, // only very bright pixels bloom
  )

  composer.addPass(bloom)

  // --- Background image
  const bgTex = new THREE.TextureLoader().load(
    new URL('../assets/textures/abstract-textured.jpg', import.meta.url).toString(),
    () => renderer.render(scene, camera), // draw once when ready
  )
  bgTex.colorSpace = THREE.SRGBColorSpace
  bgTex.minFilter = THREE.LinearFilter // avoids mipmap blurring on fullscreen quad
  bgTex.magFilter = THREE.LinearFilter
  scene.background = bgTex

  // --- Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.15))
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.1)
  sunLight.position.set(5, 10, 5)
  scene.add(sunLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.7)
  fillLight.position.set(-4, 3, 3)
  scene.add(fillLight)

  // --- Rounded cube for the mesh (nice smooth body)
  const cubeGeo = new RoundedBoxGeometry(2, 2, 2, 20, 0.2)
  const cubeMat = new THREE.MeshPhysicalMaterial({
    transmission: 1.0, // makes it transparent (real refraction)
    thickness: 0.6, // how much it bends the light inside
    roughness: 0.1, // lower = clearer reflections
    metalness: 0.0, // keep metal at 0 for glass
    clearcoat: 1.0, // extra glossy surface
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.2, // stronger reflections (optional)
    ior: 1.45, // index of refraction (glass = 1.45)
    attenuationColor: new THREE.Color(0xe0f0ff), // icy bluish glass
    attenuationDistance: 2.0,
    side: THREE.DoubleSide,
  })

  cube = new THREE.Mesh(cubeGeo, cubeMat)
  cube.position.set(0, 1.3, 0)
  cube.rotation.x = -0.25
  cube.rotation.z = 0.2
  scene.add(cube)

  // --- Ball (hot core) + point light
  const ballGeo = new THREE.SphereGeometry(0.18, 32, 32)
  const ballMat = new THREE.MeshStandardMaterial({
    emissive: 0xffe8aa,
    emissiveIntensity: 3,
    color: 0x552211,
  })
  const ball = new THREE.Mesh(ballGeo, ballMat)
  cube.add(ball)
  // soft inner fill so the glass isn't pitch black
  const innerFill = new THREE.PointLight(0xffffff, 0.22, 12)
  innerFill.position.set(0, 0.5, 0)
  cube.add(innerFill)
  const innerAmbient = new THREE.AmbientLight(0xe0f0ff, 0.12)
  cube.add(innerAmbient)

  const light = new THREE.PointLight(0xffaa55, 3, 12)
  light.castShadow = true
  ball.add(light)

  // save refs for animation
  ballMatRef = ballMat
  ballLightRef = light

  // --- Fireball swirling flame shell
  const flameGeo = new THREE.SphereGeometry(0.3, 48, 48)

  const flameUniforms = {
    uTime: { value: 0 },
    uInner: { value: new THREE.Color(0xfff8d0) }, // hot center
    uMid: { value: new THREE.Color(0xffb647) }, // orange
    uOuter: { value: new THREE.Color(0xff3b00) }, // red edge
  }

  flameMat = new THREE.ShaderMaterial({
    uniforms: flameUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      // slightly stretch upward like a flame
      p.y *= 1.2;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
    fragmentShader: /* glsl */ `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uInner;
    uniform vec3 uMid;
    uniform vec3 uOuter;

    float rand(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = rand(i);
      float b = rand(i + vec2(1.0, 0.0));
      float c = rand(i + vec2(0.0, 1.0));
      float d = rand(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) +
             (c - a) * u.y * (1.0 - u.x) +
             (d - b) * u.x * u.y;
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // map uv to -1..1 circle
      vec2 p = (vUv - 0.5) * 2.0;
      float r = length(p);
      if (r > 1.0) discard;

      // swirl upwards: stretch y and scroll over time
      vec2 q = vec2(
        p.x * 2.0,
        p.y * 3.0 + uTime * 2.0
      );

      float n = fbm(q + vec2(0.0, uTime * 0.7));
      float flameShape = smoothstep(1.2, 0.1, r + n * 0.5);

      // color ramp: center -> mid -> outer
      vec3 col;
      if (flameShape > 0.6) {
        float t = (flameShape - 0.6) / 0.4;
        col = mix(uMid, uInner, clamp(t, 0.0, 1.0)); // inner bright
      } else {
        float t = flameShape / 0.6;
        col = mix(uOuter, uMid, clamp(t, 0.0, 1.0)); // outer red/orange
      }

      float alpha = flameShape * (1.0 - r * 0.6);

      gl_FragColor = vec4(col, alpha);
    }
  `,
  })

  const flame = new THREE.Mesh(flameGeo, flameMat)
  ball.add(flame)

  // --- Reflector (overlay reflection only)
  // --- Reflector (overlay reflection only)
  const floorSize = 80
  const reflectorGeo = new THREE.PlaneGeometry(floorSize, floorSize)

  // < 1.0 = lower resolution = blurrier reflection
  const downsample = 0.35

  const reflector = new Reflector(reflectorGeo, {
    clipBias: 0.001,
    textureWidth: Math.floor(window.innerWidth * window.devicePixelRatio * downsample),
    textureHeight: Math.floor(window.innerHeight * window.devicePixelRatio * downsample),
    color: 0xffffff,
  })

  reflector.rotation.x = -Math.PI / 2
  reflector.position.y = -0.15
  scene.add(reflector)

  // --- Animated floor light overlay (only on "earth")
  const floorFXGeo = new THREE.PlaneGeometry(floorSize, floorSize)

  floorFXMat = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: /* glsl */ `
    varying vec2 vUv;
    uniform float uTime;

    void main() {
      // vUv.y ~ 0 is near camera, ~1 is far
      // Only affect bottom half of plane
      float floorMask = smoothstep(0.0, 0.4, vUv.y) * (1.0 - smoothstep(0.4, 0.8, vUv.y));

      // Moving horizontal bands
      float bands = sin(vUv.x * 20.0 + uTime * 2.0);
      bands = bands * 0.5 + 0.5; // 0..1

      // Soft noise-ish modulation using another sine
      float mod = sin(vUv.y * 10.0 - uTime * 1.5) * 0.5 + 0.5;

      float intensity = bands * mod * floorMask * 0.15; // overall strength

      // very soft grey-white light
      vec3 col = vec3(intensity);

      gl_FragColor = vec4(col, intensity);
    }
  `,
  })

  const floorFX = new THREE.Mesh(floorFXGeo, floorFXMat)
  floorFX.rotation.x = -Math.PI / 2
  floorFX.position.y = -0.149 // just above reflector
  scene.add(floorFX)

  // --- make only the reflection a bit blurry ---
  const rt = reflector.getRenderTarget() as THREE.WebGLRenderTarget
  rt.texture.generateMipmaps = true
  rt.texture.minFilter = THREE.LinearMipmapLinearFilter
  rt.texture.magFilter = THREE.LinearFilter

  // --- add opacity uniform to the reflector shader ---
  const reflMat = reflector.material as THREE.ShaderMaterial
  reflMat.transparent = true
  reflMat.depthWrite = false
  reflMat.depthTest = true

  reflMat.onBeforeCompile = (shader) => {
    // 1) add uniform
    shader.uniforms.uOpacity = { value: 0.12 } // reflection strength (0–1)

    // 2) declare in GLSL
    shader.fragmentShader = shader.fragmentShader.replace(
      'uniform vec3 color;',
      'uniform vec3 color;\nuniform float uOpacity;',
    )

    // 3) use it instead of fixed alpha = 1.0
    shader.fragmentShader = shader.fragmentShader.replace(
      'gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',
      'gl_FragColor = vec4( blendOverlay( base.rgb, color ), uOpacity );',
    )

    reflMat.userData.shader = shader
  }

  // --- Interaction (drag ball)
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let isDragging = false

  const magneticTarget = new THREE.Vector3()
  let hasMagneticTarget = false

  function updateBallPosition(e: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)

    if (!cube) return
    const worldToLocal = new THREE.Matrix4().copy(cube.matrixWorld).invert()
    intersection.applyMatrix4(worldToLocal)

    const limit = 0.8
    ball.position.set(
      THREE.MathUtils.clamp(intersection.x, -limit, limit),
      THREE.MathUtils.clamp(intersection.y, -limit, limit),
      THREE.MathUtils.clamp(intersection.z, -limit, limit),
    )
  }
  function onPointerDown(e: PointerEvent) {
    isDragging = true
    updateBallPosition(e)
  }
  function onPointerMove(e: PointerEvent) {
    if (isDragging) {
      updateBallPosition(e) // existing drag behavior
    } else {
      updateMagneticTarget(e) // gentle magnetic target
    }
  }
  function onPointerUp() {
    isDragging = false
  }
  function updateMagneticTarget(e: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)

    if (!cube) return
    const worldToLocal = new THREE.Matrix4().copy(cube.matrixWorld).invert()
    intersection.applyMatrix4(worldToLocal)

    const limit = 0.6 // smaller than drag, so it stays near center
    magneticTarget.set(
      THREE.MathUtils.clamp(intersection.x, -limit, limit),
      THREE.MathUtils.clamp(intersection.y, -limit, limit),
      THREE.MathUtils.clamp(intersection.z, -limit, limit),
    )
    hasMagneticTarget = true
  }

  scene.fog = new THREE.Fog(0x100808, 5, 20)
  renderer.setClearColor(scene.fog.color)
  window.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)

  // Pose by route
  if (route.name === 'about') transitionCube('about')
  else transitionCube('home')

  // --- Animate
  const clock = new THREE.Clock()
  let animationId = 0
  const animate = () => {
    const delta = clock.getDelta()

    if (poseAnimating && cube) {
      const now = performance.now() / 1000
      const t = (now - poseStartTime) / poseDuration
      const alpha = Math.min(Math.max(t, 0), 1)
      cube.position.lerpVectors(fromPos, toPos, alpha)
      cube.scale.lerpVectors(fromScale, toScale, alpha)
      if (alpha >= 1) poseAnimating = false
    }

    // animate flame noise
    if (flameMat) {
      flameMat.uniforms.uTime.value += delta
    }

    // slowly cycle orb + light color (0.1 = very slow)
    colorPhase += delta * 0.1
    const hue = colorPhase % 1

    if (ballMatRef) {
      ballMatRef.emissive.setHSL(hue, 0.9, 0.6)
    }

    if (ballLightRef) {
      ballLightRef.color.setHSL(hue, 0.9, 0.6)
    }

    // in animate()
    if (cubeRotationEnabled && cube) {
      cube.rotation.x = 0
      cube.rotation.z = 0
      cube.rotation.y += delta * 0.2 // a bit faster so it’s obvious
    }
    // magnetic follow when not dragging
    if (!isDragging && hasMagneticTarget) {
      ball.position.lerp(magneticTarget, 0.03) // 0.05 = smooth & slow
    }
    // animate ground only (subtle sideways drift)
    if (floorFXMat) {
      floorFXMat.uniforms.uTime.value += delta
    }

    composer.render()

    animationId = requestAnimationFrame(animate)
  }
  animate()

  // --- Resize
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize)

  // --- Cleanup
  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    renderer.dispose()
    bgTex.dispose?.()
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('resize', onResize)
    groundTexRef?.dispose?.()
  })
})
</script>

<style scoped>
.canvasscooped {
  position: fixed; /* stay in place while scrolling */
  inset: 0; /* full screen */
  z-index: -10; /* behind app content */
  pointer-events: auto; /* allow drag on the canvas */
}
</style>
