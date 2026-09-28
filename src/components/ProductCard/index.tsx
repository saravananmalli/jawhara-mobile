import { AppImage } from "@/components/AppImage";
import { Badge, BadgeVariant } from "@/components/Badge";
import { CartIcon } from "@/components/CartIcon";
import { WishlistButton } from "@/components/WishlistButton";
import { CloseIcon, DownArrowIcon } from "@/components/ui/icons";
import { BACKEND_URL, Product } from "@/services/api";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { DirhamSymbol } from "dirham/react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  isInCart?: boolean;
  onPress?: () => void;
  onWishlistToggle?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  /** Pass true for the left-column item to render the vertical divider on its right edge */
  borderRight?: boolean;
  /** Show a small close (X) icon instead of the heart — used on the wishlist page to remove items */
  wishlistIcon?: "heart" | "close";
  /** Briefly show an "Added to Wishlist" overlay on add — product listing page only */
  showWishlistToast?: boolean;
  style?: ViewStyle;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBadgeVariant(badge: string): BadgeVariant {
  const lower = badge.toLowerCase();
  if (lower.includes("sale")) return "sale";
  if (lower.includes("new")) return "new";
  if (lower.includes("trend")) return "trending";
  if (lower.includes("best")) return "best-seller";
  if (lower.includes("loved")) return "most-loved";
  if (lower.includes("feature")) return "featured";
  if (lower.includes("exclusiv")) return "exclusive";
  if (lower.includes("limited")) return "limited";
  return "featured";
}

// Stable references outside component — no re-allocation on every render
const DELIVERY_GRADIENT = ["#D9B05F", "#C89A3C", "#9F7421"] as const;
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 1, y: 0 };

// ── Component ─────────────────────────────────────────────────────────────────

