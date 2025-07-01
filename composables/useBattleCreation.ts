import { ref, computed } from 'vue'
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction, Keypair } from '@solana/web3.js'
import { useEnvironment } from './useEnvironment'
import { useStakeValidation } from './useStakeValidation'
import { useToast } from './useToast'
import { sha256 } from '@noble/hashes/sha256'

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

// Assignable base class for borsh schema classes (Solana Cookbook pattern)
class Assignable {
  constructor(properties: any) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key];
    });
  }
}
class CreateBattleArgs extends Assignable {}

const CreateBattleSchema = new Map([
  [CreateBattleArgs, {
    kind: 'struct',
    fields: [
      ['stake', 'u64'],
      ['durationSeconds', 'i64'],
    ]
  }]
])

// Calculate Anchor instruction discriminator (browser compatible)
function getInstructionDiscriminator(name: string): Buffer {
  const preimage = `global:${name}`
  const hash = sha256(new TextEncoder().encode(preimage))
  return Buffer.from(hash).subarray(0, 8)
}

export function useBattleCreation() {
  const { rpcUrl, wsRpcUrl, programId, networkName } = useEnvironment()
  const { validateStakeAmount } = useStakeValidation()
  const { success, error: showError, info } = useToast()

  // State
  const isCreatingBattle = ref(false)
  const transactionStatus = ref<'idle' | 'pending' | 'success' | 'failed'>('idle')
  const transactionSignature = ref<string | null>(null)
  const error = ref<string | null>(null)
  const battleAccount = ref<PublicKey | null>(null)

  // Battle duration in seconds (1 minute)
  const BATTLE_DURATION = 60

  // Wallet validation helper
  const validateWallet = (wallet: any) => {
    if (!wallet) throw new Error('Wallet object is null or undefined');
    if (!wallet.publicKey) throw new Error('Wallet publicKey is missing');
    if (!wallet.signTransaction || typeof wallet.signTransaction !== 'function') {
      throw new Error('Wallet signTransaction method is missing or not a function');
    }

    // Always reconstruct PublicKey from its base58 string
    let publicKey: PublicKey;
    if (typeof wallet.publicKey === 'string') {
      publicKey = new PublicKey(wallet.publicKey);
    } else if (wallet.publicKey && typeof wallet.publicKey.toBase58 === 'function') {
      publicKey = new PublicKey(wallet.publicKey.toBase58());
    } else {
      throw new Error('Wallet publicKey is not a valid type');
    }

    return { publicKey, signTransaction: wallet.signTransaction };
  }

  // Helper function to write u64 to buffer (little endian)
  const writeU64 = (buffer: Buffer, value: bigint, offset: number): number => {
    buffer.writeBigUInt64LE(value, offset)
    return offset + 8
  }

  // Helper function to write i64 to buffer (little endian)
  const writeI64 = (buffer: Buffer, value: bigint, offset: number): number => {
    buffer.writeBigInt64LE(value, offset)
    return offset + 8
  }

  // Manual serialization function for CreateBattle instruction
  const serializeCreateBattleInstruction = (stake: bigint, durationSeconds: bigint, discriminator: Buffer): Buffer => {
    // Calculate total buffer size: 8 bytes discriminator + 8 bytes stake + 8 bytes duration
    const bufferSize = 8 + 8 + 8
    const buffer = Buffer.alloc(bufferSize)
    
    let offset = 0
    
    // Write discriminator (8 bytes)
    discriminator.copy(buffer, offset)
    offset += 8
    
    // Write stake (u64, 8 bytes, little endian)
    offset = writeU64(buffer, stake, offset)
    
    // Write duration (i64, 8 bytes, little endian)
    offset = writeI64(buffer, durationSeconds, offset)
    
    console.log('[useBattleCreation] Manual serialization complete:', {
      bufferSize,
      discriminator: discriminator.toString('hex'),
      stake: stake.toString(),
      durationSeconds: durationSeconds.toString(),
      finalBuffer: buffer.toString('hex')
    })
    
    return buffer
  }

  // Create battle function
  const createBattle = async (stakeAmount: number, wallet: any) => {
    try {
      // Validate wallet first
      const { publicKey, signTransaction } = validateWallet(wallet)
      
      console.log('[useBattleCreation] Wallet validation passed:', {
        publicKey: publicKey.toString(),
        stakeAmount,
        walletBalance: wallet.balance
      })

      // Ensure both stakeAmount and balance are in lamports
      const balanceLamports = wallet.balance || 0 // Balance should already be in lamports from WalletConnection
      
      console.log('[useBattleCreation] Balance validation:', {
        stakeAmount,
        balanceLamports,
        stakeAmountInLamports: stakeAmount,
        balanceInSOL: balanceLamports / 1e9
      })

      const validation = validateStakeAmount(stakeAmount, balanceLamports)
      if (!validation.isValid) {
        const errorMsg = validation.errors[0] || 'Invalid stake amount'
        showError(errorMsg)
        throw new Error(errorMsg)
      }

      isCreatingBattle.value = true
      transactionStatus.value = 'pending'
      error.value = null

      console.log('[useBattleCreation] Starting battle creation transaction...')

      // Always use the CORS proxy (HTTPS) for battle creation
      const connection = new Connection(rpcUrl.value, 'confirmed')

      // Create a new battle account keypair
      const battleAccountKeypair = Keypair.generate()
      battleAccount.value = battleAccountKeypair.publicKey

      console.log('[useBattleCreation] Generated battle account:', battleAccountKeypair.publicKey.toString())

      // Calculate the instruction discriminator manually
      const discriminator = getInstructionDiscriminator('create_battle')

      // Serialize instruction data manually
      const instructionData = serializeCreateBattleInstruction(
        BigInt(stakeAmount),
        BigInt(BATTLE_DURATION),
        discriminator
      )

      // Build the instruction
      const keys = [
        { pubkey: battleAccountKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ]
      const ix = new TransactionInstruction({
        programId: new PublicKey(programId.value),
        keys,
        data: instructionData
      })

      console.log('[useBattleCreation] Built transaction instruction')

      // Build and sign the transaction
      const tx = new Transaction().add(ix)
      tx.feePayer = publicKey
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      tx.partialSign(battleAccountKeypair)

      console.log('[useBattleCreation] Transaction built, requesting wallet signature...')

      // Sign the transaction with the wallet
      const signedTx = await signTransaction(tx)

      console.log('[useBattleCreation] Transaction signed, sending to network...')

      // Send the transaction
      const txid = await connection.sendRawTransaction(signedTx.serialize())
      
      console.log('[useBattleCreation] Transaction sent, confirming...', txid)
      
      await connection.confirmTransaction(txid, 'confirmed')

      console.log('[useBattleCreation] Transaction confirmed successfully!')

      transactionSignature.value = txid
      transactionStatus.value = 'success'
      success(`Battle created! Stake: ${stakeAmount / 1e9} SOL`)
      
      return {
        success: true,
        signature: txid,
        battleAccount: battleAccountKeypair.publicKey.toString()
      }
    } catch (err: any) {
      console.error('[useBattleCreation] Battle creation failed:', err)
      error.value = err.message || 'Failed to create battle'
      transactionStatus.value = 'failed'
      showError(`Battle creation failed: ${error.value}`)
      return {
        success: false,
        error: error.value
      }
    } finally {
      isCreatingBattle.value = false
    }
  }

  // Get transaction URL for explorer
  const getTransactionUrl = computed(() => {
    if (!transactionSignature.value) return null
    if (networkName.value === 'Solana Devnet') {
      return `https://explorer.solana.com/tx/${transactionSignature.value}?cluster=devnet`
    } else {
      return `https://explorer.gorbagana.wtf/tx/${transactionSignature.value}`
    }
  })

  return {
    // State
    isCreatingBattle,
    transactionStatus,
    transactionSignature,
    error,
    battleAccount,
    // Functions
    createBattle,
    // Computed
    getTransactionUrl,
    // Constants
    BATTLE_DURATION
  }
} 