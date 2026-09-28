import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Review } from '@/services/api';
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  if (weeks < 4) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}

function ReviewStars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.star, { color: i <= filled ? Colors.starGold : Colors.dividerGray }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

const ReviewItem = memo(function ReviewItem({ review }: { review: Review }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{review.userInitial?.toUpperCase() ?? '?'}</Text>
        </View>
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{review.userName}</Text>
            {review.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified Purchase</Text>
              </View>
            )}
          </View>
          <ReviewStars rating={review.rating} />
        </View>
      </View>

      <Text style={styles.text}>{review.text}</Text>
      <Text style={styles.date}>{timeAgo(review.createdAt)}</Text>
    </View>
  );
});

interface PDPReviewListProps {
  reviews: Review[];
}

export const PDPReviewList = memo(function PDPReviewList({ reviews }: PDPReviewListProps) {
  if (reviews.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Customer Reviews</Text>
      {reviews.map((r) => (
        <ReviewItem key={r._id} review={r} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  heading: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  card: {
    gap: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.bold,
    color: Colors.primary,
  },
  headerText: { flex: 1, gap: 2 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    backgroundColor: Colors.starGold,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
  },
  starsRow: { flexDirection: 'row', gap: 1 },
  star: { fontSize: 13 },
  text: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
});
