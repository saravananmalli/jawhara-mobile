import * as ExpoLocation from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform } from 'react-native';

const LOCATION_KEY = 'jawhara_delivery_location';
const RECENT_KEY = 'jawhara_recent_locations';
const DEFAULT_LOCATION = 'Dubai, UAE';
const MAX_RECENT = 5;

// Same platform-aware storage pattern as AuthContext
const storage = {
  get: (key: string): Promise<string | null> =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.getItem(key))
      : SecureStore.getItemAsync(key),
  set: (key: string, value: string): Promise<void> =>
    Platform.OS === 'web'
      ? Promise.resolve(void localStorage.setItem(key, value))
      : SecureStore.setItemAsync(key, value),
};

export async function resolveGPSLocation(): Promise<string | null> {
  try {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });
    const [place] = await ExpoLocation.reverseGeocodeAsync(pos.coords);
    if (!place) return null;
    const parts = [place.district ?? place.subregion, place.city].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  } catch {
    return null;
  }
}

interface LocationContextValue {
  location: string;
  recentLocations: string[];
  sheetVisible: boolean;
  selectLocation: (loc: string) => Promise<void>;
  openSheet: () => void;
  closeSheet: () => void;
  refreshGPS: () => Promise<void>;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: PropsWithChildren) {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);

  // On mount: load persisted location, then attempt GPS if nothing saved
  useEffect(() => {
    (async () => {
      const [saved, savedRecent] = await Promise.all([
        storage.get(LOCATION_KEY).catch(() => null),
        storage.get(RECENT_KEY).catch(() => null),
      ]);

      if (savedRecent) {
        try { setRecentLocations(JSON.parse(savedRecent)); } catch {}
      }

      if (saved) {
        setLocation(saved);
      } else {
        // First launch — attempt GPS
        const gps = await resolveGPSLocation();
        if (gps) {
          setLocation(gps);
          storage.set(LOCATION_KEY, gps).catch(() => {});
        }
      }
    })();
  }, []);

  const selectLocation = useCallback(async (loc: string) => {
    setLocation(loc);
    setSheetVisible(false);

    // Persist selected location
    storage.set(LOCATION_KEY, loc).catch(() => {});

    // Update recent list (deduplicated, capped at MAX_RECENT)
    setRecentLocations(prev => {
      const updated = [loc, ...prev.filter(r => r !== loc)].slice(0, MAX_RECENT);
      storage.set(RECENT_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const refreshGPS = useCallback(async () => {
    const gps = await resolveGPSLocation();
    if (gps) {
      await selectLocation(gps);
    }
  }, [selectLocation]);

  const openSheet = useCallback(() => setSheetVisible(true), []);
  const closeSheet = useCallback(() => setSheetVisible(false), []);

  return (
    <LocationContext.Provider
      value={{ location, recentLocations, sheetVisible, selectLocation, openSheet, closeSheet, refreshGPS }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside LocationProvider');
  return ctx;
}
