import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { AppHeader } from "@/components/ui/AppHeader";
import { api, Product } from "@/services/api";
import { useCart } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";

const COL = 2;

const FILTERS = ["All", "New In", "Next Day Delivery", "Best Seller", "Bands"];

const FILTER_BADGE: Record<string, string | undefined> = {
  "New In": "new",
  "Best Seller": "Best Seller",
  "Bands": "Bands",
};

export default function GiftingScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { wishlist, toggleWishlist } = useWishlist();
  const { items: cartItems, addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState("All");

  const badge = FILTER_BADGE[activeFilter];
  const isNextDay = activeFilter === "Next Day Delivery";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", { flags: "Gifting", activeFilter }] as const,
    queryFn: ({ pageParam }: { pageParam: number }) =>
      api.getProducts({
        flags: "Gifting",
        page: pageParam,
        limit: 20,
        ...(badge && { badge }),
        ...(isNextDay && { nextDayDelivery: true }),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const products = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  const paddedProducts = useMemo(
    () => (products.length % 2 !== 0 ? [...products, null] : products) as (Product | null)[],
    [products],
  );

  const isLoading = isFetching && !isFetchingNextPage && products.length === 0;

  const loadMore = () => {
    if (isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader hideSearch>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersBar}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </AppHeader>

      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : paddedProducts.length === 0 ? (
        <EmptyState
          emoji="🎁"
          title="No gifting products found"
          subtitle="Check back soon for new arrivals"
        />
      ) : (
        <FlatList
          data={paddedProducts}
          keyExtractor={(item, index) => item?._id ?? `empty-${index}`}
          numColumns={COL}
          contentContainerStyle={[
            styles.grid,
            { paddingBottom: tabBarHeight + Spacing.lg },
          ]}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          renderItem={({ item, index }) => {
            if (!item) return <View style={styles.emptyCell} />;
            return (
              <ProductCard
                product={item}
                isWishlisted={wishlist.has(item._id)}
                isInCart={Boolean(cartItems[item._id])}
                onWishlistToggle={toggleWishlist}
                onAddToCart={addToCart}
                onPress={() =>
                  router.push({ pathname: "/product/[id]", params: { id: item._id } })
                }
                borderRight={index % 2 === 0}
              />
            );
          }}
          ListFooterComponent={
            isFetchingNextPage ? <ProductGridSkeleton count={2} /> : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  filtersBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs + 2,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontFamily: PoppinsFonts.medium,
  },
  chipTextActive: { color: Colors.textInverse, fontFamily: PoppinsFonts.bold },

  grid: { paddingBottom: Spacing.lg },
  row: { borderBottomWidth: 1, borderBottomColor: Colors.dividerGray },
  emptyCell: { flex: 1, backgroundColor: "transparent" },
});
