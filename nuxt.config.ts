// https://nuxt.com/docs/api/configuration/nuxt-config
import { cjsInterop } from 'vite-plugin-cjs-interop'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', '@nuxt/image', '@nuxt/ui', '@nuxt/fonts'],
  
  // Build configuration for Three.js and Solana/Web3
  build: {
    transpile: [
      'three',
      'vue-three',
      '@solana/web3.js',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-vue',
      '@solana/wallet-adapter-vue-ui',
      '@solana/wallet-adapter-wallets',
      'borsh',
      'jayson'
    ]
  },
  
  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      // Environment configuration
      environment: process.env.NODE_ENV || 'development',
      
      // RPC Configuration
      solanaDevnetRpcUrl: process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com',
      gorbaganaRpcUrl: process.env.GORBAGANA_RPC_URL || 'https://rpc.gorbagana.wtf',
      // gorbaganaProxyRpcUrl: process.env.GORBAGANA_PROXY_RPC_URL || 'https://gorbagana-rpc-cors-proxy.skippstack.workers.dev/',
      gorbaganaWsRpcUrl: process.env.GORBAGANA_WS_RPC_URL || 'wss://rpc.gorbagana.wtf',
      
      // Program IDs
      developmentProgramId: process.env.DEVELOPMENT_PROGRAM_ID || '5RV8MAYjHoSb16VkqjqN5KGX139MULDR6GHuYhxettKT',
      productionProgramId: process.env.PRODUCTION_PROGRAM_ID || 'GAB3CVmCbarpepefKNFEGEUGw6RzcMx9LSGER2Hg3FU2',
      
      // IDL Configuration
      solanaProgramIdl: process.env.SOLANA_PROGRAM_IDL || '~/types/solana_program_idl.json',
      gorbaganaProgramIdl: process.env.GORBAGANA_PROGRAM_IDL || '~/types/gorbagana_program_idl.json',
      
      // Server Authority
      serverAuthPublicKey: process.env.SERVER_AUTH_PUBLIC_KEY || '2RNksAgJAjwb5iXqoh6sNZW7Fjabqg7WeE64KywEyC2C',
      serverAuthKeypair: process.env.SERVER_AUTH_KEYPAIR || '[61,249,35,240,89,226,101,89,86,154,227,218,12,139,225,91,224,228,129,221,232,53,12,234,211,193,187,46,255,95,209,195,21,26,57,236,80,176,186,109,41,150,71,84,88,251,65,155,36,143,69,45,25,228,161,8,90,137,6,170,58,22,111,33]',
      
      // Firebase config (we'll add this later)
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
      },
      
      // Matchmaking Server URL
      MATCHMAKING_SERVER_URL: process.env.NUXT_PUBLIC_MATCHMAKING_SERVER_URL || 'wss://doa-server.onrender.com',
    }
  },
  
  // CSS and styling
  css: ['~/assets/css/main.css'],
  
  // App configuration
  app: {
    head: {
      title: 'Daughters of Aether',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A PvP arena game on Solana devnet (development) / Gorbagana (production)' }
      ]
    }
  },

  vite: {
    define: {
      'global': {},
    },
    optimizeDeps: {
      include: [
        'buffer',
        '@solana/web3.js',
        '@solana/wallet-adapter-base',
        '@solana/wallet-adapter-vue',
        '@solana/wallet-adapter-vue-ui',
        '@solana/wallet-adapter-wallets',
        'borsh',
        'jayson'
      ],
    },
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },
    plugins: [
      cjsInterop({
        dependencies: [
          'eventemitter3',
          'eventemitter3/**'
        ]
      })
    ],
  },

  nitro: {
    rollupConfig: {
      external: [
        '@solana/web3.js',
        '@solana/wallet-adapter-base',
        '@solana/wallet-adapter-vue',
        '@solana/wallet-adapter-vue-ui',
        '@solana/wallet-adapter-wallets',
        'borsh',
        'jayson'
      ]
    }
  }
})