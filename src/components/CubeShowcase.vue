<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'

const containerRef = ref<HTMLElement | null>(null)

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let controls: OrbitControls
let animationId = 0

// NEW: interaction + lighting state
let raycaster: THREE.Raycaster
const pointer = new THREE.Vector2()
const dragPlane = new THREE.Plane()
let dragging = false
let draggable: THREE.Mesh | null = null
let keyLight: THREE.DirectionalLight
const tmpVec3 = new THREE.Vector3()

function init() {
  const container = containerRef.value!
  const w = container.clientWidth
  const h = container.clientHeight

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
  camera.position.set(3, 2.1, 4)
  scene.add(camera)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.target.set(0, 0.6, 0)

  scene.add(new THREE.AmbientLight(0xffffff, 0.2))

  // NEW: keep reference to key light
  keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
  keyLight.position.set(3, 5, 2)
  scene.add(keyLight)

  // NEW: raycaster for picking / dragging
  raycaster = new THREE.Raycaster()

  // Try to load HDR; if it fails, still build scene
  new RGBELoader().setPath('/Portfolio/hdr/').load(
    'studio.hdr',
    (hdr) => {
      console.log('[HDR] loaded')
      hdr.mapping = THREE.EquirectangularReflectionMapping
      scene.environment = hdr
      createObjects()
      animate()
    },
    undefined,
    (err) => {
      console.warn('[HDR] failed or not found → continuing without env', err)
      createObjects()
      animate()
    },
  )

  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVis)

  // NEW: pointer events for drag + light direction
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function createObjects() {
  // Reflective floor
  const floorGeo = new THREE.PlaneGeometry(12, 12)
  const reflector = new Reflector(floorGeo, {
    clipBias: 0.003,
    textureWidth: 1024,
    textureHeight: 1024,
    color: 0x111111,
  })
  reflector.rotation.x = -Math.PI / 2
  scene.add(reflector)

  // Glassy cube
  const cubeGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8)
  const cubeMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.05,
    transmission: 1.0,
    thickness: 0.6,
    ior: 1.45,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  })
  const cube = new THREE.Mesh(cubeGeo, cubeMat)
  cube.position.y = 1.0

  const group = new THREE.Group()
  group.name = 'cubeGroup'
  group.add(cube)
  scene.add(group)

  // 🔥 FLAME SPRITE INSTEAD OF SPHERE
  const texLoader = new THREE.TextureLoader()
  const flameTex = texLoader.load('/Portfolio/media/flame.jpg')

  const flameMat = new THREE.SpriteMaterial({
    map: flameTex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const flame = new THREE.Sprite(flameMat)
  flame.name = 'flameSprite'
  flame.position.set(0, 1.02, 0) // inside the cube
  flame.scale.set(1.2, 2.2, 1) // teardrop-ish aspect
  group.add(flame)

  // point light to make the cube react to the flame
  const flameLight = new THREE.PointLight(0xffaa55, 7, 8, 2)
  flameLight.name = 'flameLight'
  flameLight.position.copy(flame.position)
  group.add(flameLight)
}

function animate() {
  animationId = requestAnimationFrame(animate)

  const t = performance.now() * 0.001
  const g = scene.getObjectByName('cubeGroup') as THREE.Group | undefined

  if (g) {
    // Keep your floating/rotation if you like
    g.rotation.y = t * 0.25
    g.position.y = 0.02 * Math.sin(t * 1.2)

    const flame = scene.getObjectByName('flameSprite') as THREE.Sprite | undefined
    const flameLight = scene.getObjectByName('flameLight') as THREE.PointLight | undefined

    if (flame) {
      // subtle scale flicker
      const wobble = 1 + 0.08 * Math.sin(t * 14.0) + 0.05 * Math.sin(t * 23.0)
      flame.scale.set(1.2 * wobble, 2.2 * wobble * 1.05, 1)

      // opacity flicker
      const mat = flame.material as THREE.SpriteMaterial
      mat.opacity = 0.8 + 0.2 * Math.sin(t * 18.0)

      // tiny rotation jitter to keep it alive
      flame.material.rotation = 0.03 * Math.sin(t * 10.0)
    }

    if (flameLight) {
      // sync light intensity with flicker
      flameLight.intensity = 6.5 + 1.0 * Math.sin(t * 20.0)
    }
  }

  controls.update()
  renderer.render(scene, camera)
}

// --- Interaction helpers -----------------------------------------------------

function updatePointer(event: PointerEvent) {
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

function onPointerDown(event: PointerEvent) {
  if (!camera || !scene) return

  updatePointer(event)
  raycaster.setFromCamera(pointer, camera)

  // Click detection only on the core sphere
  const core = scene.getObjectByName('coreSphere') as THREE.Mesh | undefined
  if (!core) return

  const intersects = raycaster.intersectObject(core, true)
  if (intersects.length > 0) {
    dragging = true
    draggable = core

    // Drag plane is horizontal at the core's current height
    dragPlane.set(new THREE.Vector3(0, 1, 0), -core.position.y)
  }
}

function onPointerMove(event: PointerEvent) {
  if (!camera || !scene) return

  updatePointer(event)

  // NEW: Move key light according to mouse (gives “reflections follow the mouse” feel)
  const strength = 4
  keyLight.position.set(pointer.x * strength, 4 + pointer.y * 1.5, 3 + pointer.y * strength)
  keyLight.lookAt(0, 1, 0)

  if (!dragging || !draggable) return

  // Raycast against the dragPlane to find where to place the sphere
  raycaster.setFromCamera(pointer, camera)
  if (raycaster.ray.intersectPlane(dragPlane, tmpVec3)) {
    // Limit movement so the sphere stays inside the cube
    const limit = 0.7
    const x = THREE.MathUtils.clamp(tmpVec3.x, -limit, limit)
    const z = THREE.MathUtils.clamp(tmpVec3.z, -limit, limit)

    draggable.position.x = x
    draggable.position.z = z

    // Move its attached point light with it
    const coreLight = scene.getObjectByName('coreLight') as THREE.PointLight | undefined
    if (coreLight) {
      coreLight.position.x = x
      coreLight.position.z = z
    }
  }
}

function onPointerUp() {
  dragging = false
  draggable = null
}

function onResize() {
  if (!containerRef.value) return
  const w = containerRef.value.clientWidth
  const h = containerRef.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

function onVis() {
  if (document.hidden) {
    cancelAnimationFrame(animationId)
  } else {
    animate()
  }
}

onMounted(init)

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVis)
  cancelAnimationFrame(animationId)
  renderer?.dispose()

  // NEW: clean up pointer listeners
  if (renderer) {
    renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    renderer.domElement.removeEventListener('pointermove', onPointerMove)
  }
  window.removeEventListener('pointerup', onPointerUp)
})
</script>

