<template>
  <div class="game-arena-immersive">
    <!-- Versus Popup -->
    <div v-if="showVersus" class="versus-popup-overlay">
      <div class="versus-popup">
        <div class="versus-player">
          <img
            v-if="props.character?.name"
            :src="`/models/${props.character.name}/${props.character.name.toLowerCase()}_profile_picture.png`"
            :alt="props.character.name + ' profile'"
            class="versus-avatar"
          />
          <div class="versus-name">{{ props.character?.name || 'You' }}</div>
        </div>
        <div class="versus-vs">VS</div>
        <div class="versus-player">
          <img
            v-if="opponentCharacterName"
            :src="`/models/${opponentCharacterName}/${opponentCharacterName.toLowerCase()}_profile_picture.png`"
            :alt="opponentCharacterName + ' profile'"
            class="versus-avatar"
          />
          <div class="versus-name">{{ opponentCharacterName || 'Opponent' }}</div>
        </div>
      </div>
    </div>
    <!-- 3D Arena Fullscreen -->
    <div ref="threeContainer" class="three-canvas-immersive"></div>
    <!-- UI Overlay -->
    <div class="arena-ui-overlay">
      <div class="arena-ui-top">
        <div class="timer-container">
          <Icon name="heroicons:clock" class="w-5 h-5" />
          <div class="timer">{{ formatTime(timeRemaining) }}</div>
        </div>
        <div class="stake-display">
          <Icon name="heroicons:currency-dollar" class="w-5 h-5" />
          <span>{{ formattedStakeAmount }} GOR Staked</span>
        </div>
        <button class="settings-btn" @click="onSettingsClick">⚙️</button>
      </div>
      <div class="arena-ui-bottom">
        <div class="health-container">
          <Icon name="heroicons:heart" class="w-5 h-5" />
          <div class="health-bar">
            <div class="health-fill" :style="{ width: `${(playerHealth / maxHealth) * 100}%` }"></div>
          </div>
          <span class="health-text">{{ playerHealth }} / {{ maxHealth }}</span>
        </div>
        <div class="mana-bar-container">
          <Icon name="heroicons:sparkles" class="w-5 h-5" />
          <div class="mana-bar">
            <div class="mana-fill" :style="{ width: `${(mana / maxMana) * 100}%` }"></div>
          </div>
          <span class="mana-text">{{ mana }} / {{ maxMana }}</span>
        </div>
        <div class="opponent-health-container">
          <Icon name="heroicons:user" class="w-5 h-5" />
          <span class="opponent-health-text">Opponent Health: {{ opponentHealth }}</span>
        </div>
        <div v-if="manaWarning" class="mana-warning">{{ manaWarning }}</div>
        <div class="controls-info">
          <div class="control-item"><span class="control-key">WASD/↑↓←→</span><span class="control-desc">Move</span></div>
          <div class="control-item"><span class="control-key">J</span><span class="control-desc">Attack</span></div>
          <div class="control-item"><span class="control-key">K</span><span class="control-desc">Defend</span></div>
          <div class="control-item"><span class="control-key">G/Space</span><span class="control-desc">Glow Orb</span></div>
        </div>
      </div>
      <div v-if="showSettings" class="settings-modal">
        <div class="settings-content">
          <h2>Settings</h2>
          <label><input type="checkbox" v-model="settings.sound" /> Sound</label>
          <label><input type="checkbox" v-model="settings.performance" /> Performance Mode</label>
          <button @click="onCloseSettings">Close</button>
        </div>
      </div>
    </div>
    <!-- Game End Modal (unchanged) -->
    <div v-if="gameEnded" class="modal-overlay">
      <div class="modal-content" :class="{ 'victory': gameResult.won, 'defeat': !gameResult.won }">
        <div class="modal-flashy-bg" :class="{ victory: gameResult.won, defeat: !gameResult.won }"></div>
        <div v-if="gameResult.won" class="royal-sparkles"></div>
        <div v-else class="royal-petals"></div>
        <div class="modal-content animated" :class="{ victory: gameResult.won, defeat: !gameResult.won }">
          <svg v-if="gameResult.won" class="modal-crown" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 32L16 8L32 32L48 8L60 32" stroke="#ffd700" stroke-width="4" fill="#fffbe6"/>
            <ellipse cx="16" cy="8" rx="4" ry="4" fill="#ffd700"/>
            <ellipse cx="48" cy="8" rx="4" ry="4" fill="#ffd700"/>
            <ellipse cx="32" cy="32" rx="6" ry="6" fill="#ffd700"/>
            <ellipse cx="32" cy="8" rx="5" ry="5" fill="#ffb300"/>
          </svg>
          <svg v-else class="modal-crown broken" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 32L16 8L32 32L48 8L60 32" stroke="#a67c00" stroke-width="4" fill="#ffeaea"/>
            <ellipse cx="16" cy="8" rx="4" ry="4" fill="#a67c00"/>
            <ellipse cx="48" cy="8" rx="4" ry="4" fill="#a67c00"/>
            <ellipse cx="32" cy="32" rx="6" ry="6" fill="#7a0000"/>
            <ellipse cx="32" cy="8" rx="5" ry="5" fill="#4b1c3c"/>
            <line x1="12" y1="36" x2="52" y2="4" stroke="#7a0000" stroke-width="2"/>
          </svg>
          <h2 class="modal-title">
            <span v-if="gameResult.won">Victory!</span>
            <span v-else><span class="defeat-shake">Defeat</span></span>
          </h2>
          <p v-if="gameResult.won" class="modal-message">{{ winQuote }}</p>
          <p v-else class="modal-message">{{ gameResult.message }}</p>
          <div class="modal-stats">
            <div class="stat-item"><span class="stat-label">Final Health:</span><span class="stat-value">{{ playerHealth }}</span></div>
            <div class="stat-item"><span class="stat-label">Time Survived:</span><span class="stat-value">{{ formatTime(gameDuration) }}</span></div>
            <div class="stat-item"><span class="stat-label">Stake Amount:</span><span class="stat-value">{{ formatGor(totalStake) }}</span></div>
            <div class="stat-item"><span class="stat-label">Payout:</span><span class="stat-value" :class="{ 'text-green-400': gameResult.won, 'text-red-400': !gameResult.won }">{{ gameResult.won ? `+${formatGor(winnerPayout)}` : `-${formatGor(loserLoss)}` }}</span></div>
          </div>
          <button class="modal-button" @click="onExitGame">Return to Lobby</button>
        </div>
      </div>
    </div>
    
    <!-- Early Victory Popup -->
    <div v-if="showEarlyVictoryPopup" class="modal-overlay">
      <div class="modal-content victory">
        <div class="modal-flashy-bg victory"></div>
        <div class="royal-sparkles"></div>
        <div class="modal-content animated victory">
          <svg class="modal-crown" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 32L16 8L32 32L48 8L60 32" stroke="#ffd700" stroke-width="4" fill="#fffbe6"/>
            <ellipse cx="16" cy="8" rx="4" ry="4" fill="#ffd700"/>
            <ellipse cx="48" cy="8" rx="4" ry="4" fill="#ffd700"/>
            <ellipse cx="32" cy="32" rx="6" ry="6" fill="#ffd700"/>
            <ellipse cx="32" cy="8" rx="5" ry="5" fill="#ffb300"/>
          </svg>
          <h2 class="modal-title">Victory!</h2>
          <p class="modal-message">You defeated your opponent! Waiting for battle deadline to resolve on-chain...</p>
          <div class="countdown-container">
            <div class="countdown-label">Resolving in:</div>
            <div class="countdown-timer">{{ formatTime(earlyVictoryCountdown || 0) }}</div>
          </div>
          <div class="modal-stats">
            <div class="stat-item"><span class="stat-label">Final Health:</span><span class="stat-value">{{ playerHealth }}</span></div>
            <div class="stat-item"><span class="stat-label">Time Remaining:</span><span class="stat-value">{{ formatTime(earlyVictoryTime || 0) }}</span></div>
            <div class="stat-item"><span class="stat-label">Stake Amount:</span><span class="stat-value">{{ formatGor(totalStake) }}</span></div>
            <div class="stat-item"><span class="stat-label">Expected Payout:</span><span class="stat-value text-green-400">+{{ formatGor(winnerPayout) }}</span></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Render opponent as a simple sphere -->
    <div v-if="opponentDisconnected" class="modal-overlay">
      <div class="modal-content">
        <h2>Opponent Disconnected</h2>
        <p>Your opponent has left the game.</p>
        <button @click="onExitGame">Return to Lobby</button>
      </div>
    </div>
    <!-- Leave Confirmation Modal -->
    <div v-if="showLeaveModal" class="modal-overlay">
      <div class="modal-content defeat">
        <h2 class="modal-title">Forfeit Match?</h2>
        <p class="modal-message">Are you sure you want to leave? If you leave, your stake will be forfeited.</p>
        <div class="modal-actions">
          <button class="modal-button" @click="confirmLeave">Yes, Forfeit</button>
          <button class="modal-button secondary" @click="showLeaveModal = false">Cancel</button>
        </div>
      </div>
    </div>
    <!-- Leave Button -->
    <button class="leave-button" @click="onLeaveClick">Leave</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { io, Socket } from 'socket.io-client'
