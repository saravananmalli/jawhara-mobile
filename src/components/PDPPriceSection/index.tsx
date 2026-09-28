import { DownArrowIcon } from "@/components/ui/icons";
import { Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { DirhamSymbol } from "dirham/react-native";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface PDPPriceSectionProps {
  price: number;
  originalPrice: number;
  discount: number;
}

// Shared line-box height for every text/icon in the row so they all center
// against the exact same baseline, regardless of each element's own font size.
const LINE_HEIGHT = FontSize.xl * 1.2;

export const PDPPriceSection = memo(function PDPPriceSection({
  price,
  originalPrice,
  discount,
}: PDPPriceSectionProps) {
  const hasDiscount = discount > 0;
  const hasOriginalPrice = originalPrice > price;

  return (
    <View style={styles.row}>
      {hasDiscount && (
        <View style={styles.discountRow}>
          <View style={styles.iconBox}>
            <DownArrowIcon size={14} />
          </View>
          <Text style={styles.discount}>{discount}%</Text>
        </View>
      )}
      <View style={styles.priceInner}>
        <View style={styles.iconBox}>
          <DirhamSymbol
            size={FontSize.xl}
            color={Colors.textPrimary}
            weight="extrabold"
          />
        </View>
        <Text style={styles.price}>{price.toLocaleString()}</Text>
      </View>
      {hasOriginalPrice && (
        <Text style={styles.strikePrice}>{originalPrice.toLocaleString()}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  iconBox: {
    height: LINE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  discount: {
    fontSize: FontSize.lg,
    fontFamily: PoppinsFonts.bold,
    color: Colors.priceDiscount,
    lineHeight: LINE_HEIGHT,
    includeFontPadding: false,
  },
  priceInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  price: {
    fontSize: FontSize.xl,
    fontFamily: PoppinsFonts.extrabold,
    color: Colors.textPrimary,
    lineHeight: LINE_HEIGHT,
    includeFontPadding: false,
  },
  strikePrice: {
    fontSize: FontSize.xl,
    color: Colors.textLight,
    fontFamily: PoppinsFonts.bold,
    textDecorationLine: "line-through",
    lineHeight: LINE_HEIGHT,
    includeFontPadding: false,
  },
});
