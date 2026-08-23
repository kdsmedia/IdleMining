import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../../hooks/useGame';
import { useAuth } from '../../hooks/useAuth';
import { GoldButton } from '../../components/ui/GoldButton';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { CoinDisplay } from '../../components/ui/CoinDisplay';
import { CoinIcon } from '../../components/ui/CoinIcon';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { DAILY_MISSIONS, formatCoins } from '../../constants/gameData';
import { PLAYSTORE_URL } from '../../constants/legalContent';
import { showRewardedAd, ensureRewardedLoaded } from '../../services/adService';
import { useAlert } from '@/template';

export default function MissionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { gameState, claimMission, recordAdWatch, checkInDaily, canCheckInToday } = useGame();
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
      showAlert('Bonus Koin', '+50 Koin ditambahkan ke saldomu!');
    } else {
      showAlert('Bonus Belum Siap', 'Coba lagi beberapa saat lagi.');
    }
  };

  // Check-in harian
  const handleCheckIn = async () => {
    if (!canCheckInToday) {
      showAlert('Sudah Check-in', 'Kamu sudah check-in hari ini. Kembali lagi besok!');
      return;
    }
    setWatchingAd(true);
    const earned = await showRewardedAd();
    setWatchingAd(false);
    if (!earned) {
      showAlert('Belum Siap', 'Coba lagi beberapa saat lagi.');
      return;
    }
    await checkInDaily();
    const reward = await claimMission('daily_checkin');
    if (reward > 0) {
      showAlert('Check-in Berhasil!', `+${formatCoins(reward)} Koin ditambahkan ke saldomu!`);
    }
  };

  const handleShareReferral = async () => {
    if (!user) return;
    try {
      await Share.share({
        message: `Main INDOMINE bareng aku! Download di Play Store: ${PLAYSTORE_URL}&referrer=${user.referralCode}\nMasukkan kode referral ${user.referralCode} saat daftar - kita berdua dapat bonus 250 koin!`,
      });
    } catch {}
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

        <Text style={styles.sectionTitle}>MISI</Text>

        {/* Grid mini card — 2 sebaris */}
        <View style={styles.missionGrid}>
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
                      size={14}
                      color={claimed ? Colors.success : completed ? Colors.primary : Colors.textMuted}
                    />
                  </View>
                  <Text numberOfLines={1} style={[styles.missionTitle, claimed && styles.missionTitleClaimed]}>
                    {mission.title}
                  </Text>
                </View>

                <Text numberOfLines={2} style={styles.missionDesc}>{mission.description}</Text>

                <View style={styles.rewardBadge}>
                  <CoinIcon size={12} />
                  <Text style={styles.rewardText}>+{formatCoins(mission.reward)}</Text>
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                  <ProgressBar
                    progress={progressRatio}
                    color={claimed ? Colors.success : completed ? Colors.primary : Colors.info}
                    height={5}
                  />
                  <Text style={styles.progressValue}>
                    {formatCoins(Math.min(progress, mission.target))}/{formatCoins(mission.target)}
                  </Text>
                </View>

                {/* Tombol sesuai tugas misi */}
                {claimed ? (
                  <View style={styles.claimedRow}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={styles.claimedText}>Diklaim</Text>
                  </View>
                ) : completed ? (
                  <GoldButton
                    title="KLAIM"
                    onPress={() => handleClaim(mission.id)}
                    loading={claimingId === mission.id}
                    size="sm"
                    fullWidth
                  />
                ) : mission.type === 'ads' ? (
                  <GoldButton
                    title="BONUS +50"
                    onPress={handleWatchAd}
                    loading={watchingAd}
                    size="sm"
                    variant="secondary"
                    fullWidth
                  />
                ) : mission.type === 'checkin' ? (
                  <GoldButton
                    title={canCheckInToday ? 'CHECK-IN' : 'SUDAH'}
                    onPress={handleCheckIn}
                    loading={watchingAd}
                    size="sm"
                    variant={canCheckInToday ? 'primary' : 'secondary'}
                    fullWidth
                  />
                ) : mission.type === 'referral' ? (
                  <GoldButton
                    title="UNDANG"
                    onPress={handleShareReferral}
                    size="sm"
                    variant="secondary"
                    fullWidth
                  />
                ) : mission.type === 'mining' ? (
                  <GoldButton
                    title="MINING"
                    onPress={() => router.push('/')}
                    size="sm"
                    variant="secondary"
                    fullWidth
                  />
                ) : mission.type === 'upgrade' ? (
                  <GoldButton
                    title="UPGRADE"
                    onPress={() => router.push('/upgrade')}
                    size="sm"
                    variant="secondary"
                    fullWidth
                  />
                ) : (
                  <Text style={styles.notReadyText}>
                    Selesaikan misi untuk klaim reward
                  </Text>
                )}
              </View>
            );
          })}
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
  missionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  missionCard: {
    width: '48%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  missionCardClaimed: { borderColor: Colors.success, opacity: 0.75 },
  missionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  missionIcon: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgCardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  missionIconClaimed: { backgroundColor: Colors.successBg, borderColor: Colors.success },
  missionIconReady: { backgroundColor: '#1A1200', borderColor: Colors.primaryDark },
  missionTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  missionTitleClaimed: { color: Colors.textMuted },
  missionDesc: { fontSize: FontSize.xs, color: Colors.textMuted, minHeight: 28 },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    backgroundColor: '#1A1200',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  rewardText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold },
  progressSection: { gap: 4 },
  progressValue: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  claimedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  claimedText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.semibold },
  notReadyText: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.xs },
});
