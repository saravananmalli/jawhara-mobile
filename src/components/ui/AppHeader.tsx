import logo from "@/assets/images/logo.png";
import { CartIcon } from "@/components/CartIcon";
import { HeartIcon, PinIcon, SearchIcon } from "@/components/ui/icons";
import { BorderRadius, Colors, PoppinsFonts, Spacing } from "@/constants/theme";
import { useLocation } from "@/context/LocationContext";
import { useCartCount } from "@/store/cartStore";
import { useWishlistCount } from "@/store/wishlistStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SEARCH_TERMS = ["Ring", "Pendant", "Earrings", "Necklace", "Bracelet", "Bangle"];

interface AppHeaderProps {
  onSearchPress?: () => void;
  hideSearch?: boolean;
  /** Rendered in place of the search bar when hideSearch is true (e.g. a filter chip row) */
  children?: ReactNode;
}

export function AppHeader({ onSearchPress, hideSearch = false, children }: AppHeaderProps) {
  const { location, openSheet } = useLocation();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const [termIndex, setTermIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const cycle = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTermIndex(i => (i + 1) % SEARCH_TERMS.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 2500);

    return () => clearInterval(cycle);
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      {/* ── Top row: logo · location · icons ── */}
      <View style={styles.topRow}>
        <Image source={logo} style={styles.logo} contentFit="contain" />

        <TouchableOpacity
          style={styles.locationSection}
          onPress={openSheet}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 0, right: 0 }}
        >
          <PinIcon size={20} />
          <View>
            <Text style={styles.deliverLabel}>Deliver to</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {location}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/wishlist')}>
            <HeartIcon color={Colors.textPrimary} size={22} />
            {wishlistCount > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/cart')}>
            <CartIcon color={Colors.textPrimary} size={22} count={cartCount} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search bar row, or a custom slot (e.g. filter chips) in its place ── */}
      {!hideSearch ? (
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={onSearchPress}
        >
          <View style={styles.placeholderRow}>
            <Text style={styles.placeholderStatic}>Search for </Text>
            <Animated.Text style={[styles.placeholderTerm, { opacity: fadeAnim }]}>
              "{SEARCH_TERMS[termIndex]}"
            </Animated.Text>
          </View>
          <View style={styles.searchBtn}>
            <SearchIcon color="#FFFFFF" size={19} />
          </View>
        </TouchableOpacity>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },

  /* Top row */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  logo: {
    width: 72,
    height: 40,
  },
  locationSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deliverLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 13,
  },
  locationText: {
    fontSize: 13,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: "row",
    gap: 2,
  },
  iconBtn: {
    padding: 4,
  },
  notifDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },

  /* Search bar */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundSearch,
    overflow: "hidden",
  },
  placeholderRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  placeholderStatic: {
    fontSize: 14,
    color: Colors.textLight,
  },
  placeholderTerm: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  searchBtn: {
    width: 46,
    height: "100%",
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