import { useSound } from '~/composables/useSound'

const props = defineProps<{ stakeAmount?: number, character?: any, opponentId?: string, yourId?: string, opponentCharacterName?: string, socket?: any }>()
const emit = defineEmits<{ 'game-ended': [result: any] }>()

// Game state
const timeRemaining = ref(60)
const playerHealth = ref(100)
const maxHealth = ref(100)
const gameEnded = ref(false)
const gameDuration = ref(0)
const gameResult = ref({ won: false, message: '' })

// Early victory countdown state
const earlyVictoryCountdown = ref<number | null>(null)
const earlyVictoryTime = ref<number | null>(null)
const showEarlyVictoryPopup = ref(false)
let earlyVictoryInterval: NodeJS.Timeout | null = null

// Safe zone and terrain state
const safeZoneRadius = 17
const terrainSize = 100
let terrainObjects: THREE.Object3D[] = []

// Life drain state
let isOutsideSafeZone = false
let lifeDrainInterval: NodeJS.Timeout | null = null

// 3D/Animation state
const threeContainer = ref<HTMLElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let animationId: number | null = null
let loadedModels: { [key: string]: { scene: THREE.Object3D, animations: THREE.AnimationClip[] } } = {}
let playerModel: THREE.Object3D | null = null
let playerMixer: THREE.AnimationMixer | null = null
let playerAction: THREE.AnimationAction | null = null
let currentModelKey = 'idle'

// TPS camera state
const playerPosition = ref({ x: -3, z: 0 })
let playerRotation = 0 // radians
const arenaBounds = { minX: -8, maxX: 8, minZ: -8, maxZ: 8 }
let moveDirection = { x: 0, z: 0 }
let moveKeyDown = false
let lastMoveTime = 0

// Movement state
const keysDown = new Set<string>()

// Action state for continuous animations
let currentAction = '' // 'attack', 'defend', or ''
let actionKeyHeld = false

// Camera smoothing
let targetCameraPosition = { x: 0, y: 4, z: 0 }
let currentCameraPosition = { x: 0, y: 4, z: 0 }
const cameraSmoothFactor = 0.1

let composer: EffectComposer | null = null
let renderPass: RenderPass | null = null
let bloomPass: UnrealBloomPass | null = null
let outlinePass: OutlinePass | null = null
let shieldGlowColor = '#2196f3'
let attackGlowColor = '#fff700'

// Audio elements
let bgm: HTMLAudioElement | null = null
let attackSound: HTMLAudioElement | null = null
let defendSound: HTMLAudioElement | null = null
let lifeDepletesSound: HTMLAudioElement | null = null
let isLifeDepleting = false

let arenaBgm: HTMLAudioElement | null = null

const fadeDuration = 1000 // ms

const showSettings = ref(false)
const settings = ref({ sound: true, performance: false })

// --- Defend Life Drain ---
let defendDrainInterval: NodeJS.Timeout | null = null

// --- Motivational quotes for win ---
const winQuotes = [
  'A true champion rises above!',
  'Victory crowns the bold!',
  'You have earned your place in legend!',
  'The throne awaits the worthy!',
  'Your courage has been rewarded!',
  'Glory is yours, noble one!',
  'You fought with honor and triumphed!',
  'The realm will remember your name!',
  'You are the light in the darkness!',
  'Royalty is forged in battle!'
]
const winQuote = ref('')

// --- Win/Lose sound logic ---
let winSound: HTMLAudioElement | null = null
let loseSound: HTMLAudioElement | null = null

watch(gameEnded, (ended) => {
  if (ended) {
    if (gameResult.value.won) {
      // Pick a random quote
      winQuote.value = winQuotes[Math.floor(Math.random() * winQuotes.length)]
      // Pick a random win track
      const winTracks = ['/sounds/win1_track.mp3', '/sounds/win2_track.mp3']
      const track = winTracks[Math.floor(Math.random() * winTracks.length)]
      winSound = new Audio(track)
      winSound.volume = 0.7
      winSound.play()
    } else {
      loseSound = new Audio('/sounds/lose_track.mp3')
      loseSound.volume = 0.7
      loseSound.play()
    }
  } else {
    // Stop sounds if modal is closed
    if (winSound) { winSound.pause(); winSound.currentTime = 0; winSound = null }
    if (loseSound) { loseSound.pause(); loseSound.currentTime = 0; loseSound = null }
  }
})

// Helper: load GLB
async function loadGLB(key: string) {
  if (!props.character) return null
  const charName = props.character.name
  const charNameLower = charName.toLowerCase()
  const modelPath = `/models/${charName}/${charNameLower}_${key}.glb`
  const loader = new GLTFLoader()
  try {
    const gltf = await loader.loadAsync(modelPath)
    return { scene: gltf.scene, animations: gltf.animations }
  } catch (e) {
    console.error(`Failed to load ${key} model:`, e)
    return null
  }
}

// Preload all animations
async function preloadAllModels() {
  const keys = ['idle', 'move', 'attack', 'defend']
  for (const key of keys) {
    const result = await loadGLB(key)
    if (result) loadedModels[key] = result
  }
}

// Center/scale model
function centerAndScaleModel(model: THREE.Object3D, targetSize = 2) {
  const box = new THREE.Box3().setFromObject(model)
  const size = new THREE.Vector3()
  box.getSize(size)
  const center = new THREE.Vector3()
  box.getCenter(center)
  model.position.x += (model.position.x - center.x)
  model.position.y += (model.position.y - center.y)
  model.position.z += (model.position.z - center.z)
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = targetSize / maxDim
  model.scale.setScalar(scale)
}

// TPS camera follow with smoothing
function updateCameraTPS() {
  if (!camera) return
  const camDist = 7
  const camHeight = 4
  const px = playerPosition.value.x
  const pz = playerPosition.value.z
  
  // Calculate target camera position
  targetCameraPosition.x = px - Math.sin(playerRotation) * camDist
  targetCameraPosition.y = camHeight
  targetCameraPosition.z = pz - Math.cos(playerRotation) * camDist
  
  // Smoothly interpolate camera position
  currentCameraPosition.x += (targetCameraPosition.x - currentCameraPosition.x) * cameraSmoothFactor
  currentCameraPosition.y += (targetCameraPosition.y - currentCameraPosition.y) * cameraSmoothFactor
  currentCameraPosition.z += (targetCameraPosition.z - currentCameraPosition.z) * cameraSmoothFactor
  
  // Apply smoothed position
  camera.position.set(currentCameraPosition.x, currentCameraPosition.y, currentCameraPosition.z)
  camera.lookAt(px, 0.7, pz)
}

// Switch animation/model with blending
function switchModel(key: string) {
  if (!scene || !loadedModels[key]) return
  if (playerModel) scene.remove(playerModel)
  playerModel = loadedModels[key].scene
  centerAndScaleModel(playerModel, 2)
  playerModel.position.set(playerPosition.value.x, 0.7, playerPosition.value.z)
  playerModel.rotation.y = playerRotation
  scene.add(playerModel)
  playerMixer = new THREE.AnimationMixer(playerModel)
  if (loadedModels[key].animations.length > 0) {
    const newAction = playerMixer.clipAction(loadedModels[key].animations[0])
    if (playerAction && playerAction !== newAction) {
      playerAction.crossFadeTo(newAction, 0.25, false)
      newAction.reset().play()
    } else {
      newAction.reset().play()
    }
    playerAction = newAction
  }
  currentModelKey = key
  updateCameraTPS()
  updatePlayerOutline()
}

// Movement logic (define this function!)
function updatePlayerPosition() {
  const speed = 0.12
  const now = Date.now()
  const dt = Math.min((now - lastMoveTime) / 16, 2)
  lastMoveTime = now
  if (isMoving() && camera) {
    // Camera-relative movement
    // Get camera's forward and right vectors (XZ plane)
    const camDir = new THREE.Vector3()
    camera.getWorldDirection(camDir)
    camDir.y = 0; camDir.normalize()
    const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize()
    // Movement vector
    let moveVec = new THREE.Vector3()
    moveVec.addScaledVector(camDir, moveDirection.z)
    moveVec.addScaledVector(camRight, moveDirection.x)
    if (moveVec.lengthSq() > 0) moveVec.normalize()
    // Predict next position
    const nextX = playerPosition.value.x + moveVec.x * speed * dt
    const nextZ = playerPosition.value.z + moveVec.z * speed * dt
    // Collision detection
    let canMove = true
    const playerRadius = 0.45
    const nextPos = new THREE.Vector3(nextX, 0.7, nextZ)
    for (const obj of terrainObjects) {
      if (obj.userData.collidable) {
        const box = new THREE.Box3().setFromObject(obj)
        if (box.distanceToPoint(nextPos) < playerRadius) {
          canMove = false
          break
        }
      }
    }
    if (canMove) {
      playerPosition.value = { x: nextX, z: nextZ }
    }
    // Handle life drain outside safe zone
    handleLifeDrain()
    // Face movement direction
    if (moveVec.lengthSq() > 0) playerRotation = Math.atan2(moveVec.x, moveVec.z)
    if (playerModel) {
      playerModel.position.set(playerPosition.value.x, 0.7, playerPosition.value.z)
      playerModel.rotation.y = playerRotation
    }
    updateCameraTPS()
  }
}

