import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface ViewMoreButtonProps {
  onPress: () => void;
  label?: string;
  style?: ViewStyle;
}

/**
 * Compact outlined pill used at the bottom of every home-screen section
 * to navigate to the full product listing for that section.
 *
 * Usage:
 *   <ViewMoreButton onPress={() => router.push({ pathname: '/products/[category]', params: { ... } })} />
 */
export const ViewMoreButton = memo(function ViewMoreButton({
  onPress,
  label = "VIEW MORE",
  style,
}: ViewMoreButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  btn: {
    alignSelf: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textInverse,
    letterSpacing: 0.8,
  },
});
