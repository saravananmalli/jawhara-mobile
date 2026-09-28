import React, { memo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState = memo(function ErrorState({
  title = 'Something went wrong',
  message = 'Please check your connection and try again.',
  onRetry,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <AppButton label="Try Again" onPress={onRetry} variant="outline" size="sm" style={styles.btn} />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['4xl'],
  },
  emoji: { fontSize: 40 },
  title: { fontSize: FontSize.md, fontFamily: PoppinsFonts.semibold, color: Colors.textPrimary, textAlign: 'center' },
  message: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: Spacing.sm },
});
