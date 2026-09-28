import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, PoppinsFonts, Spacing } from '@/constants/theme';

interface TrendingCardProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export function TrendingCard({ title, subtitle, onPress }: TrendingCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.emoji}>✨</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: Colors.goldLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
});
