import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Loader } from "@/components/Loader";
import { SearchBar } from "@/components/SearchBar";
import { AppHeader } from "@/components/ui/AppHeader";
import { WhatsAppIcon } from "@/components/ui/icons";
import { api, Store } from "@/services/api";
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from "@/theme";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COUNTRIES = ["UAE", "Oman", "Kuwait", "Saudi Arabia", "Bahrain"];

function StoreCard({ store }: { store: Store }) {
  const digits = store.phone?.replace(/[^\d+]/g, "") ?? "";

  return (
    <View style={styles.card}>
      <Text style={styles.storeName}>{store.name}</Text>
      <Text style={styles.storeAddress}>{store.address}</Text>
      {store.phone ? (
        <Text style={styles.storePhone}>{store.phone}</Text>
      ) : null}

      <View style={styles.cardActions}>
        {digits ? (
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() =>
              Linking.openURL(`https://wa.me/${digits.replace("+", "")}`)
            }
          >
            <WhatsAppIcon size={20} />
          </TouchableOpacity>
        ) : null}
        <AppButton
          label="BOOK A VISIT"
          onPress={() => store.mapLink && Linking.openURL(store.mapLink)}
          variant="primary"
          size="sm"
        />
      </View>
    </View>
  );
}

export default function FindStoreScreen() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCountry, setActiveCountry] = useState(COUNTRIES[0]);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const loadStores = () => {
    setLoading(true);
    setLoadError(false);
    api
      .getStores()
      .then(setStores)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStores();
  }, []);

  const storesInCountry = useMemo(
    () =>
      stores.filter((s) =>
        s.country.toLowerCase().includes(activeCountry.toLowerCase()),
      ),
    [stores, activeCountry],
  );

  const regions = useMemo(
    () => Array.from(new Set(storesInCountry.map((s) => s.region))).sort(),
    [storesInCountry],
  );

  const filteredStores = useMemo(() => {
    const query = search.trim().toLowerCase();
    return storesInCountry.filter((s) => {
      const matchesRegion = !activeRegion || s.region === activeRegion;
      const matchesSearch =
        !query ||
        s.region.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query);
      return matchesRegion && matchesSearch;
    });
  }, [storesInCountry, activeRegion, search]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader hideSearch>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          prefixLabel="Search By"
          rotatingTerms={["City", "Address", "Phone Number"]}
        />
      </AppHeader>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScrollWrap}
        contentContainerStyle={styles.chipsRow}
      >
        {COUNTRIES.map((country) => {
          const isActive = country === activeCountry;
          return (
            <TouchableOpacity
              key={country}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => {
                setActiveCountry(country);
                setActiveRegion(null);
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {country}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {regions.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.regionsScrollWrap}
          contentContainerStyle={styles.regionsRow}
        >
          {regions.map((region) => {
            const isActive = region === activeRegion;
            return (
              <TouchableOpacity
                key={region}
                style={[
                  styles.regionChip,
                  isActive
                    ? styles.regionChipActive
                    : styles.regionChipInactive,
                ]}
                onPress={() => setActiveRegion(isActive ? null : region)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.regionChipText,
                    isActive
                      ? styles.regionChipTextActive
                      : styles.regionChipTextInactive,
                  ]}
                >
                  {region}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {loading ? (
        <Loader fullScreen />
      ) : loadError ? (
        <ErrorState
          title="Failed to load stores"
          message="Tap to retry"
          onRetry={loadStores}
          style={styles.errorState}
        />
      ) : filteredStores.length === 0 ? (
        <EmptyState
          emoji="📍"
          title="No stores found"
          subtitle="Try a different city or country"
        />
      ) : (
        <FlatList
          data={filteredStores}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <StoreCard store={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  chipsScrollWrap: { flexGrow: 0, flexShrink: 0 },
  chipsRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    alignItems: "center",
  },

  regionsScrollWrap: { flexGrow: 0, flexShrink: 0 },
  regionsRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipInactive: {
    backgroundColor: Colors.background,
    borderColor: Colors.primaryLight,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.medium,
    lineHeight: FontSize.sm * 1.2,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  chipTextActive: { color: Colors.textInverse },
  chipTextInactive: { color: Colors.textPrimary },

  regionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  regionChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  regionChipInactive: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  regionChipText: {
    fontSize: FontSize.xs,
    fontFamily: PoppinsFonts.medium,
    lineHeight: FontSize.xs * 1.2,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  regionChipTextActive: { color: Colors.primary },
  regionChipTextInactive: { color: Colors.textSecondary },

  errorState: { flex: 1 },

  list: { padding: Spacing.md, gap: Spacing.md },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  storeName: {
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  storeAddress: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  storePhone: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  whatsappBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
});
