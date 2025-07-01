<template>
  <div class="game-container">
    <ToastContainer />
    <!-- Story Carousel -->
    <StoryCarousel v-if="isStoryVisible" @skip="skipStory" />
    <!-- Credits Screen -->
    <CreditsScreen v-if="showCredits" @close="showCredits = false" />
    <!-- Main Game Interface -->
    <div v-else-if="!isStoryVisible && !showCredits" class="game-interface">
      <!-- Credits Button: only show if not inGame -->
      <button v-if="!inGame" class="credits-button" @click="onShowCredits">
        <Icon name="heroicons:information-circle" class="w-5 h-5" />
        Credits
      </button>
      <!-- Wallet Connection -->
      <WalletConnection v-if="!walletConnected" @connected="onWalletConnected" />
      <!-- Character Selection -->
      <CharacterSelection 
        v-else-if="!selectedCharacter && !inLobby" 
        :wallet-address="walletAddress"
        :wallet-balance="walletBalance"
        @character-selected="onCharacterSelected" 
      />
      <!-- Battle Lobby -->
      <BattleLobby
        v-else-if="inLobby && !inGame"
        :wallet-balance="walletBalance"
        :wallet-address="walletAddress"
        :wallet="walletAdapter"
        :selected-character="selectedCharacter"
        :socket="socket"
        @enter-battle="enterBattleFromLobby"
      />
      <!-- Game Arena -->
      <GameArena 
        v-else 
        :stake-amount="gameState?.stakeAmount || 0"
        :character="selectedCharacter"
        :opponent-id="gameState?.opponentId"
        :your-id="gameState?.yourId"
        :opponent-character-name="gameState?.opponentCharacterName"
        :socket="socket"
        @game-ended="onGameEnded" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useStory } from '~/composables/useStory'
import type { Character } from '~/types/game'
import { io, Socket } from 'socket.io-client'
import { useSound } from '~/composables/useSound'
import { Buffer } from 'buffer'
import { useToast } from '~/composables/useToast'
import { useRuntimeConfig } from '#imports'

import StoryCarousel from '~/components/story/StoryCarousel.vue'
import WalletConnection from '~/components/wallet/WalletConnection.vue'
import CharacterSelection from '~/components/game/CharacterSelection.vue'
import CharacterPreviewStake from '~/components/game/CharacterPreviewStake.vue'
import GameArena from '~/components/game/GameArena.vue'
import BattleLobby from '~/components/game/BattleLobby.vue'
import CreditsScreen from '~/components/ui/CreditsScreen.vue'
import ToastContainer from '~/components/ui/ToastContainer.vue'

// Composables
const { isStoryVisible, skipStory } = useStory()
const { success: showSuccess, error: showError, info: showInfo } = useToast()
const config = useRuntimeConfig()

// Game state
const walletConnected = ref(false)
const walletAddress = ref('')
const walletBalance = ref(0)
const walletAdapter = ref<any>(null)
const inGame = ref(false)
const inLobby = ref(false)
const selectedCharacter = ref<Character | null>(null)
const showCredits = ref(false)
interface GameState {
  stakeAmount?: number;
  opponentId?: string;
  yourId?: string;
  opponentCharacterName?: string;
  socket?: any;
}
const gameState = ref<GameState | null>(null)

const bgm = ref<HTMLAudioElement | null>(null)
const fadeDuration = 1000 // ms

const socket = ref<Socket | null>(null)
const battleState = ref(null)

// Sound system
const { playClickSound } = useSound()

// Extend window for global music controls
declare global {
  interface Window {
    __fadeOutGameTrack?: () => void;
    __fadeInGameTrack?: () => void;
  }
}

function fadeInGameTrack() {
  if (!bgm.value) {
    bgm.value = new Audio('/sounds/game_track.mp3')
    bgm.value.loop = true
    bgm.value.volume = 0
  }
  bgm.value.play()
  let start = Date.now()
  function step() {
    if (!bgm.value) return
    let elapsed = Date.now() - start
    let t = Math.min(1, elapsed / fadeDuration)
    bgm.value.volume = 0.5 * t
    if (t < 1) requestAnimationFrame(step)
  }
  step()
}

