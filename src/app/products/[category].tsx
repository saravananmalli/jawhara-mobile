import { CartIcon } from "@/components/CartIcon";
import { EmptyState } from "@/components/EmptyState";
import { FilterSheet, AppliedFilters, DEFAULT_FILTERS } from "@/components/FilterSheet";
import { SortSheet, SortKey } from "@/components/SortSheet";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeletons";
import {
  BackArrowIcon,
  HeartIcon,
  PinIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
import { matchProductType, slugifyCategory } from "@/constants/productTypes";
import { api, ActiveOffer, Product } from "@/services/api";
import {
  BorderRadius,
  Colors,
  FontSize,
  PoppinsFonts,
  LetterSpacing,
  Spacing,
} from "@/theme";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// ── Icons ─────────────────────────────────────────────────────────────────────

function CategoriesBottomIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M6.75 3C3.88235 3 3 3.88235 3 6.75C3 9.61765 3.88235 10.5 6.75 10.5C9.61765 10.5 10.5 9.61765 10.5 6.75C10.5 3.88235 9.61765 3 6.75 3Z" stroke={Colors.textInverse} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.75 13.5C3.88235 13.5 3 14.3824 3 17.25C3 20.1176 3.88235 21 6.75 21C9.61765 21 10.5 20.1176 10.5 17.25C10.5 14.3824 9.61765 13.5 6.75 13.5Z" stroke={Colors.textInverse} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17.25 13.5C14.3824 13.5 13.5 14.3824 13.5 17.25C13.5 20.1176 14.3824 21 17.25 21C20.1176 21 21 20.1176 21 17.25C21 14.3824 20.1176 13.5 17.25 13.5Z" stroke={Colors.textInverse} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17.25 3C14.3824 3 13.5 3.88235 13.5 6.75C13.5 9.61765 14.3824 10.5 17.25 10.5C20.1176 10.5 21 9.61765 21 6.75C21 3.88235 20.1176 3 17.25 3Z" stroke={Colors.textInverse} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SortBottomIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 12 12" fill="none">
      <Path d="M2 3.5H11" stroke={Colors.textInverse} strokeLinecap="round" />
      <Path d="M2 6H8" stroke={Colors.textInverse} strokeLinecap="round" />
      <Path d="M2 8.5H4" stroke={Colors.textInverse} strokeLinecap="round" />
    </Svg>
  );
}

function FilterBottomIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 12 12" fill="none">
      <Path d="M2.69995 1.04999H9.29994C9.84994 1.04999 10.2999 1.49999 10.2999 2.04999V3.14999C10.2999 3.54999 10.0499 4.04999 9.79994 4.29999L7.64994 6.2C7.34994 6.45 7.14994 6.95 7.14994 7.35V9.5C7.14994 9.8 6.94994 10.2 6.69994 10.35L5.99994 10.8C5.34994 11.2 4.44995 10.75 4.44995 9.95V7.3C4.44995 6.95 4.24995 6.5 4.04995 6.25L2.14995 4.24999C1.89995 3.99999 1.69995 3.54999 1.69995 3.24999V2.09999C1.69995 1.49999 2.14995 1.04999 2.69995 1.04999Z" stroke={Colors.textInverse} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.465 1.04999L3 4.99999" stroke={Colors.textInverse} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COL = 2;
const FILTERS = ["All", "New In", "Next Day Delivery", "Best Seller", "Bands"];

