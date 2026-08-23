import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { GoldButton } from '../../components/ui/GoldButton';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useAlert } from '@/template';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [referral, setReferral] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !phone.trim() || !password.trim()) {
      showAlert('Lengkapi Data', 'Semua field wajib diisi');
      return;
    }
    if (username.trim().length < 3) {
      showAlert('Username Pendek', 'Username minimal 3 karakter');
      return;
    }
    if (password !== confirmPwd) {
      showAlert('Password Tidak Cocok', 'Konfirmasi password harus sama');
      return;
    }
    if (password.length < 6) {
      showAlert('Password Lemah', 'Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    const { error } = await register(username.trim(), phone.trim(), password, referral.trim() || undefined);
    setLoading(false);
    if (error) {
      showAlert('Registrasi Gagal', error);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Daftar Akun</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={styles.subtitle}>Buat akun dan mulai mining koin sekarang!</Text>

        <View style={styles.form}>
          {[
            { label: 'Username', value: username, set: setUsername, placeholder: 'Nama penambang kamu', icon: 'person' as const, type: 'default' as const },
            { label: 'Nomor HP', value: phone, set: setPhone, placeholder: '08xxxxxxxxxx', icon: 'phone-portrait' as const, type: 'phone-pad' as const },
          ].map(field => (
            <View key={field.label}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name={field.icon} size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={field.value}
                  onChangeText={field.set}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType={field.type}
                />
              </View>
            </View>
          ))}

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 karakter"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPwd}
            />
            <Pressable onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
              <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={18} color={Colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>Konfirmasi Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              placeholder="Ulangi password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPwd}
            />
          </View>

          <Text style={styles.inputLabel}>Kode Referral (Opsional)</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="gift" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={referral}
              onChangeText={setReferral}
              placeholder="Masukkan kode referral"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />
          </View>

          <GoldButton title="DAFTAR SEKARANG" onPress={handleRegister} loading={loading} fullWidth size="lg" />
        </View>

        <Pressable onPress={() => router.back()} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Sudah punya akun? <Text style={styles.loginHighlight}>Masuk</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.body, color: Colors.textSecondary, marginBottom: Spacing.xl },
  form: { gap: Spacing.xs, marginBottom: Spacing.lg },
  inputLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingRight: Spacing.sm,
  },
  inputIcon: { paddingHorizontal: Spacing.md },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    paddingVertical: 14,
  },
  eyeBtn: { padding: Spacing.sm },
  loginLink: { alignItems: 'center', paddingVertical: Spacing.md },
  loginText: { fontSize: FontSize.body, color: Colors.textSecondary },
  loginHighlight: { color: Colors.primary, fontWeight: FontWeight.bold },
});
