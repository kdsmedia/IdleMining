import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { formatCoins } from '../../constants/gameData';
import { CoinIcon } from './CoinIcon';

interface Props {
  coins: number;
  size?: 'sm' | 'md' | 'lg';
  showRupiah?: boolean;
  rupiah?: number;
}

export function CoinDisplay({ coins, size = 'md', showRupiah = false, rupiah }: Props) {
  const styles = getStyles(size);
  return (
    <View style={styles.container}>
      <CoinIcon size={size === 'lg' ? 28 : size === 'md' ? 20 : 16} />
      <Text style={styles.amount}>{formatCoins(coins)}</Text>
      {showRupiah && rupiah !== undefined && (
        <Text style={styles.rupiah}>≈ Rp{rupiah.toLocaleString('id-ID')}</Text>
      )}
    </View>
  );
}

const getStyles = (size: 'sm' | 'md' | 'lg') => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  amount: {
    fontSize: size === 'lg' ? FontSize.xxl : size === 'md' ? FontSize.lg : FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.textGold,
  },
  rupiah: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
});
