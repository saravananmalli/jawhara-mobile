export const Colors = {
  primary: "#967123",
  primaryHover: "#B39650",
  primaryLight: "#E8DCC8",
  primaryDark: "#8B7355",
  primaryButton: "#967123",
  secondaryButton: "#F5EFE6",

  secondary: "#967123",
  secondaryLight: "#967123",

  background: "#FFFFFF",
  backgroundSearch: "#FFFBF7",
  iconfill: "#FFFBF7",
  backgroundCream: "#FAF7F2",
  cardBackground: "#F5EFE6",
  offWhite: "#FAFAFA",
  bgGray: "#F8F8F8",
  dividerGray: "#E8E8E8",

  textPrimary: "#4A4A4A",
  textSecondary: "#6B6B6B",
  textLight: "#9B9B9B",
  textInverse: "#FFFFFF",

  border: "#E8E8E8",
  borderGray: "#D1D1D1",
  borderYellow: "#FBDEBA",

  error: "#D41E3A",
  success: "#7A9B8E",
  warning: "#F5A623",
  info: "#2196F3",
  rating: "#3CB371",
  priceDiscount: "#008042",

  goldLight: "#E8DCC8",
  starGold: "#FFD700",

  tabActive: "#C4A960",
  tabInactive: "#9B9B9B",

  light: {
    text: "#4A4A4A",
    background: "#FFFFFF",
    backgroundElement: "#F5EFE6",
    backgroundSelected: "#E8DCC8",
    textSecondary: "#6B6B6B",
  },
  dark: {
    text: "#4A4A4A",
    background: "#FFFFFF",
    backgroundElement: "#F5EFE6",
    backgroundSelected: "#E8DCC8",
    textSecondary: "#6B6B6B",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
