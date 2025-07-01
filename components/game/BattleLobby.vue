<template>
  <div class="battle-lobby">
    <div class="lobby-container">
      <div class="lobby-header">
        <h1 class="lobby-title">Battle Lobby</h1>
        <p class="lobby-subtitle">Prepare for battle and stake your tokens</p>
      </div>

      <div class="player-info">
        <div class="player-card">
          <div class="player-avatar">
            <img
              v-if="props.selectedCharacter?.name"
              :src="`/models/${props.selectedCharacter.name}/${props.selectedCharacter.name.toLowerCase()}_profile_picture.png`"
              :alt="props.selectedCharacter.name + ' profile'"
              class="avatar-img"
              @error="imgError = true"
              v-show="!imgError"
            />
            <Icon v-else name="heroicons:user" class="w-16 h-16" />
            <Icon v-if="imgError" name="heroicons:user" class="w-16 h-16" />
          </div>
          <div class="player-details">
            <h3 class="player-name">{{ props.selectedCharacter?.name || 'Unknown' }}</h3>
            <p class="player-element">{{ props.selectedCharacter?.element || 'Unknown' }}</p>
            <p class="player-wallet">{{ truncatedWallet }}</p>
          </div>
          <div class="player-balance">
            <span class="balance-label">Balance:</span>
            <span class="balance-amount">{{ walletBalanceDisplay }} GOR</span>
            <button class="reload-balance-btn" @click="reloadBalance" :disabled="reloadingBalance" title="Reload Balance">
              <Icon name="heroicons:arrow-path" class="w-5 h-5" :class="{ spinning: reloadingBalance }" />
            </button>
          </div>
        </div>
      </div>

      <div class="stake-section">
        <h3 class="stake-title">Stake Amount</h3>
        <div class="stake-input">
          <input
            v-model="stakeAmount"
            type="number"
            min="0.001"
            step="0.001"
            placeholder="Enter stake amount in GOR"
            class="stake-field"
          />
          <button 
            class="max-button"
            @click="setMaxStake"
          >
            MAX
          </button>
        </div>
        <p class="stake-hint">Minimum stake: 0.001 GOR</p>
      </div>

      <div class="lobby-actions">
        <button 
          class="action-button primary"
          :disabled="!canEnterBattle"
          @click="enterBattle"
        >
          <Icon v-if="isCreatingBattle" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
          <Icon v-else name="heroicons:play" class="w-5 h-5" />
          {{ isCreatingBattle ? 'Creating Battle...' : 'Enter Battle' }}
        </button>
      </div>

      <!-- Transaction Status -->
      <div v-if="transactionStatus !== 'idle'" class="transaction-status">
        <div v-if="transactionStatus === 'pending'" class="status-pending">
          <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
          <span>Creating battle on {{ networkName }}...</span>
        </div>
        <div v-else-if="transactionStatus === 'success'" class="status-success">
          <Icon name="heroicons:check-circle" class="w-5 h-5" />
          <span>Battle created successfully!</span>
          <a v-if="getTransactionUrl" :href="getTransactionUrl" target="_blank" class="transaction-link">
            View Transaction
          </a>
        </div>
        <div v-else-if="transactionStatus === 'failed'" class="status-error">
          <Icon name="heroicons:exclamation-triangle" class="w-5 h-5" />
          <span>Failed to create battle: {{ battleError }}</span>
        </div>
      </div>

      <div class="lobby-info">
        <div class="info-card">
          <h4>How it works:</h4>
          <ul class="info-list">
            <li>Stake GOR tokens to join the battle</li>
            <li>Fight other players in a 1-minute arena</li>
            <li>Winners split the total stake pool</li>
            <li>Losers forfeit their stakes</li>
          </ul>
        </div>
      </div>
    </div>
    <!-- Waiting Modal -->
    <div v-if="waitingForOpponent" class="modal-overlay">
      <div class="modal-content">
        <h2>Waiting for Opponent...</h2>
        <p>Searching for another player to join your game.</p>
        <div class="timer-circle">{{ matchmakingTimer }}</div>
        <p>If no one joins in 40 seconds, you'll be returned to the lobby and your stake refunded.</p>
      </div>
    </div>
    <!-- Timeout Popup -->
    <div v-if="matchTimeoutPopup" class="modal-overlay">
      <div class="modal-content">
        <h2>No Opponent Found</h2>
        <p>No one joined your game in time. You have been returned to the lobby and your stake refunded.</p>
        <button @click="closeTimeoutPopup">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { useSound } from '~/composables/useSound'
