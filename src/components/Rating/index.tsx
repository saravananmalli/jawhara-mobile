import React, { memo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

type RatingSize = 'sm' | 'md';

interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: RatingSize;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { fontSize: FontSize.xs, pill: { paddingHorizontal: Spacing.xs + 3, paddingVertical: Spacing.xs - 1 } },
  md: { fontSize: FontSize.sm, pill: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs } },
};

export const Rating = memo(function Rating({ value, reviewCount, size = 'sm', style }: RatingProps) {
  if (value <= 0) return null;

  const sz = sizeMap[size];

  return (
    <View style={[styles.pill, sz.pill, style]}>
      <Text style={[styles.value, { fontSize: sz.fontSize }]}>{value.toFixed(1)}</Text>
      <Text style={[styles.star, { fontSize: sz.fontSize }]}>★</Text>
      {reviewCount != null && reviewCount > 0 && (
        <Text style={[styles.count, { fontSize: sz.fontSize }]}>({reviewCount})</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.warning,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  value: { fontFamily: PoppinsFonts.bold, color: Colors.textInverse },
  star: { color: Colors.textInverse },
  count: { color: Colors.textInverse },
});
