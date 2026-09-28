import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductGridSkeletonProps {
  count?: number;
}

export const ProductGridSkeleton = memo(function ProductGridSkeleton({
  count = 8,
}: ProductGridSkeletonProps) {
  const rows = Math.ceil(count / 2);
  return (
    <View>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <ProductCardSkeleton borderRight />
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
});