// Start action animation (attack/defend)
function startAction(key: string) {
  if (!scene || !loadedModels[key]) return
  if (playerModel) scene.remove(playerModel)
  playerModel = loadedModels[key].scene
  centerAndScaleModel(playerModel, 2)
  playerModel.position.set(playerPosition.value.x, 0.7, playerPosition.value.z)
  playerModel.rotation.y = playerRotation
  scene.add(playerModel)
  playerMixer = new THREE.AnimationMixer(playerModel)
  if (loadedModels[key].animations.length > 0) {
    const newAction = playerMixer.clipAction(loadedModels[key].animations[0])
    newAction.setLoop(THREE.LoopRepeat, Infinity) // Loop infinitely
    newAction.reset().play()
    playerAction = newAction
  }
  currentModelKey = key
  currentAction = key
  // Show shield for defend
  if (key === 'defend') {
    toggleHexShield(true)
    disableAttackOutline()
    // Start defend drain
    if (!defendDrainInterval) {
      defendDrainInterval = setInterval(() => {
        if (currentAction === 'defend' && !gameEnded.value) {
          playerHealth.value = Math.max(0, playerHealth.value - 1)
          if (playerHealth.value <= 0) {
            endGame(false, 'You exhausted yourself defending!')
          }
        }
      }, 500)
    }
  } else if (key === 'attack') {
    enableAttackOutline()
    toggleHexShield(false)
  } else {
    disableAttackOutline()
    toggleHexShield(false)
  }
  updateCameraTPS()
  updatePlayerOutline()
}

// Stop action animation and revert to idle/move
function stopAction() {
  currentAction = ''
  actionKeyHeld = false
  // Hide shield and outline
  toggleHexShield(false)
  shieldActive.value = false
  disableAttackOutline()
  // Stop defend drain
  if (defendDrainInterval) {
    clearInterval(defendDrainInterval)
    defendDrainInterval = null
  }
  if (isMoving()) {
    switchModel('move')
  } else {
    switchModel('idle')
  }
  updatePlayerOutline()
}

// Helper: get glow color from character
function getGlowColor() {
  if (props.character && props.character.glowColor) {
    return props.character.glowColor
  }
  return '#2196f3'
}

// --- Keyboard controls ---
const handleKeydown = (event: KeyboardEvent) => {
  if (gameEnded.value) return
  const key = event.key.toLowerCase()
  if (keysDown.has(key)) return // Prevent repeat
  keysDown.add(key)
  let moved = false
  switch (key) {
    case 'j':
      if (!glowOrbActive) {
        useAttack()
        playAttackSound()
      }
      break
    case 'k':
      if (!glowOrbActive) {
        actionKeyHeld = true
        useShield()
      }
      break
    case 'g':
    case ' ':
      if (!shieldActive.value && !currentAction) {
        useGlowOrb()
        playGlowOrbSound()
      }
      break
    case 'w':
    case 'arrowup':
    case 's':
    case 'arrowdown':
    case 'a':
    case 'arrowleft':
    case 'd':
    case 'arrowright':
      updateMoveDirection()
      if (isMoving() && !actionKeyHeld && !glowOrbActive) {
        switchModel('move')
        playFootstepsSound()
      }
      moved = true
      break
  }
  if (moved) lastMoveTime = Date.now()
}

const handleKeyup = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase()
  keysDown.delete(key)
  switch (key) {
    case 'j':
      stopAction()
      break
    case 'k':
      actionKeyHeld = false
      stopAction()
      break
    default:
      updateMoveDirection()
      if (!isMoving() && !actionKeyHeld && !glowOrbActive) switchModel('idle')
      break
  }
}

function isMoving() {
  return moveDirection.x !== 0 || moveDirection.z !== 0
}

function updateMoveDirection() {
  // WASD/arrow keys: camera-relative movement
  let x = 0, z = 0
  if (keysDown.has('w') || keysDown.has('arrowup')) z -= 1
  if (keysDown.has('s') || keysDown.has('arrowdown')) z += 1
  if (keysDown.has('a') || keysDown.has('arrowleft')) x -= 1
  if (keysDown.has('d') || keysDown.has('arrowright')) x += 1
  // Normalize
  const len = Math.sqrt(x * x + z * z)
  if (len > 0) {
    x /= len; z /= len
  }
  moveDirection.x = x
  moveDirection.z = z
}

// Check if player is in safe zone
function isInSafeZone(): boolean {
  const distance = Math.sqrt(playerPosition.value.x * playerPosition.value.x + playerPosition.value.z * playerPosition.value.z)
  return distance <= safeZoneRadius
}

// Handle life drain outside safe zone
function handleLifeDrain() {
  const wasInSafeZone = isOutsideSafeZone
  isOutsideSafeZone = !isInSafeZone()
  if (isOutsideSafeZone && !wasInSafeZone) {
    // Start life drain
    isLifeDepleting = true
    if (lifeDepletesSound) {
      lifeDepletesSound.currentTime = 0
      lifeDepletesSound.loop = true
      lifeDepletesSound.play()
    }
    lifeDrainInterval = setInterval(() => {
      if (!gameEnded.value && isOutsideSafeZone) {
        playerHealth.value = Math.max(0, playerHealth.value - 2)
        if (playerHealth.value <= 0) {
          endGame(false, 'The darkness consumed you beyond the safe zone!')
        }
      }
    }, 1000) // Drain 2 HP every second
  } else if (!isOutsideSafeZone && wasInSafeZone) {
    // Stop life drain
    isLifeDepleting = false
    if (lifeDepletesSound) lifeDepletesSound.pause()
    if (lifeDrainInterval) {
      clearInterval(lifeDrainInterval)
      lifeDrainInterval = null
    }
  }
}

// ENVIRONMENT TOGGLE
const isEnvironmentEnabled = (import.meta.env.VITE_ENVIRONMENT !== undefined)
  ? import.meta.env.VITE_ENVIRONMENT === 'true'
  : (typeof process !== 'undefined' && process.env.environment === 'true')

// Create ruined kingdom terrain
function createRuinedKingdomTerrain() {
  if (!scene) return
  
  // Ground texture (stone/cobblestone-like)
  const groundGeometry = new THREE.PlaneGeometry(terrainSize * 2, terrainSize * 2)
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a2a,
    roughness: 0.9,
    metalness: 0.1
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.5
  scene.add(ground)
  
  // Safe zone boundary (ethereal barrier)
  const boundaryGeometry = new THREE.CylinderGeometry(safeZoneRadius, safeZoneRadius, 8, 32)
  const boundaryMaterial = new THREE.MeshBasicMaterial({
    color: 0x4a90e2,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide
  })
  const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial)
  boundary.position.y = 4
  scene.add(boundary)
  
  if (!isEnvironmentEnabled) {
    console.log('[DEBUG] Environment is disabled, skipping obstacles/ruins/bushes')
    return
  }
  
  // Add ruined building blocks
  for (let i = 0; i < 12; i++) {
    const ruin = createRuinBlock()
    ruin.userData.collidable = true
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * (safeZoneRadius - 3) + 3
    ruin.position.x = Math.cos(angle) * distance
    ruin.position.z = Math.sin(angle) * distance
    ruin.position.y = 0
    ruin.rotation.y = Math.random() * Math.PI * 2
    scene.add(ruin)
    terrainObjects.push(ruin)
  }
  
  // Add scattered bushes (reduced count)
  for (let i = 0; i < 8; i++) {
    const bush = createBush()
    bush.userData.collidable = false
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * (safeZoneRadius - 1) + 1
    bush.position.x = Math.cos(angle) * distance
    bush.position.z = Math.sin(angle) * distance
    bush.position.y = 0
    scene.add(bush)
    terrainObjects.push(bush)
  }
  
  // Add broken pillars
  for (let i = 0; i < 8; i++) {
    const pillar = createBrokenPillar()
    pillar.userData.collidable = true
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * (safeZoneRadius - 2) + 2
    pillar.position.x = Math.cos(angle) * distance
    pillar.position.z = Math.sin(angle) * distance
    pillar.position.y = 0
    pillar.rotation.y = Math.random() * Math.PI * 2
    scene.add(pillar)
    terrainObjects.push(pillar)
  }
  
  // Add scattered debris
  for (let i = 0; i < 8; i++) {
    const debris = createDebris()
    debris.userData.collidable = true
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * (safeZoneRadius - 1) + 1
    debris.position.x = Math.cos(angle) * distance
    debris.position.z = Math.sin(angle) * distance
    debris.position.y = 0
    debris.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )
    scene.add(debris)
    terrainObjects.push(debris)
  }
  
  // Add extra ruins outside the safe zone (reduced to 5)
  for (let i = 0; i < 5; i++) {
    const ruin = createRuinBlock()
    ruin.userData.collidable = true
    const angle = Math.random() * Math.PI * 2
    const minDist = safeZoneRadius + 3
    const maxDist = safeZoneRadius + 15
    const distance = Math.random() * (maxDist - minDist) + minDist
    ruin.position.x = Math.cos(angle) * distance
    ruin.position.z = Math.sin(angle) * distance
    ruin.position.y = 0
    ruin.rotation.y = Math.random() * Math.PI * 2
    scene.add(ruin)
    // Not added to terrainObjects (no collision needed outside)
  }
}

