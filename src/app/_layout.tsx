import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/AuthContext';
import { BrandingProvider } from '@/context/BrandingContext';
import { LocationProvider, useLocation } from '@/context/LocationContext';
import { PushNotificationConnector } from '@/components/PushNotificationConnector';
import { LocationSheet } from '@/components/LocationSheet';
import { QueryProvider } from '@/providers/QueryProvider';
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

function LocationSheetConnector() {
  const { location, recentLocations, sheetVisible, selectLocation, closeSheet, refreshGPS } = useLocation();
  return (
    <LocationSheet
      visible={sheetVisible}
      location={location}
      recentLocations={recentLocations}
      onClose={closeSheet}
      onSelect={selectLocation}
      onRefreshGPS={refreshGPS}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <BrandingProvider>
            <LocationProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
              <LocationSheetConnector />
              <PushNotificationConnector />
            </LocationProvider>
          </BrandingProvider>
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
