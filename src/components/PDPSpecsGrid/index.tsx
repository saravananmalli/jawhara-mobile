import { Product } from "@/services/api";
import { Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface PDPSpecsGridProps {
  product: Product;
}

function formatValue(
  value: string | string[] | number | undefined,
): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") return String(value);
  const joined = Array.isArray(value) ? value.join(", ") : value;
  return joined.trim().length > 0 ? joined : null;
}

function metalTypeFor(product: Product): string | null {
  const parts = [product.metalKt, product.metal].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

function weightFor(product: Product): string | null {
  if (typeof product.weight === "number") return `${product.weight} g`;
  return formatValue(product.weightRange);
}

export const PDPSpecsGrid = memo(function PDPSpecsGrid({
  product,
}: PDPSpecsGridProps) {
  const fields: { label: string; value: string | null }[] = [
    // Primary spec row — mirrors the reference design's Brand / Metal / Weight and diamond grading
    { label: "Brand", value: formatValue(product.brand) },
    { label: "Metal Type", value: metalTypeFor(product) },
    { label: "Net Weight", value: weightFor(product) },
    { label: "Diamond Clarity", value: formatValue(product.diamondClarity) },
    { label: "Diamond Color", value: formatValue(product.diamondColor) },
    { label: "Diamond Ct", value: formatValue(product.diamondCt) },
    // Supplementary — whichever additional attributes this product happens to have
    { label: "Collection", value: formatValue(product.collection) },
    { label: "Material", value: formatValue(product.material) },
    {
      label: "Gemstone",
      value: formatValue(product.stones ?? product.stone ?? product.gemstone),
    },
    { label: "Product Type", value: formatValue(product.productType) },
    { label: "Occasion", value: formatValue(product.occasion) },
    { label: "Ring Size", value: formatValue(product.ringSize) },
    { label: "Ring Style", value: formatValue(product.ringStyle) },
    { label: "Earring Type", value: formatValue(product.earringType) },
    { label: "Back Type", value: formatValue(product.backType) },
    { label: "Necklace Type", value: formatValue(product.necklaceType) },
    { label: "Chain Length", value: formatValue(product.chainLength) },
    { label: "Bracelet Type", value: formatValue(product.braceletType) },
    { label: "Bracelet Size", value: formatValue(product.braceletSize) },
    { label: "Shop For", value: formatValue(product.shopFor) },
  ].filter((f): f is { label: string; value: string } => f.value !== null);

  if (fields.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Product Details</Text>
      <View style={styles.grid}>
        {fields.map((f) => (
          <View key={f.label} style={styles.cell}>
            <Text style={styles.label}>{f.label}</Text>
            <Text style={styles.value}>{f.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {},
  heading: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "33.33%",
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.sm,
    gap: 2,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  value: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
  },
});