// Create a ruin block
function createRuinBlock() {
  const ruinGroup = new THREE.Group()
  
  // Main block
  const blockGeometry = new THREE.BoxGeometry(2, Math.random() * 2 + 1, 2)
  const blockMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x696969,
    roughness: 0.8
  })
  const block = new THREE.Mesh(blockGeometry, blockMaterial)
  block.position.y = block.geometry.parameters.height / 2
  ruinGroup.add(block)
  
  // Add some smaller broken pieces
  for (let i = 0; i < 3; i++) {
    const pieceGeometry = new THREE.BoxGeometry(
      Math.random() * 0.8 + 0.2,
      Math.random() * 0.5 + 0.2,
      Math.random() * 0.8 + 0.2
    )
    const piece = new THREE.Mesh(pieceGeometry, blockMaterial)
    piece.position.set(
      (Math.random() - 0.5) * 3,
      Math.random() * 0.5,
      (Math.random() - 0.5) * 3
    )
    ruinGroup.add(piece)
  }
  
  return ruinGroup
}

// Create a broken pillar
function createBrokenPillar() {
  const pillarGroup = new THREE.Group()
  
  // Base
  const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.5, 8)
  const stoneMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B7355,
    roughness: 0.7
  })
  const base = new THREE.Mesh(baseGeometry, stoneMaterial)
  base.position.y = 0.25
  pillarGroup.add(base)
  
  // Main pillar (broken)
  const pillarHeight = Math.random() * 2 + 1
  const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.4, pillarHeight, 8)
  const pillar = new THREE.Mesh(pillarGeometry, stoneMaterial)
  pillar.position.y = pillarHeight / 2 + 0.5
  pillarGroup.add(pillar)
  
  // Broken top piece
  const topGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 8)
  const top = new THREE.Mesh(topGeometry, stoneMaterial)
  top.position.y = pillarHeight + 0.65
  top.rotation.z = Math.random() * 0.5
  pillarGroup.add(top)
  
  return pillarGroup
}

// Create debris
function createDebris() {
  const debrisGeometry = new THREE.DodecahedronGeometry(0.3, 0)
  const debrisMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B5C2A, // earthy brown
    roughness: 0.9
  })
  const debris = new THREE.Mesh(debrisGeometry, debrisMaterial)
  debris.position.y = 0.15
  return debris
}

// Create a bush
function createBush() {
  const bushGeometry = new THREE.SphereGeometry(0.8, 6, 6)
  const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x184d27, roughness: 0.8 })
  const bush = new THREE.Mesh(bushGeometry, bushMaterial)
  bush.position.y = 0.8
  return bush
}

// --- Hex shield and glow orb meshes ---
let hexShield: THREE.Mesh | null = null
let glowOrb: THREE.Mesh | null = null
let glowOrbActive = false
let glowOrbTimeout: NodeJS.Timeout | null = null

// Create hex shield (defend)
function createHexShield() {
  if (hexShield) return
  const hexShape = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const x = Math.cos(angle)
    const y = Math.sin(angle)
    if (i === 0) hexShape.moveTo(x, y)
    else hexShape.lineTo(x, y)
  }
  hexShape.closePath()
  const extrudeSettings = { depth: 0.1, bevelEnabled: false }
  const geometry = new THREE.ExtrudeGeometry(hexShape, extrudeSettings)
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
    metalness: 0.3,
    roughness: 0.2,
    transmission: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  })
  hexShield = new THREE.Mesh(geometry, material)
  hexShield.visible = false
  hexShield.renderOrder = 1001
  scene!.add(hexShield)
}

// Create glow orb (special move)
function createGlowOrb() {
  if (glowOrb) return
  const geometry = new THREE.SphereGeometry(1.3, 32, 32)
  const color = getGlowOrbColor()
  const material = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: 0.45,
    metalness: 0.7,
    roughness: 0.1,
    transmission: 0.7,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.7,
  })
  glowOrb = new THREE.Mesh(geometry, material)
  glowOrb.visible = false
  glowOrb.renderOrder = 1002
  scene!.add(glowOrb)
}

function getGlowOrbColor() {
  if (props.character && props.character.glowColor) {
    return props.character.glowColor
  }
  return '#fffbe6'
}

function showGlowOrb() {
  if (!glowOrb || !playerModel) return
  glowOrb.visible = true
  glowOrbActive = true
  // Position orb at player
  glowOrb.position.copy(playerModel.position)
  glowOrb.position.y += 1.1
}

function hideGlowOrb() {
  if (!glowOrb) return
  glowOrb.visible = false
  glowOrbActive = false
}

function useGlowOrb() {
  if (mana.value < 2) {
    showManaWarning('Not enough mana for Glow Orb!')
    return
  }
  mana.value -= 2
  showGlowOrb()
  // Only one skill at a time
  stopAction()
  // Check for hit (simple distance check)
  setTimeout(() => {
    // Use synced positions for hit detection
    const orbPos = { x: playerPosition.value.x, z: playerPosition.value.z, y: 1.1 }
    const oppPos = { x: opponentPosition.value.x, z: opponentPosition.value.z, y: 1.1 }
    const dist = Math.sqrt(
      Math.pow(orbPos.x - oppPos.x, 2) +
      Math.pow(orbPos.y - oppPos.y, 2) +
      Math.pow(orbPos.z - oppPos.z, 2)
    )
    if (dist < 2.2) { // hit threshold
      if (socket.value && socket.value.connected) {
        console.log('[DEBUG] Emitting deal_damage', { amount: 10 })
        socket.value.emit('deal_damage', { amount: 10 })
      }
    }
    hideGlowOrb()
  }, 400)
}

// Show/hide hex shield in front of player
function toggleHexShield(show: boolean) {
  if (!hexShield || !playerModel) return
  hexShield.visible = show
  if (show) {
    // Position in front of player
    const dist = 1.2
    const angle = playerRotation
    hexShield.position.copy(playerModel.position)
    hexShield.position.x += Math.sin(angle) * dist
    hexShield.position.z += Math.cos(angle) * dist
    hexShield.position.y += 1.1
    hexShield.rotation.set(0, angle, 0)
  }
}

// Update useShield to also cost mana per tick
function useShield() {
  if (shieldActive.value) return
  if (mana.value < 1) {
    showManaWarning('Not enough mana for Shield!')
    return
  }
  startAction('defend')
  shieldActive.value = true
  toggleHexShield(true)
  // Start mana/health drain interval
  if (!defendDrainInterval) {
    defendDrainInterval = setInterval(() => {
      if (currentAction === 'defend' && !gameEnded.value && shieldActive.value) {
        if (mana.value < 1) {
          showManaWarning('Mana depleted!')
          stopAction()
          return
        }
        playerHealth.value = Math.max(0, playerHealth.value - 1)
        mana.value = Math.max(0, mana.value - 1)
        if (playerHealth.value <= 0) {
          endGame(false, 'You exhausted yourself defending!')
        }
      }
    }, 500)
  }
}

function useAttack() {
  startAction('attack')
  if (character3DRef.value && character3DRef.value.triggerAttackEffect) {
    character3DRef.value.triggerAttackEffect()
  }
  // Check for melee hit using synced positions
  const dist = Math.sqrt(
    Math.pow(playerPosition.value.x - opponentPosition.value.x, 2) +
    Math.pow(playerPosition.value.z - opponentPosition.value.z, 2)
  )
  if (dist < 2.2) { // melee range
    if (socket.value && socket.value.connected) {
      console.log('[DEBUG] Emitting deal_damage', { amount: 5 })
      socket.value.emit('deal_damage', { amount: 5 })
    }
  }
}

