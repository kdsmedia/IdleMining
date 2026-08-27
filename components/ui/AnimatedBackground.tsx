import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { CoinIcon } from './CoinIcon';

interface Props {
  variant?: 'coins' | 'sparks' | 'both';
  count?: number;
  style?: ViewStyle;
}

// Konfigurasi elemen jatuh yang tersebar di layar (posisi % dari kiri)
const FALL_ITEMS = [
  { left: '6%', size: 16, delay: 0, dur: 6200 },
  { left: '18%', size: 22, delay: 1400, dur: 7000 },
  { left: '30%', size: 14, delay: 800, dur: 5600 },
  { left: '45%', size: 20, delay: 2200, dur: 6800 },
  { left: '58%', size: 16, delay: 600, dur: 6000 },
  { left: '70%', size: 24, delay: 1800, dur: 7200 },
  { left: '82%', size: 15, delay: 1000, dur: 5800 },
  { left: '93%', size: 19, delay: 2500, dur: 6600 },
];

export function AnimatedBackground({ variant = 'coins', count = 6, style }: Props) {
  const anims = useRef(FALL_ITEMS.slice(0, count).map(() => new Animated.Value(0))).current;
  const items = FALL_ITEMS.slice(0, count);

  useEffect(() => {
    const loops = anims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(items[i].delay),
          Animated.timing(a, { toValue: 1, duration: items[i].dur, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(a, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {items.map((item, i) => {
        const fall = anims[i].interpolate({ inputRange: [0, 1], outputRange: [-40, 900] });
        const fade = anims[i].interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.55, 0.55, 0] });
        const El = variant === 'sparks'
          ? <Ionicons name="flash" size={item.size} color={Colors.primaryDark} />
          : <CoinIcon size={item.size} />;
        return (
          <Animated.View
            key={`bg-${i}`}
            pointerEvents="none"
            style={[
              styles.item,
              { left: item.left as any, transform: [{ translateY: fall }], opacity: fade },
              style,
            ]}
          >
            {El}
          </Animated.View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  item: { position: 'absolute', top: 0, zIndex: 0 },
});
