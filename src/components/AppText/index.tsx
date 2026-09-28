import React, { memo } from 'react';
import { Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { Colors, FontSize, PoppinsFonts } from '@/theme';

export type TextVariant =
  | 'h1' | 'h2' | 'h3' | 'h4'
  | 'body' | 'bodySmall'
  | 'caption' | 'label' | 'overline';

interface AppTextProps {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  h1: { fontSize: FontSize['4xl'], fontFamily: PoppinsFonts.extrabold, color: Colors.textPrimary, lineHeight: 40 },
  h2: { fontSize: FontSize['3xl'], fontFamily: PoppinsFonts.bold, color: Colors.textPrimary, lineHeight: 34 },
  h3: { fontSize: FontSize['2xl'], fontFamily: PoppinsFonts.bold, color: Colors.textPrimary, lineHeight: 30 },
  h4: { fontSize: FontSize.xl, fontFamily: PoppinsFonts.bold, color: Colors.textPrimary, lineHeight: 26 },
  body: { fontSize: FontSize.base, fontFamily: PoppinsFonts.regular, color: Colors.textPrimary, lineHeight: 21 },
  bodySmall: { fontSize: FontSize.sm, fontFamily: PoppinsFonts.regular, color: Colors.textSecondary, lineHeight: 18 },
  caption: { fontSize: FontSize.xs, fontFamily: PoppinsFonts.regular, color: Colors.textSecondary, lineHeight: 16 },
  label: { fontSize: FontSize.sm, fontFamily: PoppinsFonts.semibold, color: Colors.textPrimary, lineHeight: 18 },
  overline: { fontSize: FontSize.xs, fontFamily: PoppinsFonts.bold, color: Colors.primary, letterSpacing: 1 },
};

export const AppText = memo(function AppText({
  variant = 'body',
  color,
  align,
  numberOfLines,
  style,
  children,
}: AppTextProps) {
  return (
    <Text
      style={[variantStyles[variant], color ? { color } : undefined, align ? { textAlign: align } : undefined, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
});

