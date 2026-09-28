import { memo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeletons';
import { Product } from '@/services/api';
import { useCartActions, useCartItems } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.44);

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  products: Product[];
  loading?: boolean;
  onProductPress: (product: Product) => void;
}

export const ProductSlider = memo(function ProductSlider({
  title,
  subtitle,
  products,
  loading = false,
  onProductPress,
}: ProductSliderProps) {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCartActions();
  const cartItems = useCartItems();

  if (!loading && products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} style={{ width: CARD_WIDTH, flex: undefined }} />
            ))
          : products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                isWishlisted={wishlist.has(p._id)}
                isInCart={Boolean(cartItems[p._id])}
                onWishlistToggle={toggleWishlist}
                onAddToCart={addToCart}
                onPress={() => onProductPress(p)}
                style={{ width: CARD_WIDTH }}
              />
            ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  header: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: 2,
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
});
