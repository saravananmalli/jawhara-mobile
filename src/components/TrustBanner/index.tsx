import { Colors, FontSize, PoppinsFonts, LetterSpacing, Spacing } from "@/theme";
import { Image } from "expo-image";
import { memo, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

// ── Constants ─────────────────────────────────────────────────────────────────

const SCROLL_SPEED = 38; // px / second

const ICONS = {
  certified: require("../../../assets/images/trust-icons/certified.png"),
  shipping: require("../../../assets/images/trust-icons/shipping.png"),
  payment: require("../../../assets/images/trust-icons/payment.png"),
  support: require("../../../assets/images/trust-icons/support.png"),
} as const;

const BENEFITS = [
  { icon: "certified", text: "100% Certified" },
  { icon: "shipping", text: "Free Shipping" },
  { icon: "payment", text: "Secure Payment" },
  { icon: "support", text: "Online Support" },
] as const;

type IconType = keyof typeof ICONS;

// ── Benefit item ──────────────────────────────────────────────────────────────

function BenefitItem({ icon, text }: { icon: IconType; text: string }) {
  return (
    <View style={styles.item}>
      <View style={styles.iconCircle}>
        <Image
          source={ICONS[icon]}
          style={styles.iconImage}
          contentFit="contain"
        />
      </View>
      <Text style={styles.itemText}>{text}</Text>
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TrustBannerProps {
  style?: ViewStyle;
}

export const TrustBanner = memo(function TrustBanner({
  style,
}: TrustBannerProps) {
  const [contentWidth, setContentWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (contentWidth === 0) return;
    loopRef.current?.stop();
    translateX.setValue(0);
    loopRef.current = Animated.loop(
      Animated.timing(translateX, {
        toValue: -contentWidth,
        duration: (contentWidth / SCROLL_SPEED) * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loopRef.current.start();
    return () => loopRef.current?.stop();
  }, [contentWidth, translateX]);

  const animStyle = { transform: [{ translateX }] };

  return (
    <View style={[styles.container, style]}>
      {/* ── Fixed brand label ── */}
      <View style={styles.brandWrap}>
        <Text style={styles.brandText}>JAWHARA</Text>
        <View style={styles.brandDivider} />
      </View>

      {/* ── Infinite marquee ── */}
      <View style={styles.marqueeWrap}>
        <Animated.View style={[styles.row, animStyle]}>
          {/* First set — onLayout gives us the loop offset */}
          <View
            style={styles.row}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0 && contentWidth === 0) setContentWidth(w);
            }}
          >
            {BENEFITS.map((b) => (
              <BenefitItem key={b.icon} icon={b.icon} text={b.text} />
            ))}
          </View>
          {/* Duplicate set — renders seamlessly behind the first */}
          <View style={styles.row}>
            {BENEFITS.map((b) => (
              <BenefitItem key={`dup-${b.icon}`} icon={b.icon} text={b.text} />
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    borderRadius: 14,
    height: 44,
    overflow: "hidden",
  },

  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: Spacing.md,
  },
  brandText: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.extrabold,
    color: Colors.textInverse,
    letterSpacing: LetterSpacing.wider,
  },
  brandDivider: {
    width: 0,
    height: 26,
    marginLeft: Spacing.md,
  },

  marqueeWrap: {
    flex: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.textInverse,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 16,
    height: 16,
  },
  itemText: {
    fontSize: FontSize.xs,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textInverse,
  },
  dot: {
    fontSize: 12,
    color: "rgba(255,255,255,0.40)",
    marginLeft: Spacing.xs,
  },
});