import { useBattleCreation } from '~/composables/useBattleCreation'
import { useEnvironment } from '~/composables/useEnvironment'
import { Connection, PublicKey } from '@solana/web3.js'

// Props
const props = defineProps<{
  selectedCharacter: any,
  walletAddress: string,
  walletBalance: number,
  wallet: any,
  socket: any
}>()

// Sound system
const { playClickSound } = useSound()

// Battle creation
const { 
  createBattle, 
  isCreatingBattle, 
  transactionStatus, 
  transactionSignature, 
  error: battleError,
  getTransactionUrl 
} = useBattleCreation()

// Environment
const { networkName, rpcUrl, wsRpcUrl, isProduction } = useEnvironment()

// State
const stakeAmount = ref('0.01') // Default to recommended stake

// Matchmaking state
const waitingForOpponent = ref(false)
const matchTimeoutPopup = ref(false)
const matchmakingTimer = ref(40)
let matchmakingInterval: NodeJS.Timeout | null = null
let imgError = ref(false)

// New state for reloading balance
const walletBalanceDisplay = ref(props.walletBalance)
const reloadingBalance = ref(false)

// Computed
const truncatedWallet = computed(() => {
  if (!props.walletAddress) return 'Not connected'
  return `${props.walletAddress.slice(0, 4)}...${props.walletAddress.slice(-4)}`
})

const canEnterBattle = computed(() => {
  const amount = parseFloat(stakeAmount.value)
  return amount >= 0.001 && amount <= props.walletBalance && !isCreatingBattle.value
})

// Methods
const setMaxStake = () => {
  playClickSound()
  const maxStake = Math.min(props.walletBalance * 0.9, 10) // Leave 10% for fees, max 10 SOL
  stakeAmount.value = maxStake.toFixed(4)
}

const startMatchmaking = (battleAccountPubkey: string) => {
  waitingForOpponent.value = true
  matchmakingTimer.value = 40
  clearMatchmakingInterval()
  // Use socket from props
  const s = props.socket
  if (!s) return
  // Remove old listeners
  s.off('battle_ready')
  s.off('match_timeout')
  s.emit('join_queue', {
    characterName: props.selectedCharacter?.name,
    walletPubkey: props.wallet?.publicKey?.toString?.() || '',
    battleAccountPubkey: battleAccountPubkey
  })
  s.on('battle_ready', (data: any) => {
    waitingForOpponent.value = false
    clearMatchmakingInterval()
    // Transition to game arena, pass all relevant info
    emit('enter-battle', {
      stakeAmount: parseFloat(stakeAmount.value) * 1e9,
      battle: data.battle,
      playerTwoBattle: data.playerTwoBattle,
      playerOne: data.playerOne,
      playerTwo: data.playerTwo,
      characterOne: data.characterOne,
      characterTwo: data.characterTwo,
      joinBattleTx: data.joinBattleTx
    })
  })
  s.on('match_timeout', () => {
    waitingForOpponent.value = false
    matchTimeoutPopup.value = true
    clearMatchmakingInterval()
  })
  matchmakingInterval = setInterval(() => {
    matchmakingTimer.value--
    if (matchmakingTimer.value <= 0) {
      clearMatchmakingInterval()
    }
  }, 1000)
}

function clearMatchmakingInterval() {
  if (matchmakingInterval) {
    clearInterval(matchmakingInterval)
    matchmakingInterval = null
  }
}

