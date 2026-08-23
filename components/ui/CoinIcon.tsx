import React from 'react';
import { Text } from 'react-native';

interface Props {
  size?: number;
}

export function CoinIcon({ size = 20 }: Props) {
  return (
    <Text style={{ fontSize: size * 0.85, lineHeight: size * 1.15 }}>🪙</Text>
  );
}
