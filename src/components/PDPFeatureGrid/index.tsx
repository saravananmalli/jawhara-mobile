import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

// Static, site-wide trust content — same source as TrustBanner's icon set,
// there is no per-product "features" API to draw this from.
const ICONS = {
  certified: require('../../../assets/images/trust-icons/certified.png'),
  shipping: require('../../../assets/images/trust-icons/shipping.png'),
  payment: require('../../../assets/images/trust-icons/payment.png'),
  support: require('../../../assets/images/trust-icons/support.png'),
} as const;

const FEATURES = [
  { icon: 'certified', title: '100% Certified', subtitle: 'All diamonds independently certified' },
  { icon: 'shipping', title: 'Complementary Free Shipping', subtitle: 'On all orders above AED 500' },
  { icon: 'payment', title: 'All Payment Methods', subtitle: "Don't bother with payment details." },
  { icon: 'support', title: 'Online Support', subtitle: 'Expect jewellery consultation 24/7' },
] as const;

export const PDPFeatureGrid = memo(function PDPFeatureGrid() {
  return (
    <View style={styles.grid}>
      {FEATURES.map((f) => (
        <View key={f.icon} style={styles.item}>
          <View style={styles.iconCircle}>
            <Image source={ICONS[f.icon]} style={styles.iconImage} contentFit="contain" />
          </View>
          <Text style={styles.title}>{f.title}</Text>
          <Text style={styles.subtitle}>{f.subtitle}</Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconImage: { width: 26, height: 26 },
  title: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
