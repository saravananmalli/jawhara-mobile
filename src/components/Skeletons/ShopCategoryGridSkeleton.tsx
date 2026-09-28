import { memo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BorderRadius, Spacing } from '@/theme';
import { SkeletonBox } from './SkeletonBox';

const COLS = 3;
const GAP = Spacing.sm;
const H_PAD = Spacing.md;
const SCREEN_W = Dimensions.get('window').width;
const CARD_W = Math.floor((SCREEN_W - H_PAD * 2 - GAP * (COLS - 1)) / COLS);
const BADGE_H = 20;
const IMAGE_H = CARD_W;
const TITLE_H = 28;
const CARD_H = BADGE_H + IMAGE_H + TITLE_H + Spacing.sm * 2;

interface Props {
  rows?: number;
}

export const ShopCategoryGridSkeleton = memo(function ShopCategoryGridSkeleton({
  rows = 2,
}: Props) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {Array.from({ length: COLS }).map((_, colIdx) => (
            <View key={colIdx} style={[styles.card, { width: CARD_W, height: CARD_H }]}>
              <SkeletonBox style={styles.badgeSkeleton} borderRadius={BorderRadius.xs} />
              <SkeletonBox style={styles.imageSkeleton} borderRadius={0} />
              <SkeletonBox style={styles.titleSkeleton} borderRadius={BorderRadius.xs} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: H_PAD,
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  badgeSkeleton: {
    width: '60%',
    height: BADGE_H,
    borderRadius: 0,
  },
  imageSkeleton: {
    width: '100%',
    height: IMAGE_H,
    marginTop: 4,
  },
  titleSkeleton: {
    width: '75%',
    height: 12,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
});
