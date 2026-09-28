import { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, PoppinsFonts, Spacing } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({ label, error, isPassword, style, placeholder, onFocus, onBlur, value, ...props }: InputProps) {
  const [secure, setSecure] = useState(isPassword ?? false);
  const [focused, setFocused] = useState(false);

  const floatLabel = placeholder ?? label;
  const isFloating = focused || !!value;

  const floatAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const animate = (toValue: number) => {
    Animated.timing(floatAnim, {
      toValue,
      duration: 160,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setFocused(true);
    animate(1);
    onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setFocused(false);
    if (!value) animate(0);
    onBlur?.(e);
  };

  const labelTop = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, -10],
  });

  const labelFontSize = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 12],
  });

  const labelColor = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.textSecondary, Colors.primary],
  });

  return (
    <View style={styles.wrapper}>
      {/* Static label above — only when label prop is used explicitly */}
      {label && !placeholder && <Text style={styles.staticLabel}>{label}</Text>}

      <View style={[styles.container, focused && styles.containerFocused, error ? styles.containerError : null]}>
        {/* Floating label — used when placeholder text is provided */}
        {floatLabel && (
          <Animated.Text
            style={[
              styles.floatingLabel,
              {
                top: labelTop,
                fontSize: labelFontSize,
                color: labelColor,
              },
            ]}
            pointerEvents="none"
          >
            {floatLabel}
          </Animated.Text>
        )}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="transparent"
          placeholder=" "
          secureTextEntry={secure}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setSecure((s) => !s)} style={styles.eyeBtn}>
            <Ionicons
              name={secure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  staticLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: PoppinsFonts.medium,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    backgroundColor: '#FAFAFA',
    overflow: 'visible',
  },
  containerFocused: {
    borderColor: Colors.primary,
  },
  containerError: {
    borderColor: Colors.error,
  },
  floatingLabel: {
    position: 'absolute',
    left: 12,
    backgroundColor: Colors.background,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingTop: 6,
  },
  eyeBtn: {
    padding: 4,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
  },
});
