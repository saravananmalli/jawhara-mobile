import { AppImage } from "@/components/AppImage";
import { BannerCarousel } from "@/components/BannerCarousel";
import { CategoryCard } from "@/components/CategoryCard";
import { CustomerStories } from "@/components/CustomerStories";
import { DiamondBestSellers } from "@/components/DiamondBestSellers";
import { ErrorState } from "@/components/ErrorState";
import { Gifting } from "@/components/Gifting";
import { IconicCollections } from "@/components/IconicCollections";
import { LimitedTimeOffers } from "@/components/LimitedTimeOffers";
import { MostLoved } from "@/components/MostLoved";
import { ShopByCategory } from "@/components/ShopByCategory";
import {
  BannerCarouselSkeleton,
  CategoryCardSkeleton,
} from "@/components/Skeletons";
import { StyleMoodboard } from "@/components/StyleMoodboard";
import { TrendingNow } from "@/components/TrendingNow";
import { TrustBanner } from "@/components/TrustBanner";
import { AppHeader } from "@/components/ui/AppHeader";
import {
  api,
  BACKEND_URL,
  BannerSlide,
  Category,
  LimitedTimeOfferConfig,
  Product,
} from "@/services/api";
import {
  BorderRadius,
  Colors,
  FontSize,
  LetterSpacing,
  PoppinsFonts,
  Spacing,
} from "@/theme";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [limitedTimeOfferBanner, setLimitedTimeOfferBanner] =
    useState<LimitedTimeOfferConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [diamondProducts, setDiamondProducts] = useState<Product[]>([]);

  const loadDashboard = () => {
    setLoading(true);
    setLoadError(false);
    api
      .getDashboard()
      .then(({ categories: cats, banners: bans, limitedTimeOffers }) => {
        setCategories(cats);
        setBanners(bans);
        setLimitedTimeOfferBanner(limitedTimeOffers);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    api
      .getProducts({ category: "Diamond", limit: 4, page: 1 })
      .then((res) => setDiamondProducts(res.data))
      .catch(() => {});
  }, []);

  const handleViewDiamond = useCallback(() => {
    router.push({
      pathname: "/products/[category]",
      params: { category: "Diamond" },
    });
  }, []);

  const handleBannerPress = (ctaLink?: string) => {
    if (!ctaLink) return;
    if (ctaLink.startsWith("http")) {
      Linking.openURL(ctaLink);
    } else if (ctaLink.startsWith("/brand/")) {
      const brand = ctaLink
        .replace("/brand/", "")
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      router.push({
        pathname: "/products/[category]",
        params: { category: brand, brand },
      });
    } else if (ctaLink.startsWith("/products/")) {
      const category = ctaLink.replace("/products/", "");
      router.push({ pathname: "/products/[category]", params: { category } });
    } else {
      router.push({
        pathname: "/products/[category]",
        params: { category: ctaLink },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader onSearchPress={() => router.push("/search")} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Top Categories ── */}
        {loading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catScroll}
            style={styles.catScrollWrap}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </ScrollView>
        ) : loadError ? (
          <ErrorState
            title="Failed to load"
            message="Tap to retry"
            onRetry={loadDashboard}
            style={styles.errorState}
          />
        ) : categories.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catScroll}
            style={styles.catScrollWrap}
          >
            {categories.map((cat) => (
              <CategoryCard
                key={cat._id}
                name={cat.name}
                icon={cat.icon}
                imageUrl={cat.imageUrl}
                onPress={() =>
                  router.push({
                    pathname: "/products/[category]",
                    params: { category: cat.name },
                  })
                }
              />
            ))}
          </ScrollView>
        ) : null}

        {/* ── Limited Time Offer banner ── */}
        {!loading && limitedTimeOfferBanner?.imageUrl ? (
          <TouchableOpacity
            style={styles.ltoBanner}
            activeOpacity={limitedTimeOfferBanner.ctaLink ? 0.85 : 1}
            onPress={() => handleBannerPress(limitedTimeOfferBanner.ctaLink)}
          >
            <AppImage
              uri={`${BACKEND_URL}${limitedTimeOfferBanner.imageUrl}`}
              style={styles.ltoBannerImage}
              contentFit="cover"
              borderRadius={BorderRadius.xl}
            />
          </TouchableOpacity>
        ) : null}

        {/* ── Banner Carousel ── */}
        {loading ? (
          <BannerCarouselSkeleton />
        ) : (
          <BannerCarousel
            banners={banners}
            onPress={(banner) => handleBannerPress(banner.ctaLink)}
          />
        )}

        {/* ── Trust / Benefits marquee ── */}
        <TrustBanner style={{ marginTop: Spacing.md }} />

        {/* ── Limited-Time Jewellery Offers ── */}
        <LimitedTimeOffers />

        {/* ── Shop by Category grid (API-driven, 3-column) ── */}
        <ShopByCategory />

        {/* ── Most Loved horizontal carousel ── */}
        <MostLoved />

        {/* ── Gifting horizontal carousel ── */}
        <Gifting />

        {/* ── Trending Now ── */}
        <TrendingNow />

        {/* ── Style Moodboard ── */}
        <StyleMoodboard />

        {/* ── Iconic Collections ── */}
        <IconicCollections />

        {/* ── Diamond Best Sellers ── */}
        <DiamondBestSellers />

        {/* ── Customer Stories ── */}
        <CustomerStories />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xl },
  errorState: { marginTop: Spacing.md },

  catScrollWrap: { marginTop: Spacing.md },
  catScroll: { paddingHorizontal: Spacing.md, gap: Spacing.md },

  ltoBanner: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
    width: "100%",
    aspectRatio: 6,
    borderRadius: BorderRadius.none,
  },
  ltoBannerImage: { width: "100%", height: "100%" },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.md },

  hero: {
    flexDirection: "row",
    alignItems: "center",
    margin: Spacing.md,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    minHeight: 150,
  },
  heroContent: { flex: 1, gap: Spacing.xs },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  heroBadgeText: {
    fontSize: FontSize.xs,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textInverse,
    letterSpacing: LetterSpacing.wider,
  },
  heroTitle: { lineHeight: 26 },
  heroBtn: { alignSelf: "flex-start", marginTop: Spacing.xs },
  heroImageBox: {
    width: 90,
    height: 100,
    backgroundColor: Colors.goldLight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  heroEmoji: { fontSize: 44 },

  goldSection: {
    margin: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  goldLabel: {
    fontSize: FontSize.xs,
    fontFamily: PoppinsFonts.bold,
    color: Colors.goldLight,
    letterSpacing: LetterSpacing.wider,
  },
  goldTitle: {
    fontSize: FontSize.xl,
    fontFamily: PoppinsFonts.extrabold,
    color: Colors.textInverse,
    lineHeight: 26,
  },
  goldSub: { fontSize: FontSize.sm, color: Colors.goldLight, lineHeight: 18 },
  goldBtn: { alignSelf: "flex-start", backgroundColor: Colors.textInverse },

  promoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  promoSub: { lineHeight: 19 },
  promoBtn: { alignSelf: "flex-start", marginTop: Spacing.xs },

  productGrid: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginTop: Spacing.sm,
  },
  productRow: {
    flexDirection: "row",
  },
  productRowBorderTop: {
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  productCell: { flex: 1 },
  skeletonRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.sm,
  },
  skeletonCard: { flex: 1 },
  viewMoreBtn: { marginTop: Spacing.md },
});
