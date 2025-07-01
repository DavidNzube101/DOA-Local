// Game Types for Daughters of Aether

export interface Character {
  id: number;
  name: string;
  description: string;
  element: string;
  modelPath?: string;
  texturePath?: string;
}

export interface Player {
  publicKey: string;
  character: Character;
  health: number;
  maxHealth: number;
  position: { x: number; y: number; z: number };
  isAlive: boolean;
  stakeAmount: number;
}

export interface GameState {
  gameId: string;
  players: Player[];
  startTime: number;
  endTime: number;
  isActive: boolean;
  winner?: string;
  totalStake: number;
}

export interface GameChallenge {
  challengeId: string;
  stakeAmount: number;
  maxPlayers: number;
  currentPlayers: number;
  isActive: boolean;
  creator: string;
  treasury: string;
}

export interface UserProfile {
  publicKey: string;
  selectedCharacterId: number;
  totalGames: number;
  wins: number;
  losses: number;
  totalStaked: number;
  totalWon: number;
  createdAt: Date;
  lastActive: Date;
}

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
  loading: boolean;
}

export interface GameAction {
  type: 'attack' | 'defend' | 'move';
  playerId: string;
  targetId?: string;
  position?: { x: number; y: number; z: number };
  timestamp: number;
}

export interface GameResult {
  gameId: string;
  winners: string[];
  losers: string[];
  totalStake: number;
  payoutPerWinner: number;
  timestamp: number;
}

// Story card interface
export interface StoryCard {
  id: number;
  title: string;
  content: string;
  image?: string;
}

// Environment variables interface
export interface EnvironmentConfig {
  solanaNetwork: string;
  gorbaganaRpcUrl: string;
  firebaseConfig: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
} 