import { EXERCISES } from "@/constants/exercises";
import { useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const ExerciseDetailScreen = () => {
  const params = useLocalSearchParams<{ exerciseId?: string }>();
  const exerciseId =
    typeof params.exerciseId === "string"
      ? params.exerciseId
      : Array.isArray(params.exerciseId)
        ? params.exerciseId[0]
        : "unknown";

  const exercise = EXERCISES.find((item) => String(item.id) === exerciseId);

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-4">
        <Text className="font-sans-bold text-2xl text-text-primary">
          Exercise not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
      <ScrollView
        className="flex-1 px-4 py-4 bg-background"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="rounded-3xl border border-primary bg-background/90 p-4">
          <View className="mb-4 overflow-hidden rounded-2xl border border-primary bg-background">
            <Image
              source={{ uri: exercise.gif }}
              className="h-56 w-full"
              resizeMode="cover"
            />
          </View>

          <Text className="font-sans-bold text-3xl text-text-primary">
            {exercise.name}
          </Text>
          <Text className="mt-2 font-sans-medium text-base text-text-secondary">
            {exercise.type} • {exercise.difficulty}
          </Text>

          <View className="mt-4 flex-row flex-wrap">
            <View className="mr-2 mb-2 rounded-full border border-accent-2 px-3 py-2">
              <Text className="font-sans-semibold text-sm text-accent-2">
                Target: {exercise.targetMuscle}
              </Text>
            </View>
            <View className="mr-2 mb-2 rounded-full border border-primary px-3 py-2">
              <Text className="font-sans-semibold text-sm text-text-primary">
                Log: {exercise.logType}
              </Text>
            </View>
          </View>

          <View className="mt-4">
            <Text className="mb-2 font-sans-semibold text-lg text-text-primary">
              Secondary muscles
            </Text>
            <Text className="font-sans-regular text-base text-text-secondary">
              {exercise.secondaryMuscles.join(", ") || "None"}
            </Text>
          </View>

          <View className="mt-4">
            <Text className="mb-2 font-sans-semibold text-lg text-text-primary">
              Equipment
            </Text>
            <Text className="font-sans-regular text-base text-text-secondary">
              {exercise.equipment.join(", ") || "None"}
            </Text>
          </View>

          <View className="mt-4">
            <Text className="mb-2 font-sans-semibold text-lg text-text-primary">
              Instructions
            </Text>
            {exercise.instruction.map((step, index) => (
              <Text
                key={`${exercise.id}-${index}`}
                className="mb-2 font-sans-regular text-base text-text-secondary"
              >
                {step}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
  );
};

export default ExerciseDetailScreen;
