import { SkeletonBox } from "@/components/Skeletons/SkeletonBox";
import { ViewMoreButton } from "@/components/ViewMoreButton";
import { api, BACKEND_URL } from "@/services/api";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { memo, useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type IconicItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  ctaLink: string;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.4);
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.25);
const CARD_GAP = Spacing.sm;

function slugToBrandName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function navigateIconic(ctaLink: string, title: string) {
  const fallback = () =>
    router.push({
      pathname: "/products/[category]",
      params: { category: title, flags: "brand" },
    });

  if (!ctaLink) {
    fallback();
    return;
  }

  try {
    const raw = ctaLink.startsWith("/") ? ctaLink : `/${ctaLink}`;
    // /brand/<slug> → use brand filter with the converted slug
    if (raw.startsWith("/brand/")) {
      const slug = raw.replace("/brand/", "").split("?")[0];
      const brandName = slugToBrandName(slug);
      router.push({
        pathname: "/products/[category]",
        params: { category: brandName, flags: "brand" },
      });
      return;
    }
    const url = new URL(`https://x${raw}`);
    const segments = url.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] ?? "";
    const filterParam = url.searchParams.get("filter") ?? undefined;
    const category = lastSegment
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    router.push({
      pathname: "/products/[category]",
      params: { category, ...(filterParam ? { initialFilter: filterParam } : {}) },
    });
  } catch {
    fallback();
  }
}

// ── Card ───────────────────────────────────────────────────────────────────────

const IconicCard = memo(function IconicCard({ item }: { item: IconicItem }) {
  const uri = item.imageUrl
    ? item.imageUrl.startsWith("http")
      ? item.imageUrl
      : `${BACKEND_URL}${item.imageUrl}`
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigateIconic(item.ctaLink, item.title)}
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
      <View style={styles.labelBar}>
        <Text style={styles.labelText} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// ── Skeleton ───────────────────────────────────────────────────────────────────

const IconicCardSkeleton = memo(function IconicCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox
        style={StyleSheet.absoluteFillObject}
        borderRadius={BorderRadius.xl}
      />
      <View style={styles.labelBar}>
        <SkeletonBox
          style={styles.skeletonLabel}
          borderRadius={BorderRadius.xs}
        />
      </View>
    </View>
  );
});

// ── Main ───────────────────────────────────────────────────────────────────────

export const IconicCollections = memo(function IconicCollections() {
  const [items, setItems] = useState<IconicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getIconicCollections()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && items.length === 0) return null;

  // Build columns of 2 for the 2-row horizontal grid
  const displayItems = loading
    ? Array.from({ length: 6 }, (_, i) => ({ id: String(i) }) as IconicItem)
    : items;

  const columns: IconicItem[][] = [];
  for (let i = 0; i < displayItems.length; i += 2) {
    columns.push(displayItems.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>All Iconic Collections</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {columns.map((col, colIndex) => (
          <View key={colIndex} style={styles.column}>
            {col.map((item, rowIndex) =>
              loading ? (
                <IconicCardSkeleton key={rowIndex} />
              ) : (
                <IconicCard key={item.id} item={item} />
              ),
            )}
          </View>
        ))}
      </ScrollView>

      <ViewMoreButton
        label="VIEW ALL"
        style={styles.viewAllBtn}
        onPress={() => router.push("/search")}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.backgroundCream,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: CARD_GAP,
  },
  column: {
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    backgroundColor: Colors.cardBackground,
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.cardBackground,
  },
  labelBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  labelText: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textInverse,
    textAlign: "center",
  },
  skeletonLabel: {
    width: "60%",
    height: 12,
    alignSelf: "center",
  },
  viewAllBtn: {
    alignSelf: "center",
    marginTop: Spacing.lg,
  },
});
