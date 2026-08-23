import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../../hooks/useGame';
import { GoldButton } from '../../components/ui/GoldButton';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { CoinDisplay } from '../../components/ui/CoinDisplay';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { DAILY_MISSIONS, formatCoins } from '../../constants/gameData';
import { showRewardedAd, ensureRewardedLoaded } from '../../services/adService';
import { useAlert } from '@/template';

export default function MissionScreen() {
  const insets = useSafeAreaInsets();
  const { gameState, claimMission, recordAdWatch } = useGame();
  const { showAlert } = useAlert();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [watchingAd, setWatchingAd] = useState(false);

  React.useEffect(() => { ensureRewardedLoaded(); }, []);

  const handleWatchAd = async () => {
    setWatchingAd(true);
    const earned = await showRewardedAd();
    setWatchingAd(false);
    if (earned) {
      await recordAdWatch();
      showAlert('Reward Iklan', '+50 Koin ditambahkan ke saldomu!');
    } else {
      showAlert('Iklan Belum Siap', 'Coba lagi beberapa saat lagi.');
    }
  };

  if (!gameState) return null;

  const handleClaim = async (missionId: string) => {
    setClaimingId(missionId);
    const reward = await claimMission(missionId);
    setClaimingId(null);
    if (reward > 0) {
      showAlert('Mission Selesai!', `Kamu mendapatkan +${formatCoins(reward)} Koin`);
    }
  };

  const completedCount = DAILY_MISSIONS.filter(m => gameState.missionClaimed[m.id]).length;
  const totalCoinsReward = DAILY_MISSIONS.reduce((sum, m) => sum + m.reward, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mission</Text>
        <CoinDisplay coins={gameState.coins} size="sm" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryTitle}>Misi Harian</Text>
              <Text style={styles.summaryDate}>Reset setiap hari</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleNum}>{completedCount}</Text>
              <Text style={styles.progressCircleTotal}>/{DAILY_MISSIONS.length}</Text>
            </View>
          </View>
          <ProgressBar
            progress={completedCount / DAILY_MISSIONS.length}
            color={Colors.primary}
            height={8}
          />
          <Text style={styles.summaryReward}>
            Total reward: <Text style={{ color: Colors.primary }}>{formatCoins(totalCoinsReward)} Koin</Text>
          </Text>
        </View>

        <Text style={styles.sectionTitle}>MISI HARIAN</Text>

        {DAILY_MISSIONS.map(mission => {
          const progress = gameState.missionProgress[mission.id] || 0;
          const claimed = gameState.missionClaimed[mission.id] || false;
          const completed = progress >= mission.target;
          const progressRatio = Math.min(progress / mission.target, 1);

          return (
            <View key={mission.id} style={[styles.missionCard, claimed && styles.missionCardClaimed]}>
              <View style={styles.missionHeader}>
                <View style={[styles.missionIcon, claimed && styles.missionIconClaimed, completed && !claimed && styles.missionIconReady]}>
                  <Ionicons
                    name={claimed ? 'checkmark' : completed ? 'gift' : 'flag'}
                    size={20}
                    color={claimed ? Colors.success : completed ? Colors.primary : Colors.textMuted}
                  />
                </View>
                <View style={styles.missionInfo}>
                  <Text style={[styles.missionTitle, claimed && styles.missionTitleClaimed]}>
                    {mission.title}
                  </Text>
                  <Text style={styles.missionDesc}>{mission.description}</Text>
                </View>
                <View style={styles.rewardBadge}>
                  <Ionicons name="logo-bitcoin" size={12} color={Colors.primary} />
                  <Text style={styles.rewardText}>+{formatCoins(mission.reward)}</Text>
                </View>
              </View>

              {/* Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>
                    {formatCoins(Math.min(progress, mission.target))} / {formatCoins(mission.target)}
                  </Text>
                </View>
                <ProgressBar
                  progress={progressRatio}
                  color={claimed ? Colors.success : completed ? Colors.primary : Colors.info}
                  height={6}
                />
              </View>

              {/* Action */}
              {claimed ? (
                <View style={styles.claimedRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.claimedText}>Reward Diklaim</Text>
                </View>
              ) : completed ? (
                <View style={styles.claimRow}>
                  <GoldButton
                    title="KLAIM REWARD"
                    onPress={() => handleClaim(mission.id)}
                    loading={claimingId === mission.id}
                    size="sm"
                  />
                </View>
              ) : mission.type === 'ads' ? (
                <View style={styles.claimRow}>
                  <GoldButton
                    title="TONTON IKLAN (+50)"
                    onPress={handleWatchAd}
                    loading={watchingAd}
                    size="sm"
                    variant="secondary"
                  />
                </View>
              ) : (
                <Text style={styles.notReadyText}>
                  Selesaikan misi untuk klaim reward
                </Text>
              )}
            </View>
          );
        })}

        {/* Achievement teaser */}
        <View style={styles.achievementTeaser}>
          <Ionicons name="trophy" size={32} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.achievementTitle}>Achievement</Text>
            <Text style={styles.achievementSub}>Segera hadir — raih pencapaian jangka panjang</Text>
          </View>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>SOON</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  scroll: { padding: Spacing.md, gap: Spacing.md },
  summaryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    gap: Spacing.sm,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  summaryDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  progressCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Colors.bgCardElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  progressCircleNum: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  progressCircleTotal: { fontSize: FontSize.sm, color: Colors.textMuted },
  summaryReward: { fontSize: FontSize.sm, color: Colors.textSecondary },
  sectionTitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  missionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  missionCardClaimed: { borderColor: Colors.success, opacity: 0.75 },
  missionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  missionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgCardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  missionIconClaimed: { backgroundColor: Colors.successBg, borderColor: Colors.success },
  missionIconReady: { backgroundColor: '#1A1200', borderColor: Colors.primaryDark },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  missionTitleClaimed: { color: Colors.textMuted },
  missionDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#1A1200',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  rewardText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold },
  progressSection: { gap: 6 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  progressValue: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  claimedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  claimedText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.semibold },
  claimRow: { alignItems: 'flex-start' },
  notReadyText: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.xs },
  achievementTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.7,
  },
  achievementTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  achievementSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  comingSoon: {
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  comingSoonText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.bold },
});
