import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/Skeletons";
import { ViewMoreButton } from "@/components/ViewMoreButton";
import { ActiveOffer, api, Product } from "@/services/api";
import { useCartActions, useCartItems } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Constants ──────────────────────────────────────────────────────────────────

const ALL = "All";
const MAX_DISPLAY = 6; // 3 rows × 2 columns

// ── Countdown helpers ──────────────────────────────────────────────────────────

interface CountdownTime {
  days: number;
  hours: number;
  mins: number;
  secs: number;
}

function calcRemaining(expiresAt: string): CountdownTime {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function useCountdown(expiresAt?: string | null): CountdownTime | null {
  const [timeLeft, setTimeLeft] = useState<CountdownTime | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    setTimeLeft(calcRemaining(expiresAt));
    const id = setInterval(() => setTimeLeft(calcRemaining(expiresAt)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return timeLeft;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const CountdownUnit = memo(function CountdownUnit({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <View style={cd.unitWrap}>
      <View style={cd.box}>
        <Text style={cd.value}>{pad(value)}</Text>
      </View>
      <Text style={cd.label}>{label}</Text>
    </View>
  );
});

const CountdownRow = memo(function CountdownRow({
  time,
}: {
  time: CountdownTime;
}) {
  return (
    <View style={cd.row}>
      <CountdownUnit value={time.days} label="Days" />
      <Text style={cd.colon}>:</Text>
      <CountdownUnit value={time.hours} label="Hrs" />
      <Text style={cd.colon}>:</Text>
      <CountdownUnit value={time.mins} label="Min" />
      <Text style={cd.colon}>:</Text>
      <CountdownUnit value={time.secs} label="Sec" />
    </View>
  );
});

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <View style={styles.cardWrap}>
      <ProductCardSkeleton style={styles.cardInner} />
    </View>
  );
});

// ── Main component ─────────────────────────────────────────────────────────────

export const LimitedTimeOffers = memo(function LimitedTimeOffers() {
  const [offer, setOffer] = useState<ActiveOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(ALL);
  const { addToCart } = useCartActions();
  const cartItems = useCartItems();
  const { wishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    api
      .getActiveOffer()
      .then((data) => setOffer(data))
      .catch(() => setOffer(null))
      .finally(() => setLoading(false));
  }, []);

  const countdown = useCountdown(offer?.expiresAt);

  const handleViewMore = useCallback(() => {
    router.push({
      pathname: "/products/[category]",
      // Pass the selected tab through so the listing page pre-selects the
      // matching Product Type filter — "offer" is a placeholder category
      // for the unfiltered "All" tab.
      params: { category: selected === ALL ? "offer" : selected, mode: "offer" },
    });
  }, [selected]);

  const handleProductPress = useCallback((product: Product) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: product._id },
    });
  }, []);

  // Category tabs derived from unique product categories
  const allProducts = offer?.products ?? [];
  const uniqueCategories = Array.from(
    new Set(allProducts.map((p) => p.category)),
  ).slice(0, 4);
  const tabs = [ALL, ...uniqueCategories];

  // Client-side category filter, then cap at MAX_DISPLAY for home screen preview
  const filtered =
    selected === ALL
      ? allProducts
      : allProducts.filter((p) => p.category === selected);
  const displayed = filtered.slice(0, MAX_DISPLAY);

  // Pair into rows of 2
  const pairs: Array<[Product, Product | undefined]> = [];
  for (let i = 0; i < displayed.length; i += 2) {
    pairs.push([displayed[i], displayed[i + 1]]);
  }

  if (!loading && !offer) return null;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.headerWrap}>
        <Text style={styles.title}>
          {loading ? "" : (offer?.title ?? "Limited-Time Jewellery Offers")}
        </Text>
        {!loading && offer?.subtitle ? (
          <Text style={styles.subtitle}>{offer.subtitle}</Text>
        ) : null}

        {/* ── Countdown timer ── */}
        {!loading && countdown ? <CountdownRow time={countdown} /> : null}
      </View>

      {/* ── Category filter tabs (centered) ── */}
      {!loading && tabs.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          style={styles.tabsWrap}
        >
          {tabs.map((tab) => {
            const isSelected = tab === selected;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  isSelected ? styles.tabActive : styles.tabInactive,
                ]}
                onPress={() => setSelected(tab)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.tabText,
                    isSelected ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}

      {/* ── Product grid ── */}
      <View style={styles.grid}>
        {loading ? (
          <>
            <View style={styles.gridRow}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
            <View style={styles.gridRow}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          </>
        ) : (
          pairs.map((pair, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              <View style={styles.cardWrap}>
                <ProductCard
                  product={pair[0]}
                  onPress={() => handleProductPress(pair[0])}
                  onAddToCart={addToCart}
                  isWishlisted={wishlist.has(pair[0]._id)}
                  isInCart={Boolean(cartItems[pair[0]._id])}
                  onWishlistToggle={toggleWishlist}
                  style={styles.cardInner}
                />
              </View>
              {pair[1] ? (
                <View style={styles.cardWrap}>
                  <ProductCard
                    product={pair[1]}
                    onPress={() => handleProductPress(pair[1]!)}
                    onAddToCart={addToCart}
                    isWishlisted={wishlist.has(pair[1]._id)}
                    isInCart={Boolean(cartItems[pair[1]._id])}
                    onWishlistToggle={toggleWishlist}
                    style={styles.cardInner}
                  />
                </View>
              ) : (
                <View style={styles.emptySlot} />
              )}
            </View>
          ))
        )}
      </View>

      {/* ── VIEW MORE ── */}
      {!loading ? (
        <ViewMoreButton onPress={handleViewMore} style={styles.viewMoreBtn} />
      ) : null}
    </View>
  );
});

// ── Countdown styles ───────────────────────────────────────────────────────────

const cd = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  unitWrap: {
    alignItems: "center",
    gap: 4,
  },
  box: {
    width: 48,
    height: 44,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.medium,
    color: Colors.primary,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: PoppinsFonts.medium,
  },
  colon: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.primary,
    marginBottom: Spacing.lg, // align colon with the value boxes, not the labels
  },
});

// ── Section styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    marginTop: Spacing.md,
  },

  // Header — center aligned
  headerWrap: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: "center",
    gap: 0,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: "center",
  },

  // Category tabs — centered
  tabsWrap: { marginBottom: Spacing.md },
  tabsContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabInactive: {
    backgroundColor: Colors.background,
    borderColor: Colors.primaryLight,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.medium,
  },
  tabTextActive: { color: Colors.textInverse },
  tabTextInactive: { color: Colors.textPrimary },

  // Grid with padding and gaps between cards (no shadow)
  grid: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  gridRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },

  // Individual card — rounded corners, no shadow
  cardWrap: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    backgroundColor: Colors.background,
  },
  cardInner: { flex: 1 },
  emptySlot: { flex: 1 },

  viewMoreBtn: { marginTop: Spacing.lg },
});
