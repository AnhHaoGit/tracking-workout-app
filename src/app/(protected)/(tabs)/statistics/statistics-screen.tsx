import React from "react";
import { View, Text, Pressable} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useRouter, Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useAuth } from "@/context/auth";
import { useWorkoutSessions } from "@/context/workout-sessions";
import WeeklyStreak from "@/components/WeeklyStreak";
import PullToRefreshComponent from "@/components/PullToRefreshComponent";

const SafeAreaView = styled(RNSafeAreaView);

const NAV_ITEMS = [
  {
    key: "volume",
    title: "Volume",
    subtitle: "Total weight lifted over time",
    icon: "chart.bar.fill",
    route: "/(protected)/(tabs)/(statistics)/volume",
  },
  {
    key: "duration",
    title: "Duration",
    subtitle: "How long your sessions last",
    icon: "clock.fill",
    route: "/(protected)/(tabs)/(statistics)/duration",
  },
  {
    key: "reps-weight",
    title: "Reps vs Weight",
    subtitle: "Relationship between load and reps",
    icon: "scalemass.fill",
    route: "/(protected)/(tabs)/(statistics)/reps-weight",
  },
  {
    key: "reps",
    title: "Reps",
    subtitle: "Total reps completed over time",
    icon: "number",
    route: "/(protected)/(tabs)/(statistics)/reps",
  },
] as const;

const StatisticsScreen = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { workoutSessions } = useWorkoutSessions();

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <PullToRefreshComponent>
        <Text className="mb-5 font-sans-bold text-3xl text-text-primary">
          Statistics
        </Text>

        {/* Weekly streak bar */}
        <WeeklyStreak workoutSessions={workoutSessions} />

        {/* Navigation cards */}
        <Text className="mb-3 font-sans-semibold text-lg text-text-primary">
          Breakdown
        </Text>

        {NAV_ITEMS.map((item) => (
          <Link
            href={`/(protected)/(tabs)/statistics/${item.key}`}
            asChild
            key={item.key}
            className="mb-3 flex-row items-center gap-3 rounded-3xl border-2 border-primary bg-background/80 p-4"
          >
            <Pressable>
              <View className="h-11 w-11 items-center justify-center rounded-full border border-primary bg-primary/10">
                <SymbolView name={item.icon} tintColor="#ffffff" size={20} />
              </View>

              <View className="flex-1">
                <Text className="font-sans-semibold text-base text-text-primary">
                  {item.title}
                </Text>
                <Text className="font-sans-regular text-sm text-text-secondary">
                  {item.subtitle}
                </Text>
              </View>

              <SymbolView
                name="chevron.right"
                tintColor="#7A7A7A"
                size={14}
                weight="bold"
              />
            </Pressable>
          </Link>
        ))}
      </PullToRefreshComponent>
    </SafeAreaView>
  );
};

export default StatisticsScreen;
