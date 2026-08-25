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
    baseCost: 2500,
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
    baseCost: 4000,
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
    baseCost: 6000,
    growthRate: 1.22,
    baseBonus: 0.12,
    unit: '% Output',
  },
  {
    id: 'storage',
    name: 'Storage',
    description: 'Perluas kapasitas penyimpanan',
    icon: 'archive',
    maxLevel: 20,
    baseCost: 10000,
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
    baseCost: 7500,
    growthRate: 1.15,
    baseBonus: 0.06,
    unit: '% Efisiensi',
  },
  {
    id: 'drill',
    name: 'Bor',
    description: 'Gali lapisan lebih dalam',
    icon: 'construct',
    maxLevel: 40,
    baseCost: 12500,
    growthRate: 1.19,
    baseBonus: 0.09,
    unit: '% Mining',
  },
  {
    id: 'dynamite',
    name: 'Dinamit',
    description: 'Ledakkan batuan keras',
    icon: 'flame',
    maxLevel: 30,
    baseCost: 20000,
    growthRate: 1.22,
    baseBonus: 0.15,
    unit: '% Output',
  },
  {
    id: 'radar',
    name: 'Radar',
    description: 'Deteksi urat koin terbaik',
    icon: 'locate',
    maxLevel: 30,
    baseCost: 16000,
    growthRate: 1.18,
    baseBonus: 0.07,
    unit: '% Akurasi',
  },
  {
    id: 'tunnel',
    name: 'Terowongan',
    description: 'Akses jalur tambang baru',
    icon: 'trail',
    maxLevel: 25,
    baseCost: 30000,
    growthRate: 1.24,
    baseBonus: 0.18,
    unit: '% Akses',
  },
  {
    id: 'refinery',
    name: 'Refinery',
    description: 'Pemurnian ore jadi koin',
    icon: 'flask',
    maxLevel: 20,
    baseCost: 40000,
    growthRate: 1.25,
    baseBonus: 0.20,
    unit: '% Output',
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
// Rate dasar sengaja rendah agar hasil mining tidak terlalu cepat
export const BASE_MINING_RATE = 1; // koin per menit
export const MINING_ALGORITHM = 'SHA-256';
export const BASE_HASH_RATE = 5; // hashes per detik
export const BASE_OFFLINE_CAP_HOURS = 1;
export const MAX_OFFLINE_CAP_HOURS = 12;

export const computeMiningRate = (upgradeLevels: Record<string, number>): number => {
  let multiplier = 1;
  for (const upg of UPGRADES) {
    if (upg.id === 'storage') continue; // storage menambah kapasitas, bukan rate
    multiplier += (upgradeLevels[upg.id] || 0) * upg.baseBonus;
  }
  return Math.max(BASE_MINING_RATE, Math.floor(BASE_MINING_RATE * multiplier));
};

export const computeHashRate = (upgradeLevels: Record<string, number>): number => {
  const levelsSum = Object.values(upgradeLevels).reduce((a, b) => a + b, 0);
  const rate = computeMiningRate(upgradeLevels);
  return Math.floor(BASE_HASH_RATE * rate + levelsSum * 2); // H/s
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
  type: 'mining' | 'upgrade' | 'login' | 'referral' | 'checkin';
  target: number;
  reward: number;
  rewardType: 'coins';
}

// ---- BONUS & SYARAT ----
export const SIGNUP_BONUS = 200; // bonus akun baru
export const REFERRAL_BONUS = 250; // bonus untuk pengundang & yang diundang
export const WITHDRAW_ADS_REQUIRED = 350; // sesi bonus (rewarded) wajib sebelum penarikan
export const BONUS_REWARD_COINS = 50; // koin per sesi bonus

export const DAILY_MISSIONS: MissionDef[] = [
  {
    id: 'mine_coins',
    title: 'Gali Koin',
    description: 'Kumpulkan 5.000 koin dari mining',
    type: 'mining',
    target: 5000,
    reward: 1000,
    rewardType: 'coins',
  },
  {
    id: 'upgrade_once',
    title: 'Upgrade',
    description: 'Lakukan upgrade 1 kali',
    type: 'upgrade',
    target: 1,
    reward: 800,
    rewardType: 'coins',
  },
  {
    id: 'daily_checkin',
    title: 'Check-in',
    description: 'Check-in hari ini',
    type: 'checkin',
    target: 1,
    reward: 75,
    rewardType: 'coins',
  },
  {
    id: 'invite_friends',
    title: 'Undang Teman',
    description: 'Undang 10 teman pakai kode referral',
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
