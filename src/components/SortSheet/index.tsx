import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BorderRadius,
  Colors,
  FontSize,
  PoppinsFonts,
  Shadow,
  Spacing,
} from '@/theme';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SortKey =
  | 'relevance'
  | 'discount'
  | 'whats_new'
  | 'price_asc'
  | 'price_desc'
  | 'customer_rating';

export interface SortSheetProps {
  isOpen: boolean;
  selected: SortKey;
  onSelect: (key: SortKey) => void;
  onClose: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'relevance',      label: 'Relevance' },
  { key: 'discount',       label: 'Discount' },
  { key: 'whats_new',      label: "What's New" },
  { key: 'price_asc',      label: 'Price: Low to High' },
  { key: 'price_desc',     label: 'Price: High to Low' },
  { key: 'customer_rating', label: 'Customer Rating' },
];

const SWIPE_CLOSE_THRESHOLD = 80;
const SCREEN_HEIGHT = Dimensions.get('window').height;
// Auto-size: handle + title + 6 rows + bottom inset
const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.62, 480);

// ── Component ─────────────────────────────────────────────────────────────────

export const SortSheet = memo(function SortSheet({
  isOpen,
  selected,
  onSelect,
  onClose,
}: SortSheetProps) {
  const { bottom: bottomInset } = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const wasOpenRef = useRef(false);
  const dragY = useRef(new Animated.Value(0)).current;
  const dragYValue = useRef(0);

  useEffect(() => {
    dragY.addListener(({ value }) => { dragYValue.current = value; });
    return () => dragY.removeAllListeners();
  }, [dragY]);

  useEffect(() => {
    if (isOpen === wasOpenRef.current) return;
    wasOpenRef.current = isOpen;

    if (isOpen) {
      dragY.setValue(0);
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
  }, [isOpen, backdropOpacity, translateY, dragY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) dragY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > SWIPE_CLOSE_THRESHOLD || vy > 0.5) {
          onClose();
          dragY.setValue(0);
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    }),
  ).current;

  const sheetTranslate = Animated.add(translateY, dragY);

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: bottomInset, transform: [{ translateY: sheetTranslate }] },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        {/* Drag handle — pan area */}
        <View style={styles.handleArea} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Sort Designs By</Text>

        {/* Options */}
        <View style={styles.optionList}>
          {SORT_OPTIONS.map(({ key, label }) => {
            const active = selected === key;
            return (
              <TouchableOpacity
                key={key}
                style={styles.optionRow}
                onPress={() => { onSelect(key); onClose(); }}
                activeOpacity={0.7}
              >
                <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                  {active && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </>
  );
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    zIndex: 11,
    ...Shadow.lg,
  },

  handleArea: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },

  title: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },

  optionList: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: Colors.primary,
  },

  optionLabel: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.regular,
    color: Colors.textPrimary,
  },
  optionLabelActive: {
    fontFamily: PoppinsFonts.medium,
    color: Colors.textPrimary,
  },
});
