<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// ↓ add these 3 lines (for compressed models)
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
// (Optional) If you later use KTX2 textures:
// import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'

const props = defineProps<{ src: string }>()

const container = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let modelRoot: THREE.Group | null = null

// ↓ NEW: a pivot we’ll rotate, with the model centered under it
let pivot: THREE.Group | null = null

let rafId = 0
let ro: ResizeObserver | null = null

function setSize() {
  if (!container.value || !renderer || !camera) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  renderer.setSize(w, h, false)

  // ↓ CHANGE: cap pixel ratio a bit to keep it cheap
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

  camera.aspect = w / h || 1
  camera.updateProjectionMatrix()
}

function frameObject(object: THREE.Object3D, padding = 1.25) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())

  // radius via box corners
  const radius = new THREE.Sphere(center, 0).setFromPoints([
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ]).radius
  const safeRadius = Math.max(radius, 0.001)

  const vFov = (camera.fov * Math.PI) / 180
  const dist = (safeRadius / Math.sin(vFov / 2)) * padding

  camera.near = Math.max(dist / 1000, 0.01)
  camera.far = dist * 1000
  camera.position.copy(center)
  camera.position.z += dist
  camera.lookAt(center)
  camera.updateProjectionMatrix()
}

onMounted(() => {
  if (!container.value || !canvas.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })

  setSize()

  // Lighting
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
  scene.add(hemi)
  const dir = new THREE.DirectionalLight(0xffffff, 0.8)
  dir.position.set(3, 5, 2)
  scene.add(dir)

  // ↓ NEW: set up loader with decoders (for smaller .glb/.gltf)
  const loader = new GLTFLoader()

  const draco = new DRACOLoader()
  draco.setDecoderPath('/draco/') // put decoder files under /public/draco/
  loader.setDRACOLoader(draco)

  loader.setMeshoptDecoder(MeshoptDecoder)

  // (Optional) If you convert textures to KTX2, uncomment:
  // const ktx2 = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer!)
  // loader.setKTX2Loader(ktx2)

  // Load model
  loader.load(
    props.src,
    (gltf) => {
      modelRoot = gltf.scene

      // ---------- EXACT CENTERING + PIVOT ----------
      // 1) compute current bounds/center
      const box = new THREE.Box3().setFromObject(modelRoot)
      const center = box.getCenter(new THREE.Vector3())

      // 2) create a pivot at world origin and add it to the scene
      pivot = new THREE.Group()
      scene.add(pivot)

      // 3) shift the model so its visual center is at the pivot
      modelRoot.position.sub(center)

      // 4) add the model under the pivot
      pivot.add(modelRoot)
      // ---------------------------------------------

      setSize()
      frameObject(pivot) // frame the pivot (not the raw model)

      const tick = () => {
        if (pivot) pivot.rotation.y += 0.005 // rotate around center
        renderer!.render(scene, camera)
        rafId = requestAnimationFrame(tick)
      }
      tick()
    },
    undefined,
    (err) => {
      console.error('GLTF load error', err)
      const geo = new THREE.BoxGeometry(1, 1, 1)
      const mat = new THREE.MeshStandardMaterial({ metalness: 0.1, roughness: 0.7 })
      const mesh = new THREE.Mesh(geo, mat)
      scene.add(mesh)
      frameObject(mesh)
      const tick = () => {
        mesh.rotation.y += 0.01
        renderer!.render(scene, camera)
        rafId = requestAnimationFrame(tick)
      }
      tick()
    },
  )

  // Resize handling
  ro = new ResizeObserver(() => {
    setSize()
    if (pivot) frameObject(pivot) // keep fit on aspect changes
  })
  ro.observe(container.value)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  ro?.disconnect()
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss?.()
    renderer.domElement.remove()
    renderer = null
  }
})
</script>

<template>
  <div ref="container" class="relative w-full h-full overflow-hidden">
    <canvas ref="canvas" class="absolute inset-0 w-full h-full block"></canvas>
  </div>
</template>

<style scoped>
/* nothing extra needed */
</style>
