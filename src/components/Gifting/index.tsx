import { SkeletonBox } from "@/components/Skeletons/SkeletonBox";
import { api, BACKEND_URL, GiftingItem } from "@/services/api";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { Image } from "expo-image";
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
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.76);
const CARD_GAP = Spacing.md;

// ── Link navigation ────────────────────────────────────────────────────────────

const COLLECTION_SLUG_MAP: Record<string, string> = {
  gifting: "Gifting",
  "new-arrivals": "New Arrivals",
  "best-seller": "Best Seller",
  trending: "Trending",
};

function navigateFromCtaLink(ctaLink: string, title: string) {
  try {
    const raw = ctaLink.startsWith("/") ? ctaLink : `/${ctaLink}`;
    const url = new URL(`https://x${raw}`);
    const segments = url.pathname.split("/").filter(Boolean);
    const slug = segments[segments.length - 1] ?? "";
    const flags = COLLECTION_SLUG_MAP[slug.toLowerCase()];
    router.push({
      pathname: "/products/[category]",
      params: { category: title, ...(flags ? { flags } : {}) },
    });
  } catch {
    router.push({
      pathname: "/products/[category]",
      params: { category: title },
    });
  }
}

// ── Gifting card ───────────────────────────────────────────────────────────────

const GiftingCard = memo(function GiftingCard({
  item,
  onPress,
}: {
  item: GiftingItem;
  onPress: () => void;
}) {
  const uri = item.imageUrl ? `${BACKEND_URL}${item.imageUrl}` : null;

  return (
    <TouchableOpacity style={card.wrap} activeOpacity={0.9} onPress={onPress}>
      {/* Full-bleed image */}
      <Image
        source={uri ? { uri } : undefined}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />

      {/* Bottom CTA overlay */}
      <View style={card.overlay}>
        <Text style={card.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={card.exploreBtn}>
          <Text style={card.exploreText}>Explore</Text>
          <Text style={card.exploreArrow}> →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const card = StyleSheet.create({
  wrap: {
    width: CARD_WIDTH,
    height: 230,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    backgroundColor: Colors.cardBackground,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.medium,
    color: Colors.textInverse,
    lineHeight: 20,
    marginRight: Spacing.sm,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  exploreText: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.medium,
    color: Colors.textInverse,
  },
  exploreArrow: {
    fontSize: FontSize.md,
    color: Colors.textInverse,
  },
});

// ── Skeleton card ──────────────────────────────────────────────────────────────

const GiftingCardSkeleton = memo(function GiftingCardSkeleton() {
  return (
    <View style={skeleton.wrap}>
      <SkeletonBox
        style={StyleSheet.absoluteFillObject}
        borderRadius={BorderRadius.xl}
      />
      <View style={skeleton.overlay}>
        <SkeletonBox
          style={skeleton.titleLine}
          borderRadius={BorderRadius.xs}
        />
        <SkeletonBox style={skeleton.cta} borderRadius={BorderRadius.xs} />
      </View>
    </View>
  );
});

const skeleton = StyleSheet.create({
  wrap: {
    width: CARD_WIDTH,
    height: 230,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    backgroundColor: "#EBEBEB",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: "rgba(0,0,0,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  titleLine: { flex: 1, height: 14 },
  cta: { width: 64, height: 14 },
});

// ── Main component ─────────────────────────────────────────────────────────────

export const Gifting = memo(function Gifting() {
  const [items, setItems] = useState<GiftingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getGiftingItems()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePress = useCallback((item: GiftingItem) => {
    navigateFromCtaLink(item.ctaLink, item.title);
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gifting</Text>
        <Text style={styles.subtitle}>Find the perfect gift</Text>
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
          ? Array.from({ length: 3 }).map((_, i) => (
              <GiftingCardSkeleton key={i} />
            ))
          : items.map((item) => (
              <GiftingCard
                key={item._id}
                item={item}
                onPress={() => handlePress(item)}
              />
            ))}
      </ScrollView>
    </View>
  );
});

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background,
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
});
