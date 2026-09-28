import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product } from '@/services/api';
import { Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

interface PDPProductInfoProps {
  product: Product;
  onRatingPress?: () => void;
}

// Shared line-box height for the star row so the (larger) star glyphs and the
// (smaller) rating number/review count text all center on the same baseline.
const STAR_LINE_HEIGHT = 18;

function StarRow({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const filled = Math.round(rating);
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={[styles.star, { color: i <= filled ? Colors.starGold : Colors.dividerGray }]}
        >
          ★
        </Text>
      ))}
      <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
      {reviewCount > 0 && <Text style={styles.reviewCount}>({reviewCount})</Text>}
    </View>
  );
}

/** The backend's `collection` field is inconsistently typed (string, "", or
 * even ["  ""]) — flatten it to a usable string, or undefined if truly empty. */
function flattenCollection(collection: Product['collection']): string | undefined {
  const value = Array.isArray(collection) ? collection.join(', ') : collection;
  return value && value.trim().length > 0 ? value : undefined;
}

/** Falls back through progressively weaker labels since not every product has a real brand. */
function brandLabelFor(product: Product): string {
  return product.brand || flattenCollection(product.collection) || product.category;
}

/** Falls back to a stable id-derived code only for the rare product missing a real designCode. */
function designCodeFor(product: Product): string {
  return product.designCode || product._id.slice(-8).toUpperCase();
}

export const PDPProductInfo = memo(function PDPProductInfo({
  product,
  onRatingPress,
}: PDPProductInfoProps) {
  const description = product.description?.trim();

  return (
    <View style={styles.container}>
      <Text style={styles.collection}>{brandLabelFor(product)}</Text>
      <Text style={styles.name}>{product.name}</Text>
      {product.rating > 0 &&
        (onRatingPress ? (
          <TouchableOpacity onPress={onRatingPress} activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6 }}>
            <StarRow rating={product.rating} reviewCount={product.reviewCount} />
          </TouchableOpacity>
        ) : (
          <StarRow rating={product.rating} reviewCount={product.reviewCount} />
        ))}
      <Text style={styles.designCode}>Design Code: {designCodeFor(product)}</Text>

      {description ? (
        <View style={styles.descBlock}>
          <Text style={styles.description}>{description}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  collection: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.primary,
  },
  name: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  star: {
    fontSize: 15,
    lineHeight: STAR_LINE_HEIGHT,
    includeFontPadding: false,
  },
  ratingValue: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
    lineHeight: STAR_LINE_HEIGHT,
    includeFontPadding: false,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: STAR_LINE_HEIGHT,
    includeFontPadding: false,
  },
  designCode: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  descBlock: { marginTop: Spacing.sm, gap: Spacing.xs },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
