import {
  AccountIcon,
  AccountSelectedIcon,
  CategoriesIcon,
  CategoriesSelectedIcon,
  GiftIcon,
  GiftSelectedIcon,
  HomeIcon,
  HomeSelectedIcon,
  StoreIcon,
  StoreSelectedIcon,
} from "@/components/ui/icons";
import { Colors, PoppinsFonts } from "@/constants/theme";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabIcon({
  Icon,
  SelectedIcon,
  focused,
}: {
  Icon: React.ComponentType<{ color?: string; size?: number }>;
  SelectedIcon: React.ComponentType<{ size?: number }>;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      {focused ? <SelectedIcon size={22} /> : <Icon color={Colors.textPrimary} size={22} />}
    </View>
  );
}

const TAB_BAR_CONTENT_HEIGHT = 56;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textPrimary,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: PoppinsFonts.semibold,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={HomeIcon} SelectedIcon={HomeSelectedIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={CategoriesIcon} SelectedIcon={CategoriesSelectedIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="find-store"
        options={{
          title: "Find Store",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={StoreIcon} SelectedIcon={StoreSelectedIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="gifting"
        options={{
          title: "Gifting",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={GiftIcon} SelectedIcon={GiftSelectedIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={AccountIcon} SelectedIcon={AccountSelectedIcon} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
  },
});