export const ProductCard = memo(function ProductCard({
  product,
  isWishlisted = false,
  isInCart = false,
  onPress,
  onWishlistToggle,
  onAddToCart,
  borderRight = false,
  wishlistIcon = "heart",
  showWishlistToast = false,
  style,
}: ProductCardProps) {
  const uri = product.images?.[0] ? `${BACKEND_URL}${product.images[0]}` : null;
  const hasDiscount = product.discount > 0;
  const hasOriginalPrice = product.originalPrice > product.price;

  const showAddedToast = showWishlistToast && isWishlisted;

  return (
    <TouchableOpacity
      style={[styles.cell, borderRight && styles.cellBorderRight, style]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      {/* ── Image area ── */}
      <View style={styles.imageBox}>
        <AppImage
          uri={uri}
          style={styles.image}
          contentFit="contain"
          placeholder="💍"
          borderRadius={0}
        />

        {/* Brief confirmation overlay shown right after adding to wishlist */}
        {showAddedToast && (
          <View style={styles.addedOverlay} pointerEvents="none">
            <Text style={styles.addedOverlayText}>ADDED TO WISHLIST</Text>
          </View>
        )}

        {/* Top-left: badge */}
        {product.badge ? (
          <View style={styles.badgePos}>
            <Badge
              variant={getBadgeVariant(product.badge)}
              label={product.badge}
            />
          </View>
        ) : null}

        {/* Top-right: wishlist toggle, or a small close icon to remove from wishlist */}
        <View
          style={[
            styles.heartCircle,
            wishlistIcon === "heart" &&
              isWishlisted &&
              styles.heartCircleActive,
          ]}
        >
          {wishlistIcon === "close" ? (
            <TouchableOpacity
              onPress={() => onWishlistToggle?.(product)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <CloseIcon color={Colors.textPrimary} size={14} />
            </TouchableOpacity>
          ) : (
            <WishlistButton
              isWishlisted={isWishlisted}
              onToggle={() => onWishlistToggle?.(product)}
              size={18}
              activeColor={Colors.textInverse}
              inactiveColor={Colors.textPrimary}
            />
          )}
        </View>

        {/* Bottom-right: cart toggle — filled primary once the product is in the cart */}
        <TouchableOpacity
          style={[styles.cartCircle, isInCart && styles.cartCircleActive]}
          onPress={() => onAddToCart?.(product)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <CartIcon
            color={isInCart ? Colors.textInverse : Colors.textPrimary}
            size={18}
          />
        </TouchableOpacity>
      </View>

      {/* ── Text area ── */}
      <View style={styles.info}>
        {/* Price row: ↓50%  د.إ 13,900  18,900 */}
        <View style={styles.priceRow}>
          {hasDiscount && (
            <View style={styles.discountRow}>
              <View style={styles.arrowBox}>
                <DownArrowIcon size={12} />
              </View>
              <Text style={styles.discount}>{product.discount}%</Text>
            </View>
          )}
          <View style={styles.priceInner}>
            <View style={styles.arrowBox}>
              <DirhamSymbol
                size={FontSize.base}
                color={Colors.textPrimary}
                weight="extrabold"
              />
            </View>
            <Text style={styles.price}>{product.price.toLocaleString()}</Text>
          </View>
          {hasOriginalPrice && (
            <Text style={styles.strikePrice}>
              {product.originalPrice.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Name — 2 lines max, fixed minimum height for alignment */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating pill + review count + delivery gradient */}
        <View style={styles.bottomRow}>
          {product.rating > 0 && (
            <>
              <View style={styles.ratingPill}>
                <Text style={styles.ratingValue}>
                  {product.rating.toFixed(1)}
                </Text>
                <Text style={styles.ratingStar}> ★</Text>
              </View>
              {product.reviewCount > 0 && (
                <Text style={styles.reviewCount}>({product.reviewCount})</Text>
              )}
            </>
          )}
          {!!product.arrivesBy && (
            <LinearGradient
              colors={DELIVERY_GRADIENT}
              start={GRADIENT_START}
              end={GRADIENT_END}
              style={styles.deliveryPill}
            >
              <Text style={styles.deliveryText} numberOfLines={1}>
                {product.arrivesBy}
              </Text>
            </LinearGradient>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Flat grid cell — no shadow, no card elevation, no border radius
  cell: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: Colors.dividerGray,
  },

  // Image section
  imageBox: {
    aspectRatio: 1,
    backgroundColor: Colors.offWhite,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badgePos: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
  },
  heartCircle: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  heartCircleActive: {
    backgroundColor: Colors.primary,
  },
  addedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.30)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
  },
  addedOverlayText: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textInverse,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  cartCircle: {
    position: "absolute",
    bottom: Spacing.sm,
    right: Spacing.sm,
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cartCircleActive: {
    backgroundColor: Colors.primary,
  },

  // Text section
  info: {
    paddingHorizontal: Spacing.sm + 2,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: 2,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flexWrap: "wrap",
  },
  priceInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  arrowBox: {
    height: FontSize.base * 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  discount: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.bold,
    color: Colors.priceDiscount,
    lineHeight: FontSize.base * 1.2,
    includeFontPadding: false,
  },
  price: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    lineHeight: FontSize.base * 1.2,
    includeFontPadding: false,
  },
  strikePrice: {
    fontSize: FontSize.base,
    color: Colors.textLight,
    textDecorationLine: "line-through",
    lineHeight: FontSize.base * 1.2,
    includeFontPadding: false,
  },

  name: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    lineHeight: 16,
    minHeight: 32,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.rating,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  ratingValue: {
    fontSize: FontSize.xs,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textInverse,
  },
  ratingStar: {
    fontSize: FontSize.xs,
    color: Colors.textInverse,
  },
  reviewCount: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  deliveryPill: {
    flex: 1,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  deliveryText: {
    fontSize: FontSize.xs,
    fontFamily: PoppinsFonts.medium,
    color: Colors.textInverse,
    textAlign: "center",
  },
});
