import { AppText } from "@/components/AppText";
import { SkeletonBox } from "@/components/Skeletons/SkeletonBox";
import { TrendingNow } from "@/components/TrendingNow";
import { AppHeader } from "@/components/ui/AppHeader";
import { api, BACKEND_URL, MobileCategory } from "@/services/api";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

type Gender = "women" | "kids";

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PAD = Spacing.md;
const COL_GAP = Spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - COL_GAP) / 2;
const THUMB_SIZE = 52;

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveUri(url: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${BACKEND_URL}${url}`;
}

function navigateToCategory(ctaLink: string, title: string) {
  // ctaLink can be "category/rings", "/category/rings", or "category/rings?filter=X"
  const raw = ctaLink || title;
  const pathMatch = raw.match(/category\/([^?/]+)/);
  const category = pathMatch ? pathMatch[1] : raw;
  const filterMatch = raw.match(/[?&]filter=([^&]+)/);
  router.push({
    pathname: "/products/[category]",
    params: filterMatch
      ? { category, initialFilter: decodeURIComponent(filterMatch[1]) }
      : { category },
  });
}

// ── Category card ─────────────────────────────────────────────────────────────

function CategoryCard({
  item,
  onPress,
}: {
  item: MobileCategory;
  onPress: () => void;
}) {
  const uri = resolveUri(item.imageUrl);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.thumb}>
        {uri ? (
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <Text style={styles.emoji}>✨</Text>
        )}
      </View>
      <Text style={styles.cardName} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

// ── Skeleton grid ─────────────────────────────────────────────────────────────

function SkeletonGrid({ count }: { count: number }) {
  const rows: number[][] = [];
  for (let i = 0; i < count; i += 2) {
    rows.push([i, i + 1].filter((n) => n < count));
  }
  return (
    <View style={styles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((i) => (
            <SkeletonBox
              key={i}
              style={styles.cardSkeleton}
              borderRadius={BorderRadius.lg}
            />
          ))}
          {row.length === 1 && <View style={styles.cardPlaceholder} />}
        </View>
      ))}
    </View>
  );
}

// ── Category grid ─────────────────────────────────────────────────────────────

function CategoryGrid({ items }: { items: MobileCategory[] }) {
  const rows: MobileCategory[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return (
    <View style={styles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((item) => (
            <CategoryCard
              key={item._id}
              item={item}
              onPress={() => navigateToCategory(item.ctaLink, item.title)}
            />
          ))}
          {row.length === 1 && <View style={styles.cardPlaceholder} />}
        </View>
      ))}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CategoriesScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [gender, setGender] = useState<Gender>("women");
  const [womenCategories, setWomenCategories] = useState<MobileCategory[]>([]);
  const [kidsCategories, setKidsCategories] = useState<MobileCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCategoryItems()
      .then(({ women, kids }) => {
        setWomenCategories(women);
        setKidsCategories(kids);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const currentCategories =
    gender === "women" ? womenCategories : kidsCategories;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader hideSearch />

      {/* Women / Kids tab bar */}
      <View style={styles.tabBar}>
        {(["women", "kids"] as Gender[]).map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.tab, gender === g && styles.tabActive]}
            onPress={() => setGender(g)}
          >
            <AppText
              style={[styles.tabLabel, gender === g && styles.tabLabelActive]}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight }]}
      >
        <Text style={styles.sectionTitle}>Top Categories</Text>

        {loading ? (
          <SkeletonGrid count={8} />
        ) : currentCategories.length === 0 ? (
          <Text style={styles.emptyText}>No categories available</Text>
        ) : (
          <CategoryGrid items={currentCategories} />
        )}

        <TrendingNow />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    backgroundColor: Colors.borderYellow,
  },
  tabLabel: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontFamily: PoppinsFonts.medium,
  },
  tabLabelActive: {
    color: Colors.textPrimary,
    fontFamily: PoppinsFonts.semibold,
  },

  scroll: { paddingHorizontal: H_PAD, paddingTop: Spacing.lg },

  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontFamily: PoppinsFonts.regular,
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
  },

  grid: { gap: COL_GAP },
  row: { flexDirection: "row", gap: COL_GAP },

  card: {
    width: CARD_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBackground,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emoji: { fontSize: 26 },
  cardName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
    lineHeight: 18,
  },

  cardSkeleton: {
    width: CARD_WIDTH,
    height: THUMB_SIZE + Spacing.sm * 2,
  },
  cardPlaceholder: { width: CARD_WIDTH },
});
