// Idle Mining — Design Tokens
export const Colors = {
  // Base
  bg: '#0A0A0F',
  bgCard: '#13131A',
  bgCardElevated: '#1A1A24',
  bgCardHighlight: '#1E1E2E',
  border: '#252535',
  borderLight: '#2E2E42',

  // Brand
  primary: '#FFD700',
  primaryDark: '#CC9E00',
  primaryLight: '#FFE94D',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0C8',
  textMuted: '#5A5A7A',
  textGold: '#FFD700',

  // Semantic
  success: '#4ADE80',
  successBg: '#0F2A1A',
  error: '#FF4444',
  errorBg: '#2A0F0F',
  warning: '#FFAA00',
  warningBg: '#2A1E0F',
  info: '#4499FF',
  infoBg: '#0F1E2A',

  // VIP
  vip: '#A855F7',
  vipBg: '#1A0F2A',

  // Rarity
  common: '#9CA3AF',
  uncommon: '#4ADE80',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#FFD700',

  // Mining
  ore1: '#9CA3AF', // Stone
  ore2: '#374151', // Coal
  ore3: '#B45309', // Copper
  ore4: '#6B7280', // Iron
  ore5: '#C0C0C0', // Silver
  ore6: '#FFD700', // Gold
  ore7: '#EF4444', // Ruby
  ore8: '#10B981', // Emerald
  ore9: '#3B82F6', // Sapphire
  ore10: '#FFFFFF', // Diamond
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  body: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 40,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
