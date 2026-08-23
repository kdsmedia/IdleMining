// Idle Mining — Game Constants & Configuration

export const COIN_TO_RUPIAH = 100; // 100 Koin = Rp1

export const formatCoins = (amount: number): string => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString('id-ID');
};

export const formatRupiah = (koin: number): string => {
  const rp = Math.floor(koin / COIN_TO_RUPIAH);
  return `Rp${rp.toLocaleString('id-ID')}`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}d`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}j ${Math.floor((seconds % 3600) / 60)}m`;
};

// ---- UPGRADES ----
export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  baseCost: number;
  growthRate: number;
  baseBonus: number; // per level multiplier addition
  unit: string;
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'pickaxe',
    name: 'Pickaxe',
    description: 'Tingkatkan kekuatan tambang',
    icon: 'hardware-chip',
    maxLevel: 50,
    baseCost: 500,
    growthRate: 1.18,
    baseBonus: 0.10,
    unit: '% Mining',
  },
  {
    id: 'mining_speed',
    name: 'Mining Speed',
    description: 'Percepat produksi koin',
    icon: 'flash',
    maxLevel: 50,
    baseCost: 800,
    growthRate: 1.20,
    baseBonus: 0.08,
    unit: '% Speed',
  },
  {
    id: 'worker',
    name: 'Worker',
    description: 'Tingkatkan efisiensi pekerja',
    icon: 'people',
    maxLevel: 30,
    baseCost: 1200,
    growthRate: 1.22,
    baseBonus: 0.12,
    unit: '% Output',
  },
  {
    id: 'storage',
    name: 'Storage',
    description: 'Perluas kapasitas offline mining',
    icon: 'archive',
    maxLevel: 20,
    baseCost: 2000,
    growthRate: 1.25,
    baseBonus: 1, // hours
    unit: ' jam',
  },
  {
    id: 'conveyor',
    name: 'Conveyor',
    description: 'Optimasi jalur produksi',
    icon: 'git-merge',
    maxLevel: 40,
    baseCost: 1500,
    growthRate: 1.15,
    baseBonus: 0.06,
    unit: '% Efisiensi',
  },
];

export const getUpgradeCost = (baseCost: number, growthRate: number, level: number): number => {
  return Math.floor(baseCost * Math.pow(growthRate, level));
};

export const getUpgradeTotalBonus = (upgrade: UpgradeDef, level: number): number => {
  if (upgrade.id === 'storage') return level * upgrade.baseBonus; // hours
  return level * upgrade.baseBonus;
};

// ---- MINING ----
export const BASE_MINING_RATE = 10; // coins per minute
export const BASE_OFFLINE_CAP_HOURS = 1;
export const MAX_OFFLINE_CAP_HOURS = 12;

export const computeMiningRate = (upgradeLevels: Record<string, number>): number => {
  const pickaxeBonus = (upgradeLevels['pickaxe'] || 0) * 0.10;
  const speedBonus = (upgradeLevels['mining_speed'] || 0) * 0.08;
  const workerBonus = (upgradeLevels['worker'] || 0) * 0.12;
  const conveyorBonus = (upgradeLevels['conveyor'] || 0) * 0.06;
  const totalMultiplier = 1 + pickaxeBonus + speedBonus + workerBonus + conveyorBonus;
  return Math.floor(BASE_MINING_RATE * totalMultiplier);
};

export const computeOfflineCap = (storageLevel: number): number => {
  const base = BASE_OFFLINE_CAP_HOURS + storageLevel;
  return Math.min(base, MAX_OFFLINE_CAP_HOURS);
};

// ---- DAILY REWARD ----
export const DAILY_REWARDS = [500, 750, 1000, 1500, 2000, 3000, 5000];

// ---- DAILY MISSIONS ----
export interface MissionDef {
  id: string;
  title: string;
  description: string;
  type: 'mining' | 'upgrade' | 'login' | 'ads' | 'referral' | 'checkin';
  target: number;
  reward: number;
  rewardType: 'coins';
}

