import { storage } from './storageService';
import {
  computeMiningRate, computeOfflineCap,
  getUpgradeCost, UPGRADES, DAILY_MISSIONS, DAILY_REWARDS,
  xpForLevel, MissionDef,
} from '../constants/gameData';

export interface Transaction {
  id: string;
  type: string;
  label: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export interface GameState {
  userId: string;
  coins: number;
  totalEarned: number;
  upgradeLevels: Record<string, number>;
  miningRate: number;
  offlineCapHours: number;
  lastActiveAt: string;
  currentMineId: string;
  dailyStreak: number;
  lastDailyClaimDate: string;
  missionProgress: Record<string, number>;
  missionClaimed: Record<string, boolean>;
  lastMissionResetDate: string;
  transactions: Transaction[];
  totalUpgrades: number;
  offlineClaimedToday: boolean;
}

const genTxId = () => 'TX-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
const today = () => new Date().toISOString().split('T')[0];

const defaultState = (userId: string): GameState => ({
  userId,
  coins: 200,
  totalEarned: 200,
  upgradeLevels: { pickaxe: 0, mining_speed: 0, worker: 0, storage: 0, conveyor: 0 },
  miningRate: 10,
  offlineCapHours: 1,
  lastActiveAt: new Date().toISOString(),
  currentMineId: 'mine1',
  dailyStreak: 0,
  lastDailyClaimDate: '',
  missionProgress: { mine_coins: 0, upgrade_once: 0, claim_offline: 0 },
  missionClaimed: { mine_coins: false, upgrade_once: false, claim_offline: false },
  lastMissionResetDate: today(),
  transactions: [{
    id: genTxId(),
    type: 'BONUS',
    label: 'Welcome Bonus',
    amount: 200,
    balanceBefore: 0,
    balanceAfter: 200,
    timestamp: new Date().toISOString(),
    status: 'success',
  }],
  totalUpgrades: 0,
  offlineClaimedToday: false,
});

export const gameService = {
  getState: async (userId: string): Promise<GameState> => {
    const saved = await storage.get<GameState>(`game_${userId}`);
    if (!saved) {
      const state = defaultState(userId);
      await storage.set(`game_${userId}`, state);
      return state;
    }
    // Reset daily missions if date changed
    if (saved.lastMissionResetDate !== today()) {
      saved.missionProgress = { mine_coins: 0, upgrade_once: 0, claim_offline: 0 };
      saved.missionClaimed = { mine_coins: false, upgrade_once: false, claim_offline: false };
      saved.lastMissionResetDate = today();
      saved.offlineClaimedToday = false;
      await storage.set(`game_${userId}`, saved);
    }
    return saved;
  },

  saveState: async (state: GameState): Promise<void> => {
    await storage.set(`game_${state.userId}`, state);
  },

  addTransaction: (state: GameState, type: string, label: string, amount: number): GameState => {
    const balanceBefore = state.coins;
    const newCoins = state.coins + amount;
    const tx: Transaction = {
      id: genTxId(),
      type,
      label,
      amount,
      balanceBefore,
      balanceAfter: newCoins,
      timestamp: new Date().toISOString(),
      status: 'success',
    };
    return {
      ...state,
      coins: newCoins,
      totalEarned: amount > 0 ? state.totalEarned + amount : state.totalEarned,
      transactions: [tx, ...state.transactions].slice(0, 200),
    };
  },

  claimOffline: (state: GameState): { newState: GameState; reward: number } => {
    const now = new Date();
    const lastActive = new Date(state.lastActiveAt);
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    const capMinutes = computeOfflineCap(state.upgradeLevels['storage'] || 0) * 60;
    const validMinutes = Math.min(diffMinutes, capMinutes);
    const reward = Math.floor(state.miningRate * Math.max(0, validMinutes));

    let newState = { ...state, lastActiveAt: now.toISOString() };
    if (reward > 0) {
      newState = gameService.addTransaction(newState, 'OFFLINE_MINING', 'Offline Mining', reward);
      newState.missionProgress = {
        ...newState.missionProgress,
        mine_coins: (newState.missionProgress['mine_coins'] || 0) + reward,
      };
      if (!newState.offlineClaimedToday) {
        newState.missionProgress['claim_offline'] = 1;
        newState.offlineClaimedToday = true;
      }
    }
    return { newState, reward };
  },

  claimMining: (state: GameState, minutes: number): { newState: GameState; reward: number } => {
    const reward = Math.floor(state.miningRate * minutes);
    let newState = gameService.addTransaction(state, 'MINING', 'Mining Reward', reward);
    newState.missionProgress = {
      ...newState.missionProgress,
      mine_coins: (newState.missionProgress['mine_coins'] || 0) + reward,
    };
    newState.lastActiveAt = new Date().toISOString();
    return { newState, reward };
  },

  claimDaily: (state: GameState): { newState: GameState; reward: number; day: number } => {
    if (state.lastDailyClaimDate === today()) return { newState: state, reward: 0, day: state.dailyStreak };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    const newStreak = state.lastDailyClaimDate === yStr ? Math.min(state.dailyStreak + 1, 7) : 1;
    const dayIndex = newStreak - 1;
    const reward = DAILY_REWARDS[dayIndex] || DAILY_REWARDS[6];

    let newState = gameService.addTransaction(state, 'DAILY_REWARD', `Daily Reward Hari ${newStreak}`, reward);
    newState.dailyStreak = newStreak;
    newState.lastDailyClaimDate = today();
    return { newState, reward, day: newStreak };
  },

  canClaimDaily: (state: GameState): boolean => state.lastDailyClaimDate !== today(),

  upgrade: (state: GameState, upgradeId: string): { newState: GameState; success: boolean; error?: string } => {
    const upgradeDef = UPGRADES.find(u => u.id === upgradeId);
    if (!upgradeDef) return { newState: state, success: false, error: 'Upgrade tidak ditemukan' };

    const currentLevel = state.upgradeLevels[upgradeId] || 0;
    if (currentLevel >= upgradeDef.maxLevel) return { newState: state, success: false, error: 'Level maksimum tercapai' };

    const cost = getUpgradeCost(upgradeDef.baseCost, upgradeDef.growthRate, currentLevel);
    if (state.coins < cost) return { newState: state, success: false, error: 'Koin tidak cukup' };

    const newLevels = { ...state.upgradeLevels, [upgradeId]: currentLevel + 1 };
    let newState = gameService.addTransaction(state, 'UPGRADE', `Upgrade ${upgradeDef.name} Lv.${currentLevel + 1}`, -cost);
    newState.upgradeLevels = newLevels;
    newState.miningRate = computeMiningRate(newLevels);
    newState.offlineCapHours = computeOfflineCap(newLevels['storage'] || 0);
    newState.totalUpgrades = (newState.totalUpgrades || 0) + 1;
    newState.missionProgress = {
      ...newState.missionProgress,
      upgrade_once: (newState.missionProgress['upgrade_once'] || 0) + 1,
    };
    return { newState, success: true };
  },

  claimMission: (state: GameState, missionId: string): { newState: GameState; reward: number } => {
    const mission = DAILY_MISSIONS.find(m => m.id === missionId);
    if (!mission) return { newState: state, reward: 0 };
    if (state.missionClaimed[missionId]) return { newState: state, reward: 0 };

    const progress = state.missionProgress[missionId] || 0;
    if (progress < mission.target) return { newState: state, reward: 0 };

    let newState = gameService.addTransaction(state, 'MISSION', `Mission: ${mission.title}`, mission.reward);
    newState.missionClaimed = { ...newState.missionClaimed, [missionId]: true };
    return { newState, reward: mission.reward };
  },
};