// Three.js setup
async function initThree() {
  if (!threeContainer.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#1a1a2e') // Dark evening sky
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = !settings.value.performance
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.width = settings.value.performance ? 512 : 1024
  renderer.shadowMap.height = settings.value.performance ? 512 : 1024
  threeContainer.value.appendChild(renderer.domElement)

  // General uplighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcfcfcf, 2.2 * 0.65)
  hemiLight.position.set(0, 20, 0)
  scene.add(hemiLight)

  // Ambient light (darker)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5 * 0.65)
  scene.add(ambientLight)

  // Main directional light (white, strong, but dimmer)
  const dirLight = new THREE.DirectionalLight(0xffffff, 2.5 * 0.65)
  dirLight.position.set(-15, 25, -10)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 2048
  dirLight.shadow.mapSize.height = 2048
  dirLight.shadow.camera.near = 0.5
  dirLight.shadow.camera.far = 50
  dirLight.shadow.camera.left = -20
  dirLight.shadow.camera.right = 20
  dirLight.shadow.camera.top = 20
  dirLight.shadow.camera.bottom = -20
  scene.add(dirLight)

  // Fill directional light (opposite side, softer, but dimmer)
  const fillLight = new THREE.DirectionalLight(0xffffff, 1.2 * 0.65)
  fillLight.position.set(15, 10, 15)
  scene.add(fillLight)

  scene.fog = new THREE.Fog(0x1a1a2e, 40, 90)

  // Ensure terrain is created before loading models
  createRuinedKingdomTerrain();

  // Add opponent model (multiplayer)
  await loadOpponentModel()

  // Load models
  await preloadAllModels();
  switchModel('idle');

  // Audio setup
  bgm = new Audio('/sounds/arena_track.wav')
  bgm.loop = true
  bgm.volume = 0.5
  attackSound = new Audio('/sounds/attack.wav')
  defendSound = new Audio('/sounds/defend.wav')
  lifeDepletesSound = new Audio('/sounds/life_depletes.wav')

  // Play background music
  bgm.play()

  // Postprocessing: Bloom (disable in performance mode)
  composer = new EffectComposer(renderer)
  renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)
  if (!settings.value.performance) {
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2, // strength
      0.4, // radius
      0.1 // threshold
    )
    composer.addPass(bloomPass)
    // OutlinePass for player glow
    outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera
    )
    outlinePass.edgeStrength = 8.0
    outlinePass.edgeGlow = 1.0
    outlinePass.edgeThickness = 2.0
    outlinePass.visibleEdgeColor.set(getGlowColor())
    outlinePass.hiddenEdgeColor.set('#000000')
    composer.addPass(outlinePass)
  } else {
    outlinePass = null
    bloomPass = null
  }

  // Create hex shield
  createHexShield()
  createGlowOrb()

  // Render loop
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    if (playerMixer) playerMixer.update(1/60)
    updatePlayerPosition()
    animateHexShield()
    animateGlowOrb()
    updatePlayerOutline()
    // Update opponent model position
    if (opponentModel) {
      opponentModel.position.set(opponentPosition.value.x, 0.7, opponentPosition.value.z)
      // Animate opponent model
      if (opponentMixer) opponentMixer.update(1/60)
      // Update health bar above head
      updateOpponentHealthBar()
    }
    if (composer) {
      composer.render()
    } else {
      renderer!.render(scene!, camera!)
    }
  }
  animate()
}

function fadeInArenaTrack() {
  if (!arenaBgm) {
    arenaBgm = new Audio('/sounds/arena_track.wav')
    arenaBgm.loop = true
    arenaBgm.volume = 0
  }
  arenaBgm.play()
  let start = Date.now()
  function step() {
    if (!arenaBgm) return
    let elapsed = Date.now() - start
    let t = Math.min(1, elapsed / fadeDuration)
    arenaBgm.volume = 0.5 * t
    if (t < 1) requestAnimationFrame(step)
  }
  step()
}

function fadeOutArenaTrack() {
  if (!arenaBgm) return
  let startVol = arenaBgm.volume
  let start = Date.now()
  function step() {
    if (!arenaBgm) return
    let elapsed = Date.now() - start
    let t = Math.min(1, elapsed / fadeDuration)
    arenaBgm.volume = startVol * (1 - t)
    if (t < 1) {
      requestAnimationFrame(step)
    } else {
      arenaBgm.pause()
      arenaBgm.currentTime = 0
    }
  }
  step()
}

// Multiplayer state
const socket = ref<any>(props.socket || null)
const opponentPosition = ref({ x: 3, z: 0 })
const opponentHealth = ref(100)
const opponentDisconnected = ref(false)
let opponentModel: THREE.Object3D | null = null
let opponentMixer: THREE.AnimationMixer | null = null

