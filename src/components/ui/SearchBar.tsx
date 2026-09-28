import { SearchIcon } from "@/components/ui/icons";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  placeholder?: string;
  onPress?: () => void;
}

export function SearchBar({
  placeholder = 'Search for "Ring"',
  onPress,
}: SearchBarProps) {
  return (
    <TouchableOpacity
      style={styles.wrapper}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        editable={false}
        pointerEvents="none"
      />
      <View style={styles.btn}>
        <SearchIcon color="#FFFFFF" size={20} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    height: 39,
    fontSize: 14,
    backgroundColor: Colors.backgroundSearch,
    color: Colors.textPrimary,
  },
  btn: {
    width: 52,
    height: 38,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
