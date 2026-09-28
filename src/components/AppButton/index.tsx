import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import React, { memo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";

export type ButtonVariant = "primary" | "secondary" | "outline" | "text";
export type ButtonSize = "sm" | "md" | "lg";

interface AppButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Fully-rounded pill shape instead of the size's default corner radius — used for prominent CTAs. */
  pill?: boolean;
  /** Space between the label and leftIcon/rightIcon. Defaults to Spacing.xs. */
  gap?: number;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  labelStyle?: TextStyle;
}

const containerStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: Colors.primaryButton },
  secondary: { backgroundColor: Colors.secondaryButton },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: "transparent",
  },
  text: { backgroundColor: "transparent", paddingHorizontal: 0 },
};

const labelStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: Colors.textInverse },
  secondary: { color: Colors.primary },
  outline: { color: Colors.primary },
  text: { color: Colors.primary },
};

const sizeStyles: Record<
  ButtonSize,
  { container: ViewStyle; label: TextStyle }
> = {
  sm: {
    container: { height: 36, paddingHorizontal: Spacing.md },
    label: { fontSize: FontSize.sm },
  },
  md: {
    container: { height: 46, paddingHorizontal: Spacing.lg },
    label: { fontSize: FontSize.base },
  },
  lg: {
    container: { height: 54, paddingHorizontal: Spacing.xl },
    label: { fontSize: FontSize.md },
  },
};

export const AppButton = memo(function AppButton({
  label,
  variant = "primary",
  size = "md",
  pill = false,
  gap = Spacing.xs,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  labelStyle,
  ...rest
}: AppButtonProps) {
  // Shared line-box height for the label and icon boxes — generous enough to
  // fit icons a couple px larger than the label's font size without clipping,
  // so both are centered against the exact same baseline.
  const rowLineHeight = (sizeStyles[size].label.fontSize as number) * 1.6;
  return (
    <TouchableOpacity
      style={[
        styles.base,
        containerStyles[variant],
        sizeStyles[size].container,
        pill && styles.pill,
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.82}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? Colors.textInverse : Colors.primary}
        />
      ) : (
        <View style={[styles.row, { gap }]}>
          {leftIcon ? (
            <View style={[styles.iconBox, { height: rowLineHeight }]}>{leftIcon}</View>
          ) : null}
          <Text
            style={[
              styles.label,
              labelStyles[variant],
              sizeStyles[size].label,
              { lineHeight: rowLineHeight },
              disabled && styles.labelDisabled,
              labelStyle,
            ]}
          >
            {label}
          </Text>
          {rightIcon ? (
            <View style={[styles.iconBox, { height: rowLineHeight }]}>{rightIcon}</View>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    borderRadius: BorderRadius.full,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  iconBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: PoppinsFonts.bold,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
  labelDisabled: {},
});
