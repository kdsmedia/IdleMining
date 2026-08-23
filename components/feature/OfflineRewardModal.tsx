import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CoinIcon } from '../ui/CoinIcon';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { formatCoins } from '../../constants/gameData';
import { GoldButton } from '../ui/GoldButton';

interface Props {
  visible: boolean;
  reward: number;
  onClaim: () => void;
}

export function OfflineRewardModal({ visible, reward, onClaim }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Ionicons name="time" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Selamat Datang Kembali!</Text>
          <Text style={styles.subtitle}>Tambangmu terus bekerja saat kamu pergi</Text>

          <View style={styles.rewardCard}>
            <Text style={styles.rewardLabel}>⛏️ Offline Mining</Text>
            <View style={styles.rewardRow}>
              <CoinIcon size={32} />
              <Text style={styles.rewardAmount}>+{formatCoins(reward)}</Text>
            </View>
            <Text style={styles.rewardSubtext}>Koin</Text>
          </View>

          <GoldButton title="KLAIM SEKARANG" onPress={onClaim} fullWidth size="lg" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A1E00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  rewardCard: {
    backgroundColor: '#1A1200',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  rewardLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontWeight: FontWeight.semibold,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rewardAmount: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  rewardSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
