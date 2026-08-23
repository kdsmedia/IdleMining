import { storage } from './storageService';
import { db, isFirebaseAvailable } from './firebaseService';
import {
  computeMiningRate, computeOfflineCap,
  getUpgradeCost, UPGRADES, DAILY_MISSIONS, DAILY_REWARDS,
  xpForLevel, MissionDef, SIGNUP_BONUS, WITHDRAW_ADS_REQUIRED,
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
  totalAdsWatched: number;
  referralCount: number;
  referralBonusGranted: boolean;
  lastCheckinDate: string;
}

const genTxId = () => 'TX-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
const today = () => new Date().toISOString().split('T')[0];

const defaultState = (userId: string): GameState => ({
  userId,
  coins: SIGNUP_BONUS,
  totalEarned: SIGNUP_BONUS,
  upgradeLevels: { pickaxe: 0, mining_speed: 0, worker: 0, storage: 0, conveyor: 0 },
  miningRate: 10,
  offlineCapHours: 1,
  lastActiveAt: new Date().toISOString(),
  currentMineId: 'mine1',
  dailyStreak: 0,
  lastDailyClaimDate: '',
  missionProgress: { mine_coins: 0, upgrade_once: 0, watch_ads: 0, daily_checkin: 0, invite_friends: 0 },
  missionClaimed: { mine_coins: false, upgrade_once: false, watch_ads: false, daily_checkin: false, invite_friends: false },
  lastMissionResetDate: today(),
  transactions: [{
    id: genTxId(),
    type: 'BONUS',
    label: 'Welcome Bonus',
    amount: SIGNUP_BONUS,
    balanceBefore: 0,
    balanceAfter: SIGNUP_BONUS,
    timestamp: new Date().toISOString(),
    status: 'success',
  }],
  totalUpgrades: 0,
  totalAdsWatched: 0,
  referralCount: 0,
  referralBonusGranted: false,
  lastCheckinDate: '',
});

export const gameService = {
  getState: async (userId: string): Promise<GameState> => {
    // Prioritaskan data cloud (Firestore) agar progress tersimpan lintas perangkat
    if (isFirebaseAvailable()) {
      try {
        const snap = await db().collection('gameStates').doc(userId).get();
        if (snap.exists()) {
          const cloud = snap.data() as GameState;
          await storage.set(`game_${userId}`, cloud);
          return gameService._applyDailyReset(cloud);
        }
      } catch {}
    }
    const saved = await storage.get<GameState>(`game_${userId}`);
    if (!saved) {
      const state = defaultState(userId);
      await storage.set(`game_${userId}`, state);
      gameService._syncToCloud(state);
      return state;
    }
    return gameService._applyDailyReset(saved);
  },

  _applyDailyReset: (state: GameState): GameState => {
    // Migrasi field baru untuk state lama
    if (state.totalAdsWatched === undefined) state.totalAdsWatched = 0;
    if (state.referralCount === undefined) state.referralCount = 0;
    if (state.referralBonusGranted === undefined) state.referralBonusGranted = false;
    if (state.lastCheckinDate === undefined) state.lastCheckinDate = '';

    // Reset misi harian jika ganti tanggal (invite_friends TIDAK di-reset — kumulatif)
    if (state.lastMissionResetDate !== today()) {
      const inviteProgress = state.missionProgress['invite_friends'] || 0;
      const inviteClaimed = state.missionClaimed['invite_friends'] || false;
      state.missionProgress = {
        mine_coins: 0, upgrade_once: 0, watch_ads: 0, daily_checkin: 0,
        invite_friends: inviteProgress,
      };
      state.missionClaimed = {
        mine_coins: false, upgrade_once: false, watch_ads: false, daily_checkin: false,
        invite_friends: inviteClaimed,
      };
      state.lastMissionResetDate = today();
      storage.set(`game_${state.userId}`, state);
      gameService._syncToCloud(state);
    }
    return state;
  },

  _syncToCloud: (state: GameState): void => {
    if (!isFirebaseAvailable()) return;
    db().collection('gameStates').doc(state.userId).set(state)
      .catch(() => {});
  },

  saveState: async (state: GameState): Promise<void> => {
    await storage.set(`game_${state.userId}`, state);
    gameService._syncToCloud(state);
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

  recordAdWatch: (state: GameState, reward: number = 50): GameState => {
    let newState = gameService.addTransaction(state, 'ADS_REWARD', 'Reward Iklan', reward);
    newState.missionProgress = {
      ...newState.missionProgress,
      watch_ads: (newState.missionProgress['watch_ads'] || 0) + 1,
    };
    newState.totalAdsWatched = (newState.totalAdsWatched || 0) + 1;
    return newState;
  },

  claimMission: (state: GameState, missionId: string): { newState: GameState; reward: number } => {
    const mission = DAILY_MISSIONS.find(m => m.id === missionId);
    if (!mission) return { newState: state, reward: 0 };
    if (state.missionClaimed[missionId]) return { newState: state, reward: 0 };

    // Misi check-in wajib melalui checkInDaily (menonton video)
    if (missionId === 'daily_checkin' && state.lastCheckinDate !== today()) {
      return { newState: state, reward: 0 };
    }

    const progress = state.missionProgress[missionId] || 0;
    if (progress < mission.target) return { newState: state, reward: 0 };

    let newState = gameService.addTransaction(state, 'MISSION', `Mission: ${mission.title}`, mission.reward);
    newState.missionClaimed = { ...newState.missionClaimed, [missionId]: true };
    return { newState, reward: mission.reward };
  },

  // Check-in harian: hanya bisa sekali per hari (setelah menonton video)
  checkInDaily: (state: GameState): GameState => {
    const newState = { ...state, lastCheckinDate: today() };
    newState.missionProgress = {
      ...newState.missionProgress,
      daily_checkin: 1,
    };
    return newState;
  },

  canCheckIn: (state: GameState): boolean => state.lastCheckinDate !== today(),

  // Progres misi undang teman dari jumlah referral valid
  syncReferralProgress: (state: GameState, referralCount: number): GameState => {
    const newState = { ...state, referralCount };
    newState.missionProgress = {
      ...newState.missionProgress,
      invite_friends: Math.min(referralCount, 10),
    };
    return newState;
  },

  // Bonus referral 250 koin untuk akun yang diundang (sekali seumur akun)
  claimReferralBonus: (state: GameState): { newState: GameState; reward: number } => {
    const newState = gameService.addTransaction(state, 'BONUS', 'Bonus Referral', 250);
    return { newState, reward: 250 };
  },

  // Syarat penarikan: minimal 350x menonton iklan
  canWithdraw: (state: GameState): boolean =>
    (state.totalAdsWatched || 0) >= WITHDRAW_ADS_REQUIRED,

  withdrawAdsProgress: (state: GameState): number =>
    Math.min(state.totalAdsWatched || 0, WITHDRAW_ADS_REQUIRED),
};
