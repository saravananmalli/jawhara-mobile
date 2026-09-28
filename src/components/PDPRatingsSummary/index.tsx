import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { Review } from '@/services/api';
import { Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

interface PDPRatingsSummaryProps {
  reviews: Review[];
}

export const PDPRatingsSummary = memo(function PDPRatingsSummary({
  reviews,
}: PDPRatingsSummaryProps) {
  const total = reviews.length;

  if (total === 0) {
    return (
      <View>
        <Text style={styles.heading}>Ratings</Text>
        <EmptyState emoji="⭐" title="No ratings yet" subtitle="Be the first to review this product" />
      </View>
    );
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
  const filled = Math.round(average);

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  return (
    <View>
      <Text style={styles.heading}>Ratings</Text>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Text
                key={i}
                style={[styles.star, { color: i <= filled ? Colors.starGold : Colors.dividerGray }]}
              >
                ★
              </Text>
            ))}
          </View>
          <Text style={styles.count}>{total} Rating{total !== 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.right}>
          {counts.map(({ star, count }) => {
            const pct = Math.round((count / total) * 100);
            return (
              <View key={star} style={styles.barRow}>
                <Text style={styles.barLabel}>{star}★</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.barPct}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  heading: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  left: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    width: 90,
  },
  starRow: { flexDirection: 'row', gap: 1 },
  star: { fontSize: 18 },
  count: { fontSize: FontSize.xs, color: Colors.textLight },
  right: { flex: 1, gap: Spacing.xs },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  barLabel: {
    width: 22,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dividerGray,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  barPct: {
    width: 32,
    textAlign: 'right',
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
