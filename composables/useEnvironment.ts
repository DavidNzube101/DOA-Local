import { computed } from 'vue'

export function useEnvironment() {
  const config = useRuntimeConfig()
  
  // Environment detection
  const isDevelopment = computed(() => config.public.environment === 'development')
  const isProduction = computed(() => config.public.environment === 'production')
  
  // RPC URL selection based on environment
  const rpcUrl = computed(() => {
    if (isDevelopment.value) {
      return config.public.solanaDevnetRpcUrl
    } else {
      return config.public.gorbaganaRpcUrl
    }
  })
  
  // WebSocket RPC URL selection based on environment
  const wsRpcUrl = computed(() => {
    if (isDevelopment.value) {
      // Devnet: use HTTP for both, or set up a devnet WS endpoint if needed
      return config.public.solanaDevnetRpcUrl.replace('https://', 'wss://').replace('http://', 'ws://')
    } else {
      return config.public.gorbaganaWsRpcUrl
    }
  })
  
  // Program ID selection based on environment
  const programId = computed(() => {
    if (isDevelopment.value) {
      return config.public.developmentProgramId
    } else {
      return config.public.productionProgramId
    }
  })
  
  // IDL selection based on environment
  const idlPath = computed(() => {
    if (isDevelopment.value) {
      return config.public.solanaProgramIdl
    } else {
      return config.public.gorbaganaProgramIdl
    }
  })
  
  // Server authority configuration
  const serverAuthPublicKey = computed(() => config.public.serverAuthPublicKey)
  const serverAuthKeypair = computed(() => {
    try {
      return JSON.parse(config.public.serverAuthKeypair as string)
    } catch (error) {
      console.error('Failed to parse server auth keypair:', error)
      return []
    }
  })
  
  // Network name for display purposes
  const networkName = computed(() => {
    if (isDevelopment.value) {
      return 'Solana Devnet'
    } else {
      return 'Gorbagana'
    }
  })
  
  // Validation
  const isValidConfiguration = computed(() => {
    const hasRpcUrl = !!rpcUrl.value
    const hasProgramId = !!programId.value
    const hasServerAuth = !!serverAuthPublicKey.value && serverAuthKeypair.value.length > 0
    
    return hasRpcUrl && hasProgramId && hasServerAuth
  })
  
  return {
    // Environment flags
    isDevelopment,
    isProduction,
    
    // Configuration
    rpcUrl,
    wsRpcUrl,
    programId,
    idlPath,
    serverAuthPublicKey,
    serverAuthKeypair,
    networkName,
    
    // Validation
    isValidConfiguration,
    
    // Debug info
    debugInfo: computed(() => ({
      environment: config.public.environment,
      rpcUrl: rpcUrl.value,
      wsRpcUrl: wsRpcUrl.value,
      programId: programId.value,
      idlPath: idlPath.value,
      networkName: networkName.value,
      serverAuthPublicKey: serverAuthPublicKey.value
    }))
  }
} 