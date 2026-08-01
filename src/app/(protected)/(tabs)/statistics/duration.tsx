import LineChartComponent from "@/components/LineChartComponent";
import { BASE_URL } from "@/constants/constants";
import { StatisticsDataPoint } from "@/constants/type";
import showToast from "@/utils/toast";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../../../context/auth";

const suggestedNames = [
  "Pull Day",
  "Push Day",
  "Leg Day",
  "Chest Day",
  "Back Day",
  "Arm Day",
  "Shoulder Day",
  "Core Day",
  "Glute Day",
  "Stretching",
  "Cardio",
  "Upper Body",
  "Lower Body",
  "Full Body",
  "Mobility",
  "PR Attempt",
];

const Duration = () => {
  const [selectedName, setSelectedName] = React.useState("Pull Day");
  const [durationData, setDurationData] = React.useState<StatisticsDataPoint[]>(
    [],
  );
  const [isFetchingDuration, setIsFetchingDuration] = React.useState(false);
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();

  // cache dữ liệu theo tên bài tập
  const durationCache = React.useRef<Map<string, StatisticsDataPoint[]>>(
    new Map(),
  );

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  React.useEffect(() => {
    let isCancelled = false;

    const fetchDurationData = async () => {
      if (!user || isCancelled) return;

      const cached = durationCache.current.get(selectedName);
      const hasCached = cached !== undefined;

      if (hasCached) {
        setDurationData(cached);
      } else {
        setIsFetchingDuration(true);
      }

      try {
        const response = await fetchWithAuth(
          `${BASE_URL}/api/statistics/duration?name=${encodeURIComponent(selectedName)}`,
          { method: "GET" },
        );

        if (isCancelled) return;

        if (response.ok) {
          const data = await response.json();
          if (isCancelled) return;
          durationCache.current.set(selectedName, data);
          setDurationData(data);
        } else {
          throw new Error();
        }
      } catch (error) {
        if (!isCancelled && error instanceof Error && !hasCached) {
          showToast(
            "errorToast",
            "Cannot load duration statistics. Check your internet connection.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsFetchingDuration(false);
        }
      }
    };

    fetchDurationData();

    return () => {
      isCancelled = true;
    };
  }, [fetchWithAuth, user, selectedName]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-sans-bold text-3xl text-text-primary">
          Duration (mins)
        </Text>
        <Text className="font-sans-regular text-sm text-text-secondary mb-3">
          How long your sessions last
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-12"
        >
          {suggestedNames.map((name) => {
            const selected = name === selectedName;
            const disabled = isFetchingDuration && !selected;

            return (
              <Pressable
                key={name}
                disabled={disabled}
                onPress={() => setSelectedName(name)}
                className={`mr-2 rounded-full border-2 px-3 py-2 ${
                  selected
                    ? "border-accent-2 bg-accent-2"
                    : "border-primary bg-background"
                } ${disabled ? "opacity-40" : ""}`}
              >
                <Text
                  className={`font-sans-medium text-sm ${selected ? "text-background" : "text-text-primary"}`}
                >
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isFetchingDuration && (
          <View className="flex-1 items-center justify-center pt-20 bg-background">
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        )}

        {!isFetchingDuration && durationData.length === 0 && (
          <View className="flex items-center justify-center pt-20">
            <Text className="font-sans-regular text-2xl text-text-secondary">
              No data found
            </Text>
          </View>
        )}

        {!isFetchingDuration && durationData.length !== 0 && (
          <LineChartComponent data={durationData} unit="mins" />
        )}
      </ScrollView>
    </View>
  );
};

export default Duration;
