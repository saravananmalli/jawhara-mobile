import { memo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BorderRadius, Spacing } from '@/theme';
import { SkeletonBox } from './SkeletonBox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PEEK = 22;
const SLIDE_W = SCREEN_WIDTH - PEEK * 2;

export const BannerCarouselSkeleton = memo(function BannerCarouselSkeleton() {
  return (
    <View style={styles.wrapper}>
      <SkeletonBox style={styles.banner} borderRadius={BorderRadius.xl} />
      <View style={styles.dots}>
        <SkeletonBox style={styles.dotActive} borderRadius={3} />
        <SkeletonBox style={styles.dot} borderRadius={3} />
        <SkeletonBox style={styles.dot} borderRadius={3} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginTop: Spacing.md },
  banner: { width: SLIDE_W, height: 330, marginLeft: PEEK },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  dotActive: { width: 18, height: 6 },
  dot: { width: 6, height: 6 },
});
