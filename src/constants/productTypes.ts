// ── Product Type / Style taxonomy ───────────────────────────────────────────
//
// Single source of truth for how a jewelry "Product Type" (Ring, Necklace,
// Earring, Bracelet, ...) maps to its "Style" sub-options (e.g. Ring Styles:
// Engagement Ring, Solitaire Ring, ...). Used by FilterSheet to build the
// Product Type / Style filters dynamically, and by the product listing
// screen to infer a product's type/style from its category and name.

export interface FilterOption {
  key: string;
  label: string;
}

export interface StyleOption extends FilterOption {
  matchKeywords: string[];
}

export interface ProductTypeDef {
  key: string;
  label: string;
  styleLabel: string;
  matchKeywords: string[];
  styles: StyleOption[];
}

export const PRODUCT_TYPES: ProductTypeDef[] = [
  {
    key: "ring",
    label: "Rings",
    styleLabel: "Ring Styles",
    matchKeywords: ["ring"],
    styles: [
      { key: "engagement_ring", label: "Engagement Ring", matchKeywords: ["engagement"] },
      { key: "solitaire_ring", label: "Solitaire Ring", matchKeywords: ["solitaire"] },
      { key: "halo_ring", label: "Halo Ring", matchKeywords: ["halo"] },
      { key: "cocktail_ring", label: "Cocktail Ring", matchKeywords: ["cocktail"] },
      { key: "wedding_band", label: "Wedding Band", matchKeywords: ["wedding", "band"] },
      { key: "stackable_ring", label: "Stackable Ring", matchKeywords: ["stackable", "stack"] },
    ],
  },
  {
    key: "earring",
    label: "Earrings",
    styleLabel: "Earring Styles",
    matchKeywords: ["earring", "ear cuff"],
    styles: [
      { key: "stud_earrings", label: "Stud Earrings", matchKeywords: ["stud"] },
      { key: "hoop_earrings", label: "Hoop Earrings", matchKeywords: ["hoop"] },
      { key: "drop_earrings", label: "Drop Earrings", matchKeywords: ["drop"] },
      { key: "huggie_earrings", label: "Huggie Earrings", matchKeywords: ["huggie"] },
      { key: "ear_cuffs", label: "Ear Cuffs", matchKeywords: ["ear cuff"] },
    ],
  },
  {
    key: "necklace",
    label: "Necklaces",
    styleLabel: "Necklace Styles",
    matchKeywords: ["necklace"],
    styles: [
      { key: "pendant_necklace", label: "Pendant Necklace", matchKeywords: ["pendant"] },
      { key: "chain_necklace", label: "Chain Necklace", matchKeywords: ["chain"] },
      { key: "choker", label: "Choker", matchKeywords: ["choker"] },
      { key: "layered_necklace", label: "Layered Necklace", matchKeywords: ["layered", "layer"] },
      { key: "tennis_necklace", label: "Tennis Necklace", matchKeywords: ["tennis"] },
    ],
  },
  { key: "pendant", label: "Pendants", styleLabel: "Pendant Styles", matchKeywords: ["pendant"], styles: [] },
  {
    key: "bracelet",
    label: "Bracelets",
    styleLabel: "Bracelet Styles",
    matchKeywords: ["bracelet"],
    styles: [
      { key: "tennis_bracelet", label: "Tennis Bracelet", matchKeywords: ["tennis"] },
      { key: "bangle_bracelet", label: "Bangle", matchKeywords: ["bangle"] },
      { key: "charm_bracelet", label: "Charm Bracelet", matchKeywords: ["charm"] },
      { key: "cuff_bracelet", label: "Cuff Bracelet", matchKeywords: ["cuff"] },
      { key: "link_bracelet", label: "Link Bracelet", matchKeywords: ["link", "chain"] },
    ],
  },
  { key: "bangle", label: "Bangles", styleLabel: "Bangle Styles", matchKeywords: ["bangle"], styles: [] },
  { key: "chain", label: "Chains", styleLabel: "Chain Styles", matchKeywords: ["chain"], styles: [] },
  { key: "charm", label: "Charms", styleLabel: "Charm Styles", matchKeywords: ["charm"], styles: [] },
  { key: "brooch", label: "Brooches", styleLabel: "Brooch Styles", matchKeywords: ["brooch"], styles: [] },
  { key: "nose_pin", label: "Nose Pins", styleLabel: "Nose Pin Styles", matchKeywords: ["nose pin", "nosepin", "nath"], styles: [] },
  { key: "mangalsutra", label: "Mangalsutra", styleLabel: "Mangalsutra Styles", matchKeywords: ["mangalsutra", "mangal sutra"], styles: [] },
  { key: "anklet", label: "Anklets", styleLabel: "Anklet Styles", matchKeywords: ["anklet"], styles: [] },
];

// Matches against clean category strings (e.g. "Rings", "Earrings"), not free
// text — uses a prefix check rather than `includes` so "ring" doesn't
// falsely match inside "earring".
export function matchProductType(categoryOrText: string): ProductTypeDef | undefined {
  const text = categoryOrText.trim().toLowerCase();
  return PRODUCT_TYPES.find((pt) => pt.matchKeywords.some((kw) => text.startsWith(kw)));
}

export function getProductTypeByKey(key: string): ProductTypeDef | undefined {
  return PRODUCT_TYPES.find((pt) => pt.key === key);
}

export function slugifyCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
