import { ref, computed } from 'vue'
import { AnchorProvider, Program, web3, Idl } from '@project-serum/anchor'
import { useEnvironment } from './useEnvironment'

// Dynamic IDL loading based on environment
let idl: any = null
const loadIdl = async () => {
  if (idl) return idl
  const { idlPath } = useEnvironment()
  try {
    // Dynamic import based on environment
    if (idlPath.value.includes('solana')) {
      idl = await import('~/types/solana_program_idl.json')
    } else {
      idl = await import('~/types/gorbagana_program_idl.json')
    }
    return idl.default || idl
  } catch (error) {
    console.error('Failed to load IDL:', error)
    throw new Error('Failed to load program IDL')
  }
}

export function useContract() {
  const { rpcUrl, wsRpcUrl, programId, networkName, isValidConfiguration, isProduction } = useEnvironment()

  const connection = computed(() => new web3.Connection(isProduction.value ? wsRpcUrl.value : rpcUrl.value, 'confirmed'))
  const provider = ref<AnchorProvider | null>(null)
  const program = ref<Program | null>(null)
  const ready = ref(false)
  const error = ref<string | null>(null)

  async function init(wallet?: any) {
    try {
      error.value = null
      // Load IDL dynamically
      const loadedIdl = await loadIdl()
      
      // If wallet is provided, use it; else, use a dummy wallet (read-only)
      const anchorProvider = new AnchorProvider(
        connection.value,
        wallet || {
          publicKey: null,
          signAllTransactions: async (txs: any) => txs,
          signTransaction: async (tx: any) => tx,
        },
        { preflightCommitment: 'confirmed' }
      )
      provider.value = anchorProvider
      program.value = new Program(loadedIdl as Idl, programId.value, anchorProvider)
      ready.value = true
    } catch (e: any) {
      error.value = e.message || 'Failed to initialize contract client'
      ready.value = false
    }
  }

  return {
    connection,
    provider,
    program,
    ready,
    error,
    networkName,
    isValidConfiguration,
    init
  }
} 