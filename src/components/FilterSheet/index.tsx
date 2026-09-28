import { AppButton } from "@/components/AppButton";
import {
  BorderRadius,
  Colors,
  FontSize,
  PoppinsFonts,
  Spacing,
} from "@/theme";
import { DirhamSymbol } from "dirham/react-native";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import {
  PRODUCT_TYPES,
  getProductTypeByKey,
  matchProductType,
  type FilterOption as ProductTypeFilterOption,
} from "@/constants/productTypes";

// ── Constants ─────────────────────────────────────────────────────────────────

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.88;

// ── Types ─────────────────────────────────────────────────────────────────────

export type AppliedFilters = Record<string, string[]>;
export const DEFAULT_FILTERS: AppliedFilters = {};

interface FilterOption {
  key: string;
  label: string;
}

interface FilterCategory {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterSheetProps {
  isOpen: boolean;
  /** Current category page context (e.g. "Rings") — used to pre-select the matching Product Type. */
  productCategory?: string;
  /** When provided, the sheet runs in brand mode: shows only the product types found under the brand. Category pages omit this and get the full taxonomy. */
  productTypeOptions?: ProductTypeFilterOption[];
  appliedFilters: AppliedFilters;
  onClose: () => void;
  onApply: (filters: AppliedFilters) => void;
}

// ── Filter Option Data ────────────────────────────────────────────────────────

const PRICE_OPTIONS: FilterOption[] = [
  { key: "under_1000", label: "Under |1,000" },
  { key: "under_1500", label: "Under |1,500" },
  { key: "under_2000", label: "Under |2,000" },
  { key: "under_2500", label: "Under |2,500" },
  { key: "under_3000", label: "Under |3,000" },
  { key: "under_3500", label: "Under |3,500" },
  { key: "under_4000", label: "Under |4,000" },
  { key: "under_4500", label: "Under |4,500" },
  { key: "over_5000",  label: "|5,000 & Above" },
];

const MATERIAL_OPTIONS: FilterOption[] = [
  { key: "gold", label: "Gold" },
  { key: "diamond", label: "Diamond" },
  { key: "platinum", label: "Platinum" },
  { key: "silver", label: "Silver" },
  { key: "rose_gold", label: "Rose Gold" },
  { key: "white_gold", label: "White Gold" },
];

const METAL_OPTIONS: FilterOption[] = [
  { key: "yellow_gold", label: "Yellow Gold" },
  { key: "white_gold", label: "White Gold" },
  { key: "rose_gold", label: "Rose Gold" },
  { key: "platinum", label: "Platinum" },
];

const SHOP_FOR_OPTIONS: FilterOption[] = [
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
  { key: "kids", label: "Kids" },
  { key: "unisex", label: "Unisex" },
];

const OCCASION_OPTIONS: FilterOption[] = [
  { key: "wedding", label: "Wedding" },
  { key: "anniversary", label: "Anniversary" },
  { key: "birthday", label: "Birthday" },
  { key: "engagement", label: "Engagement" },
  { key: "daily_wear", label: "Daily Wear" },
  { key: "party", label: "Party" },
];

const GEMSTONE_OPTIONS: FilterOption[] = [
  { key: "diamond", label: "Diamond" },
  { key: "ruby", label: "Ruby" },
  { key: "emerald", label: "Emerald" },
  { key: "sapphire", label: "Sapphire" },
  { key: "pearl", label: "Pearl" },
  { key: "opal", label: "Opal" },
];

const GIFT_OPTIONS: FilterOption[] = [
  { key: "for_her", label: "For Her" },
  { key: "for_him", label: "For Him" },
  { key: "for_kids", label: "For Kids" },
];

const DELIVERY_OPTIONS: FilterOption[] = [
  { key: "next_day", label: "Next Day Delivery" },
  { key: "1_3_days", label: "1–3 Days" },
  { key: "2_3_days", label: "2–3 Days" },
  { key: "in_stock", label: "In Stock" },
];

const WEIGHT_RANGE_OPTIONS: FilterOption[] = [
  { key: "under_2g", label: "Under 2g" },
  { key: "2_5g", label: "2g – 5g" },
  { key: "5_10g", label: "5g – 10g" },
  { key: "over_10g", label: "10g & Above" },
];

const RING_SIZE_OPTIONS: FilterOption[] = [
  { key: "5", label: "5" },
  { key: "6", label: "6" },
  { key: "7", label: "7" },
  { key: "8", label: "8" },
  { key: "9", label: "9" },
  { key: "10", label: "10" },
  { key: "11", label: "11" },
  { key: "12", label: "12" },
];

const CHAIN_LENGTH_OPTIONS: FilterOption[] = [
  { key: "14inch", label: '14"' },
  { key: "16inch", label: '16"' },
  { key: "18inch", label: '18"' },
  { key: "20inch", label: '20"' },
  { key: "22inch", label: '22"' },
  { key: "24inch", label: '24"' },
];

const COLLECTION_OPTIONS: FilterOption[] = [
  { key: "classic", label: "Classic" },
  { key: "modern", label: "Modern" },
  { key: "vintage", label: "Vintage" },
  { key: "luxury", label: "Luxury" },
];

const BACK_TYPE_OPTIONS: FilterOption[] = [
  { key: "push_back", label: "Push Back" },
  { key: "screw_back", label: "Screw Back" },
  { key: "lever_back", label: "Lever Back" },
  { key: "french_back", label: "French Back" },
];

const BRACELET_SIZE_OPTIONS: FilterOption[] = [
  { key: "6inch", label: '6"' },
  { key: "6_5inch", label: '6.5"' },
  { key: "7inch", label: '7"' },
  { key: "7_5inch", label: '7.5"' },
  { key: "8inch", label: '8"' },
];

// ── Extra (non Product Type / Style) filters per product type ─────────────────
// Product Type and Style are composed dynamically at render time from
// src/constants/productTypes.ts — this is only the remaining attribute set.

const PRICE_FILTER: FilterCategory = { key: "price", label: "Price", options: PRICE_OPTIONS };

const RING_EXTRA_FILTERS: FilterCategory[] = [
  { key: "weightRange", label: "Weight Ranges", options: WEIGHT_RANGE_OPTIONS },
  { key: "material", label: "Material", options: MATERIAL_OPTIONS },
  { key: "metal", label: "Metal", options: METAL_OPTIONS },
  { key: "ringSize", label: "Ring Size", options: RING_SIZE_OPTIONS },
  { key: "shopFor", label: "Shop for", options: SHOP_FOR_OPTIONS },
  { key: "occasion", label: "Occasion", options: OCCASION_OPTIONS },
  { key: "gemstone", label: "Gemstone", options: GEMSTONE_OPTIONS },
  { key: "gifts", label: "Gifts", options: GIFT_OPTIONS },
  { key: "deliveryTime", label: "Delivery Time", options: DELIVERY_OPTIONS },
];

const NECKLACE_EXTRA_FILTERS: FilterCategory[] = [
  { key: "chainLength", label: "Chain Length", options: CHAIN_LENGTH_OPTIONS },
  { key: "material", label: "Material", options: MATERIAL_OPTIONS },
  { key: "metal", label: "Metal", options: METAL_OPTIONS },
  { key: "gemstone", label: "Gemstone", options: GEMSTONE_OPTIONS },
  { key: "collection", label: "Collection", options: COLLECTION_OPTIONS },
  { key: "occasion", label: "Occasion", options: OCCASION_OPTIONS },
  { key: "shopFor", label: "Shop for", options: SHOP_FOR_OPTIONS },
  { key: "gifts", label: "Gifts", options: GIFT_OPTIONS },
  { key: "deliveryTime", label: "Delivery Time", options: DELIVERY_OPTIONS },
];

const EARRING_EXTRA_FILTERS: FilterCategory[] = [
  { key: "material", label: "Material", options: MATERIAL_OPTIONS },
  { key: "metal", label: "Metal", options: METAL_OPTIONS },
  { key: "gemstone", label: "Gemstone", options: GEMSTONE_OPTIONS },
  { key: "backType", label: "Back Type", options: BACK_TYPE_OPTIONS },
  { key: "occasion", label: "Occasion", options: OCCASION_OPTIONS },
  { key: "shopFor", label: "Shop for", options: SHOP_FOR_OPTIONS },
  { key: "gifts", label: "Gifts", options: GIFT_OPTIONS },
  { key: "deliveryTime", label: "Delivery Time", options: DELIVERY_OPTIONS },
];

const BRACELET_EXTRA_FILTERS: FilterCategory[] = [
  { key: "size", label: "Size", options: BRACELET_SIZE_OPTIONS },
  { key: "material", label: "Material", options: MATERIAL_OPTIONS },
  { key: "metal", label: "Metal", options: METAL_OPTIONS },
  { key: "gemstone", label: "Gemstone", options: GEMSTONE_OPTIONS },
  { key: "collection", label: "Collection", options: COLLECTION_OPTIONS },
  { key: "shopFor", label: "Shop for", options: SHOP_FOR_OPTIONS },
  { key: "gifts", label: "Gifts", options: GIFT_OPTIONS },
  { key: "deliveryTime", label: "Delivery Time", options: DELIVERY_OPTIONS },
];

const FALLBACK_EXTRA_FILTERS: FilterCategory[] = [
  { key: "material", label: "Material", options: MATERIAL_OPTIONS },
  { key: "metal", label: "Metal", options: METAL_OPTIONS },
  { key: "shopFor", label: "Shop for", options: SHOP_FOR_OPTIONS },
  { key: "occasion", label: "Occasion", options: OCCASION_OPTIONS },
  { key: "gemstone", label: "Gemstone", options: GEMSTONE_OPTIONS },
  { key: "gifts", label: "Gifts", options: GIFT_OPTIONS },
  { key: "deliveryTime", label: "Delivery Time", options: DELIVERY_OPTIONS },
];

function getExtraFilters(productCategory?: string): FilterCategory[] {
  const cat = (productCategory ?? "").toLowerCase();
  if (cat.includes("earring") || cat.includes("ear cuff")) return EARRING_EXTRA_FILTERS;
  if (cat.includes("bracelet") || cat.includes("bangle")) return BRACELET_EXTRA_FILTERS;
  if (cat.includes("necklace") || cat.includes("pendant") || cat.includes("choker")) return NECKLACE_EXTRA_FILTERS;
  if (cat.includes("ring")) return RING_EXTRA_FILTERS;
  return FALLBACK_EXTRA_FILTERS;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <View style={[cbStyles.box, checked && cbStyles.checked]}>
      {checked && (
        <Svg width={11} height={11} viewBox="0 0 12 12" fill="none">
          <Path
            d="M2 6l3 3 5-5"
            stroke={Colors.textInverse}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </View>
  );
}

const cbStyles = StyleSheet.create({
  box: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});

function CloseIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={Colors.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export const FilterSheet = memo(function FilterSheet({
  isOpen,
  productCategory,
  productTypeOptions,
  appliedFilters,
  onClose,
  onApply,
}: FilterSheetProps) {
  const { bottom: bottomInset } = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const wasOpenRef = useRef(false);

  const [draft, setDraft] = useState<AppliedFilters>({});
  const [activeCatKey, setActiveCatKey] = useState("price");
  const rightScrollRef = useRef<ScrollView>(null);

  // Brand pages pass only the product types found under that brand; category
  // pages don't, so every product type is shown (with the current page's type
  // pre-selected) letting the user browse across categories from the filter.
  const isBrandMode = productTypeOptions !== undefined;

  const resolvedProductTypeOptions = useMemo<ProductTypeFilterOption[]>(() => {
    if (productTypeOptions) return productTypeOptions;
    return PRODUCT_TYPES.map((pt) => ({ key: pt.key, label: pt.label }));
  }, [productTypeOptions]);

  // Style options are derived from whichever Product Type(s) are currently
  // selected — never mixes ring styles into a necklace's style list, etc.
  const styleInfo = useMemo(() => {
    const selectedProductTypeKeys = draft.productType ?? [];
    const seen = new Set<string>();
    const options: FilterOption[] = [];
    const styleLabels: string[] = [];
    for (const key of selectedProductTypeKeys) {
      const def = getProductTypeByKey(key);
      if (!def) continue;
      styleLabels.push(def.styleLabel);
      for (const s of def.styles) {
        if (!seen.has(s.key)) {
          seen.add(s.key);
          options.push({ key: s.key, label: s.label });
        }
      }
    }
    return { options, label: styleLabels.length === 1 ? styleLabels[0] : "Style" };
  }, [draft.productType]);

  const extraFilters = useMemo(() => getExtraFilters(productCategory), [productCategory]);

  const categories = useMemo(() => {
    const cats: FilterCategory[] = [PRICE_FILTER];
    if (resolvedProductTypeOptions.length > 0) {
      cats.push({ key: "productType", label: "Product Type", options: resolvedProductTypeOptions });
    }
    if (styleInfo.options.length > 0) {
      cats.push({ key: "style", label: styleInfo.label, options: styleInfo.options });
    }
    cats.push(...extraFilters);
    return cats;
  }, [resolvedProductTypeOptions, styleInfo, extraFilters]);

  const activeOptions = useMemo(
    () => categories.find((c) => c.key === activeCatKey)?.options ?? [],
    [categories, activeCatKey],
  );

  const selectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of categories)
      counts[cat.key] = (draft[cat.key] ?? []).length;
    return counts;
  }, [categories, draft]);

  const totalCount = useMemo(
    () => Object.values(draft).reduce((sum, v) => sum + v.length, 0),
    [draft],
  );

  useEffect(() => {
    if (isOpen === wasOpenRef.current) return;
    wasOpenRef.current = isOpen;

    if (isOpen) {
      const initial: AppliedFilters = { ...appliedFilters };
      if (!isBrandMode && (initial.productType ?? []).length === 0) {
        const defaultKey = productCategory ? matchProductType(productCategory)?.key : undefined;
        if (defaultKey) initial.productType = [defaultKey];
      }
      setDraft(initial);
      setActiveCatKey("price");
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.45,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, appliedFilters, isBrandMode, productCategory, translateY, backdropOpacity]);

  // Keep the active tab valid if the category list shrinks (e.g. Style
  // disappears because the user unchecked the only selected Product Type).
  useEffect(() => {
    if (!isOpen) return;
    if (!categories.some((c) => c.key === activeCatKey)) {
      setActiveCatKey(categories[0]?.key ?? "price");
    }
  }, [isOpen, categories, activeCatKey]);

  useEffect(() => {
    if (!isOpen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [isOpen, onClose]);

  const handleCategorySelect = useCallback((key: string) => {
    setActiveCatKey(key);
    rightScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const toggleOption = useCallback((catKey: string, optKey: string) => {
    setDraft((prev) => {
      const current = prev[catKey] ?? [];
      const next = current.includes(optKey)
        ? current.filter((k) => k !== optKey)
        : [...current, optKey];
      return { ...prev, [catKey]: next };
    });
  }, []);

  const handleClear = useCallback(() => setDraft({}), []);

  const handleApply = useCallback(() => {
    const cleaned: AppliedFilters = {};
    for (const [k, v] of Object.entries(draft)) {
      if (v.length > 0) cleaned[k] = v;
    }
    onApply(cleaned);
    onClose();
  }, [draft, onApply, onClose]);

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        pointerEvents={isOpen ? "auto" : "none"}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CloseIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Two-panel body */}
        <View style={styles.body}>
          {/* Left: category list — View owns the 40% width */}
          <View style={styles.leftPanel}>
            <ScrollView
              style={styles.leftScroll}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {categories.map((cat) => {
                const count = selectionCounts[cat.key] ?? 0;
                const active = cat.key === activeCatKey;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.catRow, active && styles.catRowActive]}
                    onPress={() => handleCategorySelect(cat.key)}
                    activeOpacity={0.7}
                  >
                    {active && <View style={styles.catAccent} />}
                    <Text
                      style={[styles.catLabel, active && styles.catLabelActive]}
                      numberOfLines={2}
                    >
                      {cat.label}
                    </Text>
                    {count > 0 && (
                      <View style={styles.catBadge}>
                        <Text style={styles.catBadgeText}>{count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: Spacing.xl }} />
            </ScrollView>
          </View>

          <View style={styles.panelDivider} />

          {/* Right: options — View owns the 60% width */}
          <View style={styles.rightPanel}>
            <ScrollView
              ref={rightScrollRef}
              style={styles.rightScroll}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {activeOptions.map((opt) => {
                const checked = (draft[activeCatKey] ?? []).includes(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={styles.optionRow}
                    onPress={() => toggleOption(activeCatKey, opt.key)}
                    activeOpacity={0.7}
                  >
                    <CheckBox checked={checked} />
                    {opt.label.includes("|") ? (
                      <View style={styles.priceLabelRow}>
                        {opt.label.split("|")[0] ? (
                          <Text style={styles.optionLabel}>{opt.label.split("|")[0]}</Text>
                        ) : null}
                        <DirhamSymbol
                          size={FontSize.sm}
                          color={Colors.textPrimary}
                          weight="semibold"
                        />
                        <Text style={styles.optionLabel}>{opt.label.split("|")[1]}</Text>
                      </View>
                    ) : (
                      <Text style={styles.optionLabel}>{opt.label}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: Spacing.xxl }} />
            </ScrollView>
          </View>
        </View>

        {/* Action bar */}
        <View
          style={[
            styles.actionBar,
            { paddingBottom: bottomInset + Spacing.md },
          ]}
        >
          <AppButton
            label="Clear All"
            variant="outline"
            size="md"
            onPress={handleClear}
            style={styles.actionBtn}
            labelStyle={styles.actionBtnLabel}
          />
          <AppButton
            label={totalCount > 0 ? `Apply Filters (${totalCount})` : "Apply Filters"}
            variant="primary"
            size="md"
            onPress={handleApply}
            style={styles.actionBtn}
            labelStyle={styles.actionBtnLabel}
          />
        </View>
      </Animated.View>
    </>
  );
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 99,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 100,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  headerSpacer: { width: 40 },

  body: {
    flex: 1,
    flexDirection: "row",
  },

  // ── Left panel ────────────────────────────────────────────────────────────────
  leftPanel: {
    flex: 2,
  },
  leftScroll: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.xs,
    paddingLeft: Spacing.md,
    backgroundColor: Colors.cardBackground,
    position: "relative",
  },
  catRowActive: {
    backgroundColor: Colors.background,
  },
  catAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.primary,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  catLabel: {
    flex: 1,
    fontSize: FontSize.xs,
    fontFamily: PoppinsFonts.regular,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  catLabelActive: {
    fontFamily: PoppinsFonts.semibold,
    color: Colors.primary,
  },
  catBadge: {
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    marginLeft: 2,
  },
  catBadgeText: {
    fontSize: 9,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textInverse,
  },

  panelDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },

  // ── Right panel ───────────────────────────────────────────────────────────────
  rightPanel: {
    flex: 3,
  },
  rightScroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  optionLabel: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.regular,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  priceLabelRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  actionBar: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
  },
  actionBtnLabel: {
    fontFamily: PoppinsFonts.bold,
  },
});
