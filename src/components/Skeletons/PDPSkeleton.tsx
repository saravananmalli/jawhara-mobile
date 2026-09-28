import { memo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BorderRadius, Spacing } from '@/theme';
import { SkeletonBox } from './SkeletonBox';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const PDPSkeleton = memo(function PDPSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBox style={styles.image} borderRadius={0} />
      <View style={styles.body}>
        <SkeletonBox style={styles.priceLine} borderRadius={BorderRadius.xs} />
        <SkeletonBox style={styles.collectionLine} borderRadius={BorderRadius.xs} />
        <SkeletonBox style={styles.nameLine1} borderRadius={BorderRadius.xs} />
        <SkeletonBox style={styles.nameLine2} borderRadius={BorderRadius.xs} />
        <SkeletonBox style={styles.ratingLine} borderRadius={BorderRadius.full} />
        <SkeletonBox style={styles.block} borderRadius={BorderRadius.md} />
        <SkeletonBox style={styles.block} borderRadius={BorderRadius.md} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  body: { padding: Spacing.md, gap: Spacing.md },
  priceLine: { width: '40%', height: 22 },
  collectionLine: { width: '30%', height: 14 },
  nameLine1: { width: '90%', height: 16 },
  nameLine2: { width: '60%', height: 16 },
  ratingLine: { width: '35%', height: 20 },
  block: { width: '100%', height: 80 },
});
