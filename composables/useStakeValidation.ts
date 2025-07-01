import { computed } from 'vue'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export function useStakeValidation() {
  // Stake limits in SOL
  const MIN_STAKE = 0.001 // 0.001 SOL
  const MAX_STAKE = 10 // 10 SOL
  const RECOMMENDED_STAKE = 0.01 // 0.01 SOL

  // Convert SOL to lamports
  const minStakeLamports = computed(() => MIN_STAKE * LAMPORTS_PER_SOL)
  const maxStakeLamports = computed(() => MAX_STAKE * LAMPORTS_PER_SOL)
  const recommendedStakeLamports = computed(() => RECOMMENDED_STAKE * LAMPORTS_PER_SOL)

  // Validation functions
  const validateStakeAmount = (stakeAmount: number, walletBalance: number) => {
    const errors: string[] = []
    const warnings: string[] = []

    // Check minimum stake
    if (stakeAmount < minStakeLamports.value) {
      errors.push(`Minimum stake is ${MIN_STAKE} SOL`)
    }

    // Check maximum stake
    if (stakeAmount > maxStakeLamports.value) {
      errors.push(`Maximum stake is ${MAX_STAKE} SOL`)
    }

    // Check if user has enough balance
    if (stakeAmount > walletBalance) {
      errors.push('Insufficient balance for this stake amount')
    }

    // Check if stake is too low (warning)
    if (stakeAmount < recommendedStakeLamports.value) {
      warnings.push(`Consider staking at least ${RECOMMENDED_STAKE} SOL for better rewards`)
    }

    // Check if stake is very high (warning)
    if (stakeAmount > walletBalance * 0.8) {
      warnings.push('High stake amount - consider keeping some SOL for transaction fees')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Format stake amount for display
  const formatStakeAmount = (lamports: number) => {
    return (lamports / LAMPORTS_PER_SOL).toFixed(4)
  }

  // Get stake suggestions based on balance
  const getStakeSuggestions = (walletBalance: number) => {
    const suggestions = []
    
    if (walletBalance >= recommendedStakeLamports.value) {
      suggestions.push({
        label: 'Recommended',
        value: recommendedStakeLamports.value,
        description: 'Good balance of risk and reward'
      })
    }

    if (walletBalance >= minStakeLamports.value) {
      suggestions.push({
        label: 'Minimum',
        value: minStakeLamports.value,
        description: 'Lowest possible stake'
      })
    }

    if (walletBalance >= LAMPORTS_PER_SOL) {
      suggestions.push({
        label: 'High Stakes',
        value: LAMPORTS_PER_SOL,
        description: '1 SOL stake for serious players'
      })
    }

    return suggestions
  }

  return {
    // Constants
    MIN_STAKE,
    MAX_STAKE,
    RECOMMENDED_STAKE,
    minStakeLamports,
    maxStakeLamports,
    recommendedStakeLamports,

    // Functions
    validateStakeAmount,
    formatStakeAmount,
    getStakeSuggestions
  }
} 