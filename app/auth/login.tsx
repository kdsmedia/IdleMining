import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '../../hooks/useAuth';
import { GoldButton } from '../../components/ui/GoldButton';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useAlert } from '@/template';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, { toValue: 1.07, duration: 1200, useNativeDriver: true }),
        Animated.timing(logoPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      showAlert('Lengkapi Data', 'Nomor HP dan password wajib diisi');
      return;
    }
    setLoading(true);
    const { error } = await login(phone.trim(), password);
    setLoading(false);
    if (error) {
      showAlert('Login Gagal', error);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <AnimatedBackground variant="coins" count={7} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Animated.View style={[styles.logoWrap, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <Animated.View style={{ transform: [{ scale: logoPulse }] }}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} contentFit="contain" />
          </Animated.View>
          <Text style={styles.appName}>INDOMINE</Text>
          <Text style={styles.tagline}>Tambang koin, raih reward</Text>
        </Animated.View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Nomor HP</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="phone-portrait" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="08xxxxxxxxxx"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPwd}
              autoComplete="password"
            />
            <Pressable onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn} hitSlop={8}>
              <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={18} color={Colors.textMuted} />
            </Pressable>
          </View>

          <GoldButton title="MASUK" onPress={handleLogin} loading={loading} fullWidth size="lg" />
        </View>

        {/* Register link */}
        <Pressable onPress={() => router.push('/auth/register')} style={styles.registerLink}>
          <Text style={styles.registerText}>
            Belum punya akun? <Text style={styles.registerHighlight}>Daftar Sekarang</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.lg },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { width: 100, height: 100, marginBottom: Spacing.md },
  appName: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: { gap: Spacing.sm, marginBottom: Spacing.xl },
  inputLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    marginBottom: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
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
  registerLink: { alignItems: 'center', paddingVertical: Spacing.md },
  registerText: { fontSize: FontSize.body, color: Colors.textSecondary },
  registerHighlight: { color: Colors.primary, fontWeight: FontWeight.bold },
});
