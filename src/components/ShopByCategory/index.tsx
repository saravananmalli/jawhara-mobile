import { AppImage } from "@/components/AppImage";
import { ShopCategoryGridSkeleton } from "@/components/Skeletons";
import {
  api,
  BACKEND_URL,
  ShopCategoryItem,
  ShopCategorySection,
} from "@/services/api";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { DirhamSymbol } from "dirham/react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── ctaLink parser ───────────────────────────────────────────────────────────
// Web app links look like: /category/rings?filter=Gold%2018K
// Map the slug to the mobile category name used in /products/[category]

const WEB_SLUG_TO_CATEGORY: Record<string, string> = {
  rings: "Rings",
  earrings: "Earrings",
  necklaces: "Necklace",
  pendants: "Pendants",
  bracelets: "Bracelets",
  bangles: "Bangles",
  all: "Rings", // collection/all fallback
};

interface ParsedLink {
  category: string;
  initialFilter?: string;
}

function parseCategoryLink(ctaLink: string, fallbackTitle: string): ParsedLink {
  try {
    // Normalise: ensure leading slash so URL() parses correctly
    const raw = ctaLink.startsWith("/") ? ctaLink : `/${ctaLink}`;
    const url = new URL(`https://x${raw}`);

    // Last non-empty path segment is the slug e.g. "rings", "earrings"
    const segments = url.pathname.split("/").filter(Boolean);
    const slug = segments[segments.length - 1] ?? "";

    const category = WEB_SLUG_TO_CATEGORY[slug.toLowerCase()] ?? fallbackTitle;

    // ?filter=Gold%2018K  or  ?stone=diamond  become initialFilter
    const filter =
      url.searchParams.get("filter") ??
      url.searchParams.get("stone") ??
      undefined;

    return { category, initialFilter: filter ?? undefined };
  } catch {
    return { category: fallbackTitle };
  }
}

// ── Layout ────────────────────────────────────────────────────────────────────

const COLS = 3;
const H_PAD = Spacing.md;
const GAP = Spacing.sm;
const SCREEN_W = Dimensions.get("window").width;
const CARD_W = Math.floor((SCREEN_W - H_PAD * 2 - GAP * (COLS - 1)) / COLS);
const IMAGE_SIZE = CARD_W - Spacing.sm * 2; // image with small side padding

// ── Category card — matches reference screenshot ──────────────────────────────

interface CategoryCardProps {
  item: ShopCategoryItem;
  onPress: (item: ShopCategoryItem) => void;
}

const CategoryCard = memo(function CategoryCard({
  item,
  onPress,
}: CategoryCardProps) {
  const uri = item.imageUrl ? `${BACKEND_URL}${item.imageUrl}` : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress(item)}
    >
      {/* ── Badge — gold pill, centered inside card with top spacing ── */}

      {/* ── Product image with gradient background ── */}
      <LinearGradient
        colors={["#FDEEDF", "#FBDEBA"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.imageGradient}
      >
        <AppImage
          uri={uri}
          style={styles.image}
          contentFit="contain"
          placeholder="💎"
          borderRadius={0}
        />
      </LinearGradient>

      {/* ── Category title ── */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
});

// ── Main section ──────────────────────────────────────────────────────────────

export const ShopByCategory = memo(function ShopByCategory() {
  const [section, setSection] = useState<ShopCategorySection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getShopCategories()
      .then(setSection)
      .catch(() => setSection(null))
      .finally(() => setLoading(false));
  }, []);

  const handlePress = useCallback((item: ShopCategoryItem) => {
    const { category, initialFilter } = parseCategoryLink(
      item.ctaLink ?? "",
      item.title,
    );
    router.push({
      pathname: "/products/[category]",
      params: { category, ...(initialFilter ? { initialFilter } : {}) },
    });
  }, []);

  if (!loading && !section) return null;

  // Chunk items into rows of COLS
  const rows: ShopCategoryItem[][] = [];
  if (section) {
    for (let i = 0; i < section.items.length; i += COLS) {
      rows.push(section.items.slice(i, i + COLS));
    }
  }

  return (
    <View style={styles.container}>
      {/* ── Section title — centered, bold ── */}
      {loading ? (
        <View style={styles.titleSkeleton} />
      ) : (
        <View style={styles.sectionTitleRow}>
          {section!.title.split("₹").map((part, i, arr) => (
            <React.Fragment key={i}>
              <Text style={styles.sectionTitle}>{part}</Text>
              {i < arr.length - 1 && (
                <DirhamSymbol
                  size={FontSize.lg}
                  color={Colors.textPrimary}
                  weight="extrabold"
                />
              )}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <ShopCategoryGridSkeleton rows={2} />
      ) : (
        <View style={styles.grid}>
          {rows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              {row.map((item) => (
                <CategoryCard
                  key={item._id}
                  item={item}
                  onPress={handlePress}
                />
              ))}
              {/* Fill trailing empty slots so columns align */}
              {row.length < COLS &&
                Array.from({ length: COLS - row.length }).map((_, i) => (
                  <View key={`fill-${i}`} style={styles.cardFill} />
                ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },

  // Section title: centered, bold, dark — matches "Diamonds starting at ₹ 500"
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingHorizontal: H_PAD,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  titleSkeleton: {
    alignSelf: "center",
    width: 220,
    height: 22,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#EBEBEB",
    marginBottom: Spacing.xl,
  },

  // Grid layout
  grid: {
    paddingHorizontal: H_PAD,
    gap: GAP,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
  },
  cardFill: {},

  // Card — cream background, rounded, no border/shadow
  card: {
    width: CARD_W,
    backgroundColor: "transparent",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    paddingBottom: Spacing.sm,
    overflow: "hidden",
  },

  // Badge row: always renders to keep consistent card height
  badgeRow: {
    width: "100%",
    alignItems: "center",
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  // Gold pill badge — all corners rounded, centered
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textInverse,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  // Reserve same height as badge when absent
  badgeSpacer: {
    height: 17, // matches badge line-height
  },

  // Gradient container for the product image
  imageGradient: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  // Image fills the gradient — transparent bg so gradient shows through
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    backgroundColor: "transparent",
  },

  // Category title — centered, 2 lines max
  cardTitle: {
    marginTop: Spacing.xs + 2,
    paddingHorizontal: Spacing.xs,
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 16,
  },
});
