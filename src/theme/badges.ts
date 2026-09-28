export type BadgeVariant =
  | 'sale'
  | 'new'
  | 'trending'
  | 'best-seller'
  | 'most-loved'
  | 'featured'
  | 'exclusive'
  | 'limited'
  | 'discount'
  | 'delivery';

export interface BadgeToken {
  bg: string;
  text: string;
  defaultLabel: string;
  /** Render as a pill (full border-radius, heavier font) */
  pill?: boolean;
}

export const BadgeTokens: Record<BadgeVariant, BadgeToken> = {
  // ── Web app: .ui-badge--sale ──────────────────────────────────────────────
  sale: {
    bg: '#ffe1e1',
    text: '#b3261e',
    defaultLabel: 'SALE',
  },

  // ── Web app: .ui-badge--new ───────────────────────────────────────────────
  new: {
    bg: '#ddf7e8',
    text: '#0f7a4a',
    defaultLabel: 'NEW',
  },

  // ── Web app: .ui-badge default (gold/amber) ───────────────────────────────
  trending: {
    bg: '#f8e7b5',
    text: '#8a6a00',
    defaultLabel: 'TRENDING',
  },

  // ── Web app: .ui-badge default (gold/amber) ───────────────────────────────
  'best-seller': {
    bg: '#f8e7b5',
    text: '#8a6a00',
    defaultLabel: 'BEST SELLER',
  },

  // ── No direct web equivalent — brand mauve ───────────────────────────────
  'most-loved': {
    bg: '#FAE8F4',
    text: '#892E6C',
    defaultLabel: 'MOST LOVED',
  },

  // ── Web app: .ui-badge--default ───────────────────────────────────────────
  featured: {
    bg: '#f8f8f8',
    text: '#898989',
    defaultLabel: 'FEATURED',
  },

  // ── Web app: .ui-badge default (gold/amber) ───────────────────────────────
  exclusive: {
    bg: '#f8e7b5',
    text: '#8a6a00',
    defaultLabel: 'EXCLUSIVE',
  },

  // ── Web app: .ui-badge--limited ───────────────────────────────────────────
  limited: {
    bg: '#d41e3a',
    text: '#ffffff',
    defaultLabel: 'LIMITED EDITION',
  },

  // ── Same palette as "new" ─────────────────────────────────────────────────
  discount: {
    bg: '#ddf7e8',
    text: '#0f7a4a',
    defaultLabel: '',
  },

  // ── Soft blue — trust / service ──────────────────────────────────────────
  delivery: {
    bg: '#E8EFF8',
    text: '#265C8A',
    defaultLabel: 'NEXT DAY DELIVERY',
  },
};

// ── Shared badge shape/typography tokens ─────────────────────────────────────

export const BadgeStyle = {
  paddingHorizontalDefault: 8,   // Spacing.sm
  paddingVerticalDefault: 2,
  paddingHorizontalPill: 12,
  paddingVerticalPill: 5,
  borderRadiusDefault: 4,        // BorderRadius.sm
  borderRadiusPill: 9999,        // BorderRadius.full
  fontSize: 11,                  // FontSize.xs
  fontWeightDefault: '500' as const,   // medium
  fontWeightPill: '600' as const,      // semibold
  letterSpacing: 0.5,            // LetterSpacing.wide
} as const;
