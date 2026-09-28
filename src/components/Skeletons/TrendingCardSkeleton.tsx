import { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing } from '@/theme';
import { SkeletonBox } from './SkeletonBox';

interface TrendingCardSkeletonProps {
  style?: ViewStyle;
}

export const TrendingCardSkeleton = memo(function TrendingCardSkeleton({
  style,
}: TrendingCardSkeletonProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.textBlock}>
        <SkeletonBox style={styles.title} borderRadius={BorderRadius.xs} />
        <SkeletonBox style={styles.subtitle} borderRadius={BorderRadius.xs} />
      </View>
      <SkeletonBox style={styles.thumb} borderRadius={BorderRadius.md} />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  textBlock: { flex: 1, gap: 7 },
  title: { width: '55%', height: 14 },
  subtitle: { width: '80%', height: 11 },
  thumb: { width: 64, height: 64, marginLeft: Spacing.md },
});
