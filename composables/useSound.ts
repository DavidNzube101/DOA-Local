import { ref } from 'vue'

// Sound settings
const soundEnabled = ref(true)
const volume = ref(0.7)

// Audio elements
let attackSound: HTMLAudioElement | null = null
let glowOrbSound: HTMLAudioElement | null = null
let footstepsSound: HTMLAudioElement | null = null
let clickSound: HTMLAudioElement | null = null

// Initialize sounds
function initSounds() {
  if (typeof window === 'undefined') return
  
  attackSound = new Audio('/sounds/attack.wav')
  glowOrbSound = new Audio('/sounds/glow_orb.mp3')
  footstepsSound = new Audio('/sounds/footsteps.wav')
  clickSound = new Audio('/sounds/click.wav')
  
  // Set initial volume
  updateVolume()
}

// Update volume for all sounds
function updateVolume() {
  const sounds = [attackSound, glowOrbSound, footstepsSound, clickSound]
  sounds.forEach(sound => {
    if (sound) {
      sound.volume = soundEnabled.value ? volume.value : 0
    }
  })
}

// Play sound with error handling
function playSound(sound: HTMLAudioElement | null) {
  if (!sound || !soundEnabled.value) return
  
  try {
    sound.currentTime = 0
    sound.play().catch(err => {
      console.warn('Failed to play sound:', err)
    })
  } catch (err) {
    console.warn('Error playing sound:', err)
  }
}

// Sound functions
function playAttackSound() {
  playSound(attackSound)
}

function playGlowOrbSound() {
  playSound(glowOrbSound)
}

function playFootstepsSound() {
  playSound(footstepsSound)
}

function playClickSound() {
  playSound(clickSound)
}

// Toggle sound on/off
function toggleSound() {
  soundEnabled.value = !soundEnabled.value
  updateVolume()
}

// Set volume (0-1)
function setVolume(newVolume: number) {
  volume.value = Math.max(0, Math.min(1, newVolume))
  updateVolume()
}

// Initialize sounds on first use
if (typeof window !== 'undefined') {
  initSounds()
}

export function useSound() {
  return {
    soundEnabled,
    volume,
    playAttackSound,
    playGlowOrbSound,
    playFootstepsSound,
    playClickSound,
    toggleSound,
    setVolume
  }
} 