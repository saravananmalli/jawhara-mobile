import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BorderRadius, Colors, FontSize, PoppinsFonts } from '@/theme';

interface CartIconProps {
  count?: number;
  color?: string;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

function BagSvg({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.6395 20C7.17414 20 4.94143 20 3.74181 18.5545C2.54219 17.1091 2.95365 14.9146 3.77657 10.5257C4.36179 7.40452 4.65441 5.84393 5.7653 4.92196C6.8762 4 8.46398 4 11.6395 4H12.3607C15.5363 4 17.1241 4 18.235 4.92196C19.3459 5.84393 19.6385 7.40452 20.2237 10.5257L20.2238 10.5261C21.0466 14.9147 21.4581 17.1091 20.2585 18.5545C19.0589 20 16.8261 20 12.3607 20H11.6395Z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M9.1709 8C9.58273 9.16519 10.694 10 12.0002 10C13.3064 10 14.4177 9.16519 14.8295 8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export const CartIcon = memo(function CartIcon({
  count = 0,
  color = Colors.textPrimary,
  size = 22,
  onPress,
  style,
}: CartIconProps) {
  const inner = (
    <View style={style}>
      <BagSvg color={color} size={size} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        {inner}
      </TouchableOpacity>
    );
  }

  return inner;
});

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: Colors.textInverse,
  },
  badgeText: {
    fontSize: FontSize.xs - 2,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textInverse,
  },
});
