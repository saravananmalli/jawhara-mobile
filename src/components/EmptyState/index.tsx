import React, { memo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

interface EmptyStateProps {
  emoji?: string;
  /** Custom icon element — takes precedence over `emoji` (e.g. our own CartIcon) */
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
  style?: ViewStyle;
}

export const EmptyState = memo(function EmptyState({
  emoji = '🔍',
  icon,
  title,
  subtitle,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon ?? (emoji ? <Text style={styles.emoji}>{emoji}</Text> : null)}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action ? (
        <AppButton
          label={action.label}
          onPress={action.onPress}
          variant="outline"
          size="sm"
          style={styles.btn}
        />
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
  emoji: { fontSize: 48 },
  title: { fontSize: FontSize.md, fontFamily: PoppinsFonts.semibold, color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  btn: { marginTop: Spacing.sm },
});
