<template>
  <div class="wallet-modal-overlay">
    <div class="wallet-modal">
      <div class="wallet-connection">
        <div class="connection-card">
          <div class="connection-header">
            <h1 class="game-title">Daughters of Aether</h1>
            <p class="game-subtitle">Connect your wallet to begin your journey</p>
          </div>

          <div class="wallet-options">
            <div class="wallet-grid">
              <button
                v-for="wallet in availableWallets"
                :key="wallet.name"
                class="wallet-option"
                :class="{ 
                  'recommended': wallet.recommended,
                  'loading': connectingWallet === wallet.name 
                }"
                @click="connectWallet(wallet.name)"
                :disabled="connectingWallet !== null"
              >
                <div class="wallet-icon">
                  <!-- <Icon :name="wallet.icon" class="w-8 h-8" /> -->
                  <img :src="wallet.image_url" alt="Wallet Icon" class="w-8 h-8" />
                </div>
                <div class="wallet-info">
                  <h3 class="wallet-name">{{ wallet.name }}</h3>
                  <p class="wallet-description">{{ wallet.description }}</p>
                  <span v-if="wallet.recommended" class="recommended-badge">Recommended</span>
                </div>
                <div v-if="connectingWallet === wallet.name" class="loading-spinner"></div>
              </button>
            </div>
          </div>

          <div v-if="error" class="error-message">
            <Icon name="heroicons:exclamation-triangle" class="w-5 h-5" />
            {{ error }}
          </div>

          <div class="connection-footer">
            <p class="footer-text">
              Don't have a wallet? 
              <a 
                href="https://backpack.app" 
                target="_blank" 
                rel="noopener noreferrer"
                class="footer-link"
              >
                Download Backpack
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Connection, PublicKey } from '@solana/web3.js'
import { useSound } from '~/composables/useSound'
import { useEnvironment } from '~/composables/useEnvironment'

// Props and emits
const emit = defineEmits<{
  connected: [publicKey: string, balance: number, wallet: any]
}>()

// Sound system
const { playClickSound } = useSound()

// State
const connectingWallet = ref<string | null>(null)
const error = ref<string | null>(null)

// Wallet configurations
const availableWallets = [
  {
    name: 'Backpack',
    description: 'The most secure Solana wallet',
    icon: 'simple-icons:backpack',
    image_url: "/Backpack.png",
    recommended: true,
    adapter: 'backpack'
  },
  {
    name: 'Solflare',
    description: 'Fast and user-friendly',
    icon: 'simple-icons:solflare',
    image_url: "/Solflare.png",
    recommended: false,
    adapter: 'solflare'
  },
  {
    name: 'Phantom',
    description: 'Popular and reliable',
    icon: 'simple-icons:phantom',
    image_url: "/Phantom.png",
    recommended: false,
    adapter: 'phantom'
  }
]

// Check wallet availability
const checkWalletAvailability = () => {
  return availableWallets.filter(wallet => {
    switch (wallet.adapter) {
      case 'backpack':
        return typeof window !== 'undefined' && 'backpack' in window
      case 'solflare':
        return typeof window !== 'undefined' && ('solflare' in window || ('solana' in window && 'solflare' in (window as any).solana))
      case 'phantom':
        return typeof window !== 'undefined' && ('phantom' in window || ('solana' in window && 'phantom' in (window as any).solana))
      default:
        return false
    }
  })
}

