export const BACKEND_URL = 'https://jawhara-backend.onrender.com';
const BASE_URL = `${BACKEND_URL}/api`;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}, timeoutMs = 10000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, signal: controller.signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return res.json();
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export interface OnboardingSlide {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  active: boolean;
}

export interface BrandingAsset {
  _id: string;
  slot: 'logo' | 'favicon' | 'splash';
  imageUrl: string;
  active: boolean;
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string };
}

interface RawAuthResponse {
  success: boolean;
  token: string;
  data: { _id: string; email: string; name: string };
}

function mapAuthResponse(raw: RawAuthResponse): AuthResponse {
  return {
    token: raw.token,
    user: { id: raw.data._id, email: raw.data.email, name: raw.data.name },
  };
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  badge?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  nextDayDelivery?: boolean;
  arrivesBy?: string;
  // Rich filter fields — optional until backend exposes them
  material?: string;
  metal?: string;
  productType?: string;
  occasion?: string | string[];
  gemstone?: string | string[];
  shopFor?: string;
  giftTag?: string;
  weightRange?: string;
  ringSize?: string;
  ringStyle?: string;
  earringType?: string;
  backType?: string;
  necklaceType?: string;
  chainLength?: string;
  braceletType?: string;
  braceletSize?: string;
  collection?: string | string[];
  // Full product record fields — present on the live API but previously
  // undeclared here, so the app fell back to weaker derived/generic values.
  description?: string;
  brand?: string;
  designCode?: string;
  weight?: number;
  metalKt?: string;
  stone?: string;
  stones?: string[];
  diamondClarity?: string;
  diamondColor?: string;
  diamondCt?: number;
  sizes?: string[];
  certified?: boolean;
}

interface DashboardAsset {
  _id: string;
  screen: string;
  slot: string;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
  ctaLink?: string;
  order?: number;
  active?: boolean;
  productId?: string;
}

export interface LimitedTimeOfferConfig {
  title: string;
  subtitle?: string;
  ctaLink?: string;
  imageUrl?: string;
}

export interface ActiveOffer {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  discount?: number;
  ctaLink?: string;
  expiresAt?: string;
  active: boolean;
  products: Product[];
}

export interface LocationResult {
  _id: string;
  name: string;
  country: string;
}

/** Shape returned by /users/cart — a Product with the logged-in user's quantity merged in. */
export type CartApiRow = Product & { quantity: number };

export interface Store {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  services: string[];
  country: string;
  region: string;
  mapLink?: string;
}

// Shown when the /locations endpoint is not yet available
const UAE_CITIES: LocationResult[] = [
  { _id: '1', name: 'Dubai',           country: 'UAE' },
  { _id: '2', name: 'Abu Dhabi',       country: 'UAE' },
  { _id: '3', name: 'Sharjah',         country: 'UAE' },
  { _id: '4', name: 'Ajman',           country: 'UAE' },
  { _id: '5', name: 'Ras Al Khaimah',  country: 'UAE' },
  { _id: '6', name: 'Fujairah',        country: 'UAE' },
  { _id: '7', name: 'Umm Al Quwain',   country: 'UAE' },
  { _id: '8', name: 'Al Ain',          country: 'UAE' },
];

// ── Mobile category items (Women / Kids) ──────────────────────────────────────

export interface MobileCategory {
  _id: string;
  title: string;
  imageUrl: string | null;
  /** Navigation target e.g. "category/rings" */
  ctaLink: string;
  /** "women" | "kids" — maps to the slot field from /mobile-assets/category */
  slot: string;
  order: number;
}

// ── Shop-by-category grid ─────────────────────────────────────────────────────

export interface ShopCategoryItem {
  _id: string;
  title: string;
  /** Badge label e.g. "18KT GOLD" — maps to DashboardAsset.subtitle */
  badge?: string;
  imageUrl: string | null;
  /** Navigation target e.g. "/category/gold-rings" */
  ctaLink?: string;
  order: number;
}

export interface ShopCategorySection {
  /** Configurable heading e.g. "Diamonds Starting At ₹500" */
  title: string;
  items: ShopCategoryItem[];
}

export interface Review {
  _id: string;
  userName: string;
  userInitial: string;
  location: string;
  rating: number;
  verified: boolean;
  text: string;
  createdAt: string;
  product: { _id: string; name: string; images: string[] } | null;
}

export interface GiftingItem {
  _id: string;
  title: string;
  imageUrl: string | null;
  ctaLink: string;
  order: number;
}

export interface BannerSlide {
  _id: string;
  imageUrl: string;
  ctaLink?: string;
  order: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string | null;
}

