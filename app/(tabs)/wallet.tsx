import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../../hooks/useGame';
import { GoldButton } from '../../components/ui/GoldButton';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { formatCoins, formatRupiah, COIN_TO_RUPIAH, WITHDRAW_ADS_REQUIRED, BONUS_REWARD_COINS } from '../../constants/gameData';
import { Transaction, gameService } from '../../services/gameService';
import { showRewardedAd, ensureRewardedLoaded } from '../../services/adService';
import { CoinIcon } from '../../components/ui/CoinIcon';
import { useAlert } from '@/template';

const WITHDRAW_OPTIONS = [1000, 2000, 5000, 10000, 20000, 50000];

const TX_COLORS: Record<string, string> = {
  MINING: Colors.success,
  OFFLINE_MINING: Colors.info,
  DAILY_REWARD: Colors.primary,
  MISSION: Colors.vip,
  UPGRADE: Colors.error,
  BONUS: Colors.warning,
  WITHDRAWAL: Colors.error,
};

const TX_ICONS: Record<string, any> = {
  MINING: 'hammer',
  OFFLINE_MINING: 'time',
  DAILY_REWARD: 'gift',
  MISSION: 'flag',
  UPGRADE: 'arrow-up-circle',
  BONUS: 'star',
  WITHDRAWAL: 'cash',
};

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { gameState, recordAdWatch, requestWithdrawal } = useGame();
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [danaNumber, setDanaNumber] = useState('');
  const [claimingBonus, setClaimingBonus] = useState(false);

  useEffect(() => {
    ensureRewardedLoaded();
  }, []);

  if (!gameState) return null;

  const rupiah = Math.floor(gameState.coins / COIN_TO_RUPIAH);
  const filteredTx = gameState.transactions.filter(tx => {
    if (filter === 'INCOME') return tx.amount > 0;
    if (filter === 'EXPENSE') return tx.amount < 0;
    return true;
  });

  const minWithdrawCoins = 1000 * COIN_TO_RUPIAH;
  const bonusDone = gameState.totalAdsWatched || 0;
  const bonusComplete = bonusDone >= WITHDRAW_ADS_REQUIRED;
  const balanceEnough = gameState.coins >= minWithdrawCoins;
  const withdrawEligible = gameService.canWithdraw(gameState);
  const pendingWithdrawCoins = gameState.transactions
    .filter(tx => tx.type === 'WITHDRAWAL' && tx.status === 'pending')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const handleClaimBonus = async () => {
    if (claimingBonus) return;
    setClaimingBonus(true);
    const earned = await showRewardedAd();
    setClaimingBonus(false);
    if (earned) {
      await recordAdWatch(BONUS_REWARD_COINS);
      showAlert('Bonus Diterima!', `+${BONUS_REWARD_COINS} Koin ditambahkan ke saldomu!`);
    } else {
      showAlert('Belum Selesai', 'Selesaikan sesi bonus sampai akhir untuk menerima reward.');
    }
  };

  const openWithdraw = () => {
    if (!withdrawEligible) {
      const reasons: string[] = [];
      if (!balanceEnough) reasons.push(`saldo minimal ${formatCoins(minWithdrawCoins)} koin`);
      if (!bonusComplete) reasons.push(`misi bonus ${bonusDone}/${WITHDRAW_ADS_REQUIRED}`);
      showAlert('Belum Memenuhi Syarat', `Lengkapi dulu: ${reasons.join(' dan ')}.`);
      return;
    }
    setShowWithdraw(true);
  };

  const handleWithdraw = async () => {
    if (!selectedAmount) { showAlert('Pilih Nominal', 'Pilih nominal penarikan terlebih dahulu'); return; }
    if (!danaNumber.trim() || danaNumber.length < 10) { showAlert('Nomor DANA', 'Masukkan nomor DANA yang valid'); return; }
    const coinsNeeded = selectedAmount * COIN_TO_RUPIAH;
    if (gameState.coins < coinsNeeded) { showAlert('Koin Tidak Cukup', `Kamu butuh ${formatCoins(coinsNeeded)} koin`); return; }
    const result = await requestWithdrawal(selectedAmount, danaNumber);
    if (!result.success) {
      showAlert('Penarikan Gagal', result.error || 'Terjadi kesalahan, coba lagi.');
      return;
    }
    setShowWithdraw(false);
    showAlert(
      'Penarikan Diajukan',
      `Permintaan Rp${selectedAmount.toLocaleString('id-ID')} ke DANA ${danaNumber} berhasil diajukan dan sedang diproses admin. Status dapat dipantau di riwayat transaksi.`
    );
    setSelectedAmount(null);
    setDanaNumber('');
  };

  const renderTx = ({ item }: { item: Transaction }) => {
    const isPositive = item.amount > 0;
    const color = TX_COLORS[item.type] || Colors.textSecondary;
    const icon = TX_ICONS[item.type] || 'swap-horizontal';
    const date = new Date(item.timestamp);
    const dateStr = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    return (
      <View style={styles.txItem}>
        <View style={[styles.txIcon, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txLabel}>{item.label}</Text>
          <Text style={styles.txDate}>{dateStr} · {item.status}</Text>
        </View>
        <View style={styles.txAmountCol}>
          <Text style={[styles.txAmount, { color: isPositive ? Colors.success : Colors.error }]}>
            {isPositive ? '+' : ''}{formatCoins(item.amount)}
          </Text>
          <Text style={styles.txBalance}>{formatCoins(item.balanceAfter)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Koin</Text>
          <View style={styles.balanceRow}>
            <CoinIcon size={32} />
            <Text style={styles.balanceAmount}>{formatCoins(gameState.coins)}</Text>
          </View>
          <View style={styles.rupiahRow}>
            <Ionicons name="cash" size={16} color={Colors.success} />
            <Text style={styles.rupiahValue}>{formatRupiah(gameState.coins)}</Text>
            <Text style={styles.conversionRate}>(100 Koin = Rp1)</Text>
          </View>
        </View>

        {/* Balance detail */}
        <View style={styles.balanceDetail}>
          <View style={styles.balanceDetailItem}>
            <Text style={styles.balanceDetailLabel}>Available</Text>
            <Text style={styles.balanceDetailValue}>{formatCoins(gameState.coins)}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.balanceDetailItem}>
            <Text style={styles.balanceDetailLabel}>Pending</Text>
            <Text style={styles.balanceDetailValue}>{formatCoins(pendingWithdrawCoins)}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.balanceDetailItem}>
            <Text style={styles.balanceDetailLabel}>Nilai Rp</Text>
            <Text style={[styles.balanceDetailValue, { color: Colors.primary }]}>
              Rp{rupiah.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Bonus mission progress */}
        <View style={styles.bonusCard}>
          <View style={styles.bonusHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bonusTitle}>Misi Bonus Penarikan</Text>
              <Text style={styles.bonusSub}>
                {bonusComplete ? 'Syarat bonus terpenuhi' : `Progres ${bonusDone}/${WITHDRAW_ADS_REQUIRED}`}
              </Text>
            </View>
            {bonusComplete ? (
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            ) : (
              <Text style={styles.bonusCount}>{bonusDone}/{WITHDRAW_ADS_REQUIRED}</Text>
            )}
          </View>
          <ProgressBar
            progress={Math.min(bonusDone / WITHDRAW_ADS_REQUIRED, 1)}
            color={bonusComplete ? Colors.success : Colors.primary}
            height={6}
          />
          {!bonusComplete && (
            <GoldButton
              title={`KLAIM BONUS +${BONUS_REWARD_COINS}`}
              onPress={handleClaimBonus}
              loading={claimingBonus}
              fullWidth
              size="sm"
              variant="secondary"
            />
          )}
        </View>

        {/* Withdraw button */}
        {withdrawEligible ? (
          <GoldButton
            title="TARIK SALDO (DANA)"
            onPress={openWithdraw}
            fullWidth
            size="lg"
            icon={<Ionicons name="cash-outline" size={18} color={Colors.bg} />}
          />
        ) : (
          <Pressable style={styles.lockedBtn} onPress={openWithdraw}>
            <Ionicons name="lock-closed" size={16} color={Colors.textMuted} />
            <Text style={styles.lockedBtnText}>PENARIKAN TERKUNCI</Text>
            <Text style={styles.lockedBtnSub}>
              {balanceEnough ? `Bonus ${bonusDone}/${WITHDRAW_ADS_REQUIRED}` : `Koin ${formatCoins(gameState.coins)}/${formatCoins(minWithdrawCoins)}`}
            </Text>
          </Pressable>
        )}

        {/* Min withdraw notice */}
        <View style={styles.notice}>
          <Ionicons name="information-circle" size={14} color={Colors.info} />
          <Text style={styles.noticeText}>
            Min. Rp1.000 · 100 Koin = Rp1
          </Text>
        </View>

        {/* Filter */}
        <Text style={styles.sectionTitle}>RIWAYAT TRANSAKSI</Text>
        <View style={styles.filterRow}>
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map(f => (
            <Pressable
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'ALL' ? 'Semua' : f === 'INCOME' ? 'Masuk' : 'Keluar'}
              </Text>
            </Pressable>
          ))}
        </View>

        {filteredTx.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Belum ada riwayat transaksi</Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {filteredTx.map(tx => (
              <View key={tx.id}>{renderTx({ item: tx })}</View>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal visible={showWithdraw} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.withdrawModal}>
            <View style={styles.withdrawHeader}>
              <Text style={styles.withdrawTitle}>Tarik Saldo</Text>
              <Pressable onPress={() => setShowWithdraw(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.withdrawLabel}>Pilih Nominal</Text>
            <View style={styles.withdrawOptions}>
              {WITHDRAW_OPTIONS.map(amount => {
                const coins = amount * COIN_TO_RUPIAH;
                const canAfford = gameState.coins >= coins;
                return (
                  <Pressable
                    key={amount}
                    style={[
                      styles.withdrawOption,
                      selectedAmount === amount && styles.withdrawOptionSelected,
                      !canAfford && styles.withdrawOptionDisabled,
                    ]}
                    onPress={() => canAfford && setSelectedAmount(amount)}
                  >
                    <Text style={[styles.withdrawOptionText, selectedAmount === amount && styles.withdrawOptionTextSelected, !canAfford && { color: Colors.textMuted }]}>
                      Rp{amount.toLocaleString('id-ID')}
                    </Text>
                    <Text style={[styles.withdrawOptionCoins, !canAfford && { color: Colors.textMuted }]}>
                      {formatCoins(coins)} koin
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.withdrawLabel}>Nomor DANA</Text>
            <View style={styles.danaInput}>
              <Ionicons name="phone-portrait" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.danaField}
                value={danaNumber}
                onChangeText={setDanaNumber}
                placeholder="08xxxxxxxxxx"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            {selectedAmount && (
              <View style={styles.withdrawSummary}>
                <Text style={styles.withdrawSummaryText}>
                  Nominal: <Text style={{ color: Colors.primary }}>Rp{selectedAmount.toLocaleString('id-ID')}</Text>
                </Text>
                <Text style={styles.withdrawSummaryText}>
                  Potongan Koin: <Text style={{ color: Colors.error }}>{formatCoins(selectedAmount * COIN_TO_RUPIAH)}</Text>
                </Text>
              </View>
            )}

            <GoldButton title="AJUKAN PENARIKAN" onPress={handleWithdraw} fullWidth size="lg" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  lockedBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  lockedBtnText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.extrabold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  lockedBtnSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  bonusCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    gap: Spacing.sm,
  },
  bonusHeader: { flexDirection: 'row', alignItems: 'center' },
  bonusTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  bonusSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  bonusCount: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  scroll: { padding: Spacing.md, gap: Spacing.md },
  balanceCard: {
    backgroundColor: '#1A1200',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  balanceLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  balanceAmount: { fontSize: 44, fontWeight: FontWeight.extrabold, color: Colors.primary },
  rupiahRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.sm },
  rupiahValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.success },
  conversionRate: { fontSize: FontSize.xs, color: Colors.textMuted },
  balanceDetail: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  balanceDetailItem: { flex: 1, alignItems: 'center', padding: Spacing.md },
  balanceDetailLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  balanceDetailValue: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  detailDivider: { width: 1, backgroundColor: Colors.border },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.infoBg,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.info,
  },
  noticeText: { flex: 1, fontSize: FontSize.xs, color: Colors.info },
  sectionTitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  filterRow: { flexDirection: 'row', gap: Spacing.sm },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: { backgroundColor: '#1A1200', borderColor: Colors.primaryDark },
  filterText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  filterTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  emptyText: { fontSize: FontSize.body, color: Colors.textMuted },
  txList: { gap: Spacing.xs },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  txDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  txAmountCol: { alignItems: 'flex-end' },
  txAmount: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  txBalance: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  withdrawModal: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  withdrawHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  withdrawTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  withdrawLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  withdrawOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  withdrawOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    width: '30%',
    backgroundColor: Colors.bgCardElevated,
  },
  withdrawOptionSelected: { borderColor: Colors.primary, backgroundColor: '#1A1200' },
  withdrawOptionDisabled: { opacity: 0.45 },
  withdrawOptionText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  withdrawOptionTextSelected: { color: Colors.primary },
  withdrawOptionCoins: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  danaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  danaField: { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary, paddingVertical: 14, marginLeft: Spacing.sm },
  withdrawSummary: {
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  withdrawSummaryText: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
