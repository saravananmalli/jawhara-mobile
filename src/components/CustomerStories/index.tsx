import { SkeletonBox } from "@/components/Skeletons/SkeletonBox";
import { api, BACKEND_URL, Review } from "@/services/api";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_H_MARGIN = Spacing.md;
const CARD_WIDTH = SCREEN_WIDTH - CARD_H_MARGIN * 2;

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days === 1) return "1 day Before";
  if (days < 7) return `${days} days Before`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week Before";
  if (weeks < 4) return `${weeks} weeks Before`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month Before";
  return `${months} months Before`;
}

function resolveImage(path: string): string {
  return path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
}

// ── Star row ───────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text key={i} style={[styles.star, i < rating && styles.starFilled]}>
          ★
        </Text>
      ))}
      <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
    </View>
  );
}

// ── Single review card ─────────────────────────────────────────────────────────

const ReviewCard = memo(function ReviewCard({ review }: { review: Review }) {
  const productImage =
    review.product?.images?.[0] ? resolveImage(review.product.images[0]) : null;

  return (
    <View style={styles.card}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{review.userInitial?.toUpperCase() ?? "?"}</Text>
      </View>

      {/* Verified badge */}
      {review.verified && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Verified Purchase</Text>
        </View>
      )}

      {/* Stars */}
      <Stars rating={review.rating} />

      {/* Name + location */}
      <View style={styles.nameRow}>
        <Text style={styles.userName}>{review.userName}</Text>
        {review.location ? (
          <Text style={styles.location}> ({review.location})</Text>
        ) : null}
      </View>

      {/* Review text */}
      <Text style={styles.reviewText}>{review.text}</Text>

      {/* Date */}
      <Text style={styles.date}>{timeAgo(review.createdAt)}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Product row */}
      {review.product && (
        <View style={styles.productRow}>
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              style={styles.productThumb}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={[styles.productThumb, styles.productThumbFallback]} />
          )}
          <Text style={styles.productName} numberOfLines={2}>
            {review.product.name}
          </Text>
        </View>
      )}
    </View>
  );
});

// ── Skeleton card ──────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonBox style={styles.skeletonAvatar} borderRadius={BorderRadius.full} />
      <SkeletonBox style={styles.skeletonBadge} borderRadius={BorderRadius.sm} />
      <SkeletonBox style={styles.skeletonStars} borderRadius={BorderRadius.xs} />
      <SkeletonBox style={styles.skeletonName} borderRadius={BorderRadius.xs} />
      <SkeletonBox style={styles.skeletonLine1} borderRadius={BorderRadius.xs} />
      <SkeletonBox style={styles.skeletonLine2} borderRadius={BorderRadius.xs} />
      <SkeletonBox style={styles.skeletonLine3} borderRadius={BorderRadius.xs} />
    </View>
  );
}

// ── Dots ───────────────────────────────────────────────────────────────────────

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
      ))}
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export const CustomerStories = memo(function CustomerStories() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    api
      .getRecentReviews(5)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  if (!loading && reviews.length === 0) return null;

  return (
    <LinearGradient
      colors={["#FBDEBA", "#FDEEDF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.sectionTitle}>Customer Stories</Text>

      {loading ? (
        <SkeletonCard />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(r) => r._id}
          renderItem={({ item }) => <ReviewCard review={item} />}
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH + CARD_H_MARGIN * 2}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={styles.listContent}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + CARD_H_MARGIN * 2,
            offset: (CARD_WIDTH + CARD_H_MARGIN * 2) * index,
            index,
          })}
        />
      )}

      {!loading && reviews.length > 1 && (
        <Dots count={reviews.length} active={activeIndex} />
      )}
    </LinearGradient>
  );
});

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },

  listContent: {
    paddingHorizontal: CARD_H_MARGIN,
    gap: CARD_H_MARGIN * 2,
  },

  // ── Card ────────────────────────────────────────────────────────────────────
  card: {
    width: CARD_WIDTH,
    backgroundColor: "transparent",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },

  // ── Avatar ──────────────────────────────────────────────────────────────────
  avatar: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: "#C8C8C8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: FontSize["2xl"],
    fontFamily: PoppinsFonts.bold,
    color: Colors.textInverse,
  },

  // ── Badge ───────────────────────────────────────────────────────────────────
  badge: {
    backgroundColor: Colors.starGold,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
  },

  // ── Stars ───────────────────────────────────────────────────────────────────
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: Spacing.sm,
  },
  star: {
    fontSize: 22,
    color: Colors.dividerGray,
  },
  starFilled: {
    color: Colors.starGold,
  },
  ratingNum: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
  },

  // ── Name ────────────────────────────────────────────────────────────────────
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  userName: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  location: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.regular,
    color: Colors.textSecondary,
  },

  // ── Review text ─────────────────────────────────────────────────────────────
  reviewText: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.regular,
    color: Colors.textPrimary,
    lineHeight: 22,
    textAlign: "left",
    alignSelf: "stretch",
    marginBottom: Spacing.sm,
  },

  // ── Date ────────────────────────────────────────────────────────────────────
  date: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.light,
    color: Colors.textSecondary,
    fontStyle: "italic",
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
  },

  // ── Divider ─────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    alignSelf: "stretch",
    borderWidth: 0.5,
    borderColor: Colors.borderGray,
    borderStyle: "dashed",
    marginBottom: Spacing.md,
  },

  // ── Product row ─────────────────────────────────────────────────────────────
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    gap: Spacing.sm,
  },
  productThumb: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
  },
  productThumbFallback: {
    backgroundColor: Colors.dividerGray,
  },
  productName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.regular,
    color: Colors.textPrimary,
    lineHeight: 18,
  },

  // ── Dots ────────────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  dot: {
    width: 28,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dividerGray,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },

  // ── Skeleton ─────────────────────────────────────────────────────────────────
  skeletonAvatar: {
    width: 64,
    height: 64,
    alignSelf: "center",
    marginBottom: Spacing.sm,
  },
  skeletonBadge: {
    width: 120,
    height: 24,
    alignSelf: "center",
    marginBottom: Spacing.sm,
  },
  skeletonStars: {
    width: 130,
    height: 18,
    alignSelf: "center",
    marginBottom: Spacing.sm,
  },
  skeletonName: {
    width: 140,
    height: 16,
    alignSelf: "center",
    marginBottom: Spacing.sm,
  },
  skeletonLine1: {
    height: 13,
    alignSelf: "stretch",
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  skeletonLine2: {
    height: 13,
    alignSelf: "stretch",
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  skeletonLine3: {
    width: "60%",
    height: 13,
    alignSelf: "flex-start",
    marginHorizontal: Spacing.md,
  },
});
