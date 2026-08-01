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

const Volume = () => {
  const [selectedName, setSelectedName] = React.useState("Pull Day");
  const [volumeData, setVolumeData] = React.useState<StatisticsDataPoint[]>([]);
  const [isFetchingVolume, setIsFetchingVolume] = React.useState(false);
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();

  const volumeCache = React.useRef<Map<string, StatisticsDataPoint[]>>(
    new Map(),
  );

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  React.useEffect(() => {
    let isCancelled = false;

    const fetchVolumeData = async () => {
      if (!user || isCancelled) return;

      const cached = volumeCache.current.get(selectedName);
      const hasCached = cached !== undefined;

      if (hasCached) {
        setVolumeData(cached);
      } else {
        setIsFetchingVolume(true);
      }

      try {
        const response = await fetchWithAuth(
          `${BASE_URL}/api/statistics/volume?name=${encodeURIComponent(selectedName)}`,
          { method: "GET" },
        );

        if (isCancelled) return;

        if (response.ok) {
          const data = await response.json();
          if (isCancelled) return;
          volumeCache.current.set(selectedName, data);
          setVolumeData(data);
        } else {
          throw new Error();
        }
      } catch (error) {
        if (!isCancelled && error instanceof Error && !hasCached) {
          showToast(
            "errorToast",
            "Cannot load volume statistics. Check your internet connection.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsFetchingVolume(false);
        }
      }
    };

    fetchVolumeData();

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
          Volume (kgs)
        </Text>
        <Text className="font-sans-regular text-sm text-text-secondary mb-3">
          Total weight lifted over time
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-12"
        >
          {suggestedNames.map((name) => {
            const selected = name === selectedName;
            const disabled = isFetchingVolume && !selected;

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

        {isFetchingVolume && (
          <View className="flex-1 items-center justify-center pt-20 bg-background">
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        )}

        {!isFetchingVolume && volumeData.length === 0 && (
          <View className="flex items-center justify-center pt-20">
            <Text className="font-sans-regular text-2xl text-text-secondary">
              No data found
            </Text>
          </View>
        )}

        {!isFetchingVolume && volumeData.length !== 0 && (
          <LineChartComponent data={volumeData} unit="kgs" />
        )}
      </ScrollView>
    </View>
  );
};

export default Volume;
