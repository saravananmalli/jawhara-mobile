import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { BorderRadius, Colors, PoppinsFonts, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function LocationScreen() {
  const { user } = useAuth();
  const [locationName, setLocationName] = useState('Dubai, UAE');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync(pos.coords);
      if (place) {
        const parts = [place.city, place.country].filter(Boolean);
        if (parts.length) setLocationName(parts.join(', '));
      }
    })();
  }, []);

  const proceed = () => router.replace('/(tabs)/home');

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.skipBtn} onPress={proceed}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.body}>
        <View style={styles.iconRow}>
          <Ionicons name="location-sharp" size={52} color={Colors.textPrimary} />
          <Ionicons name="location-outline" size={44} color={Colors.textPrimary} style={styles.iconOffset} />
        </View>

        <Text style={styles.welcome}>Welcome {user?.name || 'UserName'}</Text>
        <Text style={styles.desc}>
          For first deliveries or available of designs in-store? Locate your nearest store
        </Text>

        <View style={styles.deliverRow}>
          <Ionicons name="location-sharp" size={18} color={Colors.primary} />
          <View>
            <Text style={styles.deliverLabel}>Deliver to</Text>
            <Text style={styles.deliverValue}>{locationName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="DONE" onPress={proceed} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    margin: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  skipText: {
    color: Colors.primary,
    fontSize: 13,
    fontFamily: PoppinsFonts.medium,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
  },
  iconOffset: {
    marginLeft: -8,
    marginBottom: 8,
  },
  welcome: {
    fontSize: 22,
    fontFamily: PoppinsFonts.bold,
    color: Colors.primary,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  deliverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignSelf: 'stretch',
    marginTop: Spacing.sm,
    backgroundColor: '#FAFAFA',
  },
  deliverLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  deliverValue: {
    fontSize: 15,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  footer: {
    padding: Spacing.xl,
  },
});
