<img src="assets/cover.png">

# Daughters of Aether

**A real-time Web3 PvP arena game on Gorbagana testnet**

Daughters of Aether is a fast-paced, competitive multiplayer game that demonstrates Gorbagana's speed and fairness through engaging PvP battles. Players select unique 3D characters, stake GOR tokens, and battle in real-time for glory and rewards—all settled transparently on the Gorbagana testnet.

## 🎮 Game Overview

### Core Gameplay
- **Real-time PvP Battles**: Fast-paced 3D arena combat with health, mana, and special moves
- **Character Selection**: Choose from unique heroines with distinct elemental powers
- **Token Staking**: Stake GOR tokens to enter battles—winner takes all
- **Instant Matchmaking**: Real-time player pairing via Socket.IO
- **On-chain Resolution**: Every battle result is settled transparently on Gorbagana

### Why It's Perfect for Gorbagana
- **Zero-MEV Execution**: Fair, transparent battles with no front-running
- **Instant Finality**: Real-time gameplay with immediate on-chain settlement
- **Web2-like Speed**: Seamless multiplayer experience powered by Gorbagana's performance
- **Community-Driven**: Built by degens, for degens—embracing the "trash chain" spirit

## 🚀 Gorbagana Integration

### Smart Contract Details
- **Program ID**: `GAB3CVmCbarpepefKNFEGEUGw6RzcMx9LSGER2Hg3FU2`
- **Network**: Gorbagana testnet
- **Native Token**: GOR (for staking and rewards)
- **Explorer**: [Gorbagana Explorer](https://explorer.gorbagana.wtf/)

### Technical Implementation
- **Solana Program**: Anchor-based smart contract for battles, staking, and resolution
- **Real-time State**: Socket.IO server handles matchmaking and battle coordination
- **Wallet Integration**: Seamless Backpack wallet support with Gorbagana RPC
- **Dynamic Configuration**: Automatically adapts to Gorbagana network settings

### Token Usage
- **Staking**: Players stake GOR tokens to enter battles
- **Rewards**: Winner receives the total stake pool
- **Fees**: Minimal transaction fees for battle resolution
- **Access Control**: Token-gated character selection and arena access

## 🎯 Features

- **Wallet Connection**: Seamless Backpack wallet integration
- **Character Selection**: 3D character previews with elemental themes
- **Real-time Matchmaking**: Instant player pairing via Socket.IO
- **Battle Arena**: 3D real-time combat with health, mana, and animations
- **Battle Resolution**: Victory, defeat, tie, forfeit, and disconnect handling
- **Transaction Feedback**: Real-time status updates and error handling
- **Dynamic Environment**: Automatic RPC and program ID selection

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Backpack wallet (configured for Gorbagana testnet)
- GOR testnet tokens (request in [Telegram](https://t.me/gorbagana_portal))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DavidNzube101/DOA-Local.git
   cd DOA-Local
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and uncomment these lines:
   - Line 5, 6, 7 (Gorbagana RPC and program settings)
   - Line 11, 12 (Backend server configuration)
   - Line 16, 17 (Wallet and contract settings)
   - Line 20 (Additional configuration)

4. **Build the game:**
   ```bash
   pnpm build
   ```

5. **Start the game:**
   ```bash
   pnpm start
   ```

6. **Open your browser:**
   Visit `http://localhost:3000`

### How to Play

1. **Connect Wallet**: Use Backpack wallet connected to Gorbagana testnet
2. **Get GOR Tokens**: Request testnet tokens in the [Gorbagana Telegram](https://t.me/gorbagana_portal)
3. **Select Character**: Choose from Nyx (Darkness), Lyra (Light), or Seraphina (Fire)
4. **Stake Tokens**: Stake GOR tokens to enter the arena
5. **Battle**: Real-time PvP combat with health, mana, and special moves
6. **Win Rewards**: Victor takes the entire stake pool

## 📱 Wallet Support

### Primary: Backpack Wallet
- **Full Support**: Complete integration with Gorbagana testnet
- **Easy Setup**: Simple configuration for testnet tokens
- **User Experience**: Seamless connection and transaction signing

### Alternative: Phantom Wallet
- **Compatible**: Works with Gorbagana testnet
- **Fallback Option**: Available if Backpack is not preferred

## 🎨 Game Characters

### Available Now
- **Nyx** (Darkness): The Shadow Weaver, mistress of the unseen
- **Lyra** (Light): The Radiant Guardian, beacon of hope  
- **Seraphina** (Fire): The Flame Dancer, bringer of warmth and fury

### Coming Soon
- Astraea, Rhiannon, Aurelia, Celeste, Thalassa, Isolde, Elara, Zephyra, Morwen


## 🤝 Contribution

- **Issues**: [Report bugs](https://github.com/DavidNzube101/DOA-Local/issues)
- **Features**: [Submit PRs](https://github.com/DavidNzube101/DOA-Local/pulls)
- **Community**: Join the [Gorbagana Telegram](https://t.me/gorbagana_portal)

## 📄 License

Boost Software License - Version 1.0 - August 17th, 2003

---

**Built on trash chain, Gorbagana. Developed by Skipp** 🚀

*Demonstrating the power of fast, fair, and fun on-chain multiplayer gaming.* 