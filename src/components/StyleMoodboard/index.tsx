import { SkeletonBox } from "@/components/Skeletons/SkeletonBox";
import { api, BACKEND_URL } from "@/services/api";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { memo, useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MoodboardItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  ctaLink: string;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PADDING = Spacing.md * 2;
const COL_GAP = Spacing.sm;
const COL_WIDTH = (SCREEN_WIDTH - H_PADDING - COL_GAP * 2) / 3;

// Center column is shorter and starts at top; outer columns are taller and offset down
const OUTER_IMG_H = Math.round(COL_WIDTH * 1.35);
const CENTER_IMG_H = Math.round(COL_WIDTH * 1.1);
const OUTER_OFFSET = Math.round(COL_WIDTH * 0.28);

function getMonthName() {
  return new Date().toLocaleString("default", { month: "long" });
}

function navigateMoodboard(ctaLink: string, title: string) {
  if (!ctaLink) {
    router.push({
      pathname: "/products/[category]",
      params: { category: title },
    });
    return;
  }
  try {
    const raw = ctaLink.startsWith("/") ? ctaLink : `/${ctaLink}`;
    const url = new URL(`https://x${raw}`);
    const segments = url.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] ?? "";
    const filterParam = url.searchParams.get("filter") ?? undefined;
    const category = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    router.push({
      pathname: "/products/[category]",
      params: {
        category,
        ...(filterParam ? { initialFilter: filterParam } : {}),
      },
    });
  } catch {
    router.push({
      pathname: "/products/[category]",
      params: { category: title },
    });
  }
}

// ── Single card ────────────────────────────────────────────────────────────────

const MoodCard = memo(function MoodCard({
  item,
  imageHeight,
}: {
  item: MoodboardItem;
  imageHeight: number;
}) {
  const uri = item.imageUrl
    ? item.imageUrl.startsWith("http")
      ? item.imageUrl
      : `${BACKEND_URL}${item.imageUrl}`
    : null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigateMoodboard(item.ctaLink, item.title)}
      style={styles.card}
    >
      <View style={[styles.imageBox, { height: imageHeight }]}>
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
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
});

// ── Skeleton card ──────────────────────────────────────────────────────────────

const MoodCardSkeleton = memo(function MoodCardSkeleton({
  imageHeight,
}: {
  imageHeight: number;
}) {
  return (
    <View style={styles.card}>
      <SkeletonBox
        style={{ height: imageHeight, borderRadius: BorderRadius.xl }}
      />
      <SkeletonBox
        style={styles.skeletonTitle}
        borderRadius={BorderRadius.xs}
      />
    </View>
  );
});

// ── Main component ─────────────────────────────────────────────────────────────

export const StyleMoodboard = memo(function StyleMoodboard() {
  const [items, setItems] = useState<MoodboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMoodboard()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && items.length === 0) return null;

  // Split into 3 columns: [0,3], [1,4], [2,5]
  const col1 = loading
    ? [{} as MoodboardItem, {} as MoodboardItem]
    : [items[0], items[3]].filter(Boolean);
  const col2 = loading
    ? [{} as MoodboardItem, {} as MoodboardItem]
    : [items[1], items[4]].filter(Boolean);
  const col3 = loading
    ? [{} as MoodboardItem, {} as MoodboardItem]
    : [items[2], items[5]].filter(Boolean);

  return (
    <LinearGradient
      colors={["#FFF8F0", "#FAF7F2", "#FDEEDF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.sectionTitle}>
        Your {getMonthName()} Style Moodboard!
      </Text>

      <View style={styles.grid}>
        {/* Column 1 — left, offset down */}
        <View style={[styles.column, { paddingTop: OUTER_OFFSET }]}>
          {col1.map((item, i) =>
            loading ? (
              <MoodCardSkeleton key={i} imageHeight={OUTER_IMG_H} />
            ) : (
              <MoodCard key={item.id} item={item} imageHeight={OUTER_IMG_H} />
            ),
          )}
        </View>

        {/* Column 2 — center, starts at top */}
        <View style={styles.column}>
          {col2.map((item, i) =>
            loading ? (
              <MoodCardSkeleton key={i} imageHeight={CENTER_IMG_H} />
            ) : (
              <MoodCard key={item.id} item={item} imageHeight={CENTER_IMG_H} />
            ),
          )}
        </View>

        {/* Column 3 — right, offset down */}
        <View style={[styles.column, { paddingTop: OUTER_OFFSET }]}>
          {col3.map((item, i) =>
            loading ? (
              <MoodCardSkeleton key={i} imageHeight={OUTER_IMG_H} />
            ) : (
              <MoodCard key={item.id} item={item} imageHeight={OUTER_IMG_H} />
            ),
          )}
        </View>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: "row",
    gap: COL_GAP,
    overflow: "visible",
  },
  column: {
    width: COL_WIDTH,
    gap: Spacing.md,
  },
  card: {
    gap: Spacing.xs,
  },
  imageBox: {
    width: "100%",
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    backgroundColor: Colors.cardBackground,
  },
  imageFallback: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
  },
  cardTitle: {
    fontSize: FontSize.xs,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 16,
  },
  skeletonTitle: {
    width: "70%",
    height: 11,
    alignSelf: "center",
  },
});
