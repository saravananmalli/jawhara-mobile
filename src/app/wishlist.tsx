import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { BackArrowIcon } from '@/components/ui/icons';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/services/api';
import { useCartActions, useCartItems } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

const COL = 2;

export default function WishlistScreen() {
  const { isLoggedIn } = useAuth();
  const { itemList, wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCartActions();
  const cartItems = useCartItems();

  const goToProduct = (product: Product) =>
    router.push({ pathname: '/product/[id]', params: { id: product._id } });

  // Pad with null so an odd final item doesn't stretch across the row.
  const paddedItems = useMemo(
    () => (itemList.length % 2 !== 0 ? [...itemList, null] : itemList) as (Product | null)[],
    [itemList],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BackArrowIcon color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        {isLoggedIn && (
          <Text style={styles.headerCount}>
            {itemList.length} item{itemList.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {!isLoggedIn ? (
        <EmptyState
          emoji="🔒"
          title="Login to see your wishlist"
          subtitle="Your saved items are linked to your account"
          action={{ label: 'Login / Sign Up', onPress: () => router.push('/(auth)/login') }}
        />
      ) : itemList.length === 0 ? (
        <EmptyState
          emoji="🤍"
          title="Your wishlist is empty"
          subtitle="Tap the heart on any product to save it here"
          action={{ label: 'Start Shopping', onPress: () => router.push('/(tabs)/home') }}
        />
      ) : (
        <FlatList
          data={paddedItems}
          keyExtractor={(item, index) => item?._id ?? `empty-${index}`}
          numColumns={COL}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            if (!item) return <View style={styles.emptyCell} />;
            return (
              <ProductCard
                product={item}
                isWishlisted={wishlist.has(item._id)}
                isInCart={Boolean(cartItems[item._id])}
                onWishlistToggle={toggleWishlist}
                onAddToCart={addToCart}
                onPress={() => goToProduct(item)}
                borderRight={index % 2 === 0}
                wishlistIcon="close"
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  headerCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  grid: { paddingBottom: Spacing.lg },
  row: { borderBottomWidth: 1, borderBottomColor: Colors.dividerGray },
  emptyCell: { flex: 1, backgroundColor: 'transparent' },
});
