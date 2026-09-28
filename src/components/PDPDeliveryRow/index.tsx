import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PinIcon } from '@/components/ui/icons';
import { useLocation } from '@/context/LocationContext';
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

interface PDPDeliveryRowProps {
  nextDayDelivery?: boolean;
  arrivesBy?: string;
}

export const PDPDeliveryRow = memo(function PDPDeliveryRow({
  nextDayDelivery,
  arrivesBy,
}: PDPDeliveryRowProps) {
  const { location, openSheet } = useLocation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.locationRow} onPress={openSheet} activeOpacity={0.7}>
        <PinIcon size={18} />
        <Text style={styles.locationText} numberOfLines={1}>
          {location}
        </Text>
      </TouchableOpacity>

      {arrivesBy ? (
        <View style={styles.deliveryRow}>
          <Text style={styles.deliveryIcon}>📦</Text>
          <Text style={styles.deliveryText}>
            Expected delivery by {arrivesBy}
            {nextDayDelivery ? '(Next Day)' : ''}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bgGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  locationText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.medium,
    color: Colors.textPrimary,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  deliveryIcon: { fontSize: FontSize.md },
  deliveryText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