const connectWallet = async (walletName: string) => {
  connectingWallet.value = walletName
  error.value = ''
  playClickSound()
  
  try {
    let rawWallet: any
    let publicKey: PublicKey
    let balance: number

    // Get the raw wallet object from window
    switch (walletName) {
      case 'Backpack':
        if (typeof window !== 'undefined' && 'backpack' in window) {
          rawWallet = (window as any).backpack
          await rawWallet.connect()
          publicKey = rawWallet.publicKey
        } else {
          throw new Error('Backpack wallet not found. Please install Backpack extension.')
        }
        break

      case 'Solflare':
        if (typeof window !== 'undefined' && 'solflare' in window) {
          // Try to get the correct Solflare wallet object
          rawWallet = (window as any).solflare?.solana || (window as any).solflare
          if (!rawWallet || typeof rawWallet.connect !== 'function') {
            throw new Error('Solflare wallet does not support connect().')
          }
          await rawWallet.connect()
          publicKey = rawWallet.publicKey
        } else {
          throw new Error('Solflare wallet not found. Please install Solflare extension.')
        }
        break

      case 'Phantom':
        if (typeof window !== 'undefined' && 'phantom' in window) {
          // Try to get the correct Phantom wallet object
          rawWallet = (window as any).phantom?.solana || (window as any).phantom
          if (!rawWallet || typeof rawWallet.connect !== 'function') {
            throw new Error('Phantom wallet does not support connect().')
          }
          await rawWallet.connect()
          publicKey = rawWallet.publicKey
        } else {
          throw new Error('Phantom wallet not found. Please install Phantom extension.')
        }
        break

      default:
        throw new Error('Unsupported wallet')
    }

    // Validate that we have the required properties
    if (!publicKey || !rawWallet.signTransaction) {
      console.error('Wallet validation failed:', {
        publicKey: !!publicKey,
        signTransaction: !!rawWallet.signTransaction,
        walletKeys: Object.keys(rawWallet)
      })
      throw new Error('Wallet does not provide required methods (publicKey or signTransaction)')
    }

    // Convert publicKey to PublicKey object if it's a string
    if (typeof publicKey === 'string') {
      publicKey = new PublicKey(publicKey)
    }

    // Get wallet balance
    balance = await getWalletBalance(publicKey.toString())

    // Create a standardized wallet object
    const standardizedWallet = {
      publicKey: publicKey, // Always a PublicKey object
      signTransaction: rawWallet.signTransaction.bind(rawWallet),
      signAllTransactions: rawWallet.signAllTransactions?.bind(rawWallet),
      connect: rawWallet.connect?.bind(rawWallet),
      disconnect: rawWallet.disconnect?.bind(rawWallet),
      connected: true,
      balance: balance * 1e9, // Always store balance in lamports
      _raw: rawWallet // Keep reference to original wallet for debugging
    }

    console.log('[WalletConnection] Wallet connected successfully:', {
      walletName,
      publicKey: publicKey.toString(),
      balance: balance,
      hasSignTransaction: !!standardizedWallet.signTransaction,
      walletMethods: Object.keys(standardizedWallet)
    })

    // Emit connection success
    emit('connected', publicKey.toString(), balance, standardizedWallet)

  } catch (err: any) {
    error.value = err.message || 'Failed to connect wallet'
    console.error('Wallet connection error:', err)
  } finally {
    connectingWallet.value = null
  }
}

const getWalletBalance = async (publicKey: string): Promise<number> => {
  try {
    const { rpcUrl, wsRpcUrl, isProduction } = useEnvironment()
    const connection = new Connection(rpcUrl.value)
    const balance = await connection.getBalance(new PublicKey(publicKey))
    return balance / 1e9 // Convert lamports to SOL
  } catch (err) {
    console.error('Failed to get wallet balance:', err)
    return 0
  }
}

// Lifecycle
onMounted(() => {
  // Check wallet availability on mount
  const available = checkWalletAvailability()
  if (available.length === 0) {
    error.value = 'No supported wallets detected. Please install Backpack, Solflare, or Phantom.'
  }
})
</script>

<style scoped>
.wallet-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.wallet-modal {
  max-width: 480px;
  max-height: 90vh;
  width: 100%;
  background: rgba(26, 26, 46, 0.97);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.wallet-connection {
  padding: 2.5rem 2rem;
  overflow-y: auto;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.connection-card {
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.connection-header {
  margin-bottom: 3rem;
}

.game-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 0;
}

.wallet-options {
  margin-bottom: 2rem;
}

.wallet-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wallet-option {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.wallet-option:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.wallet-option.recommended {
  border-color: var(--accent-color);
  background: rgba(245, 158, 11, 0.1);
}

.wallet-option.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.wallet-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wallet-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  color: var(--primary-color);
}

.wallet-info {
  flex: 1;
  text-align: left;
}

.wallet-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.wallet-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.recommended-badge {
  background: var(--accent-color);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.loading-spinner {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: var(--error-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.connection-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
}

.footer-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.footer-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.footer-link:hover {
  text-decoration: underline;
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .wallet-connection {
    padding: 1rem;
  }
  
  .connection-card {
    padding: 2rem;
  }
  
  .game-title {
    font-size: 2rem;
  }
  
  .wallet-option {
    padding: 1rem;
  }
  
  .wallet-icon {
    width: 40px;
    height: 40px;
  }
}
</style> 