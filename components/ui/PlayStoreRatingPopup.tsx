import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';

const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=com.altomedia.indomine';
const INTERVAL_MS = 30 * 60 * 1000; // 30 menit
const LAST_KEY = 'playstore_rating_popup_last';

export function PlayStoreRatingPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const check = async () => {
      try {
        const last = await AsyncStorage.getItem(LAST_KEY);
        const lastTs = last ? parseInt(last, 10) : 0;
        if (Date.now() - lastTs >= INTERVAL_MS) {
          setVisible(true);
        }
      } catch {}
    };
    // beri jeda awal 90 detik setelah app dibuka
    const initial = setTimeout(check, 90 * 1000);
    timer = setInterval(check, 60 * 1000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, []);

  const dismiss = async () => {
    try { await AsyncStorage.setItem(LAST_KEY, String(Date.now())); } catch {}
    setVisible(false);
  };

  const openStore = async () => {
    try { await Linking.openURL(PLAYSTORE_URL); } catch {}
    await dismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons key={i} name="star" size={30} color={Colors.primary} />
            ))}
          </View>
          <Text style={styles.title}>Suka INDOMINE?</Text>
          <Text style={styles.message}>
            Bantu kami berkembang! Berikan rating 5 bintang di Google Play Store agar lebih banyak penambang bergabung.
          </Text>
          <Pressable style={styles.rateBtn} onPress={openStore}>
            <Ionicons name="logo-google-playstore" size={18} color={Colors.bg} />
            <Text style={styles.rateBtnText}>BERI RATING</Text>
          </Pressable>
          <Pressable style={styles.laterBtn} onPress={dismiss}>
            <Text style={styles.laterBtnText}>Nanti Saja</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    width: '100%',
  },
  starsRow: { flexDirection: 'row', gap: 4 },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center' },
  message: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  rateBtnText: { color: Colors.bg, fontWeight: FontWeight.extrabold, fontSize: FontSize.body, letterSpacing: 0.5 },
  laterBtn: { padding: Spacing.xs },
  laterBtnText: { color: Colors.textMuted, fontSize: FontSize.sm },
});
