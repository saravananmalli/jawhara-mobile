import { AppImage } from "@/components/AppImage";
import { Badge, BadgeVariant } from "@/components/Badge";
import { SkeletonBox } from "@/components/Skeletons/SkeletonBox";
import { DownArrowIcon } from "@/components/ui/icons";
import { api, BACKEND_URL, Product } from "@/services/api";
import {
  BorderRadius,
  Colors,
  FontSize,
  PoppinsFonts,
  Shadow,
  Spacing,
} from "@/theme";
import { DirhamSymbol } from "dirham/react-native";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Constants ──────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.44);
const CARD_GAP = Spacing.sm;

// ── Star rating ────────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  const filled = Math.round(rating);
  return (
    <View style={star.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={[
            star.icon,
            { color: i <= filled ? Colors.starGold : "#D0D0D0" },
          ]}
        >
          ★
        </Text>
      ))}
      {count > 0 && <Text style={star.count}>({count})</Text>}
    </View>
  );
}

const star = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
  icon: { fontSize: 13 },
  count: { fontSize: FontSize.xs, color: Colors.textLight, marginLeft: 2 },
});

// ── Badge helper ───────────────────────────────────────────────────────────────

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

// ── Carousel card ──────────────────────────────────────────────────────────────

const MostLovedCard = memo(function MostLovedCard({
  product,
  onPress,
}: {
  product: Product;
  onPress: () => void;
}) {
  const uri = product.images?.[0] ? `${BACKEND_URL}${product.images[0]}` : null;
  const hasDiscount = product.discount > 0;
  const hasOriginalPrice = product.originalPrice > product.price;

  return (
    <TouchableOpacity style={card.wrap} activeOpacity={0.88} onPress={onPress}>
      <View style={card.imageBox}>
        <AppImage
          uri={uri}
          style={card.image}
          contentFit="contain"
          placeholder="💍"
          borderRadius={0}
        />
        {product.badge ? (
          <View style={card.badgePos}>
            <Badge
              variant={getBadgeVariant(product.badge)}
              label={product.badge}
            />
          </View>
        ) : null}
      </View>

      <View style={card.info}>
        <View style={card.priceRow}>
          {hasDiscount && (
            <View style={card.discountRow}>
              <DownArrowIcon size={12} />
              <Text style={card.discount}>{product.discount}%</Text>
            </View>
          )}
          <View style={card.priceInner}>
            <DirhamSymbol
              size={FontSize.sm}
              color={Colors.textPrimary}
              weight="extrabold"
            />
            <Text style={card.price}>{product.price.toLocaleString()}</Text>
          </View>
          {hasOriginalPrice && (
            <Text style={card.strikePrice}>
              {product.originalPrice.toLocaleString()}
            </Text>
          )}
        </View>

        <Text style={card.name} numberOfLines={2}>
          {product.name}
        </Text>

        {product.rating > 0 && (
          <StarRating rating={product.rating} count={product.reviewCount} />
        )}
      </View>
    </TouchableOpacity>
  );
});

const card = StyleSheet.create({
  wrap: {
    width: CARD_WIDTH,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadow.sm,
  },
  imageBox: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: Colors.offWhite,
  },
  image: { width: "100%", height: "100%" },
  badgePos: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
  },
  info: {
    padding: Spacing.sm,
    gap: Spacing.xs,
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
    gap: 3,
  },
  discount: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.bold,
    color: Colors.priceDiscount,
  },
  price: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  strikePrice: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    textDecorationLine: "line-through",
  },
  name: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    lineHeight: 16,
    minHeight: 32,
  },
});

// ── Skeleton card ──────────────────────────────────────────────────────────────

const MostLovedCardSkeleton = memo(function MostLovedCardSkeleton() {
  return (
    <View style={skeleton.wrap}>
      <View style={skeleton.imageBox}>
        <SkeletonBox style={StyleSheet.absoluteFillObject} borderRadius={0} />
      </View>
      <View style={skeleton.info}>
        <SkeletonBox style={skeleton.price} borderRadius={BorderRadius.xs} />
        <SkeletonBox style={skeleton.nameL1} borderRadius={BorderRadius.xs} />
        <SkeletonBox style={skeleton.nameL2} borderRadius={BorderRadius.xs} />
        <SkeletonBox style={skeleton.stars} borderRadius={BorderRadius.full} />
      </View>
    </View>
  );
});

const skeleton = StyleSheet.create({
  wrap: {
    width: CARD_WIDTH,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  imageBox: { width: "100%", aspectRatio: 1, backgroundColor: "#EBEBEB" },
  info: { padding: Spacing.sm, gap: Spacing.xs + 3 },
  price: { width: "55%", height: 11 },
  nameL1: { width: "90%", height: 11 },
  nameL2: { width: "65%", height: 11 },
  stars: { width: "70%", height: 10 },
});

// ── Main component ─────────────────────────────────────────────────────────────

export const MostLoved = memo(function MostLoved() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMostLovedProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleViewMore = useCallback(() => {
    // Most Loved spans every category — "Ring" previously forced a bogus
    // Product Type filter that hid the other categories. "Most Loved" isn't
    // a real product type, so it leaves every type selectable and the
    // Best Seller chip does the actual scoping.
    router.push({
      pathname: "/products/[category]",
      params: { category: "Most Loved", initialFilter: "Best Seller" },
    });
  }, []);

  const handleProductPress = useCallback((product: Product) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: product._id },
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Most Loved</Text>
        <Text style={styles.subtitle}>
          New here? Start with our most popular design
        </Text>
      </View>

      {/* Horizontal carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <MostLovedCardSkeleton key={i} />
            ))
          : products.map((p) => (
              <MostLovedCard
                key={p._id}
                product={p}
                onPress={() => handleProductPress(p)}
              />
            ))}
      </ScrollView>
    </View>
  );
});

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: 0,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: CARD_GAP,
  },
  viewMoreBtn: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.md,
  },
});