<template>
  <section class="cube-section">
    <div class="fx-bg"></div>
    <div ref="containerRef" class="three-wrap" />
    <!-- <div class="hero-copy">
      <h2>DIVE INTO DIGITAL MAGIC</h2>
      <p>We bring stories to life with 3D, AR, and VR.</p>
      <a href="#projects" class="cta">Explore</a>
    </div> -->
  </section>
</template>

<style scoped>
.cube-section {
  position: relative;
  min-height: 72vh;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.fx-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1200px 600px at 50% 90%, rgba(0, 170, 255, 0.25), transparent 50%),
    radial-gradient(1000px 600px at 50% 0%, rgba(0, 0, 0, 0.8), transparent 55%),
    linear-gradient(180deg, #0a0f14 0%, #06090c 100%);
  pointer-events: none;
  z-index: 0; /* background layer */
}

/* Make sure the WebGL canvas sits ABOVE the gradient */
.three-wrap {
  position: absolute;
  inset: 0;
  z-index: 1; /* key fix */
}

.hero-copy {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 1rem;
}
.hero-copy h2 {
  font-weight: 800;
  letter-spacing: 0.08em;
  font-size: clamp(28px, 4vw, 56px);
}
.hero-copy p {
  opacity: 0.85;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
}
.cta {
  display: inline-block;
  border: 1px solid currentColor;
  padding: 0.8rem 1.6rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}
</style>
