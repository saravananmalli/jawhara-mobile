import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackArrowIcon, HeartIcon, SearchIcon } from '@/components/ui/icons';
import { CartIcon } from '@/components/CartIcon';
import { Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';
import { useCartCount } from '@/store/cartStore';
import { useWishlistCount } from '@/store/wishlistStore';

interface PDPStickyHeaderProps {
  productName?: string;
}

export const PDPStickyHeader = memo(function PDPStickyHeader({
  productName,
}: PDPStickyHeaderProps) {
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <BackArrowIcon color={Colors.textPrimary} size={22} />
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {productName ?? 'Product'}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/search')}>
          <SearchIcon color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/wishlist')}>
          <HeartIcon color={Colors.textPrimary} size={22} />
          {wishlistCount > 0 && <View style={styles.notifDot} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/cart')}>
          <CartIcon color={Colors.textPrimary} size={22} count={cartCount} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: { padding: 4 },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
});
