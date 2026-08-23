import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { AuthProvider } from '../contexts/AuthContext';
import { GameProvider } from '../contexts/GameContext';
import { initAds, startInterstitialCycle } from '../services/adService';

export default function RootLayout() {
  useEffect(() => {
    let stopCycle: (() => void) | undefined;
    initAds().then(() => {
      stopCycle = startInterstitialCycle();
    });
    return () => stopCycle?.();
  }, []);

  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <GameProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/register" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </GameProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
