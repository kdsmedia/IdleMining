import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CoinIcon } from '../../components/ui/CoinIcon';
import { useGame } from '../../hooks/useGame';
import { GoldButton } from '../../components/ui/GoldButton';
import { CoinDisplay } from '../../components/ui/CoinDisplay';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { UPGRADES, getUpgradeCost, getUpgradeTotalBonus, formatCoins, computeMiningRate } from '../../constants/gameData';
import { useAlert } from '@/template';

export default function UpgradeScreen() {
  const insets = useSafeAreaInsets();
  const { gameState, upgrade } = useGame();
  const { showAlert } = useAlert();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmUpgrade, setConfirmUpgrade] = useState<string | null>(null);

  if (!gameState) return null;

  const handleUpgrade = async (upgradeId: string) => {
    setConfirmUpgrade(null);
    setLoadingId(upgradeId);
    const { success, error } = await upgrade(upgradeId);
    setLoadingId(null);
    if (!success && error) {
      showAlert('Upgrade Gagal', error);
    }
  };

  const confirmDef = UPGRADES.find(u => u.id === confirmUpgrade);
  const confirmLevel = confirmUpgrade ? (gameState.upgradeLevels[confirmUpgrade] || 0) : 0;
  const confirmCost = confirmDef ? getUpgradeCost(confirmDef.baseCost, confirmDef.growthRate, confirmLevel) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Upgrade</Text>
        <CoinDisplay coins={gameState.coins} size="sm" />
      </View>

      {/* Mining rate preview */}
      <View style={styles.rateCard}>
        <Ionicons name="trending-up" size={16} color={Colors.success} />
        <Text style={styles.rateText}>Mining Rate Saat Ini: <Text style={styles.rateHighlight}>{formatCoins(gameState.miningRate)} koin/menit</Text></Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {UPGRADES.map(upg => {
          const currentLevel = gameState.upgradeLevels[upg.id] || 0;
          const cost = getUpgradeCost(upg.baseCost, upg.growthRate, currentLevel);
          const isMaxed = currentLevel >= upg.maxLevel;
          const canAfford = gameState.coins >= cost;
          const totalBonus = getUpgradeTotalBonus(upg, currentLevel);
          const nextBonus = getUpgradeTotalBonus(upg, currentLevel + 1);
          const progress = currentLevel / upg.maxLevel;

          // Preview new mining rate
          const previewLevels = { ...gameState.upgradeLevels, [upg.id]: currentLevel + 1 };
          const previewRate = computeMiningRate(previewLevels);

          return (
            <View key={upg.id} style={[styles.upgradeCard, isMaxed && styles.upgradeCardMaxed]}>
              <View style={styles.upgradeHeader}>
                <View style={[styles.upgradeIcon, isMaxed && styles.upgradeIconMaxed]}>
                  <Ionicons name={upg.icon as any} size={24} color={isMaxed ? Colors.success : Colors.primary} />
                </View>
                <View style={styles.upgradeInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.upgradeName}>{upg.name}</Text>
                    {isMaxed && (
                      <View style={styles.maxBadge}>
                        <Text style={styles.maxText}>MAX</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.upgradeDesc}>{upg.description}</Text>
                  <View style={styles.levelRow}>
                    <Text style={styles.levelText}>Lv.{currentLevel}</Text>
                    <View style={styles.progressWrap}>
                      <ProgressBar progress={progress} color={isMaxed ? Colors.success : Colors.primary} height={4} />
                    </View>
                    <Text style={styles.maxLevel}>/{upg.maxLevel}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Bonus Saat Ini</Text>
                  <Text style={styles.statBoxValue}>
                    {upg.id === 'storage' ? `${totalBonus}${upg.unit}` : `+${(totalBonus * 100).toFixed(0)}${upg.unit}`}
                  </Text>
                </View>
                {!isMaxed && (
                  <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
                )}
                {!isMaxed && (
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Setelah Upgrade</Text>
                    <Text style={[styles.statBoxValue, { color: Colors.success }]}>
                      {upg.id === 'storage' ? `${nextBonus}${upg.unit}` : `+${(nextBonus * 100).toFixed(0)}${upg.unit}`}
                    </Text>
                  </View>
                )}
              </View>

              {!isMaxed && (
                <View style={styles.upgradePreview}>
                  <Text style={styles.previewText}>
                    Mining: {formatCoins(gameState.miningRate)} → <Text style={{ color: Colors.success }}>{formatCoins(previewRate)} koin/min</Text>
                  </Text>
                </View>
              )}

              {!isMaxed && (
                <View style={styles.upgradeFooter}>
                  <View style={styles.costRow}>
                    <CoinIcon size={14} />
                    <Text style={[styles.costText, !canAfford && styles.costInsufficient]}>
                      {formatCoins(cost)} Koin
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.upgradeBtn, !canAfford && styles.upgradeBtnDisabled]}
                    onPress={() => setConfirmUpgrade(upg.id)}
                    disabled={!canAfford || loadingId === upg.id}
                  >
                    {loadingId === upg.id ? (
                      <Text style={styles.upgradeBtnText}>...</Text>
                    ) : (
                      <Text style={[styles.upgradeBtnText, !canAfford && { color: Colors.textMuted }]}>
                        UPGRADE
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={confirmUpgrade !== null} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.confirmCard}>
            <Ionicons name="arrow-up-circle" size={40} color={Colors.primary} />
            <Text style={styles.confirmTitle}>Konfirmasi Upgrade</Text>
            {confirmDef && (
              <>
                <Text style={styles.confirmName}>{confirmDef.name} → Lv.{confirmLevel + 1}</Text>
                <View style={styles.confirmCostRow}>
                  <CoinIcon size={20} />
                  <Text style={styles.confirmCost}>{formatCoins(confirmCost)} Koin</Text>
                </View>
                <View style={styles.confirmBtns}>
                  <GoldButton title="Batal" onPress={() => setConfirmUpgrade(null)} variant="secondary" size="md" />
                  <GoldButton title="UPGRADE" onPress={() => handleUpgrade(confirmUpgrade!)} size="md" />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successBg,
    margin: Spacing.md,
    marginBottom: 0,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  rateText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  rateHighlight: { color: Colors.success, fontWeight: FontWeight.bold },
  scroll: { padding: Spacing.md, gap: Spacing.md },
  upgradeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  upgradeCardMaxed: { borderColor: Colors.success, opacity: 0.8 },
  upgradeHeader: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  upgradeIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: '#1A1200',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  upgradeIconMaxed: { backgroundColor: Colors.successBg, borderColor: Colors.success },
  upgradeInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  upgradeName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  maxBadge: {
    backgroundColor: Colors.successBg,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  maxText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.bold },
  upgradeDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.xs },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  levelText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold, width: 28 },
  progressWrap: { flex: 1 },
  maxLevel: { fontSize: FontSize.xs, color: Colors.textMuted },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statBoxLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  statBoxValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  upgradePreview: {
    backgroundColor: '#0D2A0D',
    borderRadius: Radius.sm,
    padding: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  previewText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  upgradeFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  costText: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.primary },
  costInsufficient: { color: Colors.textMuted },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  upgradeBtnDisabled: { backgroundColor: Colors.bgCardElevated },
  upgradeBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.extrabold, color: Colors.bg },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  confirmCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    gap: Spacing.sm,
  },
  confirmTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  confirmName: { fontSize: FontSize.body, color: Colors.textSecondary },
  confirmCostRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  confirmCost: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  confirmBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
});
