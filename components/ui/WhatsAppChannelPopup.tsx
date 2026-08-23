import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';

const WA_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbDlYg9HVvTbH0KDRg0R';
const INTERVAL_MS = 30 * 60 * 1000; // 30 menit
const LAST_KEY = 'wa_channel_popup_last';

export function WhatsAppChannelPopup() {
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
    check();
    timer = setInterval(check, 60 * 1000); // cek tiap menit
    return () => clearInterval(timer);
  }, []);

  const dismiss = async () => {
    try { await AsyncStorage.setItem(LAST_KEY, String(Date.now())); } catch {}
    setVisible(false);
  };

  const openChannel = async () => {
    try { await Linking.openURL(WA_CHANNEL_URL); } catch {}
    await dismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="logo-whatsapp" size={44} color="#25D366" />
          </View>
          <Text style={styles.title}>Gabung Channel WhatsApp!</Text>
          <Text style={styles.message}>
            Dapatkan info event, bonus, dan update terbaru INDOMINE langsung di channel WhatsApp resmi kami.
          </Text>
          <Pressable style={styles.joinBtn} onPress={openChannel}>
            <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
            <Text style={styles.joinBtnText}>JOIN CHANNEL</Text>
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
    borderColor: Colors.border,
    width: '100%',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(37,211,102,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center' },
  message: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#25D366',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  joinBtnText: { color: '#FFFFFF', fontWeight: FontWeight.extrabold, fontSize: FontSize.body, letterSpacing: 0.5 },
  laterBtn: { padding: Spacing.xs },
  laterBtnText: { color: Colors.textMuted, fontSize: FontSize.sm },
});
