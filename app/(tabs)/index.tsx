import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../../hooks/useGame';
import { useAuth } from '../../hooks/useAuth';
import { MiningAnimation } from '../../components/feature/MiningAnimation';
import { DailyRewardModal } from '../../components/feature/DailyRewardModal';
import { CoinDisplay } from '../../components/ui/CoinDisplay';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AdBanner } from '../../components/ui/AdBanner';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { formatCoins, formatRupiah, MINES, xpForLevel, computeHashRate, MINING_ALGORITHM } from '../../constants/gameData';
import NetInfo from '@react-native-community/netinfo';

export default function MiningScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    gameState, showDailyModal,
    claimDaily, dismissDailyModal,
    claimMiningTick,
  } = useGame();

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isOnline, setIsOnline] = React.useState(true);
  const [appState, setAppState] = React.useState(AppState.currentState);
  const appStateRef = useRef(AppState.currentState);

  // Aplikasi wajib internet: pantau koneksi & status aplikasi
  useEffect(() => {
    const unsubNet = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected !== false);
    });
    const unsubApp = AppState.addEventListener('change', next => {
      appStateRef.current = next;
      setAppState(next);
    });
    return () => {
      unsubNet();
      unsubApp.remove();
    };
  }, []);

  // Mining aktif hanya saat aplikasi dibuka & ada internet
  const miningActive = isOnline && appState === 'active';

  // Tick mining setiap 60 detik; berhenti saat offline / aplikasi ditutup
  const gameExists = !!gameState;
  useEffect(() => {
    if (!gameExists) return;
    if (tickRef.current) clearInterval(tickRef.current);
    if (!miningActive) return;
    tickRef.current = setInterval(() => {
      if (appStateRef.current === 'active' && isOnline) {
        claimMiningTick(1); // 1 menit mining
      }
    }, 90000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [gameState?.miningRate, gameExists, claimMiningTick, miningActive, isOnline]);

  if (!gameState || !user) return null;

  const hashRate = computeHashRate(gameState.upgradeLevels);

  const currentMine = MINES.find(m => m.id === gameState.currentMineId) || MINES[0];
  const xpNeeded = xpForLevel(user.level);
  const xpProgress = Math.min(user.xp / xpNeeded, 1);
  const nextMine = MINES.find(m => m.unlockCoins > gameState.totalEarned);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.username}>{user.username}</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelText}>Lv.{user.level}</Text>
              <ProgressBar progress={xpProgress} color={Colors.info} height={4} />
            </View>
          </View>
        </View>
        <View style={styles.balanceWrap}>
          <CoinDisplay coins={gameState.coins} size="md" />
          <Text style={styles.rupiahText}>{formatRupiah(gameState.coins)}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Daily reward banner */}
        {gameState.lastDailyClaimDate !== new Date().toISOString().split('T')[0] && (
          <Pressable style={styles.dailyBanner} onPress={() => claimDaily()}>
            <Ionicons name="gift" size={20} color={Colors.primary} />
            <Text style={styles.dailyBannerText}>Daily Reward tersedia — Klaim sekarang!</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </Pressable>
        )}

        {/* Status mining */}
        {!miningActive && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline" size={16} color={Colors.error} />
            <Text style={styles.offlineText}>
              {isOnline ? 'Mining berhenti saat aplikasi ditutup' : 'Tidak ada internet — mining berhenti'}
            </Text>
          </View>
        )}

        {/* Mining area */}
        <View style={styles.mineCard}>
          <MiningAnimation
            miningRate={gameState.miningRate}
            hashRate={hashRate}
            algorithm={MINING_ALGORITHM}
            isActive={miningActive}
            currentMine={currentMine.name}
          />
        </View>

        {/* Banner */}
        <AdBanner />

        {/* Statistik mini — 3 sebaris */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="timer" size={18} color={Colors.info} />
            <Text style={styles.statValue}>{gameState.offlineCapHours}j</Text>
            <Text style={styles.statLabel}>Simpan</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={18} color={Colors.success} />
            <Text style={styles.statValue}>{formatCoins(gameState.miningRate)}/m</Text>
            <Text style={styles.statLabel}>Laju</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={18} color={Colors.vip} />
            <Text style={styles.statValue}>{hashRate} H/s</Text>
            <Text style={styles.statLabel}>Hash</Text>
          </View>
        </View>

        {/* Ore display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ore Saat Ini</Text>
          <View style={styles.oreRow}>
            {currentMine.ores.map(ore => (
              <View key={ore} style={styles.oreBadge}>
                <Ionicons name="diamond" size={14} color={currentMine.color} />
                <Text style={styles.oreName}>{ore}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Next mine unlock */}
        {nextMine && (
          <View style={styles.unlockCard}>
            <Ionicons name="lock-closed" size={16} color={Colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={styles.unlockTitle}>Area Berikutnya: {nextMine.name}</Text>
              <ProgressBar
                progress={Math.min(gameState.totalEarned / nextMine.unlockCoins, 1)}
                color={nextMine.color}
                height={6}
              />
              <Text style={styles.unlockSub}>{formatCoins(Math.max(0, nextMine.unlockCoins - gameState.totalEarned))} koin lagi</Text>
            </View>
          </View>
        )}

        {/* Total stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistik Mining</Text>
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Koin Diperoleh</Text>
              <Text style={styles.totalValue}>{formatCoins(gameState.totalEarned)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Nilai Saldo</Text>
              <Text style={styles.totalValueGold}>{formatRupiah(gameState.coins)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Upgrade</Text>
              <Text style={styles.totalValue}>{gameState.totalUpgrades}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modals */}
      <DailyRewardModal
        visible={showDailyModal}
        currentStreak={gameState.dailyStreak}
        onClaim={claimDaily}
        onClose={dismissDailyModal}
      />
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
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgCardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  username: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 2 },
  levelText: { fontSize: FontSize.xs, color: Colors.info, fontWeight: FontWeight.bold, width: 32 },
  balanceWrap: { alignItems: 'flex-end' },
  rupiahText: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  scroll: { padding: Spacing.md },
  dailyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#1A1200',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  dailyBannerText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  mineCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  offlineText: { flex: 1, fontSize: FontSize.xs, color: Colors.error },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  section: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.bold, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  oreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  oreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  oreName: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  unlockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unlockTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold, marginBottom: 6 },
  unlockSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  totalCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  totalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  totalValue: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  totalValueGold: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.border },
});
