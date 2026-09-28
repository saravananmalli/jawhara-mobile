import { TrendingCardSkeleton } from "@/components/Skeletons/TrendingCardSkeleton";
import { api, BACKEND_URL } from "@/services/api";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { memo, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TrendingItem = {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  ctaLink?: string;
};

const COLLECTION_SLUG_MAP: Record<string, string> = {
  trending: "Trending",
  gifting: "Gifting",
  "new-arrivals": "New Arrivals",
  "best-seller": "Best Seller",
};

function navigateTrending(ctaLink: string | undefined, title: string) {
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
    const flags = COLLECTION_SLUG_MAP[lastSegment.toLowerCase()];

    if (flags) {
      router.push({
        pathname: "/products/[category]",
        params: { category: title, flags },
      });
    } else {
      const category =
        lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
      router.push({
        pathname: "/products/[category]",
        params: {
          category,
          ...(filterParam ? { initialFilter: filterParam } : {}),
        },
      });
    }
  } catch {
    router.push({
      pathname: "/products/[category]",
      params: { category: title },
    });
  }
}

const CARD_BG_COLORS = ["#FDEEDF", "#FBDEBA", "#F5D18A"];

const TrendingCard = memo(function TrendingCard({
  item,
  bgColor,
  onPress,
}: {
  item: TrendingItem;
  bgColor: string;
  onPress: () => void;
}) {
  const uri = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `${BACKEND_URL}${item.image}`
    : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bgColor }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.textBlock}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.imageWrap}>
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.image}
            contentFit="contain"
            transition={200}
          />
        ) : (
          <Text style={styles.emoji}>✨</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

export const TrendingNow = memo(function TrendingNow() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getTrending()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Trending Now</Text>
      </View>

      <View style={styles.list}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <TrendingCardSkeleton key={i} />
            ))
          : items.map((item, index) => (
              <TrendingCard
                key={item.id}
                item={item}
                bgColor={CARD_BG_COLORS[index % CARD_BG_COLORS.length]}
                onPress={() => navigateTrending(item.ctaLink, item.title)}
              />
            ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  list: {
    gap: Spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingLeft: Spacing.lg,
    paddingRight: 0,
    overflow: "hidden",
    minHeight: 110,
  },
  textBlock: {
    flex: 1,
    gap: 6,
    paddingRight: Spacing.sm,
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  imageWrap: {
    width: 140,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emoji: {
    fontSize: 40,
  },
});
