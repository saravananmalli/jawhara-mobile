import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BorderRadius, Colors, FontSize, Spacing } from '@/theme';

function SearchSvg({ color }: { color: string }) {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  rotatingTerms?: string[];
  /** Static text shown before the rotating term, e.g. "Search for" or "Search By" */
  prefixLabel?: string;
  autoFocus?: boolean;
  editable?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const SearchBar = memo(function SearchBar({
  value = '',
  onChangeText,
  onSubmit,
  placeholder,
  rotatingTerms,
  prefixLabel = 'Search for',
  autoFocus = false,
  editable = true,
  onPress,
  style,
}: SearchBarProps) {
  const [termIndex, setTermIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const terms = rotatingTerms ?? (placeholder ? [] : ['Ring', 'Pendant', 'Earrings', 'Necklace']);

  useEffect(() => {
    if (terms.length < 2) return;
    const cycle = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setTermIndex(i => (i + 1) % terms.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 2500);
    return () => clearInterval(cycle);
  }, [terms.length, fadeAnim]);

  const showRotating = !value && terms.length > 0 && !placeholder;

  const inner = (
    <View style={[styles.wrapper, style]}>
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? (terms.length === 0 ? 'Search…' : '')}
          placeholderTextColor={Colors.textLight}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          autoFocus={autoFocus}
          editable={editable && !onPress}
        />
        {showRotating && value.length === 0 && (
          <View style={styles.animatedPlaceholder} pointerEvents="none">
            <Text style={styles.placeholderStatic}>{prefixLabel} </Text>
            <Animated.Text style={[styles.placeholderTerm, { opacity: fadeAnim }]}>
              "{terms[termIndex]}"
            </Animated.Text>
          </View>
        )}
        {value.length > 0 && onChangeText && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => onChangeText('')}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.iconBtn}>
        <SearchSvg color={Colors.textInverse} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {inner}
      </TouchableOpacity>
    );
  }

  return inner;
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundSearch,
    overflow: 'hidden',
  },
  inputArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    height: '100%',
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  animatedPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  placeholderStatic: { fontSize: FontSize.base, color: Colors.textLight },
  placeholderTerm: { fontSize: FontSize.base, color: Colors.textPrimary },
  clearBtn: { paddingHorizontal: Spacing.sm, height: '100%', justifyContent: 'center' },
  clearText: { fontSize: FontSize.base, color: Colors.textSecondary },
  iconBtn: {
    width: 46,
    height: '100%',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