// Multiplayer: connect and sync state
onMounted(() => {
  console.log('[DEBUG] ENVIRONMENT ENABLED:', isEnvironmentEnabled)
  console.log('[DEBUG] PROPS opponentId:', props.opponentId, 'yourId:', props.yourId)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('keyup', handleKeyup)
  setTimeout(() => {
    initThree()
  }, 100)
  // Fade out game track and fade in arena track
  if (typeof window !== 'undefined') {
    if (window.__fadeOutGameTrack) window.__fadeOutGameTrack()
    if (window.__arenaBgm && typeof window.__arenaBgm.pause === 'function') window.__arenaBgm.pause()
  }
  fadeInArenaTrack()
  if (typeof window !== 'undefined') window.__arenaBgm = arenaBgm

  // --- TIMER LOGIC ---
  startTime = Date.now()
  gameLoop = setInterval(() => {
    if (gameEnded.value) return
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    timeRemaining.value = Math.max(0, 60 - elapsed)
    gameDuration.value = elapsed
    if (timeRemaining.value <= 0) {
      if (playerHealth.value > 0) {
        // Notify the server that you survived, but do NOT set gameEnded/gameResult here
        if (socket.value && socket.value.connected) {
          socket.value.emit('game_end', { survived: true });
        }
      } else {
        endGame(false, 'You were defeated before time ran out!')
      }
    }
  }, 1000)

  // --- Mana regen ---
  const manaRegenInterval = 1200 // ms
  let manaRegenTimer: NodeJS.Timeout | null = null
  manaRegenTimer = setInterval(() => {
    if (mana.value < maxMana) mana.value++
  }, manaRegenInterval)

  if (props.opponentId && props.yourId && socket.value) {
    socket.value.on('connect', () => {
      console.log('[DEBUG] Socket connected:', socket.value?.id)
    })
    socket.value.on('opponent_state', (data: any) => {
      console.log('[DEBUG] Received opponent_state', data)
      if (typeof data.x === 'number' && typeof data.z === 'number') {
        opponentPosition.value = { x: data.x, z: data.z } // REASSIGN for reactivity!
      }
      if (typeof data.health === 'number') {
        opponentHealth.value = data.health
      }
    })
    socket.value.on('opponent_disconnected', () => {
      opponentDisconnected.value = true
    })
    socket.value.on('opponent_game_end', (result: any) => {
      if (!gameEnded.value) {
        // Check if this is an early defeat notification
        if (result.earlyDefeat) {
          console.log('[DEBUG] Received early defeat notification, showing early victory popup');
          // Show early victory popup for the winner
          showEarlyVictoryPopup.value = true;
          earlyVictoryTime.value = result.countdownTime;
          earlyVictoryCountdown.value = result.countdownTime;
          
          // Start countdown interval
          earlyVictoryInterval = setInterval(() => {
            if (earlyVictoryCountdown.value && earlyVictoryCountdown.value > 0) {
              earlyVictoryCountdown.value--;
            } else {
              // Countdown finished, end the game
              clearInterval(earlyVictoryInterval!);
              earlyVictoryInterval = null;
              showEarlyVictoryPopup.value = false;
              gameEnded.value = true;
              gameResult.value = { won: true, message: 'You defeated your opponent!' };
            }
          }, 1000);
        } else {
          // Normal game end
          gameEnded.value = true;
          gameResult.value = { won: result.won, message: result.message };
        }
      }
    })
  }
  if (socket.value) {
    socket.value.on('battle_resolved', (result: any) => {
      gameEnded.value = true;
      gameResult.value = { won: result.won, message: result.message };
    });
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('keyup', handleKeyup)
  if (animationId) cancelAnimationFrame(animationId)
  if (lifeDrainInterval) clearInterval(lifeDrainInterval)
  if (gameLoop) clearInterval(gameLoop)
  if (earlyVictoryInterval) clearInterval(earlyVictoryInterval)
  if (renderer && renderer.domElement && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }
  renderer = null; scene = null; camera = null
  if (bgm) { bgm.pause(); bgm = null }
  if (attackSound) { attackSound.pause(); attackSound = null }
  if (defendSound) { defendSound.pause(); defendSound = null }
  if (lifeDepletesSound) { lifeDepletesSound.pause(); lifeDepletesSound = null }
  // Fade out arena track and fade in game track
  fadeOutArenaTrack()
  if (typeof window !== 'undefined') {
    if (window.__arenaBgm && typeof window.__arenaBgm.pause === 'function') window.__arenaBgm.pause()
    window.__arenaBgm = null
    if (window.__fadeInGameTrack) window.__fadeInGameTrack()
  }
  if (glowOrbTimeout) clearTimeout(glowOrbTimeout)
  if (glowOrb) { scene?.remove(glowOrb); glowOrb = null }
  // Do NOT disconnect the socket here; it is managed by the parent
  if (opponentModel) {
    scene?.remove(opponentModel)
    opponentModel = null
    opponentMixer = null
  }
  if (opponentHealthBarDiv) {
    document.body.removeChild(opponentHealthBarDiv)
    opponentHealthBarDiv = null
  }
})

// Timer/game logic (unchanged)
let gameLoop: NodeJS.Timeout | null = null
let startTime: number = 0
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
const startTutorial = () => {}
const startGame = () => {}
const endGame = (won: boolean, message: string, tie?: boolean) => {
  console.log('[DEBUG] endGame called. won:', won, 'message:', message, 'tie:', tie)
  
  // If this is an early victory (opponent died before deadline), start countdown
  if (won && timeRemaining.value > 0) {
    console.log('[DEBUG] Early victory detected, starting countdown to battle deadline')
    showEarlyVictoryPopup.value = true
    earlyVictoryTime.value = timeRemaining.value
    earlyVictoryCountdown.value = timeRemaining.value
    
    // Start countdown interval
    earlyVictoryInterval = setInterval(() => {
      if (earlyVictoryCountdown.value && earlyVictoryCountdown.value > 0) {
        earlyVictoryCountdown.value--
      } else {
        // Countdown finished, now we can safely call resolve_battle
        clearInterval(earlyVictoryInterval!)
        earlyVictoryInterval = null
        showEarlyVictoryPopup.value = false
        completeGameEnd(won, message, tie)
      }
    }, 1000)
    
    // Notify opponent of early defeat
    if (socket.value && socket.value.connected) {
      socket.value.emit('game_end', { 
        won: false, 
        message: 'You were defeated early!',
        earlyDefeat: true,
        countdownTime: timeRemaining.value
      })
    }
  } else {
    // Normal game end (time expired or both players died)
    completeGameEnd(won, message, tie)
  }
}

const completeGameEnd = (won: boolean, message: string, tie?: boolean) => {
  console.log('[DEBUG] completeGameEnd called. won:', won, 'message:', message, 'tie:', tie)
  gameEnded.value = true
  gameResult.value = { won, message }
  
  // Notify opponent (only if not already notified for early defeat)
  if (socket.value && socket.value.connected && !showEarlyVictoryPopup.value) {
    socket.value.emit('game_end', { 
      won: !won, 
      message: won ? 'You were defeated!' : 'You defeated your opponent!',
      tie: tie // Include tie flag
    })
  }
}

const exitGame = () => {
  emit('game-ended', gameResult.value)
}

// Add debug logs for scene/model
if (!scene) console.warn('Arena scene not initialized!')
if (!playerModel) console.warn('Player model not loaded!')

function getAttackGlowColor() {
  if (props.character && props.character.attackGlowColor) {
    return props.character.attackGlowColor
  }
  return '#fff700'
}

function enableAttackOutline() {
  if (!composer || !outlinePass || !playerModel) return
  outlinePass.selectedObjects = [playerModel]
  outlinePass.visibleEdgeColor.set(getAttackGlowColor())
  outlinePass.edgeStrength = 8.0
  outlinePass.edgeGlow = 1.0
  outlinePass.edgeThickness = 2.0
  outlinePass.pulsePeriod = 0
  outlinePass.usePatternTexture = false
}

function disableAttackOutline() {
  if (!composer || !outlinePass) return
  outlinePass.selectedObjects = []
}

// Watch settings for sound/performance changes
watch(() => settings.value.sound, (val) => {
  // Mute/unmute all audio
  [bgm, attackSound, defendSound, lifeDepletesSound, arenaBgm].forEach(a => { if (a) a.muted = !val })
})
watch(() => settings.value.performance, (val) => {
  // Reload scene with new settings
  if (threeContainer.value && threeContainer.value.firstChild) {
    threeContainer.value.removeChild(threeContainer.value.firstChild)
  }
  initThree()
})

// --- Persistent player glow/outline ---
function updatePlayerOutline() {
  if (!composer || !outlinePass || !playerModel) return
  // Always outline the player
  outlinePass.selectedObjects = [playerModel]
  if (currentAction === 'attack') {
    outlinePass.visibleEdgeColor.set(getAttackGlowColor())
  } else {
    outlinePass.visibleEdgeColor.set(getGlowColor())
  }
  outlinePass.edgeStrength = 8.0
  outlinePass.edgeGlow = 1.0
  outlinePass.edgeThickness = 2.0
  outlinePass.pulsePeriod = 0
  outlinePass.usePatternTexture = false
}

watch(playerHealth, (val) => {
  console.log('[DEBUG] playerHealth changed:', val, 'gameEnded:', gameEnded.value)
  if (val <= 0 && !gameEnded.value) {
    console.log('[DEBUG] Triggering endGame from watcher')
    
    // Check if opponent also has 0 health (tie scenario)
    if (opponentHealth.value <= 0) {
      console.log('[DEBUG] Tie detected - both players have 0 health')
      endGame(false, 'Both players fell simultaneously!', true) // true = tie flag
    } else {
    endGame(false, 'You were defeated!')
    }
  }
})

// --- Skill logic ---
function triggerHexShieldEffect() {
  // Show silver/white semi-transparent hexagon in front of player for 1.2s
  // ... implement effect ...
}

// In animation loop, animate hex shield if visible (optional slight shimmer)
function animateHexShield() {
  if (!hexShield || !hexShield.visible) return
  const time = Date.now() * 0.003
  const pulse = 1.0 + Math.sin(time * 3) * 0.04
  hexShield.scale.set(pulse, pulse, pulse)
  if (hexShield.material) {
    hexShield.material.opacity = 0.45 + Math.sin(time * 2.5) * 0.08
  }
}

// Animate glow orb in render loop
function animateGlowOrb() {
  if (!glowOrb || !glowOrb.visible || !playerModel) return
  // Follow player
  glowOrb.position.copy(playerModel.position)
  glowOrb.position.y += 1.1
  // Animate pulse
  const time = Date.now() * 0.003
  const pulse = 1.0 + Math.sin(time * 2.5) * 0.08
  glowOrb.scale.set(pulse, pulse, pulse)
  if (glowOrb.material) {
    glowOrb.material.opacity = 0.45 + Math.sin(time * 2.5) * 0.08
    if (glowOrb.material.emissiveIntensity !== undefined) {
      glowOrb.material.emissiveIntensity = 0.7 + Math.sin(time * 2.5) * 0.2
    }
  }
}

// Add at the top with other refs
const character3DRef = ref()

// --- Single-player state (top-level, available to template and all logic) ---
const mana = ref(10)
const maxMana = 10
const opponentShielded = ref(false)
const shieldActive = ref(false)

const manaWarning = ref('')
function showManaWarning(msg: string) {
  manaWarning.value = msg
  setTimeout(() => { manaWarning.value = '' }, 1200)
}

// Emit player state on movement/health change (deep watch)
watch(
  () => [playerPosition.value.x, playerPosition.value.z, playerHealth.value],
  ([x, z, health]) => {
    console.log('[DEBUG] Watcher fired:', x, z, health)
    if (socket.value && socket.value.connected) {
      console.log('[DEBUG] Emitting player_state', { x, z, health })
      socket.value.emit('player_state', { x, z, health })
    }
  }
)

const showVersus = ref(true)
// Set opponent character name from props
const opponentCharacterName = ref(props.opponentCharacterName || 'Opponent')
onMounted(() => {
  showVersus.value = true
  setTimeout(() => {
    showVersus.value = false
  }, 3000)
})

async function loadOpponentModel() {
  // For now, use a placeholder character (e.g., 'Nyx')
  const charName = opponentCharacterName.value || 'Nyx'
  const charNameLower = charName.toLowerCase()
  const loader = new GLTFLoader()
  try {
    const gltf = await loader.loadAsync(`/models/${charName}/${charNameLower}_idle.glb`)
    opponentModel = gltf.scene
    centerAndScaleModel(opponentModel, 2)
    opponentModel.position.set(opponentPosition.value.x, 0.7, opponentPosition.value.z)
    scene?.add(opponentModel)
    opponentMixer = new THREE.AnimationMixer(opponentModel)
    if (gltf.animations.length > 0) {
      const action = opponentMixer.clipAction(gltf.animations[0])
      action.play()
    }
  } catch (e) {
    console.warn('Failed to load opponent model:', e)
  }
}

// --- Opponent health bar ---
let opponentHealthBarDiv: HTMLDivElement | null = null
function updateOpponentHealthBar() {
  if (!opponentModel || !camera) return
  if (!opponentHealthBarDiv) {
    opponentHealthBarDiv = document.createElement('div')
    opponentHealthBarDiv.className = 'opponent-health-bar'
    document.body.appendChild(opponentHealthBarDiv)
  }
  // Project 3D position to 2D screen
  const pos = opponentModel.position.clone()
  pos.y += 2.2 // above head
  const vector = pos.project(camera)
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight
  opponentHealthBarDiv.style.position = 'absolute'
  opponentHealthBarDiv.style.left = `${x - 50}px`
  opponentHealthBarDiv.style.top = `${y - 18}px`
  opponentHealthBarDiv.style.width = '100px'
  opponentHealthBarDiv.style.height = '20px'
  opponentHealthBarDiv.style.pointerEvents = 'none'
  opponentHealthBarDiv.style.zIndex = '1000'
  opponentHealthBarDiv.innerHTML = `
    <div class='bar-bg' style='width:100%;height:8px;background:#222;border-radius:4px;overflow:hidden;'>
      <div class='bar-fill' style='width:${Math.max(0, Math.min(100, opponentHealth.value))}%;height:100%;background:linear-gradient(90deg,#ff3c3c,#ffb347);'></div>
    </div>
    <div class='bar-label' style='color:#fff;font-size:12px;text-align:center;'>${opponentHealth.value} HP</div>
  `
}

// Ensure health bar is removed on unmount
onUnmounted(() => {
  // ... existing code ...
  if (opponentHealthBarDiv) {
    document.body.removeChild(opponentHealthBarDiv)
    opponentHealthBarDiv = null
  }
})

// Listen for opponent's game end
if (typeof window !== 'undefined') {
  watch(socket, (s) => {
    if (s) {
      s.on('opponent_game_end', (result: any) => {
        if (!gameEnded.value) {
          // Check if this is an early defeat notification
          if (result.earlyDefeat) {
            console.log('[DEBUG] Received early defeat notification, showing early victory popup');
            // Show early victory popup for the winner
            showEarlyVictoryPopup.value = true;
            earlyVictoryTime.value = result.countdownTime;
            earlyVictoryCountdown.value = result.countdownTime;
            
            // Start countdown interval
            earlyVictoryInterval = setInterval(() => {
              if (earlyVictoryCountdown.value && earlyVictoryCountdown.value > 0) {
                earlyVictoryCountdown.value--;
              } else {
                // Countdown finished, end the game
                clearInterval(earlyVictoryInterval!);
                earlyVictoryInterval = null;
                showEarlyVictoryPopup.value = false;
                gameEnded.value = true;
                gameResult.value = { won: true, message: 'You defeated your opponent!' };
              }
            }, 1000);
          } else {
            // Normal game end
            gameEnded.value = true;
            gameResult.value = { won: result.won, message: result.message };
          }
        }
      })
    }
  }, { immediate: true })
}

// --- Multiplayer damage sync ---
// Listen for damage from opponent
if (typeof window !== 'undefined') {
  watch(socket, (s) => {
    if (s) {
      s.on('take_damage', (amount: number) => {
        console.log('[DEBUG] Received take_damage:', amount)
        playerHealth.value = Math.max(0, playerHealth.value - amount)
      })
    }
  }, { immediate: true })
}

const showLeaveModal = ref(false)
function onLeaveClick() {
  playClickSound()
  showLeaveModal.value = true
}
function confirmLeave() {
  playClickSound()
  if (socket.value && socket.value.connected) {
    socket.value.emit('forfeit')
  }
  endGame(false, 'You forfeited the match and lost your stake.')
  exitGame()
}

function onSettingsClick() {
  playClickSound()
  showSettings.value = true
}

function onCloseSettings() {
  playClickSound()
  showSettings.value = false
}

function onExitGame() {
  playClickSound()
  exitGame()
}

// Sound system
const { playAttackSound, playGlowOrbSound, playFootstepsSound, playClickSound } = useSound()

// Defensive: ensure stakeAmount is a number
function getStakeAmountNumber() {
  if (typeof props.stakeAmount === 'number') return props.stakeAmount;
  if (props.stakeAmount && typeof props.stakeAmount === 'object' && 'stakeAmount' in props.stakeAmount) {
    // Legacy/incorrect prop shape
    return Number(props.stakeAmount.stakeAmount) || 0;
  }
  if (typeof props.stakeAmount === 'string') return Number(props.stakeAmount) || 0;
  console.warn('[GameArena] stakeAmount prop is not a number:', props.stakeAmount);
  return 0;
}

const formattedStakeAmount = computed(() => {
  const amt = getStakeAmountNumber();
  if (amt > 1e6) {
    return (amt / 1e9).toFixed(3);
  }
  return amt.toString();
});

// Utility: Format lamports as GOR with commas and decimals
function formatGor(lamports: number): string {
  return (lamports / 1_000_000_000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' GOR';
}

// --- Win/Loss Modal Computed ---
const totalStake = computed(() => getStakeAmountNumber());
const winnerPayout = computed(() => totalStake.value * 2);
const loserLoss = computed(() => totalStake.value);

// Watch opponentHealth: end game if opponent reaches 0
watch(opponentHealth, (val) => {
  if (val <= 0 && !gameEnded.value) {
    // Don't call endGame here - let the opponent send the early defeat notification
    // The winner will see the early victory popup and countdown
    console.log('[DEBUG] Opponent health reached 0, waiting for their game_end notification');
  }
});
</script>

<style scoped>
.game-arena-immersive {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0; left: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  z-index: 1;
}
.three-canvas-immersive {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0; left: 0;
  z-index: 1;
}
.arena-ui-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.arena-ui-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  width: 100vw;
}
.arena-ui-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 2rem;
  width: 100vw;
}
.timer-container, .stake-display, .health-container, .controls-info {
  background: rgba(30, 32, 60, 0.7);
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(99,102,241,0.12);
  backdrop-filter: blur(8px);
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.timer {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  font-family: monospace;
}
.health-bar {
  width: 120px;
  height: 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
}
.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff4d4f, #f59e0b, #22c55e);
  transition: width 0.3s ease;
}
.health-text {
  font-size: 1rem;
  color: #fff;
  font-weight: 700;
  min-width: 60px;
}
.controls-info {
  gap: 1.5rem;
  background: rgba(30, 32, 60, 0.8);
  border-radius: 16px;
  padding: 1rem 2rem;
  box-shadow: 0 4px 32px rgba(99,102,241,0.18);
}
.control-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.control-key {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  font-family: monospace;
}
.control-desc {
  font-size: 0.95rem;
  color: #b3b3c6;
}
.settings-btn {
  background: rgba(30,32,60,0.8);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-left: 1rem;
}
.settings-modal {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.settings-content {
  background: #232347;
  border-radius: 18px;
  padding: 2rem 3rem;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 300px;
  align-items: flex-start;
}
.settings-content h2 {
  margin: 0 0 1rem 0;
  font-size: 1.4rem;
}
.settings-content label {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.settings-content button {
  margin-top: 1.5rem;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
}
.game-end-modal {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  background: rgba(10, 10, 30, 0.85);
  animation: fadeInBg 0.5s;
}
@keyframes fadeInBg {
  from { background: rgba(10,10,30,0); }
  to { background: rgba(10,10,30,0.85); }
}
.modal-flashy-bg {
  position: absolute;
  top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 1;
  pointer-events: none;
  opacity: 0.85;
  transition: background 0.5s;
}
.modal-flashy-bg.victory {
  background: radial-gradient(circle at 60% 40%, #fffbe6 0%, #ffd700 40%, #ffb300 80%, #a67c00 100%);
  box-shadow: 0 0 120px 60px #ffd70099;
  animation: goldPulse 2s infinite alternate;
}
@keyframes goldPulse {
  0% { filter: brightness(1) blur(0px); }
  100% { filter: brightness(1.2) blur(2px); }
}
.modal-flashy-bg.defeat {
  background: radial-gradient(circle at 60% 40%, #ffeaea 0%, #ff3b3b 60%, #7a0000 100%);
  box-shadow: 0 0 120px 60px #ff3b3b99;
  animation: redFlash 0.7s infinite alternate;
}
@keyframes redFlash {
  0% { filter: brightness(1) blur(0px); }
  100% { filter: brightness(1.1) blur(2px); }
}
.modal-content {
  position: relative;
  z-index: 2;
  background: rgba(30, 32, 60, 0.98);
  border-radius: 2rem;
  padding: 3.5rem 3.5rem 2.5rem 3.5rem;
  box-shadow: 0 8px 64px 0 #ffd70055, 0 2px 16px #0008;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 360px;
  animation: popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55);
  font-family: 'Cinzel', serif;
  border: 5px solid transparent;
}
.modal-content.victory {
  border-image: linear-gradient(120deg, #fffbe6 10%, #ffd700 40%, #ffb300 80%, #a67c00 100%) 1;
  box-shadow: 0 0 64px 0 #ffd700cc, 0 2px 16px #0008, 0 0 0 8px #fffbe622;
}
.modal-content.defeat {
  border-image: linear-gradient(120deg, #ffeaea 10%, #a67c00 30%, #7a0000 80%, #4b1c3c 100%) 1;
  box-shadow: 0 0 64px 0 #7a0000cc, 0 2px 16px #0008, 0 0 0 8px #4b1c3c22;
  animation: shake 0.5s;
}
.modal-crown {
  width: 72px;
  height: 48px;
  margin-bottom: 1.2rem;
  display: block;
}
.modal-crown.broken {
  filter: grayscale(0.7) brightness(0.7) drop-shadow(0 0 8px #7a0000);
  transform: rotate(-12deg) scale(1.1);
}
.modal-title {
  font-size: 2.7rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  margin-bottom: 0.5rem;
  text-align: center;
  color: #fffbe6;
  text-shadow: 0 2px 16px #ffd700cc, 0 1px 2px #000a;
  font-family: 'Cinzel', serif;
}
.modal-title .booyah {
  color: #ffd700;
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-shadow: 0 2px 24px #ffd700cc, 0 1px 2px #000a;
  animation: goldPulse 1.2s infinite alternate;
  font-family: 'Cinzel', serif;
}
.modal-title .defeat-shake {
  color: #ff3b3b;
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-shadow: 0 2px 24px #ff3b3bcc, 0 1px 2px #000a;
  animation: shake 0.7s infinite;
  font-family: 'Cinzel', serif;
}
.modal-message {
  font-size: 1.25rem;
  color: #fff;
  margin-bottom: 1.5rem;
  text-align: center;
  text-shadow: 0 1px 8px #000a;
  font-family: 'Cinzel', serif;
}
.modal-stats {
  width: 100%;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  color: #fffbe6;
  text-shadow: 0 1px 8px #000a;
}
.stat-label {
  font-weight: 700;
  color: #ffd700;
}
.stat-value {
  font-weight: 700;
  color: #fff;
}
.stat-value.text-green-400 {
  color: #22ff88;
  text-shadow: 0 1px 8px #000a, 0 0 8px #22ff88aa;
}
.stat-value.text-red-400 {
  color: #ff3b3b;
  text-shadow: 0 1px 8px #000a, 0 0 8px #ff3b3baa;
}
.modal-button {
  margin-top: 1rem;
  background: linear-gradient(90deg, #ffd700, #ffb300 60%, #fffbe6 100%);
  color: #232347;
  font-weight: 900;
  font-size: 1.2rem;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 2.5rem;
  box-shadow: 0 2px 16px #ffd70088;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.modal-button:hover {
  background: linear-gradient(90deg, #fffbe6, #ffd700 60%, #ffb300 100%);
  color: #a67c00;
}
.confetti {
  position: absolute;
  top: 0; left: 0; width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 10;
  animation: confettiBurst 1.5s;
  background: url('data:image/svg+xml;utf8,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="8" fill="%23ffd700"/><circle cx="80" cy="30" r="6" fill="%23ffb300"/><circle cx="50" cy="80" r="7" fill="%23fffbe6"/><rect x="60" y="60" width="8" height="8" fill="%23a67c00"/><rect x="30" y="70" width="6" height="6" fill="%23ffd700"/></svg>');
  background-size: 120px 120px;
  opacity: 0.85;
}
@keyframes confettiBurst {
  0% { opacity: 0; transform: scale(0.7) rotate(-10deg); }
  60% { opacity: 1; transform: scale(1.1) rotate(8deg); }
  100% { opacity: 0.85; transform: scale(1) rotate(0deg); }
}
.royal-sparkles {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 3;
  background: url('data:image/svg+xml;utf8,<svg width="120" height="60" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="2" fill="%23fffbe6"/><circle cx="60" cy="10" r="1.5" fill="%23ffd700"/><circle cx="100" cy="30" r="2.5" fill="%23ffb300"/><circle cx="80" cy="50" r="1.2" fill="%23fffbe6"/></svg>');
  background-size: 120px 60px;
  opacity: 0.7;
  animation: sparkleFloat 2.5s infinite linear alternate;
}
@keyframes sparkleFloat {
  0% { opacity: 0.7; transform: translateY(0); }
  100% { opacity: 1; transform: translateY(-12px); }
}
.royal-petals {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 3;
  background: url('data:image/svg+xml;utf8,<svg width="120" height="60" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="20" rx="2" ry="5" fill="%23a67c00"/><ellipse cx="60" cy="10" rx="1.5" ry="4" fill="%237a0000"/><ellipse cx="100" cy="30" rx="2.5" ry="6" fill="%234b1c3c"/><ellipse cx="80" cy="50" rx="1.2" ry="3" fill="%23ffeaea"/></svg>');
  background-size: 120px 60px;
  opacity: 0.5;
  animation: petalFall 2.5s infinite linear alternate;
}
@keyframes petalFall {
  0% { opacity: 0.5; transform: translateY(-10px); }
  100% { opacity: 0.7; transform: translateY(16px); }
}
.mana-bar-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.mana-bar {
  width: 120px;
  height: 10px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 5px;
  overflow: hidden;
  margin: 0 0.5rem;
  border: 1px solid #ffffff44;
}
.mana-fill {
  height: 100%;
  background: linear-gradient(90deg, #fff, #bbb);
  transition: width 0.3s ease;
}
.mana-text {
  font-size: 1rem;
  color: #fff;
  font-weight: 700;
  min-width: 60px;
}
.opponent-health-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.opponent-health-text {
  font-size: 1rem;
  color: #ff4d4f;
  font-weight: 700;
  min-width: 120px;
}
.mana-warning {
  position: absolute;
  left: 50%;
  bottom: 18%;
  transform: translateX(-50%);
  background: rgba(255, 0, 80, 0.92);
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.7rem 2.2rem;
  border-radius: 1.2rem;
  box-shadow: 0 2px 16px #ff0055aa;
  z-index: 3000;
  pointer-events: none;
  animation: manaWarnPop 0.3s;
}
@keyframes manaWarnPop {
  0% { transform: translateX(-50%) scale(0.7); opacity: 0; }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}

/* Versus popup styles */
.versus-popup-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(10,10,30,0.92);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInBg 0.5s;
}
.versus-popup {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rem;
  background: rgba(30,32,60,0.98);
  border-radius: 2rem;
  padding: 2.5rem 4rem;
  box-shadow: 0 8px 64px 0 #ffd70055, 0 2px 16px #0008;
  border: 5px solid #ffd700;
  animation: popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55);
}
.versus-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.versus-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffd700;
  background: #232347;
  box-shadow: 0 0 24px #ffd70088;
}
.versus-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffd700;
  text-shadow: 0 2px 16px #ffd700cc, 0 1px 2px #000a;
  margin-top: 0.5rem;
}
.versus-vs {
  font-size: 3.5rem;
  font-weight: 900;
  color: #fffbe6;
  text-shadow: 0 2px 24px #ffd700cc, 0 1px 2px #000a;
  margin: 0 2rem;
  letter-spacing: 0.1em;
  font-family: 'Cinzel', serif;
  animation: goldPulse 1.2s infinite alternate;
}

/* Opponent health bar styles */
.opponent-health-bar {
  position: fixed;
  width: 100px;
  height: 24px;
  pointer-events: none;
  z-index: 4000;
  text-align: center;
  font-family: 'Cinzel', serif;
}
.opponent-health-bar .bar-bg {
  width: 100px;
  height: 10px;
  background: #222;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 2px;
  border: 1px solid #ffd700;
}
.opponent-health-bar .bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff4d4f, #ffd700);
  border-radius: 6px;
  transition: width 0.2s;
}
.opponent-health-bar .bar-label {
  font-size: 0.9rem;
  color: #ffd700;
  text-shadow: 0 1px 8px #000a;
  font-weight: 700;
}

.leave-button {
  position: absolute;
  top: 24px;
  right: 32px;
  z-index: 10;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: background 0.2s;
}
.leave-button:hover {
  background: #b91c1c;
}

.modal-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 1.5rem;
}
.modal-button.secondary {
  background: #222;
  color: #fffbe6;
  border: 1px solid #ffd700;
}

/* Early Victory Popup Styles */
.modal-overlay.victory {
  background: rgba(10, 10, 30, 0.85);
}
.modal-content.victory {
  border-image: linear-gradient(120deg, #fffbe6 10%, #ffd700 40%, #ffb300 80%, #a67c00 100%) 1;
  box-shadow: 0 0 64px 0 #ffd700cc, 0 2px 16px #0008, 0 0 0 8px #fffbe622;
}
.modal-content.victory .modal-flashy-bg {
  background: radial-gradient(circle at 60% 40%, #fffbe6 0%, #ffd700 40%, #ffb300 80%, #a67c00 100%);
  box-shadow: 0 0 120px 60px #ffd70099;
  animation: goldPulse 2s infinite alternate;
}
.modal-content.victory .royal-sparkles {
  background: url('data:image/svg+xml;utf8,<svg width="120" height="60" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="2" fill="%23fffbe6"/><circle cx="60" cy="10" r="1.5" fill="%23ffd700"/><circle cx="100" cy="30" r="2.5" fill="%23ffb300"/><circle cx="80" cy="50" r="1.2" fill="%23fffbe6"/></svg>');
  background-size: 120px 60px;
  opacity: 0.7;
  animation: sparkleFloat 2.5s infinite linear alternate;
}
.modal-content.victory .royal-petals {
  background: url('data:image/svg+xml;utf8,<svg width="120" height="60" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="20" rx="2" ry="5" fill="%23a67c00"/><ellipse cx="60" cy="10" rx="1.5" ry="4" fill="%237a0000"/><ellipse cx="100" cy="30" rx="2.5" ry="6" fill="%234b1c3c"/><ellipse cx="80" cy="50" rx="1.2" ry="3" fill="%23ffeaea"/></svg>');
  background-size: 120px 60px;
  opacity: 0.5;
  animation: petalFall 2.5s infinite linear alternate;
}
.modal-content.victory .countdown-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
.modal-content.victory .countdown-label {
  font-size: 1.2rem;
  color: #fff;
  font-weight: 700;
}
.modal-content.victory .countdown-timer {
  font-size: 2rem;
  color: #ffd700;
  font-weight: 900;
}
.modal-content.victory .stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  color: #fffbe6;
  text-shadow: 0 1px 8px #000a;
}
.modal-content.victory .stat-label {
  font-weight: 700;
  color: #ffd700;
}
.modal-content.victory .stat-value {
  font-weight: 700;
  color: #fff;
}
.modal-content.victory .stat-value.text-green-400 {
  color: #22ff88;
  text-shadow: 0 1px 8px #000a, 0 0 8px #22ff88aa;
}
.modal-content.victory .stat-value.text-red-400 {
  color: #ff3b3b;
  text-shadow: 0 1px 8px #000a, 0 0 8px #ff3b3baa;
}

/* Early Victory Popup Styles */
.countdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 12px;
  border: 2px solid #ffd700;
}

.countdown-label {
  font-size: 1.1rem;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 1px 4px #000a;
}

.countdown-timer {
  font-size: 2.5rem;
  font-weight: 900;
  color: #ffd700;
  font-family: monospace;
  text-shadow: 0 2px 16px #ffd700cc, 0 1px 2px #000a;
  animation: goldPulse 1s infinite alternate;
}
</style> 