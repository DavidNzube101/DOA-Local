<template>
  <div class="character-preview-stake">
    <div class="preview-container">
      <div class="character-section">
        <h2 class="section-title">Your Chosen Daughter</h2>
        <div class="character-visual">
          <div class="avatar-large">
            <div v-if="character && !modelLoadError" ref="threePreview" class="three-preview-canvas"></div>
            <Icon v-else name="heroicons:user" class="w-24 h-24" />
          </div>
          <div class="character-info">
            <h3 class="character-name">{{ character?.name }}</h3>
            <p class="character-element">Element: {{ character?.element }}</p>
            <p class="character-description">{{ character?.description }}</p>
          </div>
        </div>
      </div>
      <div class="stake-section">
        <h2 class="section-title">Prepare for Battle</h2>
        <div class="wallet-balance">
          <span>Wallet Balance:</span>
          <span class="balance">{{ walletBalanceDisplay }} SOL</span>
          <button class="reload-balance-btn" @click="reloadBalance" :disabled="reloadingBalance" title="Reload Balance">
            <Icon name="heroicons:arrow-path" class="w-5 h-5" :class="{ spinning: reloadingBalance }" />
          </button>
        </div>
        
        <!-- Stake Input -->
        <div class="stake-input-group">
          <input
            v-model="stakeAmount"
            type="number"
            :min="MIN_STAKE"
            :max="MAX_STAKE"
            step="0.001"
            placeholder="Enter stake amount in SOL"
            class="stake-input"
            :class="{ 'error': validationResult.errors.length > 0 }"
          />
          <button class="max-btn" @click="setMaxStake">MAX</button>
        </div>

        <!-- Validation Errors -->
        <div v-if="validationResult.errors.length > 0" class="validation-errors">
          <div v-for="error in validationResult.errors" :key="error" class="error-message">
            <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
            {{ error }}
          </div>
        </div>

        <!-- Validation Warnings -->
        <div v-if="validationResult.warnings.length > 0" class="validation-warnings">
          <div v-for="warning in validationResult.warnings" :key="warning" class="warning-message">
            <Icon name="heroicons:information-circle" class="w-4 h-4" />
            {{ warning }}
          </div>
        </div>

        <!-- Stake Suggestions -->
        <div v-if="stakeSuggestions.length > 0" class="stake-suggestions">
          <p class="suggestions-title">Quick Stake Options:</p>
          <div class="suggestions-grid">
            <button
              v-for="suggestion in stakeSuggestions"
              :key="suggestion.label"
              class="suggestion-btn"
              @click="stakeAmount = (suggestion.value / 1e9).toFixed(4)"
            >
              <span class="suggestion-label">{{ suggestion.label }}</span>
              <span class="suggestion-amount">{{ (suggestion.value / 1e9).toFixed(3) }} SOL</span>
              <span class="suggestion-desc">{{ suggestion.description }}</span>
            </button>
          </div>
        </div>

        <button 
          class="enter-btn"
          :disabled="!canEnterBattle"
          @click="enterBattle"
        >
          Enter Battle
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useSound } from '~/composables/useSound'
import { useStakeValidation } from '~/composables/useStakeValidation'
import { Connection, PublicKey } from '@solana/web3.js'
import { useEnvironment } from '~/composables/useEnvironment'

const props = defineProps<{
  character: any
  walletBalance: number
}>()

const emit = defineEmits<{
  'enter-battle': [stakeAmount: number]
}>()

// Sound system
const { playClickSound } = useSound()

// Stake validation
const { validateStakeAmount, formatStakeAmount, getStakeSuggestions, MIN_STAKE, MAX_STAKE } = useStakeValidation()

const stakeAmount = ref(MIN_STAKE.toString())
const validationResult = ref({ isValid: false, errors: [], warnings: [] })

// Convert wallet balance to lamports for validation
const walletBalanceLamports = computed(() => props.walletBalance * 1e9)

// Validate stake amount whenever it changes
watch(stakeAmount, (newAmount) => {
  const amountInLamports = parseFloat(newAmount) * 1e9
  validationResult.value = validateStakeAmount(amountInLamports, walletBalanceLamports.value)
})

const canEnterBattle = computed(() => {
  return validationResult.value.isValid && parseFloat(stakeAmount.value) > 0
})

