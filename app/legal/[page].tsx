import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { DISCLAIMER_TEXT, PRIVACY_POLICY_TEXT, ABOUT_TEXT } from '../../constants/legalContent';

const PAGES: Record<string, { title: string; body: string }> = {
  disclaimer: { title: 'Disclaimer', body: DISCLAIMER_TEXT },
  privacy: { title: 'Kebijakan Privasi', body: PRIVACY_POLICY_TEXT },
  about: { title: 'Tentang Aplikasi', body: ABOUT_TEXT },
};

export default function LegalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { page } = useLocalSearchParams<{ page: string }>();
  const content = PAGES[page || 'about'] || PAGES.about;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{content.title}</Text>
        <View style={{ width: 30 }} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.card}>
          <Text style={styles.body}>{content.body}</Text>
        </View>
        <View style={{ height: 30 }} />
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
  backBtn: { padding: Spacing.xs, width: 30 },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  scroll: { padding: Spacing.md },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  body: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
});
