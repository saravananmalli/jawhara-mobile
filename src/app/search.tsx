import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  FlatList,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeletons';
import { SectionHeader } from '@/components/SectionHeader';
import { BorderRadius, Colors, CURRENCY, FontSize, PoppinsFonts, Spacing } from '@/theme';
import { useCartActions, useCartItems } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { api, BACKEND_URL, Product } from '@/services/api';

// Gate on NativeModules first — avoids requireNativeModule ever being called
// (and its internal console.error) when running in Expo Go.
function getSpeechModule() {
  if (!NativeModules.ExpoSpeechRecognition) return null;
  try {
    return require('expo-speech-recognition').ExpoSpeechRecognitionModule as {
      requestPermissionsAsync(): Promise<{ granted: boolean }>;
      start(opts: { lang: string; interimResults: boolean; continuous: boolean }): void;
      abort(): void;
      addListener(event: string, handler: (e: any) => void): { remove(): void };
    };
  } catch {
    return null;
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMB_ITEM_WIDTH = 80 + Spacing.sm;

const SEARCH_TERMS = ['Ring', 'Pendant', 'Earrings', 'Necklace', 'Bracelet', 'Bangle'];

const TRENDING_TEXT = [
  { id: '2', label: `Diamond Rings under 5K ${CURRENCY}` },
  { id: '4', label: 'Easy-to-Wear Bracelets' },
  { id: '5', label: 'Cute Pendants for Kids' },
  { id: '6', label: 'Diamond Earrings' },
];

const STOP_WORDS = new Set([
  'for', 'the', 'and', 'with', 'to', 'in', 'of', 'a', 'an',
  'easy', 'cute', 'wear', 'aed', 'under', 'kids', 'layered',
]);

const KEYWORD_TO_CATEGORY: Record<string, string> = {
  ring: 'Rings', rings: 'Rings',
  earring: 'Earrings', earrings: 'Earrings',
  pendant: 'Pendants', pendants: 'Pendants',
  necklace: 'Pendants', necklaces: 'Pendants',
  bracelet: 'Bracelets', bracelets: 'Bracelets',
  bangle: 'Bracelets', bangles: 'Bracelets',
};

function parseQuery(q: string): { maxPrice: number | null; apiCategory: string | null; remainingKeywords: string[] } {
  const lower = q.toLowerCase();
  const priceMatch = lower.match(/under\s+(\d+(?:\.\d+)?)\s*(k)?\s*(?:aed)?/i);
  let maxPrice: number | null = null;
  let cleaned = lower;
  if (priceMatch) {
    const num = parseFloat(priceMatch[1]);
    maxPrice = priceMatch[2] ? num * 1000 : num;
    cleaned = lower.replace(priceMatch[0], '');
  }
  const keywords = cleaned.split(/[\s\-|]+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  let apiCategory: string | null = null;
  for (const kw of keywords) {
    if (KEYWORD_TO_CATEGORY[kw]) { apiCategory = KEYWORD_TO_CATEGORY[kw]; break; }
    const stem = kw.endsWith('s') && kw.length > 3 ? kw.slice(0, -1) : kw;
    if (KEYWORD_TO_CATEGORY[stem]) { apiCategory = KEYWORD_TO_CATEGORY[stem]; break; }
  }
  const catSet = new Set(Object.entries(KEYWORD_TO_CATEGORY).filter(([, v]) => v === apiCategory).map(([k]) => k));
  const remainingKeywords = apiCategory
    ? keywords.filter(kw => { const stem = kw.endsWith('s') && kw.length > 3 ? kw.slice(0, -1) : kw; return !catSet.has(kw) && !catSet.has(stem); })
    : keywords;
  return { maxPrice, apiCategory, remainingKeywords };
}

function matchKeyword(text: string, kw: string): boolean {
  try {
    if (new RegExp(`\\b${kw}`, 'i').test(text)) return true;
    if (kw.endsWith('s') && kw.length > 3) return new RegExp(`\\b${kw.slice(0, -1)}`, 'i').test(text);
    return false;
  } catch {
    return text.toLowerCase().includes(kw);
  }
}

function BackArrow() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={Colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MicIcon({ color = Colors.textInverse }: { color?: string }) {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
      <Path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 19V23" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 23H16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function TrendingArrow() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M7 17L17 7M17 7H8M17 7V16" stroke={Colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const thumbTranslateX = useRef(new Animated.Value(0)).current;
  const thumbIndexRef = useRef(0);
  const [termIndex, setTermIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCartActions();
  const cartItems = useCartItems();

  // Rotating placeholder
  useEffect(() => {
    const cycle = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setTermIndex(i => (i + 1) % SEARCH_TERMS.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 2500);
    return () => clearInterval(cycle);
  }, [fadeAnim]);

  // Speech recognition listeners
  useEffect(() => {
    const mod = getSpeechModule();
    if (!mod) return;
    const subs = [
      mod.addListener('result', (e: { results: { transcript: string }[] }) => {
        const transcript = e.results?.[0]?.transcript;
        if (transcript) setQuery(transcript);
      }),
      mod.addListener('end', () => setIsListening(false)),
      mod.addListener('error', () => setIsListening(false)),
    ];
    return () => subs.forEach(s => s.remove());
  }, []);

  async function handleMicPress() {
    const mod = getSpeechModule();
    if (!mod) {
      Alert.alert('Voice Search', 'Voice search requires a custom build. Use the keyboard mic button to dictate.');
      return;
    }
    if (isListening) { mod.abort(); setIsListening(false); return; }
    const { granted } = await mod.requestPermissionsAsync();
    if (!granted) return;
    setIsListening(true);
    mod.start({ lang: 'en-US', interimResults: true, continuous: false });
  }

  useEffect(() => {
    Promise.all([api.getProducts({ badge: 'new', limit: 8 }), api.getProducts({ badge: 'Best Seller', limit: 8 })])
      .then(([newRes, bsRes]) => { setFeaturedProducts(newRes.data); setBestSellers(bsRes.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    const { apiCategory, remainingKeywords, maxPrice } = parseQuery(trimmedQuery);
    const timer = setTimeout(() => {
      api.getProducts({ category: apiCategory || undefined, limit: 60 })
        .then(res => {
          let data = res.data;
          if (maxPrice !== null) data = data.filter(p => p.price <= maxPrice);
          if (remainingKeywords.length > 0) data = data.filter(p => remainingKeywords.every(kw => matchKeyword(`${p.name} ${p.category}`, kw)));
          setSearchResults(data);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [trimmedQuery]);

  // Auto-scroll new designs thumbnails
  useEffect(() => {
    if (featuredProducts.length < 2) return;
    thumbIndexRef.current = 0;
    thumbTranslateX.setValue(0);
    let timeout: ReturnType<typeof setTimeout>;
    const slide = () => {
      const nextIndex = thumbIndexRef.current + 1;
      Animated.timing(thumbTranslateX, { toValue: -nextIndex * THUMB_ITEM_WIDTH, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start(({ finished }) => {
        if (!finished) return;
        thumbIndexRef.current = nextIndex;
        if (nextIndex >= featuredProducts.length) { thumbTranslateX.setValue(0); thumbIndexRef.current = 0; }
        timeout = setTimeout(slide, 1800);
      });
    };
    timeout = setTimeout(slide, 800);
    return () => { clearTimeout(timeout); thumbTranslateX.stopAnimation(); };
  }, [featuredProducts.length, thumbTranslateX]);

  const loopedProducts = featuredProducts.length ? [...featuredProducts, ...featuredProducts.slice(0, 3)] : [];

  function handleBack() {
    if (trimmedQuery) { setQuery(''); } else { router.back(); }
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (query.trim()) { setQuery(''); return true; }
      return false;
    });
    return () => sub.remove();
  }, [query]);

  const CARD_W = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Search bar ── */}
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <BackArrow />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder=""
            placeholderTextColor="transparent"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoFocus
          />
          {query.length === 0 && (
            <View style={styles.animatedPlaceholder} pointerEvents="none">
              <Text style={styles.placeholderStatic}>Search for </Text>
              <Animated.Text style={[styles.placeholderTerm, { opacity: fadeAnim }]}>
                "{SEARCH_TERMS[termIndex]}"
              </Animated.Text>
            </View>
          )}
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => setQuery('')}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.micBtn, isListening && styles.micBtnActive]}
            onPress={handleMicPress}
            activeOpacity={0.7}
          >
            <MicIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Results / Discovery ── */}
      {trimmedQuery ? (
        searchLoading ? (
          <ScrollView contentContainerStyle={styles.skeletonGrid} showsVerticalScrollIndicator={false}>
            {Array.from({ length: 3 }).map((_, rowIdx) => (
              <View key={rowIdx} style={styles.skeletonRow}>
                <ProductCardSkeleton style={{ flex: 1 }} />
                <ProductCardSkeleton style={{ flex: 1 }} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                isWishlisted={wishlist.has(item._id)}
                isInCart={Boolean(cartItems[item._id])}
                onWishlistToggle={toggleWishlist}
                onAddToCart={addToCart}
                onPress={() => router.push({ pathname: '/product/[id]', params: { id: item._id } })}
                style={{ width: CARD_W }}
              />
            )}
            numColumns={2}
            contentContainerStyle={styles.resultsGrid}
            columnWrapperStyle={styles.resultsRow}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.resultsCount}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{trimmedQuery}&rdquo;
              </Text>
            }
            ListEmptyComponent={
              <EmptyState emoji="🔍" title="No products found" subtitle="Try a different search term" />
            }
          />
        )
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.section}>
            <Text style={styles.trendingTitle}>
              <Text style={styles.trendingGold}>Trending </Text>
              <Text style={styles.trendingDark}>Searches</Text>
            </Text>

            {/* New Designs — auto-scrolling thumbnails */}
            <View style={styles.featuredCard}>
              <View style={styles.featuredLeft}>
                <TrendingArrow />
                <View style={styles.featuredLabelWrap}>
                  <Text style={styles.featuredLabel}>New Designs</Text>
                  <Badge variant="new" label="NEW DESIGNS" />
                </View>
              </View>

              <View style={styles.thumbScrollWrap}>
                <Animated.View style={[styles.thumbRow, { transform: [{ translateX: thumbTranslateX }] }]}>
                  {loading
                    ? [0, 1, 2].map(i => <View key={i} style={styles.thumbPlaceholder} />)
                    : loopedProducts.map((p, i) => (
                        <TouchableOpacity
                          key={`${p._id}-${i}`}
                          style={styles.thumb}
                          onPress={() => router.push({ pathname: '/product/[id]', params: { id: p._id } })}
                        >
                          {p.images?.[0] ? (
                            <Image source={{ uri: `${BACKEND_URL}${p.images[0]}` }} style={styles.thumbImg} contentFit="cover" />
                          ) : (
                            <View style={[styles.thumbImg, styles.thumbEmpty]} />
                          )}
                        </TouchableOpacity>
                      ))}
                </Animated.View>
              </View>
            </View>

            {/* Trending text — 2-column grid */}
            <View style={styles.trendingGrid}>
              {TRENDING_TEXT.map(item => (
                <TouchableOpacity key={item.id} style={styles.trendingItem} onPress={() => setQuery(item.label)}>
                  <TrendingArrow />
                  <Text style={styles.trendingItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Best Sellers */}
          <View style={styles.sectionPad}>
            <SectionHeader title="Best Sellers" />
          </View>

          {loading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bestSellersScroll}>
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} style={{ width: 150, flex: undefined }} />
              ))}
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bestSellersScroll}>
              {bestSellers.map(p => (
                <ProductCard
                  key={p._id}
                  product={p}
                  isWishlisted={wishlist.has(p._id)}
                  isInCart={Boolean(cartItems[p._id])}
                  onWishlistToggle={toggleWishlist}
                  onAddToCart={addToCart}
                  onPress={() => router.push({ pathname: '/product/[id]', params: { id: p._id } })}
                  style={{ width: 150 }}
                />
              ))}
            </ScrollView>
          )}

          <View style={styles.divider} />

          {/* Explore New Collection banner */}
          <View style={styles.sectionPad}>
            <SectionHeader title="Explore our New Collection" />
          </View>
          <View style={styles.collectionBanner}>
            <View style={styles.collectionContent}>
              <Text style={styles.collectionLabel}>NEW ARRIVALS</Text>
              <Text style={styles.collectionHeading}>Crafted for{'\n'}Every Occasion</Text>
              <Text style={styles.collectionSub}>From daily wear to bridal jewellery — discover pieces that tell your story.</Text>
              <TouchableOpacity style={styles.collectionBtn}>
                <Text style={styles.collectionBtnText}>SHOP NOW</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xl },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backBtn: { padding: Spacing.xs },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundSearch,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    height: '100%',
  },
  clearBtn: { paddingHorizontal: Spacing.sm, height: '100%', justifyContent: 'center' },
  clearBtnText: { fontSize: FontSize.base, color: Colors.textSecondary },
  micBtn: { width: 46, height: '100%', backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  micBtnActive: { opacity: 0.75 },
  animatedPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    right: 46,
  },
  placeholderStatic: { fontSize: FontSize.base, color: Colors.textLight },
  placeholderTerm: { fontSize: FontSize.base, color: Colors.textPrimary },

  resultsGrid: { padding: Spacing.lg, paddingTop: Spacing.sm },
  resultsRow: { gap: Spacing.md, marginBottom: Spacing.md },
  resultsCount: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },

  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  sectionPad: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  divider: { height: 6, backgroundColor: Colors.bgGray, marginTop: Spacing.lg },

  trendingTitle: { fontSize: FontSize.lg, fontFamily: PoppinsFonts.extrabold, marginBottom: Spacing.md },
  trendingGold: { color: Colors.primary },
  trendingDark: { color: Colors.textPrimary },

  featuredCard: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  featuredLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, width: 120 },
  featuredLabelWrap: { gap: Spacing.xs },
  featuredLabel: { fontSize: FontSize.base, fontFamily: PoppinsFonts.semibold, color: Colors.textPrimary },

  thumbScrollWrap: { flex: 1, overflow: 'hidden' },
  thumbRow: { flexDirection: 'row', gap: Spacing.sm },
  thumb: { width: 80, height: 80, borderRadius: BorderRadius.lg, overflow: 'hidden', backgroundColor: Colors.cardBackground },
  thumbImg: { width: '100%', height: '100%' },
  thumbEmpty: { backgroundColor: Colors.goldLight },
  thumbPlaceholder: { width: 80, height: 80, borderRadius: BorderRadius.lg, backgroundColor: Colors.cardBackground },

  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  trendingItem: { width: '50%', flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingVertical: Spacing.sm, paddingRight: Spacing.sm },
  trendingItemText: { fontSize: FontSize.sm, color: Colors.textPrimary, flex: 1, lineHeight: 18 },

  bestSellersScroll: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.md },

  skeletonGrid: { padding: Spacing.lg, paddingTop: Spacing.sm, gap: Spacing.md },
  skeletonRow: { flexDirection: 'row', gap: Spacing.md },

  collectionBanner: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    minHeight: 160,
    justifyContent: 'center',
  },
  collectionContent: { padding: Spacing.lg, gap: Spacing.sm },
  collectionLabel: { fontSize: FontSize.xs, fontFamily: PoppinsFonts.bold, color: Colors.primary, letterSpacing: 1.5 },
  collectionHeading: { fontSize: FontSize['2xl'], fontFamily: PoppinsFonts.extrabold, color: Colors.textPrimary, lineHeight: 28 },
  collectionSub: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  collectionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  collectionBtnText: { fontSize: FontSize.xs, fontFamily: PoppinsFonts.bold, color: Colors.textInverse, letterSpacing: 0.8 },
});
