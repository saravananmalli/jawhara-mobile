import { api, LocationResult } from '@/services/api';
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = Math.round(WINDOW_HEIGHT * 0.92);

interface LocationSheetProps {
  visible: boolean;
  location: string;
  recentLocations: string[];
  onClose: () => void;
  onSelect: (loc: string) => Promise<void>;
  onRefreshGPS: () => Promise<void>;
}

export function LocationSheet({
  visible,
  location,
  onClose,
  onSelect,
  onRefreshGPS,
}: LocationSheetProps) {
  const [modalMounted, setModalMounted] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [query, setQuery] = useState('');
  const [allCities, setAllCities] = useState<LocationResult[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Fetch cities once when the sheet first opens
  useEffect(() => {
    if (!visible || allCities.length > 0) return;
    setCitiesLoading(true);
    api.getLocations()
      .then(setAllCities)
      .finally(() => setCitiesLoading(false));
  }, [visible]);

  // Open / close animation
  useEffect(() => {
    if (visible) {
      translateY.setValue(SHEET_HEIGHT);
      setModalMounted(true);
      const t = setTimeout(() => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 12,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
        ]).start();
      }, 16);
      return () => clearTimeout(t);
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalMounted(false);
        setQuery('');
      });
    }
  }, [visible]);

  // Swipe-to-close on the drag handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dy, dx }) =>
        dy > 8 && Math.abs(dy) > Math.abs(dx),
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 100 || vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 12,
          }).start();
        }
      },
    }),
  ).current;

  const handleGPS = async () => {
    setGpsLoading(true);
    try {
      await onRefreshGPS();
    } finally {
      setGpsLoading(false);
    }
  };

  // Filter cities client-side — no extra API call on every keystroke
  const filteredCities = query.trim()
    ? allCities.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase()),
      )
    : allCities;

  return (
    <Modal
      visible={modalMounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* ── Backdrop ── */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* ── Sheet ── */}
      <KeyboardAvoidingView
        style={styles.kavWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>

          {/* ── Gold header ── */}
          <View {...panResponder.panHandlers} style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="location-sharp" size={20} color={Colors.textInverse} />
              <Text style={styles.headerTitle}>Delivery Location</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>

          {/* ── Scrollable content ── */}
          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyContent}
          >
            {/* ── Use current location ── */}
            <TouchableOpacity
              style={styles.gpsCard}
              onPress={handleGPS}
              disabled={gpsLoading}
              activeOpacity={0.75}
            >
              {gpsLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="sunny" size={22} color={Colors.primary} />
              )}
              <Text style={styles.gpsLabel}>
                {gpsLoading ? 'Detecting location…' : 'Use my current location'}
              </Text>
            </TouchableOpacity>

            {/* ── Divider ── */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or choose a city</Text>
              <View style={styles.orLine} />
            </View>

            {/* ── Search ── */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textLight} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search cities..."
                placeholderTextColor={Colors.textLight}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color={Colors.textLight} />
                </TouchableOpacity>
              )}
            </View>

            {/* ── City list ── */}
            {citiesLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : filteredCities.length === 0 ? (
              <Text style={styles.emptyText}>No cities found</Text>
            ) : (
              <View style={styles.cityCard}>
                {filteredCities.map((city, index) => {
                  const isActive = city.name === location;
                  const isLast = index === filteredCities.length - 1;
                  return (
                    <View key={city._id}>
                      <TouchableOpacity
                        style={[styles.cityRow, isActive && styles.cityRowActive]}
                        onPress={() => onSelect(city.name)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="location-sharp"
                          size={18}
                          color={isActive ? Colors.primary : Colors.textSecondary}
                          style={styles.cityPin}
                        />
                        <Text style={[styles.cityName, isActive && styles.cityNameActive]}>
                          {city.name}
                        </Text>
                        <Text style={styles.countryLabel}>{city.country}</Text>
                        {isActive && (
                          <Ionicons name="checkmark" size={18} color={Colors.primary} style={styles.checkIcon} />
                        )}
                      </TouchableOpacity>
                      {!isLast && <View style={styles.cityDivider} />}
                    </View>
                  );
                })}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  } as any,

  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },

  // ── Gold header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Body ──
  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  // ── GPS card ──
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  gpsLabel: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.primary,
  },

  // ── "or choose a city" divider ──
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: Spacing.md,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  orText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // ── Search ──
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 50,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    padding: 0,
  },

  // ── City list ──
  loadingWrap: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },

  cityCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md + 2,
    backgroundColor: Colors.background,
  },
  cityRowActive: {
    backgroundColor: Colors.cardBackground,
  },
  cityPin: { marginRight: Spacing.md },
  cityName: {
    flex: 1,
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
  },
  cityNameActive: {
    color: Colors.primary,
  },
  countryLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  checkIcon: {},
  cityDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md + 18 + Spacing.md,
  },
});
