import { AppButton } from "@/components/AppButton";
import { BagIcon, ShareIcon } from "@/components/ui/icons";
import { WishlistButton } from "@/components/WishlistButton";
import { BACKEND_URL, Product } from "@/services/api";
import { useCartActions, useCartItems } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
import { BorderRadius, Colors, Spacing } from "@/theme";
import { router } from "expo-router";
import { memo, useCallback } from "react";
import { Share, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PDPBottomBarProps {
  product: Product;
}

export const PDPBottomBar = memo(function PDPBottomBar({
  product,
}: PDPBottomBarProps) {
  const insets = useSafeAreaInsets();
  const { wishlist, toggleWishlist } = useWishlist();
  const cartItems = useCartItems();
  const { addToCart } = useCartActions();

  const inCart = !!cartItems[product._id];
  const isWishlisted = wishlist.has(product._id);

  const handleShare = useCallback(() => {
    const imageUrl = product.images?.[0]
      ? `${BACKEND_URL}${product.images[0]}`
      : "";
    Share.share({
      message:
        `${product.name} — AED ${product.price.toLocaleString()}\n${imageUrl}`.trim(),
    }).catch(() => {});
  }, [product]);

  const handleCta = useCallback(() => {
    if (inCart) {
      router.push("/cart");
    } else {
      addToCart(product);
    }
  }, [inCart, addToCart, product]);

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom + Spacing.sm }]}
    >
      <WishlistButton
        isWishlisted={isWishlisted}
        onToggle={() => toggleWishlist(product)}
        size={22}
        activeColor={Colors.textInverse}
        inactiveColor={Colors.textPrimary}
        style={[styles.iconBtn, isWishlisted && styles.iconBtnActive]}
      />

      <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
        <ShareIcon color={Colors.textPrimary} size={20} />
      </TouchableOpacity>

      <AppButton
        label={inCart ? "GO TO CART" : "ADD TO CART"}
        onPress={handleCta}
        variant="primary"
        size="lg"
        leftIcon={<BagIcon color={Colors.textInverse} size={22} />}
        gap={8}
        style={styles.cta}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnActive: {
    backgroundColor: Colors.primary,
  },
  cta: {
    flex: 1,
  },
});
