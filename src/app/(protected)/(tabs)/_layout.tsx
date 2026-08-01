import { View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tabs } from "@/constants/constants";
import { colors, components } from "@/constants/theme";
import { SymbolView } from "expo-symbols";
import { clsx } from "clsx";

const tabBar = components.tabBar;

const TabIcon = ({ focused, symbol }: TabIconProps) => {
  return (
    <View className="tabs-icon">
      <View className={clsx("tabs-pill", focused && "tabs-active")}>
        <SymbolView
          name={symbol}
          tintColor={focused ? colors.iconColor : colors.textPrimary}
          weight="bold"
        />
      </View>
    </View>
  );
};

const TabLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          elevation: 0,
          borderWidth: 1,
          borderTopWidth: 1,
          borderColor: "#FF9100",
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
          marginTop: tabBar.itemPaddingVertical,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} symbol={tab.symbol} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