const enterBattle = async () => {
  if (!canEnterBattle.value) return
  
    playClickSound()
  
  try {
    // Convert stake amount to lamports
    const stakeInLamports = parseFloat(stakeAmount.value) * 1e9
    
    console.log('🎮 Starting Battle Creation Process...')
    console.log('📊 Pre-battle Details:', {
      character: props.selectedCharacter?.name,
      stakeAmount: `${parseFloat(stakeAmount.value)} SOL`,
      stakeInLamports,
      walletAddress: props.walletAddress,
      walletBalance: `${props.walletBalance} SOL`,
      walletBalanceInLamports: props.walletBalance * 1e9,
      walletObject: {
        hasPublicKey: !!props.wallet?.publicKey,
        hasSignTransaction: !!props.wallet?.signTransaction,
        publicKeyType: props.wallet?.publicKey ? typeof props.wallet.publicKey : 'undefined',
        walletKeys: props.wallet ? Object.keys(props.wallet) : null
      },
      timestamp: new Date().toISOString()
    })
    
    // Validate wallet object before proceeding
    if (!props.wallet || !props.wallet.publicKey || !props.wallet.signTransaction) {
      console.error('❌ Invalid wallet object:', {
        wallet: !!props.wallet,
        publicKey: !!props.wallet?.publicKey,
        signTransaction: !!props.wallet?.signTransaction
      })
      throw new Error('Wallet object is invalid. Please reconnect your wallet.')
    }
    
    // Create battle on blockchain
    const connection = new Connection(rpcUrl.value)
    const result = await createBattle(stakeInLamports, props.wallet)
    
    if (result.success) {
      console.log('🎯 Battle created successfully, initiating matchmaking...')
      console.log('🔗 Battle Account:', result.battleAccount)
      console.log('📝 Transaction:', result.signature)
      
      // Start matchmaking after successful battle creation
      startMatchmaking(result.battleAccount)
    } else {
      console.error('❌ Battle creation failed:', result.error)
      // Error toast is already shown by the composable
    }
    
  } catch (err: any) {
    console.error('💥 Unexpected error during battle creation:', err)
    // Show error toast
    showError(err.message || 'An unexpected error occurred during battle creation')
  }
}

const closeTimeoutPopup = () => {
  playClickSound()
  matchTimeoutPopup.value = false
}

const reloadBalance = async () => {
  if (!props.walletAddress) return
  reloadingBalance.value = true
  try {
    const connection = new Connection(rpcUrl.value)
    const balance = await connection.getBalance(new PublicKey(props.walletAddress))
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

onUnmounted(() => {
  clearMatchmakingInterval()
})

const emit = defineEmits<{
  'enter-battle': [stakeAmount: number, opponentId: string, yourId: string, opponentCharacterName: string]
}>()
</script>

<style scoped>
.battle-lobby {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

.lobby-container {
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.lobby-header {
  text-align: center;
  margin-bottom: 2rem;
}

.lobby-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.lobby-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
}

.player-info {
  margin-bottom: 2rem;
}

.player-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.player-avatar {
  width: 80px;
  height: 80px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  border: 2px solid rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
}

.player-details {
  flex: 1;
}

.player-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.player-element {
  font-size: 0.875rem;
  color: var(--accent-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.player-wallet {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.player-balance {
  text-align: right;
  flex-shrink: 0;
}

.balance-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.balance-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--success-color);
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

.stake-section {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.stake-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.stake-input {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.stake-field {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.stake-field:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.stake-field::placeholder {
  color: var(--text-secondary);
}

.max-button {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.max-button:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.stake-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.lobby-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.action-button {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  font-size: 1.125rem;
}

.action-button.primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.action-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.action-button.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.lobby-info {
  display: flex;
  justify-content: center;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
}

.info-card h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.info-list li::before {
  content: '•';
  color: var(--primary-color);
  position: absolute;
  left: 0;
  font-weight: bold;
}

/* Responsive design */
@media (max-width: 768px) {
  .battle-lobby {
    padding: 1rem;
  }
  
  .lobby-title {
    font-size: 2rem;
  }
  
  .player-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .player-balance {
    text-align: center;
  }
  
  .stake-input {
    flex-direction: column;
  }
  
  .action-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(10,10,30,0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #232347;
  border-radius: 18px;
  padding: 2.5rem 3.5rem;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 320px;
  align-items: center;
  text-align: center;
}
.timer-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #00e5ff);
  color: #fff;
  font-size: 2.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.2rem auto;
  box-shadow: 0 2px 16px #00e5ff55;
}

/* Add avatar image style */
.avatar-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #6366f1;
  background: #232347;
  display: block;
  margin: 0 auto;
}

/* Transaction Status Styles */
.transaction-status {
  margin-bottom: 2rem;
  text-align: center;
}

.status-pending,
.status-success,
.status-error {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.status-pending {
  background: rgba(255, 255, 255, 0.05);
}

.status-success {
  background: rgba(255, 255, 255, 0.05);
}

.status-error {
  background: rgba(255, 255, 255, 0.05);
}

.transaction-link {
  color: var(--primary-color);
  text-decoration: none;
}
</style>