function fadeOutGameTrack() {
  if (!bgm.value) return
  let startVol = bgm.value.volume
  let start = Date.now()
  function step() {
    if (!bgm.value) return
    let elapsed = Date.now() - start
    let t = Math.min(1, elapsed / fadeDuration)
    bgm.value.volume = startVol * (1 - t)
    if (t < 1) {
      requestAnimationFrame(step)
    } else {
      bgm.value.pause()
      bgm.value.currentTime = 0
    }
  }
  step()
}

onMounted(async () => {
  // Only play music after user interaction (browser autoplay policy)
  const startMusic = () => {
    fadeInGameTrack()
    window.removeEventListener('click', startMusic)
    window.removeEventListener('pointerdown', startMusic)
    window.removeEventListener('keydown', startMusic)
  }
  window.addEventListener('click', startMusic)
  window.addEventListener('pointerdown', startMusic)
  window.addEventListener('keydown', startMusic)

  // Socket event listeners for battle state and errors
  if (socket.value) {
    socket.value.on('battle_state', (state) => {
      battleState.value = state
      showSuccess('Battle state synced from blockchain!')
      console.log('[BATTLE_STATE]', state)
    })
    socket.value.on('match_error', (err) => {
      showError(err?.error || 'Matchmaking error')
      console.error('[MATCH_ERROR]', err)
    })
    socket.value.on('battle_resolved', (data) => {
      showSuccess(`Battle resolved! ${data.message}`)
      console.log('[BATTLE_RESOLVED]', data)
    })
    socket.value.on('battle_resolution_error', (err) => {
      showError(err?.error || 'Battle resolution failed')
      console.error('[BATTLE_RESOLUTION_ERROR]', err)
    })
  }
})

onUnmounted(() => {
  if (bgm.value) bgm.value.pause()
  if (socket.value) {
    socket.value.disconnect()
    socket.value = null
  }
})

if (typeof window !== 'undefined') {
  window.__fadeOutGameTrack = fadeOutGameTrack
  window.__fadeInGameTrack = fadeInGameTrack
  window.Buffer = Buffer
}

// Event handlers
const onWalletConnected = (publicKey: string, balance: number, wallet: any) => {
  walletConnected.value = true
  walletAddress.value = publicKey
  walletBalance.value = balance
  walletAdapter.value = wallet
}

const onCharacterSelected = (character: Character) => {
  playClickSound()
  selectedCharacter.value = character
  inLobby.value = true
  // Ensure socket is created when entering the lobby
  if (!socket.value) {
    socket.value = io(config.public.MATCHMAKING_SERVER_URL)
  }
}

const onShowCredits = () => {
  playClickSound()
  showCredits.value = true
}

const enterBattleFromLobby = (payload) => {
  // Support both old and new payload shapes
  let stakeAmount, playerOne, playerTwo, characterOne, characterTwo;
  if (typeof payload === 'object' && payload !== null) {
    stakeAmount = payload.stakeAmount || payload.stake_amount || 0;
    playerOne = payload.playerOne;
    playerTwo = payload.playerTwo;
    characterOne = payload.characterOne;
    characterTwo = payload.characterTwo;
  } else {
    // fallback for old signature
    [stakeAmount, playerTwo, playerOne, characterTwo, characterOne] = arguments;
  }
  // Determine which player is 'you' and which is 'opponent'
  let yourId, opponentId, opponentCharacterName;
  if (walletAddress.value === playerOne) {
    yourId = playerOne;
    opponentId = playerTwo;
    opponentCharacterName = characterTwo;
  } else {
    yourId = playerTwo;
    opponentId = playerOne;
    opponentCharacterName = characterOne;
  }
  inGame.value = true;
  inLobby.value = false;
  gameState.value = { stakeAmount, opponentId, yourId, opponentCharacterName };
}

const onGameEnded = (result: any) => {
  inGame.value = false
  inLobby.value = true // Return to lobby
  // Handle game end logic
  console.log('Game ended:', result)
}
</script>

<style scoped>
.game-interface {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.credits-button {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.credits-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Responsive design */
@media (max-width: 768px) {
  .credits-button {
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
