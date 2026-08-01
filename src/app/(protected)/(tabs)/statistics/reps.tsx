import {
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { StatisticsDataPoint } from "@/constants/type";
import LineChartComponent from "@/components/LineChartComponent";
import { useAuth } from "../../../../context/auth";
import { useRouter } from "expo-router";
import { BASE_URL } from "@/constants/constants";
import showToast from "@/utils/toast";

import ExercisePickerSingleModal from "@/components/ExercisePickerSingleModal";

const Reps = () => {
  const [selectedExercise, setSelectedExercise] = React.useState<null | {
    id: number;
    name: string;
  }>(null);
  const [repsData, setRepsData] = React.useState<StatisticsDataPoint[]>([]);
  const [isFetchingReps, setIsFetchingReps] = React.useState(false);
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();
  const [isExerciseModalVisible, setExerciseModalVisible] =
    React.useState(false);

  const repsCache = React.useRef<Map<string, StatisticsDataPoint[]>>(new Map());

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  React.useEffect(() => {
    const fetchRepsData = async () => {
      if (!user) return;
      if (!selectedExercise) return;

      const cacheKey = selectedExercise.id.toString();
      const cached = repsCache.current.get(cacheKey);
      const hasCached = cached !== undefined;

      if (hasCached) {
        setRepsData(cached);
      } else {
        setIsFetchingReps(true);
      }

      try {
        const response = await fetchWithAuth(
          `${BASE_URL}/api/statistics/reps?exerciseId=${selectedExercise.id}`,
          { method: "GET" },
        );

        if (response.ok) {
          const data = await response.json();
          repsCache.current.set(cacheKey, data);
          setRepsData(data);
        } else {
          throw new Error();
        }
      } catch (error) {
        if (error instanceof Error && !hasCached) {
          showToast(
            "errorToast",
            "Cannot load reps statistics. Check your internet connection.",
          );
        }
      } finally {
        setIsFetchingReps(false);
      }
    };

    fetchRepsData();
  }, [fetchWithAuth, user, selectedExercise]);

  const handleConfirmExercise = React.useCallback(
    (chosenExercise: { id: number; name: string }) => {
      setSelectedExercise(chosenExercise);
      setExerciseModalVisible(false);
    },
    [],
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row justify-between items-center mb-6">
          <View>
            <Text className="font-sans-bold text-3xl text-text-primary">
              Reps
            </Text>
            <Text className="font-sans-regular text-sm text-text-secondary mb-3">
              Total reps completed over time
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

        {selectedExercise && isFetchingReps && (
          <View className="flex-1 items-center justify-center pt-20 bg-background">
            <ActivityIndicator size="small" color="#ffffff" />
            <Text className="mt-3 font-sans-regular text-sm text-text-secondary">
              Fetching reps for {selectedExercise.name}...
            </Text>
          </View>
        )}

        {selectedExercise && !isFetchingReps && repsData.length === 0 && (
          <View className="flex items-center justify-center pt-20">
            <Text className="font-sans-regular text-2xl text-text-secondary">
              No data found
            </Text>
          </View>
        )}

        {selectedExercise && !isFetchingReps && repsData.length !== 0 && (
          <>
            <Text className="mb-3 font-sans-regular text-sm text-text-secondary">
              Showing data for {selectedExercise.name}
            </Text>
            <LineChartComponent data={repsData} unit="reps" />
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

export default Reps;
