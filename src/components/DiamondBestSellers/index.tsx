import { SkeletonBox } from "@/components/Skeletons/SkeletonBox";
import { api, BACKEND_URL } from "@/services/api";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { memo, useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DiamondItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  ctaLink: string;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PADDING = Spacing.md * 2;
const GRID_GAP = Spacing.sm;
const CONTENT_WIDTH = SCREEN_WIDTH - H_PADDING;
const TOP_IMG_H = Math.round(CONTENT_WIDTH * 0.52);
const BOTTOM_IMG_W = (CONTENT_WIDTH - GRID_GAP) / 2;
const BOTTOM_IMG_H = Math.round(BOTTOM_IMG_W * 0.88);

function resolveUri(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  return imageUrl.startsWith("http") ? imageUrl : `${BACKEND_URL}${imageUrl}`;
}

function navigate(ctaLink: string, title: string) {
  if (!ctaLink) {
    router.push({ pathname: "/products/[category]", params: { category: title } });
    return;
  }
  try {
    const raw = ctaLink.startsWith("/") ? ctaLink : `/${ctaLink}`;
    if (raw.startsWith("/brand/")) {
      const slug = raw.replace("/brand/", "").split("?")[0];
      const brand = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      router.push({ pathname: "/products/[category]", params: { category: brand, flags: "brand" } });
      return;
    }
    const url = new URL(`https://x${raw}`);
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "";
    const category = last
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const filterParam = url.searchParams.get("filter") ?? undefined;
    router.push({
      pathname: "/products/[category]",
      params: { category, ...(filterParam ? { initialFilter: filterParam } : {}) },
    });
  } catch {
    router.push({ pathname: "/products/[category]", params: { category: title } });
  }
}

// ── Top (large) image card ─────────────────────────────────────────────────────

const TopCard = memo(function TopCard({ item }: { item: DiamondItem }) {
  const uri = resolveUri(item.imageUrl);
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => navigate(item.ctaLink, item.title)}
      style={styles.topCard}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.imageFallback} />
      )}
    </TouchableOpacity>
  );
});

// ── Bottom (small) image card ──────────────────────────────────────────────────

const BottomCard = memo(function BottomCard({ item }: { item: DiamondItem }) {
  const uri = resolveUri(item.imageUrl);
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => navigate(item.ctaLink, item.title)}
      style={styles.bottomCard}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.imageFallback} />
      )}
    </TouchableOpacity>
  );
});

// ── Main component ─────────────────────────────────────────────────────────────

export const DiamondBestSellers = memo(function DiamondBestSellers() {
  const [items, setItems] = useState<DiamondItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDiamondBestSellers()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && items.length === 0) return null;

  const topItem = items[0];
  const bottomItems = items.slice(1, 3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Diamond Best Sellers</Text>
      <Text style={styles.subtitle}>
        Look at our diamond collections curated just for you
      </Text>

      {/* Top large image */}
      {loading ? (
        <SkeletonBox style={styles.topCard} borderRadius={BorderRadius.lg} />
      ) : topItem ? (
        <TopCard item={topItem} />
      ) : null}

      {/* Bottom two images */}
      <View style={styles.bottomRow}>
        {loading ? (
          <>
            <SkeletonBox style={styles.bottomCard} borderRadius={BorderRadius.lg} />
            <SkeletonBox style={styles.bottomCard} borderRadius={BorderRadius.lg} />
          </>
        ) : (
          bottomItems.map((item) => <BottomCard key={item.id} item={item} />)
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.regular,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  topCard: {
    width: CONTENT_WIDTH,
    height: TOP_IMG_H,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: Colors.cardBackground,
    marginBottom: GRID_GAP,
  },
  bottomRow: {
    flexDirection: "row",
    gap: GRID_GAP,
  },
  bottomCard: {
    width: BOTTOM_IMG_W,
    height: BOTTOM_IMG_H,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: Colors.cardBackground,
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.cardBackground,
  },
});