export const api = {
  login: (email: string, password: string) =>
    request<RawAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then(mapAuthResponse),

  register: (name: string, email: string, password: string) =>
    request<RawAuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }).then(mapAuthResponse),

  googleLogin: (accessToken: string) =>
    request<RawAuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    }).then(mapAuthResponse),

  getDashboard: async (): Promise<{ categories: Category[]; banners: BannerSlide[]; limitedTimeOffers: LimitedTimeOfferConfig | null }> => {
    const res = await request<{ success: boolean; data: DashboardAsset[] }>('/mobile-assets/dashboard');
    const assets = res.data ?? [];
    const categories = assets
      .filter(a => a.slot === 'categories' && a.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(a => ({
        _id: a._id,
        name: a.title,
        slug: a.title.toLowerCase(),
        icon: '',
        imageUrl: a.imageUrl ?? null,
      }));
    const banners = assets
      .filter(a => a.slot === 'banner_slider' && a.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(a => ({
        _id: a._id,
        imageUrl: a.imageUrl ?? '',
        ctaLink: a.ctaLink,
        order: a.order ?? 0,
      }));
    const ltoAsset = assets
      .filter(a => a.slot === 'offers' && a.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
    const limitedTimeOffers: LimitedTimeOfferConfig | null = ltoAsset
      ? {
          title: ltoAsset.title,
          subtitle: ltoAsset.subtitle,
          ctaLink: ltoAsset.ctaLink,
          imageUrl: ltoAsset.imageUrl,
        }
      : null;
    return { categories, banners, limitedTimeOffers };
  },

  getCartBanner: async (): Promise<BannerSlide | null> => {
    try {
      const res = await request<{ success: boolean; data: DashboardAsset[] }>('/mobile-assets/cart');
      const banner = (res.data ?? [])
        .filter(a => a.active !== false && !!a.imageUrl)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
      return banner
        ? { _id: banner._id, imageUrl: banner.imageUrl ?? '', ctaLink: banner.ctaLink, order: banner.order ?? 0 }
        : null;
    } catch {
      return null;
    }
  },

  getActiveOffer: async (): Promise<ActiveOffer | null> => {
    try {
      const res = await request<{ success: boolean; data: ActiveOffer }>('/offers/active');
      return res.data ?? null;
    } catch {
      return null;
    }
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await request<{ success: boolean; data: DashboardAsset[] }>('/mobile-assets/dashboard');
    const cats = (res.data ?? [])
      .filter(a => a.slot === 'categories' && a.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return cats.map(a => ({
      _id: a._id,
      name: a.title,
      slug: a.title.toLowerCase(),
      icon: '',
      imageUrl: a.imageUrl ?? null,
    }));
  },

  getProducts: (params: { category?: string; brand?: string; badge?: string; flags?: string; nextDayDelivery?: boolean; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.brand) qs.set('brand', params.brand);
    if (params.badge) qs.set('badge', params.badge);
    if (params.flags) qs.set('flags', params.flags);
    if (params.nextDayDelivery) qs.set('nextDayDelivery', 'true');
    qs.set('page', String(params.page ?? 1));
    qs.set('limit', String(params.limit ?? 20));
    return request<{ success: boolean; data: Product[]; total: number; page: number; pages: number }>(
      `/products?${qs.toString()}`
    );
  },

  getProduct: (id: string): Promise<Product> =>
    request<{ success: boolean; data: Product }>(`/products/${id}`).then(r => r.data),

  getShopCategories: async (): Promise<ShopCategorySection | null> => {
    try {
      const res = await request<{ success: boolean; data: DashboardAsset[] }>('/mobile-assets/dashboard');
      const assets = res.data ?? [];

      // Section title: configurable via slot='collections_header', else default
      const headerAsset = assets.find(
        a => a.slot === 'collections_header' && a.active !== false,
      );
      const sectionTitle = headerAsset?.title ?? 'Diamonds starting at ₹ 1000';

      // Collection cards — slot='collections', badge comes from asset.badge field
      const items: ShopCategoryItem[] = assets
        .filter(a => a.slot === 'collections' && a.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(a => ({
          _id: a._id,
          title: a.title,
          badge: a.badge || undefined,
          imageUrl: a.imageUrl ?? null,
          ctaLink: a.ctaLink ?? undefined,
          order: a.order ?? 0,
        }));

      if (items.length === 0) return null;
      return { title: sectionTitle, items };
    } catch {
      return null;
    }
  },

  getGiftingItems: async (): Promise<GiftingItem[]> => {
    try {
      const res = await request<{ success: boolean; data: DashboardAsset[] }>('/mobile-assets/dashboard');
      return (res.data ?? [])
        .filter(a => a.slot === 'gifting' && a.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(a => ({
          _id: a._id,
          title: a.title,
          imageUrl: a.imageUrl ?? null,
          ctaLink: a.ctaLink ?? '',
          order: a.order ?? 0,
        }));
    } catch {
      return [];
    }
  },

  getWishlist: async (): Promise<Product[]> => {
    const res = await request<{ success: boolean; data: Product[] }>('/users/wishlist');
    return res.data ?? [];
  },

  addWishlistItem: (productId: string) =>
    request<{ success: boolean; data: string[] }>('/users/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  removeWishlistItem: (productId: string) =>
    request<{ success: boolean; data: string[] }>(`/users/wishlist/${productId}`, {
      method: 'DELETE',
    }),

  getCart: async (): Promise<CartApiRow[]> => {
    const res = await request<{ success: boolean; data: CartApiRow[] }>('/users/cart');
    return res.data ?? [];
  },

  addCartItem: (productId: string, quantity: number) =>
    request<{ success: boolean; data: CartApiRow[] }>('/users/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  updateCartItemQuantity: (productId: string, quantity: number) =>
    request<{ success: boolean; data: CartApiRow[] }>(`/users/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeCartItem: (productId: string) =>
    request<{ success: boolean; data: CartApiRow[] }>(`/users/cart/${productId}`, {
      method: 'DELETE',
    }),

  getStores: async (): Promise<Store[]> => {
    try {
      const res = await request<{ success: boolean; data: Store[] }>('/stores');
      return res.data ?? [];
    } catch {
      return [];
    }
  },

  getLocations: async (): Promise<LocationResult[]> => {
    try {
      const res = await request<{ success: boolean; data: LocationResult[] }>('/locations');
      if (res.data?.length) return res.data;
      return UAE_CITIES;
    } catch {
      return UAE_CITIES;
    }
  },

  getMostLovedProducts: async (): Promise<Product[]> => {
    const res = await request<{ success: boolean; data: DashboardAsset[] }>('/mobile-assets/dashboard');
    const assets = (res.data ?? [])
      .filter(a => a.slot === 'most_loved' && a.active !== false && !!a.productId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (assets.length === 0) return [];

    const results = await Promise.all(
      assets.map(a =>
        request<{ success: boolean; data: Product }>(`/products/${a.productId}`)
          .then(r => r.data)
          .catch(() => null)
      )
    );

    return results.filter((p): p is Product => p !== null);
  },

  getIconicCollections: async (): Promise<{ id: string; title: string; imageUrl: string | null; ctaLink: string }[]> => {
    try {
      const res = await request<{ success: boolean; data: DashboardAsset[] }>('/mobile-assets/dashboard');
      return (res.data ?? [])
        .filter(a => a.slot === 'iconic' && a.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(a => ({
          id: a._id,
          title: a.title,
          imageUrl: a.imageUrl ?? null,
          ctaLink: a.ctaLink ?? '',
        }));
    } catch {
      return [];
    }
  },

  getRecentReviews: async (limit = 5): Promise<Review[]> => {
    try {
      const res = await request<{ success: boolean; data: Review[] }>(
        `/reviews?limit=${limit}&sort=recent`
      );
      return res.data ?? [];
    } catch {
      return [];
    }
  },

  getDiamondBestSellers: async (): Promise<{ id: string; title: string; imageUrl: string | null; ctaLink: string }[]> => {
    try {
      const res = await request<{ success: boolean; data: DashboardAsset[] }>('/mobile-assets/dashboard');
      return (res.data ?? [])
        .filter(a => a.slot === 'best_sellers' && a.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(a => ({
          id: a._id,
          title: a.title,
          imageUrl: a.imageUrl ?? null,
          ctaLink: a.ctaLink ?? '',
        }));
    } catch {
      return [];
    }
  },

  getMoodboard: async (): Promise<{ id: string; title: string; imageUrl: string | null; ctaLink: string }[]> => {
    try {
      const res = await request<{ success: boolean; data: DashboardAsset[] }>('/mobile-assets/dashboard');
      return (res.data ?? [])
        .filter(a => a.slot === 'moodboard' && a.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(a => ({
          id: a._id,
          title: a.title,
          imageUrl: a.imageUrl ?? null,
          ctaLink: a.ctaLink ?? '',
        }));
    } catch {
      return [];
    }
  },

  getCategoryItems: async (): Promise<{ women: MobileCategory[]; kids: MobileCategory[] }> => {
    try {
      const res = await request<{ success: boolean; data: DashboardAsset[] }>('/mobile-assets/category');
      const items = (res.data ?? []).filter(a => a.active !== false);
      const toCategory = (a: DashboardAsset): MobileCategory => ({
        _id: a._id,
        title: a.title,
        imageUrl: a.imageUrl ?? null,
        ctaLink: a.ctaLink ?? '',
        slot: a.slot,
        order: a.order ?? 0,
      });
      const women = items
        .filter(a => a.slot === 'women')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(toCategory);
      const kids = items
        .filter(a => a.slot === 'kids')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(toCategory);
      return { women, kids };
    } catch {
      return { women: [], kids: [] };
    }
  },

  getTrending: async (): Promise<{ id: string; title: string; subtitle: string; image?: string }[]> => {
    try {
      const res = await request<{ success: boolean; data: DashboardAsset[] }>('/mobile-assets/dashboard');
      return (res.data ?? [])
        .filter(a => a.slot === 'trending' && a.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(a => ({
          id: a._id,
          title: a.title,
          subtitle: a.subtitle ?? '',
          image: a.imageUrl,
          ctaLink: a.ctaLink ?? '',
        }));
    } catch {
      return [];
    }
  },

  getOnboardingSlides: () =>
    request<{ success: boolean; data: OnboardingSlide[] }>(
      '/mobile-assets/onboarding'
    ).then(res => res.data.filter(s => s.active).sort((a, b) => a.order - b.order)),

  getBranding: () =>
    request<{ success: boolean; data: BrandingAsset[] }>(
      '/mobile-assets/branding'
    ).then(res => res.data.filter(a => a.active)),
};