const FILTER_BADGE: Record<string, string | undefined> = {
  "New In": "new",
  "Best Seller": "Best Seller",
  "Bands": "Bands",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extracts filter-relevant attribute values for a product.
 *
 * Priority: backend-provided field → name/badge inference → null (not inferable).
 *
 * Returns:
 *   string[]  – the product's values for this filter key (may be empty → no match)
 *   null      – filter key is not inferrable for this product; caller should pass it through
 */
function inferProductValues(p: Product, filterKey: string): string[] | null {
  // Use backend-provided field when available
  const backendVal = (p as unknown as Record<string, unknown>)[filterKey];
  if (backendVal !== undefined) {
    if (Array.isArray(backendVal)) return backendVal as string[];
    if (typeof backendVal === 'string') return [backendVal];
  }

  const text = `${p.name} ${p.badge ?? ''}`.toLowerCase();
  const cat  = p.category.toLowerCase();

  switch (filterKey) {
    case 'gemstone': {
      const gems: string[] = [];
      if (text.includes('diamond'))  gems.push('diamond');
      if (text.includes('ruby'))     gems.push('ruby');
      if (text.includes('emerald'))  gems.push('emerald');
      if (text.includes('sapphire')) gems.push('sapphire');
      if (text.includes('pearl'))    gems.push('pearl');
      if (text.includes('opal'))     gems.push('opal');
      return gems;
    }

    case 'material': {
      const mats: string[] = [];
      // Check compound colours first to avoid "gold" matching inside "white gold"
      if (text.includes('white gold')) { mats.push('white_gold'); mats.push('gold'); }
      else if (text.includes('rose gold')) { mats.push('rose_gold'); mats.push('gold'); }
      else if (text.includes('yellow gold')) { mats.push('yellow_gold'); mats.push('gold'); }
      else if (text.includes('gold')) mats.push('gold');
      if (text.includes('platinum')) mats.push('platinum');
      if (text.includes('silver'))   mats.push('silver');
      if (text.includes('diamond'))  mats.push('diamond');
      return mats;
    }

    case 'metal': {
      const metals: string[] = [];
      if (text.includes('white gold'))       metals.push('white_gold');
      else if (text.includes('rose gold'))   metals.push('rose_gold');
      else if (text.includes('yellow gold')) metals.push('yellow_gold');
      else if (text.includes('gold'))        metals.push('yellow_gold');
      if (text.includes('platinum'))         metals.push('platinum');
      return metals;
    }

    // Product Type = the product's actual jewelry category (Ring, Necklace, ...),
    // matched against the canonical taxonomy FilterSheet's Product Type options use.
    case 'productType': {
      const def = matchProductType(cat);
      return [def ? def.key : slugifyCategory(p.category)];
    }

    // Style = the sub-style within the product's Product Type (e.g. Ring
    // Styles: Engagement Ring, Solitaire Ring, ...) — sourced from the same
    // canonical taxonomy FilterSheet uses, so a product can never match a
    // style that belongs to a different product type.
    case 'style': {
      const def = matchProductType(cat);
      if (!def) return null;
      const styles: string[] = [];
      for (const s of def.styles) {
        if (s.matchKeywords.some((kw) => text.includes(kw))) styles.push(s.key);
      }
      return styles;
    }

    case 'occasion': {
      const occs: string[] = [];
      if (text.includes('wedding') || text.includes('bridal')) occs.push('wedding');
      if (text.includes('engagement'))                          occs.push('engagement');
      if (text.includes('anniversary'))                         occs.push('anniversary');
      if (text.includes('birthday'))                            occs.push('birthday');
      if (text.includes('party') || text.includes('cocktail'))  occs.push('party');
      if (text.includes('daily') || text.includes('everyday'))  occs.push('daily_wear');
      return occs;
    }

    case 'collection': {
      const cols: string[] = [];
      if (text.includes('classic'))  cols.push('classic');
      if (text.includes('modern'))   cols.push('modern');
      if (text.includes('vintage'))  cols.push('vintage');
      if (text.includes('luxury'))   cols.push('luxury');
      return cols;
    }

    // Fields that require explicit backend data — cannot be inferred from name
    case 'ringSize':
    case 'size':
    case 'chainLength':
    case 'backType':
    case 'weightRange':
    case 'shopFor':
    case 'gifts':
    default:
      return null;
  }
}

function applyLocalFilters(products: Product[], filters: AppliedFilters): Product[] {
  let result = products;

  // ── Price — hard numeric thresholds ──────────────────────────────────────────
  const priceKeys = filters['price'] ?? [];
  if (priceKeys.length > 0) {
    result = result.filter(p =>
      priceKeys.some(key => {
        switch (key) {
          case 'under_1000': return p.price < 1000;
          case 'under_1500': return p.price < 1500;
          case 'under_2000': return p.price < 2000;
          case 'under_2500': return p.price < 2500;
          case 'under_3000': return p.price < 3000;
          case 'under_3500': return p.price < 3500;
          case 'under_4000': return p.price < 4000;
          case 'under_4500': return p.price < 4500;
          case 'over_5000':  return p.price >= 5000;
          default:           return true;
        }
      }),
    );
  }

  // ── Delivery time — boolean product flags ─────────────────────────────────
  const deliveryKeys = filters['deliveryTime'] ?? [];
  if (deliveryKeys.length > 0) {
    result = result.filter(p =>
      deliveryKeys.some(key => {
        switch (key) {
          case 'next_day': return p.nextDayDelivery === true;
          case 'in_stock': return p.inStock === true;
          default:         return true;
        }
      }),
    );
  }

  // ── Attribute filters — use inference engine ──────────────────────────────
  const INFERRED_KEYS = [
    'gemstone', 'material', 'metal', 'productType', 'style',
    'occasion', 'collection',
  ];

  for (const key of INFERRED_KEYS) {
    const selected = filters[key] ?? [];
    if (selected.length === 0) continue;

    result = result.filter(p => {
      const vals = inferProductValues(p, key);
      if (vals === null) return true;  // not inferrable → pass through
      if (vals.length === 0) return false; // no match found → exclude
      return selected.some(s => vals.includes(s));
    });
  }

  // ── Backend-only filters (pass through until backend supports them) ────────
  const BACKEND_KEYS = ['ringSize', 'size', 'chainLength', 'backType', 'weightRange', 'shopFor', 'gifts'];
  for (const key of BACKEND_KEYS) {
    const selected = filters[key] ?? [];
    if (selected.length === 0) continue;
    // Apply only if backend is already returning the field on products
    if (result.some(p => (p as unknown as Record<string, unknown>)[key] !== undefined)) {
      result = result.filter(p => {
        const val = (p as unknown as Record<string, unknown>)[key];
        if (val === undefined) return true;
        if (Array.isArray(val)) return selected.some(s => val.includes(s));
        return selected.includes(String(val));
      });
    }
  }

  return result;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CategoryProductsScreen() {
  const insets = useSafeAreaInsets();
  const { category, brand, mode, initialFilter, flags } = useLocalSearchParams<{
    category: string;
    brand?: string;
    mode?: string;
    initialFilter?: string;
    flags?: string;
  }>();
  const isOfferMode = mode === 'offer';
  // Brand pages, CMS collection links (flags="Trending", "Gifting", ...) and
  // offers all fetch from a curated subset rather than one exact category —
  // the Product Type filter should list only the types actually present in
  // that subset instead of the full store-wide taxonomy.
  const isCuratedListing = Boolean(brand) || Boolean(flags) || isOfferMode;
  const { location, openSheet } = useLocation();

  const [activeFilter, setActiveFilter] = useState(initialFilter ?? "All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortKey>('relevance');
  // Whenever `category` resolves to a real product type — a plain category
  // route, or a brand/collection/offer link that was tapped from a specific
  // category tab — pre-select it so the grid starts scoped to it. Links that
  // pass a brand/collection/placeholder title (no match) leave it unset so
  // every type stays visible.
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(() => {
    const def = matchProductType(category);
    return def ? { productType: [def.key] } : DEFAULT_FILTERS;
  });
  const { wishlist, toggleWishlist } = useWishlist();
  const { items: cartItems, cartCount, addToCart } = useCart();

  // ── Offer-mode: fetch products from the active offer ──────────────────────
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);
  const [offerLoading, setOfferLoading] = useState(false);

  useEffect(() => {
    if (!isOfferMode) return;
    setOfferLoading(true);
    api
      .getActiveOffer()
      .then((data: ActiveOffer | null) => setOfferProducts(data?.products ?? []))
      .catch(() => setOfferProducts([]))
      .finally(() => setOfferLoading(false));
  }, [isOfferMode]);

  // ── React Query — cached, no duplicate fetches ────────────────────────────

  const badge = FILTER_BADGE[activeFilter];
  const isNextDay = activeFilter === "Next Day Delivery";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", { category, brand, activeFilter, flags }] as const,
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      // flags="brand" means category param holds a brand name, not a category.
      // Plain category pages fetch unscoped too — the Product Type filter
      // (defaulted to the current category) scopes the view client-side so
      // switching Product Type can reveal other categories without a refetch.
      const base =
        brand ? { brand } :
        flags === "brand" ? { brand: category } :
        {};
      return api.getProducts({
        ...base,
        page: pageParam,
        limit: 20,
        ...(flags && { flags }),
        ...(badge && { badge }),
        ...(isNextDay && { nextDayDelivery: true }),
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    enabled: !isOfferMode,
  });

  // ── Derived data — memoized ───────────────────────────────────────────────

  const infiniteProducts = useMemo(
    () => data?.pages.flatMap(p => p.data) ?? [],
    [data],
  );

  // In offer mode all products come from the offer endpoint
  const rawProducts = isOfferMode ? offerProducts : infiniteProducts;

  // Brand pages, CMS collection links and offers can carry multiple product
  // types — derive the Product Type filter options from what's actually in
  // the fetched catalog instead of hardcoding a list.
  const multiCategoryProductTypeOptions = useMemo(() => {
    if (!isCuratedListing) return undefined;
    const seen = new Set<string>();
    const options: { key: string; label: string }[] = [];
    for (const p of rawProducts) {
      const def = matchProductType(p.category);
      const key = def ? def.key : slugifyCategory(p.category);
      const label = def ? def.label : p.category;
      if (seen.has(key)) continue;
      seen.add(key);
      options.push({ key, label });
    }
    return options;
  }, [isCuratedListing, rawProducts]);

  // Category scoping now happens via the Product Type filter (appliedFilters,
  // defaulted above to the current category) so the grid can switch types
  // without a refetch — this stage is just a passthrough.
  const categoryFiltered = rawProducts;

  // In offer mode apply the top chip filter client-side (server handles it normally)
  const chipFiltered = useMemo(() => {
    if (!isOfferMode || activeFilter === "All") return categoryFiltered;
    if (activeFilter === "Next Day Delivery") return categoryFiltered.filter(p => p.nextDayDelivery);
    const badgeKey = FILTER_BADGE[activeFilter];
    if (badgeKey) return categoryFiltered.filter(p =>
      p.badge?.toLowerCase().includes(badgeKey.toLowerCase())
    );
    return categoryFiltered;
  }, [isOfferMode, activeFilter, categoryFiltered]);

  // Client-side sort + price/rating filters from the FilterSheet, then SortSheet sort on top
  const displayProducts = useMemo(() => {
    const filtered = applyLocalFilters(chipFiltered, appliedFilters);
    if (selectedSort === 'relevance') return filtered;
    return [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 'discount':        return b.discount - a.discount;
        case 'whats_new':       return b._id.localeCompare(a._id);
        case 'price_asc':       return a.price - b.price;
        case 'price_desc':      return b.price - a.price;
        case 'customer_rating': return b.rating - a.rating;
        default:                return 0;
      }
    });
  }, [chipFiltered, appliedFilters, selectedSort]);

  // Pad with null so the last row always has 2 cells — prevents odd item from stretching full-width
  const paddedProducts = useMemo(
    () => (displayProducts.length % 2 !== 0 ? [...displayProducts, null] : displayProducts) as (Product | null)[],
    [displayProducts],
  );

  const activeFilterCount = useMemo(
    () => Object.values(appliedFilters).reduce((sum, vals) => sum + vals.length, 0),
    [appliedFilters],
  );

  // Client-side Product Type filtering can leave the first fetched page(s)
  // looking empty (e.g. switching to a type that wasn't in what's loaded yet)
  // — keep pulling more pages until there's enough to show or data runs out.
  useEffect(() => {
    if (isOfferMode || isFetchingNextPage || !hasNextPage) return;
    if (displayProducts.length < 12) fetchNextPage();
  }, [isOfferMode, isFetchingNextPage, hasNextPage, displayProducts.length, fetchNextPage]);

  // ── Stable callbacks ──────────────────────────────────────────────────────

  const loadMore = useCallback(() => {
    if (isOfferMode || isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  }, [isOfferMode, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const openFilter = useCallback(() => setFilterOpen(true), []);
  const closeFilter = useCallback(() => setFilterOpen(false), []);
  const handleApplyFilters = useCallback((f: AppliedFilters) => setAppliedFilters(f), []);

  const keyExtractor = useCallback(
    (item: Product | null, index: number) => item?._id ?? `empty-${index}`,
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Product | null; index: number }) => {
      if (!item) return <View style={styles.emptyCell} />;
      return (
        <ProductCard
          product={item}
          isWishlisted={wishlist.has(item._id)}
          isInCart={Boolean(cartItems[item._id])}
          onWishlistToggle={toggleWishlist}
          onAddToCart={addToCart}
          onPress={() => router.push({ pathname: '/product/[id]', params: { id: item._id } })}
          borderRight={index % 2 === 0}
          showWishlistToast
        />
      );
    },
    [wishlist, toggleWishlist, cartItems, addToCart],
  );

  const isLoading = isOfferMode
    ? offerLoading
    : (isFetching && !isFetchingNextPage && rawProducts.length === 0) ||
      // Still auto-loading more pages to satisfy the current filter — show a
      // skeleton instead of flashing "No products found" mid-fetch.
      (displayProducts.length === 0 && isFetchingNextPage && hasNextPage);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Header + Filter chips ── */}
      <View style={styles.topBar}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <BackArrowIcon color={Colors.textPrimary} size={22} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={openSheet}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 0, right: 0 }}
          >
            <View style={styles.pinWrap}>
              <PinIcon size={20} />
            </View>
            <View style={styles.headerCenter}>
              <Text style={styles.deliverLabel}>Deliver to</Text>
              <Text style={styles.headerCity} numberOfLines={1}>{location}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push("/search")}>
              <SearchIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push("/wishlist")}>
              <HeartIcon color={Colors.textPrimary} size={22} />
              {wishlist.size > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push("/cart")}>
              <CartIcon color={Colors.textPrimary} size={22} count={cartCount} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersBar}
        >
          {FILTERS.map(f => {
            const active = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Product grid ── */}
      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : displayProducts.length === 0 ? (
        <EmptyState
          emoji="💎"
          title="No products found"
          subtitle={activeFilterCount > 0 ? "No products match your filters. Try adjusting or clearing them." : "Try a different category"}
        />
      ) : (
        <FlatList
          data={paddedProducts}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={COL}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={6}
          windowSize={5}
          initialNumToRender={6}
          removeClippedSubviews
          ListFooterComponent={
            !isOfferMode && isFetchingNextPage
              ? <ProductGridSkeleton count={2} />
              : null
          }
        />
      )}

      {/* ── Bottom action bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
        <View style={styles.bottomContent}>
          <TouchableOpacity style={styles.bottomItem} onPress={() => router.push("/(tabs)/categories")}>
            <CategoriesBottomIcon />
            <Text style={styles.bottomLabel}>Categories</Text>
          </TouchableOpacity>
          <View style={styles.bottomSep} />
          <TouchableOpacity style={styles.bottomItem} onPress={() => setSortOpen(true)}>
            <SortBottomIcon />
            <Text style={styles.bottomLabel}>Sort</Text>
          </TouchableOpacity>
          <View style={styles.bottomSep} />
          <TouchableOpacity style={styles.bottomItem} onPress={openFilter}>
            <FilterBottomIcon />
            <Text style={styles.bottomLabel}>Filter</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filter sheet — always mounted, instant open ── */}
      <FilterSheet
        isOpen={filterOpen}
        productCategory={category}
        productTypeOptions={multiCategoryProductTypeOptions}
        appliedFilters={appliedFilters}
        onClose={closeFilter}
        onApply={handleApplyFilters}
      />

      {/* ── Sort sheet ── */}
      <SortSheet
        isOpen={sortOpen}
        selected={selectedSort}
        onSelect={setSelectedSort}
        onClose={() => setSortOpen(false)}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg - 2,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm + 2,
  },
  backBtn: { padding: Spacing.xs, marginRight: Spacing.xs },
  locationBtn: { flexDirection: "row", alignItems: "center", flex: 1 },
  pinWrap: { marginRight: Spacing.sm },
  headerCenter: { flex: 1 },
  deliverLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  headerCity: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  headerActions: { flexDirection: "row", gap: Spacing.xs },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.textInverse,
  },

  filtersBar: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
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

  grid: { paddingBottom: 16, paddingHorizontal: Spacing.xs },
  row: { borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  emptyCell: { flex: 1, backgroundColor: 'transparent' },

  bottomBar: {
    backgroundColor: Colors.primary,
  },
  bottomContent: {
    flexDirection: "row",
    height: 54,
    alignItems: "center",
  },
  bottomItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs + 2,
  },
  bottomSep: { width: 1, height: 22, backgroundColor: "rgba(255,255,255,0.2)" },
  bottomLabel: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textInverse,
    letterSpacing: LetterSpacing.normal,
  },
  filterBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  filterBadgeText: {
    fontSize: 9,
    fontFamily: PoppinsFonts.bold,
    color: Colors.primary,
  },
});
