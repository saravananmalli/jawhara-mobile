import { ErrorState } from "@/components/ErrorState";
import { PDPBottomBar } from "@/components/PDPBottomBar";
import { PDPDeliveryRow } from "@/components/PDPDeliveryRow";
import { PDPFeatureGrid } from "@/components/PDPFeatureGrid";
import { PDPImageGallery } from "@/components/PDPImageGallery";
import { PDPPriceSection } from "@/components/PDPPriceSection";
import { PDPProductInfo } from "@/components/PDPProductInfo";
import { PDPRatingsSummary } from "@/components/PDPRatingsSummary";
import { PDPReviewList } from "@/components/PDPReviewList";
import { PDPSizeSelector } from "@/components/PDPSizeSelector";
import { PDPSpecsGrid } from "@/components/PDPSpecsGrid";
import { PDPStickyHeader } from "@/components/PDPStickyHeader";
import { PDPTopPickBanner } from "@/components/PDPTopPickBanner";
import { ProductSlider } from "@/components/ProductSlider";
import { PDPSkeleton } from "@/components/Skeletons";
import { TrustBanner } from "@/components/TrustBanner";
import { api, Product } from "@/services/api";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import { Colors, Spacing } from "@/theme";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.getProduct(id),
    enabled: !!id,
  });

  const { items: recentlyViewed, addViewed } = useRecentlyViewed(id);

  useEffect(() => {
    if (product) addViewed(product);
  }, [product, addViewed]);

  const { data: similarData, isLoading: similarLoading } = useQuery({
    queryKey: ["similar-products", product?.category, product?._id],
    queryFn: () => api.getProducts({ category: product!.category, limit: 10 }),
    enabled: !!product,
  });

  const similarProducts = useMemo(
    () =>
      (similarData?.data ?? [])
        .filter((p) => p._id !== product?._id)
        .slice(0, 8),
    [similarData, product?._id],
  );

  const { data: allReviews = [] } = useQuery({
    queryKey: ["pdp-reviews", product?._id],
    queryFn: () => api.getRecentReviews(50),
    enabled: !!product,
  });

  const productReviews = useMemo(
    () => allReviews.filter((r) => r.product?._id === product?._id),
    [allReviews, product?._id],
  );

  const goToProduct = (p: Product) =>
    router.push({ pathname: "/product/[id]", params: { id: p._id } });

  const scrollRef = useRef<ScrollView>(null);
  const ratingsY = useRef(0);
  const scrollToRatings = useCallback(() => {
    scrollRef.current?.scrollTo({ y: ratingsY.current, animated: true });
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <PDPStickyHeader />
        <PDPSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !product) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <PDPStickyHeader />
        <ErrorState
          title="Product not found"
          message="This product may no longer be available."
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <PDPStickyHeader productName={product.name} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PDPImageGallery images={product.images} />

        <PDPTopPickBanner />

        <View style={[styles.section, styles.priceInfoBlock]}>
          <PDPPriceSection
            price={product.price}
            originalPrice={product.originalPrice}
            discount={product.discount}
          />
          <PDPProductInfo product={product} onRatingPress={scrollToRatings} />
        </View>

        <View style={styles.section}>
          <PDPDeliveryRow
            nextDayDelivery={product.nextDayDelivery}
            arrivesBy={product.arrivesBy}
          />
        </View>

        <TrustBanner style={styles.trustBanner} />

        <View style={styles.section}>
          <PDPSpecsGrid product={product} />
        </View>

        {product.sizes && product.sizes.length > 0 ? (
          <View style={styles.section}>
            <PDPSizeSelector sizes={product.sizes} />
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.section}>
          <PDPFeatureGrid />
        </View>

        <View style={styles.divider} />

        <View
          style={styles.section}
          onLayout={(e) => {
            ratingsY.current = e.nativeEvent.layout.y;
          }}
        >
          <PDPRatingsSummary reviews={productReviews} />
        </View>

        <View style={styles.section}>
          <PDPReviewList reviews={productReviews} />
        </View>

        <ProductSlider
          title="Shop From Recently Viewed"
          products={recentlyViewed}
          onProductPress={goToProduct}
        />

        <ProductSlider
          title="Similar Products"
          products={similarProducts}
          loading={similarLoading}
          onProductPress={goToProduct}
        />

        <View style={{ height: Spacing.lg }} />
      </ScrollView>

      <PDPBottomBar product={product} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.md },
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: "center",
  },
  priceInfoBlock: { gap: Spacing.sm },
  trustBanner: { marginTop: Spacing.sm, marginBottom: Spacing.md },
  divider: { height: 12, backgroundColor: Colors.backgroundCream },
});
