import { BASE_URL, WORKOUT_SESSIONS_KEY_NAME } from "@/constants/constants";
import { workoutSessionCache } from "@/secure-store/workout-sessions";
import { WorkoutSession } from "@/constants/type";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View, Pressable, Image } from "react-native";
import { useAuth } from "../../context/auth";
import { SymbolView } from "expo-symbols";

const ExerciseDetailScreen = () => {
  const params = useLocalSearchParams<{ workoutSessionId?: string }>();
  const [sessions, setSessions] = React.useState<WorkoutSession[]>([]);
  const router = useRouter();
  const { user, isLoading, fetchWithAuth } = useAuth();

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  React.useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;

      const cachedSessions = await workoutSessionCache?.getWorkoutSessions(
        WORKOUT_SESSIONS_KEY_NAME,
      );
      if (cachedSessions && cachedSessions.length > 0) {
        setSessions(cachedSessions);
      }

      try {
        const response = await fetchWithAuth(
          `${BASE_URL}/api/database/workout-sessions`,
          {
            method: "GET",
          },
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setSessions(data);
            await workoutSessionCache?.saveWorkoutSessions(
              WORKOUT_SESSIONS_KEY_NAME,
              data,
            );
          }
        }
      } catch (error) {
        console.error("Failed to load workout sessions", error);
      }
    };

    loadSessions();
  }, [fetchWithAuth, user]);

  const selectedWorkoutSession: WorkoutSession | undefined = sessions.find(
    (session) => session._id === params.workoutSessionId,
  );

  if (!selectedWorkoutSession) {
    return (
      <View>
        <Text className="text-text-primary">No workout session found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-4 py-4 bg-background"
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View
        key={selectedWorkoutSession._id}
        className="flex flex-row items-center justify-between mb-3 rounded-3xl border-2 border-primary bg-background/80 p-4"
      >
        <View>
          <Text className="font-sans-bold text-2xl text-text-primary">
            {selectedWorkoutSession.name}
          </Text>
          <Text className="mt-1 font-sans-regular text-sm text-text-secondary">
            {new Date(selectedWorkoutSession.date).toLocaleDateString()} •{" "}
            {new Date(selectedWorkoutSession.time).toLocaleTimeString()}
          </Text>
        </View>
        <Pressable className="bg-accent-2 px-4 py-2 rounded-full">
          <Text className="font-sans-semibold text-xl">Start</Text>
        </Pressable>
      </View>
      <View>
        <Text className="mt-1 font-sans-regular text-lg text-text-secondary">
          All exercises ({selectedWorkoutSession.exercises.length})
        </Text>
        <View className="mt-2">
          {selectedWorkoutSession.exercises.map((exercise) => (
            <View
              key={exercise.id}
              className="flex flex-row items-center justify-between mb-3 rounded-3xl border-2 border-primary bg-background/80 p-4"
            >
              <View className="flex-1 flex-row items-start gap-3">
                <Image
                  source={{ uri: exercise.img }}
                  className="h-15 w-15 rounded-xl"
                  resizeMode="cover"
                />
                <View className="min-w-0 flex-1">
                  <Text className="font-sans-semibold text-lg text-text-primary">
                    {exercise.name}
                  </Text>
                  <Text className="font-sans-regular text-sm text-text-secondary">
                    {exercise.targetMuscle}
                    {exercise.secondaryMuscles.length > 0
                      ? `, ${exercise.secondaryMuscles.join(", ")}`
                      : ""}
                    {"  "}• {exercise.type}
                  </Text>
                </View>
              </View>
              <Pressable className="rounded-full border border-white flex items-center justify-center mr-2 p-1">
                <SymbolView name="multiply" tintColor="#ffffff" size={10} />
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ExerciseDetailScreen;