// ---- BONUS & SYARAT ----
export const SIGNUP_BONUS = 200; // bonus akun baru
export const REFERRAL_BONUS = 250; // bonus untuk pengundang & yang diundang
export const WITHDRAW_ADS_REQUIRED = 350; // syarat penarikan: 350x nonton iklan

export const DAILY_MISSIONS: MissionDef[] = [
  {
    id: 'mine_coins',
    title: 'Gali Koin',
    description: 'Kumpulkan koin dari mining',
    type: 'mining',
    target: 5000,
    reward: 1000,
    rewardType: 'coins',
  },
  {
    id: 'upgrade_once',
    title: 'Upgrade Tambang',
    description: 'Lakukan upgrade 1 kali',
    type: 'upgrade',
    target: 1,
    reward: 800,
    rewardType: 'coins',
  },
  {
    id: 'watch_ads',
    title: 'Tonton Iklan',
    description: 'Tonton 50 iklan video (50 koin/iklan)',
    type: 'ads',
    target: 50,
    reward: 2500,
    rewardType: 'coins',
  },
  {
    id: 'daily_checkin',
    title: 'Check-in Harian',
    description: 'Check-in hari ini (tonton 1 video saat klaim)',
    type: 'checkin',
    target: 1,
    reward: 75,
    rewardType: 'coins',
  },
  {
    id: 'invite_friends',
    title: 'Undang 10 Teman',
    description: 'Undang 10 teman dengan referral valid',
    type: 'referral',
    target: 10,
    reward: 10000,
    rewardType: 'coins',
  },
];

// ---- MINES ----
export interface MineDef {
  id: string;
  name: string;
  description: string;
  ores: string[];
  multiplier: number;
  unlockCoins: number;
  color: string;
}

export const MINES: MineDef[] = [
  { id: 'mine1', name: 'Stone Valley', description: 'Tambang batu dasar', ores: ['Stone', 'Coal'], multiplier: 1, unlockCoins: 0, color: '#8B6914' },
  { id: 'mine2', name: 'Iron Cave', description: 'Gua besi dan tembaga', ores: ['Iron', 'Copper'], multiplier: 2, unlockCoins: 50000, color: '#6B7280' },
  { id: 'mine3', name: 'Gold Mountain', description: 'Gunung emas legendaris', ores: ['Gold', 'Silver'], multiplier: 4, unlockCoins: 250000, color: '#FFD700' },
  { id: 'mine4', name: 'Crystal Cavern', description: 'Gua kristal langka', ores: ['Ruby', 'Emerald', 'Sapphire'], multiplier: 8, unlockCoins: 1000000, color: '#A855F7' },
  { id: 'mine5', name: 'Diamond Depths', description: 'Kedalaman berlian', ores: ['Diamond'], multiplier: 16, unlockCoins: 5000000, color: '#FFFFFF' },
];

// ---- XP ----
export const BASE_XP = 1000;
export const XP_GROWTH = 1.3;
export const xpForLevel = (level: number) => Math.floor(BASE_XP * Math.pow(XP_GROWTH, level - 1));

// ---- VIP ----
export interface VIPLevel {
  level: number;
  name: string;
  miningBonus: number;
  offlineBonus: number;
  color: string;
}

export const VIP_LEVELS: VIPLevel[] = [
  { level: 0, name: 'None', miningBonus: 0, offlineBonus: 0, color: '#9CA3AF' },
  { level: 1, name: 'VIP 1', miningBonus: 0.05, offlineBonus: 0.05, color: '#C0C0C0' },
  { level: 2, name: 'VIP 2', miningBonus: 0.10, offlineBonus: 0.10, color: '#FFD700' },
  { level: 3, name: 'VIP 3', miningBonus: 0.15, offlineBonus: 0.15, color: '#A855F7' },
];
