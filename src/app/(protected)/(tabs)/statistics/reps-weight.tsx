import {
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { StatisticsDataPoint } from "@/constants/type";
import MultiLineChartComponent from "@/components/MultiLineChartComponent";
import { useAuth } from "../../../../context/auth";
import { useRouter } from "expo-router";
import { BASE_URL } from "@/constants/constants";
import showToast from "@/utils/toast";

import ExercisePickerSingleModal from "@/components/ExercisePickerSingleModal";

const RepsWeight = () => {
  const [selectedExercise, setSelectedExercise] = React.useState<null | {
    id: number;
    name: string;
  }>(null);
  const [repsWeightData, setRepsWeightData] = React.useState<
    StatisticsDataPoint[][]
  >([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();
  const [isExerciseModalVisible, setExerciseModalVisible] =
    React.useState(false);

  const cache = React.useRef<Map<string, StatisticsDataPoint[][]>>(new Map());

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  React.useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (!user) return;
      if (!selectedExercise) return;

      const cacheKey = selectedExercise.id.toString();
      const cached = cache.current.get(cacheKey);
      const hasCached = cached !== undefined;

      if (hasCached) {
        setRepsWeightData(cached);
      } else {
        setIsFetching(true);
      }

      try {
        const response = await fetchWithAuth(
          `${BASE_URL}/api/statistics/reps-weight?exerciseId=${selectedExercise.id}`,
          { method: "GET" },
        );

        if (response.ok) {
          const data = await response.json();
          cache.current.set(cacheKey, data);
          if (!ignore) setRepsWeightData(data);
        } else {
          throw new Error();
        }
      } catch (error) {
        if (!ignore && error instanceof Error && !hasCached) {
          showToast(
            "errorToast",
            "Cannot load reps-weight statistics. Check your internet connection.",
          );
        }
      } finally {
        if (!ignore) setIsFetching(false);
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [fetchWithAuth, user, selectedExercise]);

  const handleConfirmExercise = React.useCallback(
    (chosenExercise: { id: number; name: string }) => {
      setSelectedExercise(chosenExercise);
      setExerciseModalVisible(false);
    },
    [],
  );

  const hasData =
    repsWeightData.length > 0 && repsWeightData.some((line) => line.length > 0);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row justify-between items-center mb-6">
          <View>
            <Text className="font-sans-bold text-2xl text-text-primary">
              Reps & Weight (kgs)
            </Text>
            <Text className="font-sans-regular text-sm text-text-secondary mb-3">
              Estimated 1RM per set over time
            </Text>
          </View>
          <View>
            <Pressable
              onPress={() => setExerciseModalVisible(true)}
              className="bg-white px-4 py-2 rounded-full"
            >
              <Text className="font-sans-semibold text-lg">
                Select exercise
              </Text>
            </Pressable>
          </View>
        </View>

        {!selectedExercise && (
          <View className="flex items-center justify-center pt-20">
            <Text className="font-sans-regular text-lg text-text-secondary">
              Select one exercise to continue
            </Text>
          </View>
        )}

        {selectedExercise && isFetching && (
          <View className="flex-1 items-center justify-center pt-20 bg-background">
            <ActivityIndicator size="small" color="#ffffff" />
            <Text className="mt-3 font-sans-regular text-sm text-text-secondary">
              Fetching reps & weight for {selectedExercise.name}...
            </Text>
          </View>
        )}

        {selectedExercise && !isFetching && !hasData && (
          <View className="flex items-center justify-center pt-20">
            <Text className="font-sans-regular text-2xl text-text-secondary">
              No data found
            </Text>
          </View>
        )}

        {selectedExercise && !isFetching && hasData && (
          <>
            <Text className="mb-3 font-sans-regular text-sm text-text-secondary">
              Showing data for {selectedExercise.name}
            </Text>
            <MultiLineChartComponent data={repsWeightData} unit="kgs" />
          </>
        )}

        <ExercisePickerSingleModal
          visible={isExerciseModalVisible}
          onClose={() => setExerciseModalVisible(false)}
          onSelectExercise={handleConfirmExercise}
        />
      </ScrollView>
    </View>
  );
};

export default RepsWeight;
