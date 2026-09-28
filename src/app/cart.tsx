import { AppButton } from "@/components/AppButton";
import { AppImage } from "@/components/AppImage";
import { CartIcon } from "@/components/CartIcon";
import { EmptyState } from "@/components/EmptyState";
import {
  BackArrowIcon,
  ChevronRightIcon,
  CloseIcon,
  CouponIcon,
} from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { api, BACKEND_URL, BannerSlide } from "@/services/api";
import { CartItem, useCart } from "@/store/cartStore";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { DirhamSymbol } from "dirham/react-native";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function handleBannerPress(banner: BannerSlide) {
  const ctaLink = banner.ctaLink;
  if (!ctaLink) return;
  if (ctaLink.startsWith("http")) {
    Linking.openURL(ctaLink);
  } else if (ctaLink.startsWith("/brand/")) {
    const brand = ctaLink
      .replace("/brand/", "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    router.push({
      pathname: "/products/[category]",
      params: { category: brand, brand },
    });
  } else if (ctaLink.startsWith("/products/")) {
    const category = ctaLink.replace("/products/", "");
    router.push({ pathname: "/products/[category]", params: { category } });
  } else {
    router.push({
      pathname: "/products/[category]",
      params: { category: ctaLink },
    });
  }
}

function CartRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;
  const uri = product.images?.[0] ? `${BACKEND_URL}${product.images[0]}` : null;
  const hasDiscount = product.originalPrice > product.price;
  const saved = (product.originalPrice - product.price) * quantity;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardCloseBtn}
        onPress={() => removeFromCart(product._id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <CloseIcon color={Colors.textSecondary} size={16} />
      </TouchableOpacity>

      <View style={styles.row}>
        <AppImage
          uri={uri}
          style={styles.thumb}
          contentFit="contain"
          borderRadius={BorderRadius.md}
        />

        <View style={styles.rowInfo}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={styles.priceRow}>
            <View style={styles.arrowBox}>
              <DirhamSymbol
                size={FontSize.base}
                color={Colors.textPrimary}
                weight="extrabold"
              />
            </View>
            <Text style={styles.price}>{product.price.toLocaleString()}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                {product.originalPrice.toLocaleString()}
              </Text>
            )}
            {hasDiscount && (
              <Text style={styles.savedText}>
                YOU SAVE {saved.toLocaleString()}
              </Text>
            )}
          </View>

          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => updateQuantity(product._id, quantity - 1)}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => updateQuantity(product._id, quantity + 1)}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  valueColor = Colors.textPrimary,
  bold = false,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryLabelBold]}>
        {label}
      </Text>
      <View style={styles.summaryValueRow}>
        {typeof value === "number" ? (
          <>
            <View
              style={[
                styles.summaryArrowBox,
                bold && styles.summaryArrowBoxBold,
              ]}
            >
              <DirhamSymbol
                size={FontSize.sm}
                color={valueColor}
                weight="extrabold"
              />
            </View>
            <Text
              style={[
                styles.summaryValue,
                { color: valueColor },
                bold && styles.summaryValueBold,
              ]}
            >
              {value.toLocaleString()}
            </Text>
          </>
        ) : (
          <Text
            style={[
              styles.summaryValue,
              { color: valueColor },
              bold && styles.summaryValueBold,
            ]}
          >
            {value}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function CartScreen() {
  const { isLoggedIn } = useAuth();
  const { itemList, totalPrice } = useCart();
  const listRef = useRef<FlatList>(null);
  const [cartBanner, setCartBanner] = useState<BannerSlide | null>(null);

  useEffect(() => {
    api.getCartBanner().then(setCartBanner);
  }, []);

  const subtotal = itemList.reduce(
    (sum, i) => sum + i.product.originalPrice * i.quantity,
    0,
  );
  const totalSaved = subtotal - totalPrice;
  const hasSavings = totalSaved > 0;

  const scrollToSummary = () =>
    listRef.current?.scrollToEnd({ animated: true });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BackArrowIcon color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>

      {!isLoggedIn ? (
        <EmptyState
          icon={<CartIcon color={Colors.primary} size={48} />}
          title="Login to see your cart"
          subtitle="Your cart is linked to your account"
          action={{
            label: "Login / Sign Up",
            onPress: () => router.push("/(auth)/login"),
          }}
        />
      ) : itemList.length === 0 ? (
        <EmptyState
          icon={<CartIcon color={Colors.primary} size={48} />}
          title="Your cart is empty"
          subtitle="Browse our collections to find something you love"
          action={{
            label: "Start Shopping",
            onPress: () => router.push("/(tabs)/home"),
          }}
        />
      ) : (
        <>
          <FlatList
            ref={listRef}
            data={itemList}
            keyExtractor={(item) => item.product._id}
            renderItem={({ item }) => <CartRow item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                <TouchableOpacity
                  style={styles.addressRow}
                  onPress={() => Alert.alert("Add Address", "Coming soon.")}
                >
                  <View style={styles.addressIcon}>
                    <Text style={styles.addressIconText}>+</Text>
                  </View>
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressTitle}>Add New Address</Text>
                    <Text style={styles.addressSubtitle}>
                      Let the jewellery find way to your Home!
                    </Text>
                  </View>
                </TouchableOpacity>

                {cartBanner && (
                  <TouchableOpacity
                    style={styles.banner}
                    activeOpacity={cartBanner.ctaLink ? 0.85 : 1}
                    onPress={() => handleBannerPress(cartBanner)}
                  >
                    <AppImage
                      uri={`${BACKEND_URL}${cartBanner.imageUrl}`}
                      style={styles.bannerImage}
                      contentFit="cover"
                      borderRadius={BorderRadius.lg}
                    />
                  </TouchableOpacity>
                )}
              </>
            }
            ListFooterComponent={
              <>
                <Text style={styles.sectionTitle}>Offers & Benefits</Text>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => Alert.alert("Coupons", "Coming soon.")}
                >
                  <View style={styles.couponRow}>
                    <CouponIcon color={Colors.textPrimary} size={20} />
                    <View style={styles.couponInfo}>
                      <Text style={styles.couponTitle}>Apply Coupon</Text>
                      <Text style={styles.couponSubtitle}>
                        Save extra with coupons - check now!
                      </Text>
                    </View>
                    <ChevronRightIcon color={Colors.textSecondary} size={18} />
                  </View>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>View Order Summary</Text>
                <View style={styles.card}>
                  <SummaryRow label="Subtotal" value={subtotal} />
                  <SummaryRow label="Shipping Charge" value="Free" />
                  {hasSavings && (
                    <SummaryRow
                      label="You Saved"
                      value={totalSaved}
                      valueColor={Colors.priceDiscount}
                    />
                  )}
                  <View style={styles.summaryDivider} />
                  <SummaryRow label="Total Amount" value={totalPrice} bold />
                </View>
              </>
            }
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerTotals}
              onPress={scrollToSummary}
            >
              <View style={styles.totalPriceRow}>
                <View style={styles.totalArrowBox}>
                  <DirhamSymbol
                    size={FontSize.md}
                    color={Colors.textPrimary}
                    weight="extrabold"
                  />
                </View>
                <Text style={styles.totalValue}>
                  {totalPrice.toLocaleString()}
                </Text>
                {hasSavings && (
                  <Text style={styles.totalOriginalValue}>
                    {subtotal.toLocaleString()}
                  </Text>
                )}
              </View>
              <Text style={styles.viewSummaryLink}>View Order Summary</Text>
            </TouchableOpacity>
            <AppButton
              label="PLACE ORDER"
              onPress={() => Alert.alert("Place Order", "Coming soon.")}
              variant="primary"
              size="lg"
              style={styles.placeOrderBtn}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },

  list: { padding: Spacing.md, gap: Spacing.md },

  // Cart banner
  banner: {
    width: "100%",
    aspectRatio: 2.5,
    marginBottom: Spacing.md,
  },
  bannerImage: { width: "100%", height: "100%" },

  // Add New Address
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  addressIcon: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  addressIconText: {
    fontSize: FontSize.xl,
    color: Colors.primary,
    fontFamily: PoppinsFonts.medium,
  },
  addressInfo: { flex: 1 },
  addressTitle: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
  },
  addressSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // Shared card
  card: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },

  // Cart item card
  cardCloseBtn: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 1,
  },
  row: { flexDirection: "row", gap: Spacing.md },
  thumb: { width: 84, height: 84 },
  rowInfo: { flex: 1, gap: 4 },
  name: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.medium,
    color: Colors.textPrimary,
    lineHeight: 18,
    paddingRight: Spacing.lg,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  arrowBox: {
    height: FontSize.base * 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  price: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    lineHeight: FontSize.base * 1.2,
    includeFontPadding: false,
  },
  originalPrice: {
    fontSize: FontSize.base,
    color: Colors.textLight,
    textDecorationLine: "line-through",
    lineHeight: FontSize.base * 1.2,
    includeFontPadding: false,
  },
  savedText: {
    fontSize: FontSize.xs,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.priceDiscount,
    lineHeight: FontSize.base * 1.2,
    includeFontPadding: false,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
  },
  stepperValue: {
    minWidth: 24,
    textAlign: "center",
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
  },

  // Section headers
  sectionTitle: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  // Offers & Benefits
  couponRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  couponInfo: { flex: 1, gap: 2 },
  couponTitle: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
  },
  couponSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // Order Summary
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  summaryLabelBold: {
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  summaryValueRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  summaryArrowBox: {
    height: FontSize.base * 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryArrowBoxBold: {
    height: FontSize.md * 1.2,
  },
  summaryValue: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.medium,
    lineHeight: FontSize.base * 1.2,
    includeFontPadding: false,
  },
  summaryValueBold: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.extrabold,
    lineHeight: FontSize.md * 1.2,
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginVertical: Spacing.xs,
  },

  // Sticky bottom bar
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  footerTotals: { gap: 2 },
  totalPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  totalArrowBox: {
    height: FontSize.lg * 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  totalValue: {
    fontSize: FontSize.lg,
    fontFamily: PoppinsFonts.extrabold,
    color: Colors.textPrimary,
    lineHeight: FontSize.lg * 1.2,
    includeFontPadding: false,
  },
  totalOriginalValue: {
    fontSize: FontSize.base,
    color: Colors.textLight,
    textDecorationLine: "line-through",
    lineHeight: FontSize.lg * 1.2,
    includeFontPadding: false,
  },
  viewSummaryLink: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.medium,
    color: Colors.primary,
  },
  placeOrderBtn: { flex: 1 },
});
