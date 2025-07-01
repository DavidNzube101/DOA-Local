<img src="assets/cover.png">

# Daughters of Aether

Daughters of Aether - your real-time Web3 PvP arena game on Gorbagana

## Features

- **Wallet Connection:** Connects to Solana wallets (Backpack preferred, etc.).
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
   Create a `.env` file in the root. Copy and Paste the content of `.env.example` into it. Uncomment Line 5, 6, 7, 11, 12, 16, 17 & 20

3. **Build the Game:**
   ```sh
   pnpm build
   ```

4. **Run for Game:**
   ```sh
   pnpm start
   ```

---

## LICENSE

   Boost Software License - Version 1.0 - August 17th, 2003

---

## Contribution

   Got an issue, open an issue [here](https://github.com/DavidNzube101/DOA-Local/issues). Got a feature you wanna add, make a PR [here](https://github.com/DavidNzube101/DOA-Local/pulls).