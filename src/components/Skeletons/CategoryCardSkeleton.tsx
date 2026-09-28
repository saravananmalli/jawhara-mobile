import { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BorderRadius, Spacing } from '@/theme';
import { SkeletonBox } from './SkeletonBox';

interface CategoryCardSkeletonProps {
  size?: number;
  style?: ViewStyle;
}

export const CategoryCardSkeleton = memo(function CategoryCardSkeleton({
  size = 100,
  style,
}: CategoryCardSkeletonProps) {
  return (
    <View style={[styles.card, { width: size }, style]}>
      <SkeletonBox style={{ width: size, height: size }} borderRadius={BorderRadius.lg} />
      <SkeletonBox style={styles.label} borderRadius={BorderRadius.xs} />
    </View>
  );
});

const styles = StyleSheet.create({
  card: { alignItems: 'center' },
  label: { width: 70, height: 13, marginTop: Spacing.sm },
});
