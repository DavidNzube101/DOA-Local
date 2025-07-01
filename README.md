# Daughters of Aether – Game UI

This is the frontend for Daughters of Aether, a real-time Web3 PvP arena game built with Nuxt 3, Vue 3, and Three.js.

## Features

- **Wallet Connection:** Connects to Solana wallets (Phantom, Solflare, Backpack, etc.).
- **Character Selection:** 3D character previews and selection.
- **Staking:** Players stake tokens to enter battles.
- **Matchmaking:** Real-time matchmaking via Socket.IO.
- **Battle Arena:** 3D real-time battles with health, mana, and animations.
- **Battle Resolution:** Victory, defeat, tie, forfeit, and disconnect scenarios with animated modals and sound.
- **Transaction Feedback:** Real-time transaction status, error handling, and user feedback.
- **Dynamic Environment:** Automatically selects RPC URLs and program IDs based on environment variables.

## Getting Started

1. **Install dependencies:**
   ```sh
   pnpm install
   ```
2. **Set environment variables:**  
   Create a `.env` file in the project root or use your deployment platform’s dashboard. See [Environment Variables](#environment-variables) below.

3. **Run locally:**
   ```sh
   pnpm dev
   ```

4. **Build for production:**
   ```sh
   pnpm build
   pnpm start
   ```

## Environment Variables

The frontend is configured via environment variables, which are read in `nuxt.config.ts`.  
You can set these in a `.env` file or in your deployment platform (e.g., Vercel dashboard).

### Common

- `NUXT_PUBLIC_MATCHMAKING_SERVER_URL` – WebSocket URL for the matchmaking server (e.g. `wss://doa-server.onrender.com`)
- `NUXT_PUBLIC_ENVIRONMENT` – Set to `development` or `production` (optional, defaults to `NODE_ENV`)

### Solana Devnet (Development)

- `SOLANA_DEVNET_RPC_URL` – Devnet RPC endpoint (default: `https://api.devnet.solana.com`)
- `DEVELOPMENT_PROGRAM_ID` – Solana devnet program ID (e.g. `5RV8MAYjHoSb16VkqjqN5KGX139MULDR6GHuYhxettKT`)
- `SOLANA_PROGRAM_IDL` – Path to Solana devnet program IDL (default: `~/types/solana_program_idl.json`)

### Gorbagana Testnet (Production)

- `GORBAGANA_RPC_URL` – Gorbagana HTTP RPC endpoint (e.g. `https://gorbagana-rpc-cors-proxy.skippstack.workers.dev/`)
- `GORBAGANA_WS_RPC_URL` – Gorbagana WebSocket RPC endpoint (e.g. `wss://rpc.gorbagana.wtf`)
- `PRODUCTION_PROGRAM_ID` – Gorbagana program ID (e.g. `GAB3CVmCbarpepefKNFEGEUGw6RzcMx9LSGER2Hg3FU2`)
- `GORBAGANA_PROGRAM_IDL` – Path to Gorbagana program IDL (default: `~/types/gorbagana_program_idl.json`)

### Server Authority (for contract calls)

- `SERVER_AUTH_PUBLIC_KEY` – Public key of the server authority (for display/validation)
- `SERVER_AUTH_KEYPAIR` – JSON array of the server authority secret key (for backend use only; **never expose in frontend**)

### Firebase (Optional, if used)

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

#### Example `.env` for Development

```env
NUXT_PUBLIC_MATCHMAKING_SERVER_URL=ws://localhost:10000
SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
DEVELOPMENT_PROGRAM_ID=5RV8MAYjHoSb16VkqjqN5KGX139MULDR6GHuYhxettKT
SOLANA_PROGRAM_IDL=~/types/solana_program_idl.json
SERVER_AUTH_PUBLIC_KEY=...
```

#### Example `.env` for Production

```env
NUXT_PUBLIC_MATCHMAKING_SERVER_URL=wss://doa-server.onrender.com
GORBAGANA_RPC_URL=https://gorbagana-rpc-cors-proxy.skippstack.workers.dev/
GORBAGANA_WS_RPC_URL=wss://rpc.gorbagana.wtf
PRODUCTION_PROGRAM_ID=GAB3CVmCbarpepefKNFEGEUGw6RzcMx9LSGER2Hg3FU2
GORBAGANA_PROGRAM_IDL=~/types/gorbagana_program_idl.json
SERVER_AUTH_PUBLIC_KEY=...
```

## Deployment

- Deploy to Vercel, Netlify, or any static hosting provider.
- Set all required environment variables in your deployment dashboard.

## Tech Stack

- Nuxt 3, Vue 3, Three.js, Socket.IO, Solana web3.js

## Security

- **Never expose private keys or secrets in the frontend.**
- Always test on devnet before mainnet/testnet.
- Use CORS proxies for HTTP requests to Gorbagana if needed.

---

For more details, see the code and comments in `nuxt.config.ts` and the composables.