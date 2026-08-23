import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../constants/theme';
import { formatCoins } from '../../constants/gameData';
import { CoinIcon } from '../ui/CoinIcon';

interface Props {
  miningRate: number;
  hashRate?: number;
  algorithm?: string;
  isActive: boolean;
  currentMine: string;
}

export function MiningAnimation({ miningRate, hashRate, algorithm, isActive, currentMine }: Props) {
  const pickaxeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) return;

    const pickaxeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pickaxeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(pickaxeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );

    const coinLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(coinAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(coinAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );

    pickaxeLoop.start();
    glowLoop.start();
    coinLoop.start();

    return () => {
      pickaxeLoop.stop();
      glowLoop.stop();
      coinLoop.stop();
    };
  }, [isActive, pickaxeAnim, glowAnim, coinAnim]);

  const pickaxeRotate = pickaxeAnim.interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '25deg'] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const coinY = coinAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const coinOpacity = coinAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });

  return (
    <View style={styles.container}>
      {/* Mine visual */}
      <Animated.View style={[styles.mineCore, { opacity: glowOpacity }]}>
        <View style={styles.mineInner}>
          <Animated.View style={{ transform: [{ rotate: pickaxeRotate }] }}>
            <Ionicons name="hammer" size={56} color={Colors.primary} />
          </Animated.View>
        </View>
        <View style={styles.sparkle1} />
        <View style={styles.sparkle2} />
        <View style={styles.sparkle3} />
      </Animated.View>

      {/* Floating coin indicator */}
      {isActive && (
        <Animated.View style={[styles.floatingCoin, { transform: [{ translateY: coinY }], opacity: coinOpacity }]}>
          <CoinIcon size={16} />
          <Text style={styles.floatingText}>+{miningRate}</Text>
        </Animated.View>
      )}

      {/* Rate display */}
      <View style={styles.rateDisplay}>
        <Text style={styles.rateLabel}>Mining Rate</Text>
        <Text style={styles.rateValue}>{formatCoins(miningRate)} <Text style={styles.rateUnit}>koin/menit</Text></Text>
        {(hashRate !== undefined || algorithm) && (
          <Text style={styles.hashText}>
            Hash Rate: <Text style={styles.hashValue}>{hashRate ?? 0} H/s</Text>
            {algorithm ? <Text style={styles.hashAlgo}> · {algorithm}</Text> : null}
          </Text>
        )}
      </View>

      {/* Mine name */}
      <View style={styles.mineNameBadge}>
        <Ionicons name="location" size={12} color={Colors.primary} />
        <Text style={styles.mineName}>{currentMine}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  mineCore: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.bgCardElevated,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  mineInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle1: {
    position: 'absolute',
    top: 10,
    right: 18,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    opacity: 0.7,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primaryLight,
    opacity: 0.6,
  },
  sparkle3: {
    position: 'absolute',
    top: 30,
    left: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
    opacity: 0.5,
  },
  floatingCoin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: Spacing.sm,
  },
  floatingText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  rateDisplay: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  rateLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rateValue: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  rateUnit: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.regular,
  },
  hashText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  hashValue: {
    color: Colors.info,
    fontWeight: FontWeight.bold,
  },
  hashAlgo: {
    color: Colors.textMuted,
  },
  mineNameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bgCardElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mineName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
});