const setMaxStake = () => {
  playClickSound()
  const maxStake = Math.min(props.walletBalance * 0.9, MAX_STAKE) // Leave 10% for fees
  stakeAmount.value = maxStake.toFixed(4)
}

const enterBattle = () => {
  if (canEnterBattle.value) {
    playClickSound()
    const amountInLamports = parseFloat(stakeAmount.value) * 1e9
    emit('enter-battle', amountInLamports)
  }
}

// Get stake suggestions
const stakeSuggestions = computed(() => getStakeSuggestions(walletBalanceLamports.value))

// --- 3D Preview Logic ---
const threePreview = ref<HTMLElement | null>(null)
let previewRenderer: THREE.WebGLRenderer | null = null
let previewScene: THREE.Scene | null = null
let previewCamera: THREE.PerspectiveCamera | null = null
let previewModel: THREE.Object3D | null = null
let previewAnimationId: number | null = null
let previewMixer: THREE.AnimationMixer | null = null
let isDragging = false
let lastX = 0
let modelLoadError = ref(false)

function cleanupPreview() {
  if (previewAnimationId) cancelAnimationFrame(previewAnimationId)
  if (previewRenderer && previewRenderer.domElement && previewRenderer.domElement.parentNode) {
    previewRenderer.domElement.parentNode.removeChild(previewRenderer.domElement)
  }
  previewRenderer = null; previewScene = null; previewCamera = null; previewModel = null; previewMixer = null
}

watch(() => props.character, async (character) => {
  await nextTick()
  cleanupPreview()
  modelLoadError.value = false
  if (!character || !threePreview.value) return

  // Setup Three.js scene
  previewScene = new THREE.Scene()
  previewScene.background = new THREE.Color('#18182f')
  previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  previewCamera.position.set(0, 1.5, 3)
  previewCamera.lookAt(0, 1, 0)
  previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  previewRenderer.setSize(260, 260)
  threePreview.value.appendChild(previewRenderer.domElement)

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.7)
  previewScene.add(ambient)
  const dir = new THREE.DirectionalLight(0xffffff, 0.7)
  dir.position.set(2, 4, 2)
  previewScene.add(dir)

  // Load idle .glb
  const loader = new GLTFLoader()
  const charName = character.name.toLowerCase()
  loader.load(
    `/models/${character.name}/${charName}_idle.glb`,
    (gltf) => {
      previewModel = gltf.scene
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(previewModel)
      const size = new THREE.Vector3()
      box.getSize(size)
      const center = new THREE.Vector3()
      box.getCenter(center)
      // Center the model at the origin
      previewModel.position.x += (previewModel.position.x - center.x)
      previewModel.position.y += (previewModel.position.y - center.y)
      previewModel.position.z += (previewModel.position.z - center.z)
      // Scale the model to fit the preview
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 1.5 / maxDim
      previewModel.scale.setScalar(scale)
      previewScene!.add(previewModel)
      // Animation
      if (gltf.animations && gltf.animations.length > 0) {
        previewMixer = new THREE.AnimationMixer(previewModel)
        const action = previewMixer.clipAction(gltf.animations[0])
        action.play()
      }
    },
    undefined,
    (error) => {
      modelLoadError.value = true
      console.error('Failed to load model:', error)
    }
  )

  // Mouse drag to rotate
  const canvas = previewRenderer.domElement
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true
    lastX = e.clientX
  })
  window.addEventListener('mousemove', (e) => {
    if (isDragging && previewModel) {
      const delta = e.clientX - lastX
      previewModel.rotation.y += delta * 0.01
      lastX = e.clientX
    }
  })
  window.addEventListener('mouseup', () => {
    isDragging = false
  })

  // Animate
  const animate = () => {
    previewAnimationId = requestAnimationFrame(animate)
    if (previewMixer) previewMixer.update(1/60)
    previewRenderer!.render(previewScene!, previewCamera!)
  }
  animate()
})

