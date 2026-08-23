import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { DAILY_REWARDS, formatCoins } from '../../constants/gameData';
import { GoldButton } from '../ui/GoldButton';

interface Props {
  visible: boolean;
  currentStreak: number;
  onClaim: () => void;
  onClose: () => void;
}

export function DailyRewardModal({ visible, currentStreak, onClaim, onClose }: Props) {
  const nextDay = Math.min((currentStreak % 7) + 1, 7);
  const reward = DAILY_REWARDS[nextDay - 1];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="gift" size={36} color={Colors.primary} />
            <Text style={styles.title}>Daily Reward</Text>
            <Text style={styles.subtitle}>Login setiap hari untuk reward lebih besar!</Text>
          </View>

          {/* 7-day calendar */}
          <View style={styles.calendar}>
            {DAILY_REWARDS.map((r, i) => {
              const day = i + 1;
              const isClaimed = currentStreak >= day;
              const isToday = day === nextDay;
              return (
                <View key={day} style={[styles.dayCell, isClaimed && styles.dayClaimed, isToday && styles.dayToday]}>
                  <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>H{day}</Text>
                  <Ionicons
                    name={isClaimed ? 'checkmark-circle' : 'logo-bitcoin'}
                    size={18}
                    color={isClaimed ? Colors.success : isToday ? Colors.primary : Colors.textMuted}
                  />
                  <Text style={[styles.dayReward, isToday && styles.dayRewardToday]}>{formatCoins(r)}</Text>
                </View>
              );
            })}
          </View>

          {/* Today's reward highlight */}
          <View style={styles.todayReward}>
            <Text style={styles.todayLabel}>Hari {nextDay} — Reward Hari Ini</Text>
            <View style={styles.rewardRow}>
              <Ionicons name="logo-bitcoin" size={24} color={Colors.primary} />
              <Text style={styles.rewardAmount}>+{formatCoins(reward)} Koin</Text>
            </View>
          </View>

          <GoldButton title="CLAIM REWARD" onPress={onClaim} fullWidth size="lg" />
          <Pressable onPress={onClose} style={styles.skip}>
            <Text style={styles.skipText}>Lewati</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  dayCell: {
    width: 42,
    height: 60,
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayClaimed: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.success,
  },
  dayToday: {
    backgroundColor: '#2A1E00',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  dayNum: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.semibold,
  },
  dayNumToday: {
    color: Colors.primary,
  },
  dayReward: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  dayRewardToday: {
    color: Colors.primary,
  },
  todayReward: {
    backgroundColor: '#1A1200',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    marginBottom: Spacing.md,
  },
  todayLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rewardAmount: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  skip: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
