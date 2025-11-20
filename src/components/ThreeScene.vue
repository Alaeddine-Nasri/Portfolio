<template>
  <div class="canvasscooped" ref="wrap"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water2.js'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const wrap = ref<HTMLDivElement | null>(null)
const route = useRoute()

// cube reference so we can animate it from outside onMounted
let cube: THREE.Mesh | null = null

// cube animation state
let cubeRotationEnabled = true

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
    // center, normal size, rotate
    toPos.set(0, 0.7, 0)
    toScale.set(1, 1, 1)
    cubeRotationEnabled = true
  } else {
    // bottom-left and bigger
    toPos.set(-2.5, -1.2, 0)
    toScale.set(1.6, 1.6, 1.6)
    cubeRotationEnabled = false
  }

  poseStartTime = performance.now() / 1000
  poseDuration = 0.7
  poseAnimating = true
}

// react to route changes
watch(
  () => route.name,
  (name) => {
    if (name === 'about') transitionCube('about')
    else transitionCube('home')
  },
)

onMounted(() => {
  // Scene setup
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x101015)

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(4.46, 0.153, 4.59)
  camera.lookAt(0, 1, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  if (wrap.value) {
    wrap.value.appendChild(renderer.domElement)
  }

  // @ts-ignore – useful for debugging in browser console
  ;(window as any).camera = camera

  // const controls = new OrbitControls(camera, renderer.domElement)
  // controls.enableDamping = true

  // Cube (rotating container)
  const cubeGeo = new THREE.BoxGeometry(2, 2, 2)
  const cubeMat = new THREE.MeshPhysicalMaterial({
    color: 0x224477,
    metalness: 0.2,
    roughness: 0.5,
    opacity: 0.6,
    transparent: true,
    side: THREE.DoubleSide,
  })
  cube = new THREE.Mesh(cubeGeo, cubeMat)
  scene.add(cube)
  cube.position.set(0, 0.7, 0) // default home position
  cube.scale.set(1, 1, 1)

  // Ball (emissive + light source)
  const ballGeo = new THREE.SphereGeometry(0.2, 32, 32)
  const ballMat = new THREE.MeshStandardMaterial({
    emissive: 0x44aaff,
    emissiveIntensity: 3,
    color: 0x4488ff,
  })
  const ball = new THREE.Mesh(ballGeo, ballMat)
  cube.add(ball) // make it child of cube so it rotates with it

  const light = new THREE.PointLight(0x44aaff, 2, 10)
  light.castShadow = true
  ball.add(light) // attach light to ball so it moves with it

  // Ambient lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.15))
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))

  // Sunlight (key for Water reflection)
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
  sunLight.position.set(5, 10, 5)
  scene.add(sunLight)

  // === WATER SURFACE ===
  const waterGeo = new THREE.PlaneGeometry(50, 50)
  const water = new Water(waterGeo, {
    color: 0x0044ff,
    scale: 10,
    flowDirection: new THREE.Vector2(1, 1),
    textureWidth: 1024,
    textureHeight: 1024,
  })

  water.rotation.x = -Math.PI / 2
  water.position.y = -1.5
  scene.add(water)

  // Interaction (drag ball inside cube)
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let isDragging = false

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
    if (isDragging) updateBallPosition(e)
  }

  function onPointerUp() {
    isDragging = false
  }

  scene.fog = new THREE.Fog(0x100808, 5, 20)
  renderer.setClearColor(scene.fog.color)
  window.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)

  // initial pose based on current route
  if (route.name === 'about') {
    transitionCube('about')
  } else {
    transitionCube('home')
  }

  // Animation loop
  const clock = new THREE.Clock()
  let animationId: number

  const animate = () => {
    const delta = clock.getDelta() // time since last frame

    // interpolate position/scale when transitioning
    if (poseAnimating && cube) {
      const now = performance.now() / 1000
      const t = (now - poseStartTime) / poseDuration
      const alpha = Math.min(Math.max(t, 0), 1)

      cube.position.lerpVectors(fromPos, toPos, alpha)
      cube.scale.lerpVectors(fromScale, toScale, alpha)

      if (alpha >= 1) poseAnimating = false
    }

    // slow rotation only when enabled
    if (cubeRotationEnabled && cube) {
      cube.rotation.y += delta * 0.1
      cube.rotation.x += delta * 0.05
    }

    // water animation
    const mat: any = water.material
    if (mat && mat.uniforms && mat.uniforms['time']) {
      mat.uniforms['time'].value += 0.05
    }

    renderer.render(scene, camera)
    animationId = requestAnimationFrame(animate)
  }
  animate()

  // Resize
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize)

  // Cleanup
  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    renderer.dispose()
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('resize', onResize)
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
