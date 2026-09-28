import { BadgeStyle, BadgeTokens, BadgeVariant, PoppinsFonts } from '@/theme';
import React, { memo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export type { BadgeVariant };

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  discountPercent?: number;
  style?: ViewStyle;
}

export const Badge = memo(function Badge({
  variant,
  label,
  discountPercent,
  style,
}: BadgeProps) {
  const token = BadgeTokens[variant];
  let displayLabel = label ?? token.defaultLabel;

  if (variant === 'discount') {
    displayLabel = discountPercent != null
      ? `↓ ${discountPercent}% OFF`
      : (label ?? 'OFF');
  }

  return (
    <View style={[
      styles.badge,
      { backgroundColor: token.bg },
      token.pill && styles.badgePill,
      style,
    ]}>
      <Text style={[
        styles.text,
        { color: token.text },
        token.pill && styles.textPill,
      ]}>
        {displayLabel}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: BadgeStyle.paddingHorizontalDefault,
    paddingVertical: BadgeStyle.paddingVerticalDefault,
    borderRadius: BadgeStyle.borderRadiusDefault,
  },
  badgePill: {
    paddingHorizontal: BadgeStyle.paddingHorizontalPill,
    paddingVertical: BadgeStyle.paddingVerticalPill,
    borderRadius: BadgeStyle.borderRadiusPill,
  },
  text: {
    fontSize: BadgeStyle.fontSize,
    fontFamily: PoppinsFonts.medium,
    letterSpacing: BadgeStyle.letterSpacing,
    textTransform: 'uppercase',
  },
  textPill: {
    fontFamily: PoppinsFonts.semibold,
  },
});
