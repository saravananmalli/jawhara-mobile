import { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BorderRadius, Spacing } from '@/theme';
import { SkeletonBox } from './SkeletonBox';

interface ProductCardSkeletonProps {
  style?: ViewStyle;
  borderRight?: boolean;
}

export const ProductCardSkeleton = memo(function ProductCardSkeleton({
  style,
  borderRight = false,
}: ProductCardSkeletonProps) {
  return (
    <View style={[styles.card, borderRight && styles.borderRight, style]}>
      {/* Square image area — matches ProductCard's aspectRatio: 1 imageBox */}
      <View style={styles.imageBox}>
        <SkeletonBox style={StyleSheet.absoluteFillObject} borderRadius={0} />
      </View>

      {/* Text area — matches ProductCard's info section */}
      <View style={styles.info}>
        <SkeletonBox style={styles.price} borderRadius={BorderRadius.xs} />
        <SkeletonBox style={styles.nameL1} borderRadius={BorderRadius.xs} />
        <SkeletonBox style={styles.nameL2} borderRadius={BorderRadius.xs} />
        <SkeletonBox style={styles.badge} borderRadius={BorderRadius.full} />
      </View>
    </View>
  );
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: { flex: 1 },
  borderRight: { borderRightWidth: 1, borderRightColor: '#E8E8E8' },
  imageBox: { aspectRatio: 1, backgroundColor: '#EBEBEB' },
  info: {
    paddingHorizontal: Spacing.sm + 2,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.xs + 3,
  },
  price: { width: '50%', height: 11 },
  nameL1: { width: '90%', height: 11 },
  nameL2: { width: '60%', height: 11 },
  badge: { width: '75%', height: 10 },
});
