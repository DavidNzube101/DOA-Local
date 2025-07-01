<template>
  <div ref="containerRef" class="character-3d-canvas"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, defineExpose } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const props = defineProps<{
  character: any,
  position: { x: number, y: number },
  direction: string
}>()

const containerRef = ref<HTMLElement | null>(null)
let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera
let characterMesh: THREE.Object3D | null = null
let outlineMesh: THREE.Mesh | null = null
let defendSphere: THREE.Mesh | null = null

// Load character model
async function loadCharacter() {
  if (!props.character?.modelPath) {
    console.error('No modelPath provided for character')
    return
  }
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(props.character.modelPath)
  characterMesh = gltf.scene
  scene.add(characterMesh)
}

function setupScene() {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
  camera.position.set(0, 1, 3)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(containerRef.value!.clientWidth, containerRef.value!.clientHeight)
  containerRef.value!.appendChild(renderer.domElement)
  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(5, 10, 7.5)
  scene.add(light)
}

function animate() {
  requestAnimationFrame(animate)
  if (characterMesh) {
    // Update position
    characterMesh.position.set(props.position.x, 0, props.position.y)
    // Update direction
    switch (props.direction) {
      case 'up': characterMesh.rotation.y = Math.PI; break
      case 'down': characterMesh.rotation.y = 0; break
      case 'left': characterMesh.rotation.y = Math.PI / 2; break
      case 'right': characterMesh.rotation.y = -Math.PI / 2; break
    }
  }
  renderer.render(scene, camera)
}

// Attack: outline glow
function triggerAttackEffect() {
  if (!characterMesh) return
  if (outlineMesh) scene.remove(outlineMesh)
  outlineMesh = characterMesh.clone() as THREE.Mesh
  outlineMesh.traverse((child: any) => {
    if (child.isMesh) {
      child.material = new THREE.MeshBasicMaterial({ color: 0x00ffea, side: THREE.BackSide })
    }
  })
  outlineMesh.scale.multiplyScalar(1.05)
  scene.add(outlineMesh)
  setTimeout(() => {
    if (outlineMesh) scene.remove(outlineMesh)
    outlineMesh = null
  }, 300)
}

// Defend: glowing sphere in front
function triggerDefendEffect(direction: string) {
  if (defendSphere) scene.remove(defendSphere)
  const geometry = new THREE.SphereGeometry(0.3, 32, 32)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ffea, emissive: 0x00ffea, transparent: true, opacity: 0.7 })
  defendSphere = new THREE.Mesh(geometry, material)
  // Place sphere in front of character
  let offset = { x: 0, z: 0 }
  switch (direction) {
    case 'up': offset = { x: 0, z: -0.8 }; break
    case 'down': offset = { x: 0, z: 0.8 }; break
    case 'left': offset = { x: -0.8, z: 0 }; break
    case 'right': offset = { x: 0.8, z: 0 }; break
  }
  defendSphere.position.set(
    (characterMesh?.position.x ?? 0) + offset.x,
    0.7,
    (characterMesh?.position.z ?? 0) + offset.z
  )
  scene.add(defendSphere)
  setTimeout(() => {
    if (defendSphere) scene.remove(defendSphere)
    defendSphere = null
  }, 400)
}

defineExpose({ triggerAttackEffect, triggerDefendEffect })

onMounted(async () => {
  setupScene()
  await loadCharacter()
  animate()
})
onUnmounted(() => {
  renderer?.dispose()
  if (containerRef.value && renderer?.domElement?.parentNode === containerRef.value) {
    containerRef.value.removeChild(renderer.domElement)
  }
})
</script>

<style scoped>
.character-3d-canvas {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
</style> 