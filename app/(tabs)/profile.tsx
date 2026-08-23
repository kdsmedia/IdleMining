import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useGame } from '../../hooks/useGame';
import { GoldButton } from '../../components/ui/GoldButton';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { formatCoins, formatRupiah, xpForLevel, VIP_LEVELS, MINES } from '../../constants/gameData';
import { useAlert } from '@/template';
import * as Clipboard from 'expo-clipboard';

const AVATARS = ['⛏️', '💎', '🪨', '🔥', '⚡', '🏔️', '🌟', '👑'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { gameState } = useGame();
  const { showAlert } = useAlert();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  if (!user || !gameState) return null;

  const xpNeeded = xpForLevel(user.level);
  const xpProgress = Math.min(user.xp / xpNeeded, 1);
  const vipInfo = VIP_LEVELS[user.vipLevel] || VIP_LEVELS[0];
  const currentMine = MINES.find(m => m.id === gameState.currentMineId) || MINES[0];

  const handleCopyReferral = async () => {
    await Clipboard.setStringAsync(user.referralCode);
    showAlert('Tersalin!', `Kode referral ${user.referralCode} telah disalin`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Main Idle Mining bareng aku! Gunakan kode referral ${user.referralCode} saat daftar dan dapatkan bonus koin! ⛏️`,
      });
    } catch {}
  };

  const handleLogout = () => {
    showAlert('Keluar', 'Yakin ingin logout?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const stats = [
    { label: 'Total Koin', value: formatCoins(gameState.totalEarned), icon: 'logo-bitcoin', color: Colors.primary },
    { label: 'Mining Rate', value: `${formatCoins(gameState.miningRate)}/min`, icon: 'trending-up', color: Colors.success },
    { label: 'Total Upgrade', value: `${gameState.totalUpgrades}x`, icon: 'arrow-up-circle', color: Colors.info },
    { label: 'Area Saat Ini', value: currentMine.name, icon: 'location', color: Colors.warning },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Pressable onPress={handleLogout} style={styles.logoutBtn} hitSlop={8}>
          <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <Pressable style={styles.avatarWrap} onPress={() => setShowAvatarPicker(!showAvatarPicker)}>
            <Text style={styles.avatarEmoji}>{AVATARS[parseInt(user.avatar?.replace('avatar', '') || '1') - 1] || '⛏️'}</Text>
            <View style={styles.avatarEditBadge}>
              <Ionicons name="pencil" size={10} color={Colors.bg} />
            </View>
          </Pressable>

          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.userId}>{user.id}</Text>

          {/* VIP badge */}
          {user.vipLevel > 0 && (
            <View style={[styles.vipBadge, { borderColor: vipInfo.color }]}>
              <Ionicons name="diamond" size={12} color={vipInfo.color} />
              <Text style={[styles.vipText, { color: vipInfo.color }]}>{vipInfo.name}</Text>
            </View>
          )}

          {/* Level & XP */}
          <View style={styles.levelWrap}>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Level {user.level}</Text>
              <Text style={styles.xpText}>{user.xp} / {xpNeeded} XP</Text>
            </View>
            <ProgressBar progress={xpProgress} color={Colors.info} height={8} />
          </View>
        </View>

        {/* Stats grid */}
        <Text style={styles.sectionTitle}>STATISTIK</Text>
        <View style={styles.statsGrid}>
          {stats.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Referral section */}
        <Text style={styles.sectionTitle}>REFERRAL</Text>
        <View style={styles.referralCard}>
          <View style={styles.referralTop}>
            <View>
              <Text style={styles.referralLabel}>Kode Referralmu</Text>
              <Text style={styles.referralCode}>{user.referralCode}</Text>
            </View>
            <View style={styles.referralActions}>
              <Pressable style={styles.refBtn} onPress={handleCopyReferral} hitSlop={8}>
                <Ionicons name="copy" size={18} color={Colors.primary} />
              </Pressable>
              <Pressable style={styles.refBtn} onPress={handleShare} hitSlop={8}>
                <Ionicons name="share-social" size={18} color={Colors.primary} />
              </Pressable>
            </View>
          </View>
          <View style={styles.referralInfo}>
            <Ionicons name="people" size={14} color={Colors.textMuted} />
            <Text style={styles.referralInfoText}>Ajak teman untuk mining bersama dan dapatkan bonus koin</Text>
          </View>
        </View>

        {/* VIP section */}
        <Text style={styles.sectionTitle}>VIP</Text>
        <View style={styles.vipCard}>
          <View style={styles.vipTop}>
            <Ionicons name="diamond" size={28} color={user.vipLevel > 0 ? vipInfo.color : Colors.textMuted} />
            <View>
              <Text style={styles.vipTitle}>{user.vipLevel > 0 ? vipInfo.name : 'Belum VIP'}</Text>
              <Text style={styles.vipSubtitle}>
                {user.vipLevel > 0
                  ? `+${(vipInfo.miningBonus * 100).toFixed(0)}% Mining · +${(vipInfo.offlineBonus * 100).toFixed(0)}% Offline`
                  : 'Tingkatkan status untuk bonus eksklusif'}
              </Text>
            </View>
          </View>
          <View style={styles.vipBenefitRow}>
            {VIP_LEVELS.slice(1).map(vip => (
              <View key={vip.level} style={[styles.vipLevel, user.vipLevel >= vip.level && { borderColor: vip.color }]}>
                <Text style={[styles.vipLevelName, user.vipLevel >= vip.level && { color: vip.color }]}>{vip.name}</Text>
                <Text style={styles.vipLevelBonus}>+{(vip.miningBonus * 100).toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>PENGATURAN</Text>
        {[
          { label: 'Ubah Password', icon: 'lock-closed', action: () => showAlert('Info', 'Fitur ini membutuhkan backend aktif') },
          { label: 'Sesi Login', icon: 'phone-portrait', action: () => showAlert('Sesi Aktif', `Device: ${user.id}\nLogin terakhir: Sekarang`) },
          { label: 'Tentang Aplikasi', icon: 'information-circle', action: () => showAlert('INDOMINE', 'Versi 1.0 — oleh ALTOMEDIA\nDeveloper: ALTOMEDIA\nKontak: altomediaindonesia@gmail.com\n100 Koin = Rp1') },
        ].map(item => (
          <Pressable key={item.label} style={styles.settingRow} onPress={item.action}>
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon as any} size={18} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Pressable>
        ))}

        <View style={styles.logoutSection}>
          <GoldButton title="Keluar dari Akun" onPress={handleLogout} variant="danger" fullWidth size="md" />
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
  logoutBtn: { padding: Spacing.xs },
  scroll: { padding: Spacing.md, gap: Spacing.md },
  profileCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.bgCardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryDark,
    position: 'relative',
  },
  avatarEmoji: { fontSize: 36 },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  userId: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: 'monospace' },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    marginTop: 4,
  },
  vipText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  levelWrap: { width: '100%', gap: 6 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  levelLabel: { fontSize: FontSize.sm, color: Colors.info, fontWeight: FontWeight.bold },
  xpText: { fontSize: FontSize.xs, color: Colors.textMuted },
  sectionTitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    width: '47%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  referralCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    gap: Spacing.sm,
  },
  referralTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  referralLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  referralCode: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.primary, letterSpacing: 3 },
  referralActions: { flexDirection: 'row', gap: Spacing.sm },
  refBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgCardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  referralInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  referralInfoText: { flex: 1, fontSize: FontSize.xs, color: Colors.textMuted },
  vipCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.vipBg,
    gap: Spacing.md,
  },
  vipTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  vipTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  vipSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  vipBenefitRow: { flexDirection: 'row', gap: Spacing.sm },
  vipLevel: {
    flex: 1,
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vipLevelName: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textMuted },
  vipLevelBonus: { fontSize: FontSize.xs, color: Colors.textMuted },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  settingLabel: { fontSize: FontSize.body, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  logoutSection: { marginTop: Spacing.sm },
});
