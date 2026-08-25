import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
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

const SPARKS = [
  { top: 8, right: 16, size: 7 },
  { top: 26, left: 8, size: 5 },
  { bottom: 18, left: 20, size: 6 },
  { bottom: 10, right: 24, size: 4 },
  { top: 44, right: 6, size: 5 },
];

const RAINDROPS = [
  { left: '18%', delay: 0 },
  { left: '42%', delay: 500 },
  { left: '66%', delay: 1000 },
  { left: '84%', delay: 1500 },
];

export function MiningAnimation({ miningRate, hashRate, algorithm, isActive, currentMine }: Props) {
  const pickaxeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;
  const cartAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkAnims = useRef(SPARKS.map(() => new Animated.Value(0))).current;
  const rainAnims = useRef(RAINDROPS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!isActive) return;

    const pickaxeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pickaxeAnim, { toValue: 1, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pickaxeAnim, { toValue: 0, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
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

    // Kereta tambang bolak-balik di dasar
    const cartLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cartAnim, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(cartAnim, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );

    // Denyut ring luar
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ])
    );

    // Percikan api bergantian
    const sparkLoops = sparkAnims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 260),
          Animated.timing(a, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(a, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      )
    );

    // Hujan koin dari atas
    const rainLoops = rainAnims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(RAINDROPS[i].delay),
          Animated.timing(a, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(a, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    );

    pickaxeLoop.start();
    glowLoop.start();
    coinLoop.start();
    cartLoop.start();
    pulseLoop.start();
    sparkLoops.forEach(l => l.start());
    rainLoops.forEach(l => l.start());

    return () => {
      pickaxeLoop.stop();
      glowLoop.stop();
      coinLoop.stop();
      cartLoop.stop();
      pulseLoop.stop();
      sparkLoops.forEach(l => l.stop());
      rainLoops.forEach(l => l.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const pickaxeRotate = pickaxeAnim.interpolate({ inputRange: [0, 1], outputRange: ['-28deg', '28deg'] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
  const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const coinY = coinAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const coinOpacity = coinAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });
  const cartX = cartAnim.interpolate({ inputRange: [0, 1], outputRange: [-90, 90] });

  return (
    <View style={styles.container}>
      {/* Hujan koin di belakang */}
      {isActive && RAINDROPS.map((r, i) => {
        const fallY = rainAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-30, 210] });
        const fade = rainAnims[i].interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 1, 1, 0] });
        return (
          <Animated.View
            key={`rain-${i}`}
            style={[styles.rainCoin, { left: r.left as any, transform: [{ translateY: fallY }], opacity: fade }]}
          >
            <CoinIcon size={14} />
          </Animated.View>
        );
      })}

      {/* Inti tambang 2D */}
      <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], opacity: glowOpacity }]} />
      <Animated.View style={[styles.mineCore, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}>
        <View style={styles.mineInner}>
          <Animated.View style={{ transform: [{ rotate: pickaxeRotate }] }}>
            <Ionicons name="hammer" size={56} color={Colors.primary} />
          </Animated.View>
        </View>
        {SPARKS.map((s, i) => {
          const sparkOpacity = sparkAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] });
          const sparkScale = sparkAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] });
          return (
            <Animated.View
              key={`spark-${i}`}
              style={[
                styles.spark,
                { top: s.top, left: s.left, right: s.right, bottom: s.bottom, width: s.size, height: s.size, borderRadius: s.size / 2, opacity: sparkOpacity, transform: [{ scale: sparkScale }] },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Kereta tambang berjalan */}
      {isActive && (
        <Animated.View style={[styles.mineCart, { transform: [{ translateX: cartX }] }]}>
          <Ionicons name="cart" size={22} color={Colors.primaryLight} />
          <View style={styles.cartCoins}>
            <CoinIcon size={12} />
          </View>
        </Animated.View>
      )}

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
    overflow: 'hidden',
  },
  pulseRing: {
    position: 'absolute',
    top: 16,
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
    opacity: 0.4,
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
  spark: {
    position: 'absolute',
    backgroundColor: Colors.primary,
  },
  rainCoin: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  mineCart: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  cartCoins: {
    marginLeft: -6,
    marginTop: -8,
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