onMounted(async () => {
  if (props.character) {
    await nextTick()
    cleanupPreview()
    modelLoadError.value = false
    if (!threePreview.value) return
    previewScene = new THREE.Scene()
    previewScene.background = new THREE.Color('#18182f')
    previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    previewCamera.position.set(0, 1.5, 3)
    previewCamera.lookAt(0, 1, 0)
    previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    previewRenderer.setSize(260, 260)
    threePreview.value.appendChild(previewRenderer.domElement)
    const ambient = new THREE.AmbientLight(0xffffff, 0.7)
    previewScene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.7)
    dir.position.set(2, 4, 2)
    previewScene.add(dir)
    const loader = new GLTFLoader()
    const charName = props.character.name.toLowerCase()
    loader.load(
      `/models/${props.character.name}/${charName}_idle.glb`,
      (gltf) => {
        previewModel = gltf.scene
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(previewModel)
        const size = new THREE.Vector3()
        box.getSize(size)
        const center = new THREE.Vector3()
        box.getCenter(center)
        previewModel.position.x += (previewModel.position.x - center.x)
        previewModel.position.y += (previewModel.position.y - center.y)
        previewModel.position.z += (previewModel.position.z - center.z)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 3 / maxDim
        previewModel.scale.setScalar(scale)
        previewScene!.add(previewModel)
        if (gltf.animations && gltf.animations.length > 0) {
          previewMixer = new THREE.AnimationMixer(previewModel)
          const action = previewMixer.clipAction(gltf.animations[0])
          action.play()
        }
      },
      undefined,
      (error) => {
        modelLoadError.value = true
        console.error('Failed to load model:', error)
      }
    )
    const canvas = previewRenderer.domElement
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true
      lastX = e.clientX
    })
    window.addEventListener('mousemove', (e) => {
      if (isDragging && previewModel) {
        const delta = e.clientX - lastX
        previewModel.rotation.y += delta * 0.01
        lastX = e.clientX
      }
    })
    window.addEventListener('mouseup', () => {
      isDragging = false
    })
    const animate = () => {
      previewAnimationId = requestAnimationFrame(animate)
      if (previewMixer) previewMixer.update(1/60)
      previewRenderer!.render(previewScene!, previewCamera!)
    }
    animate()
  }
})

const walletBalanceDisplay = ref(props.walletBalance)
const reloadingBalance = ref(false)
const { rpcUrl, wsRpcUrl, isProduction } = useEnvironment()

const reloadBalance = async () => {
  if (!props.character || !props.character.publicKey) return
  reloadingBalance.value = true
  try {
    const connection = new Connection(rpcUrl.value)
    const balance = await connection.getBalance(new PublicKey(props.character.publicKey))
    walletBalanceDisplay.value = balance / 1e9
  } catch (err) {
    console.error('Failed to reload wallet balance:', err)
  } finally {
    reloadingBalance.value = false
  }
}

// Watch for prop changes to keep in sync
watch(() => props.walletBalance, (newVal) => {
  walletBalanceDisplay.value = newVal
})
</script>

<style scoped>
.character-preview-stake {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
}
.preview-container {
  max-width: 1100px;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 6rem;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 32px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  padding: 4rem 5rem;
}
.character-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.character-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}
.avatar-large {
  width: 260px;
  height: 320px;
  background: rgba(99,102,241,0.2);
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  border: 2px solid rgba(99,102,241,0.3);
  margin-bottom: 1rem;
}
.character-info {
  text-align: center;
}
.character-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}
.character-element {
  font-size: 1rem;
  color: var(--accent-color);
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.character-description {
  font-size: 1rem;
  color: var(--text-secondary);
}
.stake-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}
.wallet-balance {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}
.balance {
  color: var(--success-color);
  font-weight: 700;
  margin-left: 0.5rem;
}
.stake-input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.stake-input {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
  font-size: 1.25rem;
  width: 160px;
}
.max-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.max-btn:hover {
  background: #d97706;
}
.enter-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(99,102,241,0.3);
  transition: all 0.3s ease;
}
.enter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@media (max-width: 900px) {
  .preview-container {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem 1rem;
  }
}
.three-preview-canvas {
  width: 240px;
  height: 300px;
  background: #18182f;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(99,102,241,0.15);
  margin: 0 auto;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
}
.validation-errors, .validation-warnings, .stake-suggestions {
  margin-bottom: 1rem;
}
.error-message, .warning-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.suggestions-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}
.suggestions-grid {
  display: flex;
  gap: 0.5rem;
}
.suggestion-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.suggestion-btn:hover {
  background: #d97706;
}
.suggestion-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.suggestion-amount {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.suggestion-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.reload-balance-btn {
  background: none;
  border: none;
  margin-left: 0.5rem;
  cursor: pointer;
  color: var(--primary-color);
  vertical-align: middle;
  padding: 0;
}
.reload-balance-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 