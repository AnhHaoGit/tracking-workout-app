import { BASE_URL, WORKOUT_SESSIONS_KEY_NAME } from "@/constants/constants";
import { workoutSessionCache } from "@/secure-store/workout-sessions";
import { WorkoutSession } from "@/constants/type";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  StyleSheet,
} from "react-native";
import { useAuth } from "../../context/auth";
import { SymbolView } from "expo-symbols";
import { useWorkoutSessions } from "@/context/workout-sessions";

import SelectDropdown from "react-native-select-dropdown";

const TECHNIQUES = ["Warm-up", "Failure"];
const ExerciseDetailScreen = () => {
  const params = useLocalSearchParams<{ workoutSessionId?: string }>();
  const [selectedWorkoutSession, setSelectedWorkoutSession] = React.useState<
    WorkoutSession | undefined
  >(undefined);
  const [exerciseIndex, setExeriseIndex] = React.useState<number>(0);
  const router = useRouter();
  const { user, isLoading, fetchWithAuth } = useAuth();
  const { workoutSessions, updateWorkoutSessions } = useWorkoutSessions();
  const [message, setMessage] = React.useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  React.useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;

      if (!selectedWorkoutSession) {
        const selected = workoutSessions.find(
          (session) => session._id === params.workoutSessionId,
        );

        if (selected) {
          setSelectedWorkoutSession(selected);
        } else {
          const cachedSessions = await workoutSessionCache?.getWorkoutSessions(
            WORKOUT_SESSIONS_KEY_NAME,
          );
          if (cachedSessions && cachedSessions.length > 0) {
            const selected: WorkoutSession | undefined = cachedSessions.find(
              (session) => session._id === params.workoutSessionId,
            );
            if (selected) {
              setSelectedWorkoutSession(selected);
            }
          }
        }
      }
    };

    loadSessions();
  }, [fetchWithAuth, user]);

  const handleChangeWorkoutSessionStatus = async (status: string) => {
    const startedAt = new Date();
    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/database/workout-session-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: params.workoutSessionId,
            status,
            startedAt,
          }),
        },
      );

      if (res.ok) {
        if (params.workoutSessionId) {
          setSelectedWorkoutSession((prev) => {
            if (!prev) return prev;
            return { ...prev, status };
          });
          updateWorkoutSessions(params.workoutSessionId, { status, startedAt });
          await workoutSessionCache?.updateWorkoutSessions(
            WORKOUT_SESSIONS_KEY_NAME,
            params.workoutSessionId,
            { status, startedAt },
          );
        }
      }
    } catch (error) {
      console.error("Failed to create workout session", error);
    }
  };

  const handleSetValueChange = (
    setId: number,
    field: "weight" | "reps",
    value: string,
  ) => {
    setSelectedWorkoutSession((prev) => {
      if (!prev) return prev;
      const updatedExercises = prev.exercises.map((exercise, idx) => {
        if (idx !== exerciseIndex) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) =>
            set.id === setId ? { ...set, [field]: Number(value) } : set,
          ),
        };
      });
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleAddSet = () => {
    setSelectedWorkoutSession((prev) => {
      if (!prev) return prev;
      const updatedExercises = prev.exercises.map((exercise, idx) => {
        if (idx !== exerciseIndex) return exercise;
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newId = lastSet ? lastSet.id + 1 : 1;
        return {
          ...exercise,
          sets: [...exercise.sets, { id: newId, weight: null, reps: null }],
        };
      });
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleChangeExerciseTechnique = (selectedTechnique: string) => {
    setSelectedWorkoutSession((prev) => {
      if (!prev) return prev;
      const updatedExercises = prev.exercises.map((exercise, idx) =>
        idx !== exerciseIndex
          ? exercise
          : { ...exercise, technique: selectedTechnique },
      );
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleChangeExerciseNote = (note: string) => {
    setSelectedWorkoutSession((prev) => {
      if (!prev) return prev;
      const updatedExercises = prev.exercises.map((exercise, idx) =>
        idx !== exerciseIndex ? exercise : { ...exercise, note },
      );
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleSaveWorkoutSession = async () => {
    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/database/workout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: params.workoutSessionId,
            updatedWorkoutSession: selectedWorkoutSession,
          }),
        },
      );

      if (res.ok) {
        if (params.workoutSessionId) {
          updateWorkoutSessions(
            params.workoutSessionId,
            selectedWorkoutSession,
          );
          await workoutSessionCache?.updateWorkoutSessions(
            WORKOUT_SESSIONS_KEY_NAME,
            params.workoutSessionId,
            selectedWorkoutSession,
          );
        }
        setMessage({
          ok: true,
          message: "Save workout session successfully!",
        });
      } else {
        throw new Error();
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage({
          ok: false,
          message:
            "Cannot save your workout session. Check your internet connection.",
        });
      }
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/database/workout-session-exercise`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: params.workoutSessionId,
            exerciseId,
          }),
        },
      );

      if (res.ok) {
        const response = await res.json();
        if (params.workoutSessionId) {
          updateWorkoutSessions(params.workoutSessionId, response.session);
          await workoutSessionCache?.updateWorkoutSessions(
            WORKOUT_SESSIONS_KEY_NAME,
            params.workoutSessionId,
            response.session,
          );
          setSelectedWorkoutSession(response.session);
        }
        setMessage({
          ok: true,
          message: "Delete exercise successfully!",
        });
      } else {
        throw new Error();
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage({
          ok: false,
          message: "Cannot delete exercise. Check your internet connection.",
        });
      }
    }
  };

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
          <View className="flex flex-row gap-2">
            <Text className="font-sans-bold text-2xl text-text-primary">
              {selectedWorkoutSession.name}
            </Text>
            <View className="rounded-full border border-primary bg-primary/10 px-3 py-1 flex items-center justify-center">
              <Text
                className={`font-sans-medium text-xs ${selectedWorkoutSession.status === "Not started yet" && "text-accent-1"} ${selectedWorkoutSession.status === "In progress" && "text-accent-2"} ${selectedWorkoutSession.status === "Completed" && "text-accent-3"}`}
              >
                {selectedWorkoutSession.status ?? "Not started yet"}
              </Text>
            </View>
          </View>

          <Text className="mt-1 font-sans-regular text-sm text-text-secondary">
            {new Date(selectedWorkoutSession.date).toLocaleDateString()} •{" "}
            {new Date(selectedWorkoutSession.time).toLocaleTimeString()}
          </Text>
        </View>
        {selectedWorkoutSession.status === "Not started yet" && (
          <Pressable
            onPress={() => handleChangeWorkoutSessionStatus("In progress")}
            className="bg-white px-4 py-2 rounded-full"
          >
            <Text className="font-sans-semibold text-xl">Start</Text>
          </Pressable>
        )}
        {selectedWorkoutSession.status === "In progress" && (
          <Pressable
            className="bg-white px-4 py-2 rounded-full"
            onPress={() => handleChangeWorkoutSessionStatus("Completed")}
          >
            <Text className="font-sans-semibold text-xl">Finish</Text>
          </Pressable>
        )}
      </View>

      {selectedWorkoutSession.status === "Not started yet" && (
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
                <Pressable
                  onPress={() => handleDeleteExercise(exercise.id)}
                  className="rounded-full border border-white flex items-center justify-center mr-2 p-1"
                >
                  <SymbolView name="multiply" tintColor="#ffffff" size={10} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}
      {selectedWorkoutSession.status === "In progress" && (
        <View className="flex items-center gap-10 rounded-3xl border-2 border-primary bg-background/80 p-4">
          <Text className="text-text-primary font-sans-semibold">
            {exerciseIndex + 1}.{" "}
            {selectedWorkoutSession.exercises[exerciseIndex].name}
          </Text>

          <View className="flex flex-row items-center justify-items-start w-full">
            <SelectDropdown
              data={TECHNIQUES}
              onSelect={(selectedItem, index) => {
                handleChangeExerciseTechnique(selectedItem);
              }}
              defaultValue={
                !selectedWorkoutSession.exercises[exerciseIndex].technique
                  ? null
                  : selectedWorkoutSession.exercises[exerciseIndex].technique
              }
              renderButton={(selectedItem, isOpened) => {
                return (
                  <View className="flex flex-row items-center justify-center gap-2 px-2 border-2 border-primary py-2 rounded-full">
                    <Text
                      className={`text-sm ${selectedItem === "Warm-up" ? "text-accent-2" : selectedItem === "Failure" ? "text-accent-1" : "text-text-primary"}`}
                    >
                      {(selectedItem && selectedItem) || "Technique"}
                    </Text>
                    <SymbolView
                      name={isOpened ? "chevron.up" : "chevron.down"}
                      tintColor="#ffffff"
                      size={12}
                    />
                  </View>
                );
              }}
              renderItem={(item, index, isSelected) => {
                return (
                  <View className="p-3">
                    <Text
                      className={`text-sm ${item === "Warm-up" ? "text-accent-2" : item === "Failure" ? "text-accent-1" : "text-text-primary"}`}
                    >
                      {item}
                    </Text>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
            />
          </View>
          <View className="w-full flex items-center">
            {/* Header */}
            <View className="flex flex-row items-center mb-4">
              <Text className="flex-1 text-center font-sans-semibold text-text-secondary">
                Set
              </Text>
              <Text className="flex-1 text-center font-sans-semibold text-text-secondary">
                Weight (kg)
              </Text>
              <Text className="flex-1 text-center font-sans-semibold text-text-secondary">
                Reps
              </Text>
            </View>

            {/* Rows */}
            {selectedWorkoutSession.exercises[exerciseIndex].sets.map(
              (set, idx) => (
                <View key={set.id} className="flex flex-row items-center mb-2">
                  <Text className="flex-1 text-center text-white">
                    {idx + 1}
                  </Text>

                  <View className="flex-1 items-center">
                    <TextInput
                      className="w-16 text-text-primary border-2 border-primary rounded-full py-2"
                      keyboardType="numeric"
                      placeholderTextColor="#666"
                      value={set.weight?.toString() ?? ""}
                      onChangeText={(value) =>
                        handleSetValueChange(set.id, "weight", value)
                      }
                      style={{ textAlign: "center" }}
                    />
                  </View>

                  <View className="flex-1 items-center">
                    <TextInput
                      className="w-16 text-white border-2 border-primary rounded-full py-2"
                      keyboardType="numeric"
                      placeholderTextColor="#666"
                      value={set.reps?.toString() ?? ""}
                      onChangeText={(value) =>
                        handleSetValueChange(set.id, "reps", value)
                      }
                      style={{ textAlign: "center" }}
                    />
                  </View>
                </View>
              ),
            )}

            {/* Add set button */}
            <Pressable
              onPress={handleAddSet}
              className="flex flex-row items-center justify-center gap-1 mt-2 rounded-full w-9/10  bg-primary py-2"
            >
              <SymbolView name="plus" tintColor="#ffffff" size={10} />
              <Text className="text-text-primary font-sans-semibold">
                Add new set
              </Text>
            </Pressable>
          </View>

          <View className="w-9/10">
            <TextInput
              className="w-full text-white border-2 border-primary rounded-2xl p-2"
              placeholderTextColor="#666"
              multiline={true}
              numberOfLines={4}
              style={{ minHeight: 80, textAlignVertical: "top" }}
              placeholder="Add some note"
              value={selectedWorkoutSession.exercises[exerciseIndex].note ?? ""}
              onChangeText={(value) => handleChangeExerciseNote(value)}
            />
          </View>

          <View className="flex flex-row justify-between w-full">
            <Pressable
              className="flex flex-row items-center gap-1"
              disabled={exerciseIndex === 0}
              onPress={() => setExeriseIndex((prev) => prev - 1)}
            >
              <SymbolView name="chevron.left" tintColor="#ffffff" size={10} />

              <Text className="text-text-primary font-sans-semibold">Back</Text>
            </Pressable>
            <Pressable
              onPress={() => handleSaveWorkoutSession()}
              className="bg-white px-6 py-2 rounded-full"
            >
              <Text className="font-sans-semibold">Save</Text>
            </Pressable>
            <Pressable
              className="flex flex-row items-center gap-1"
              disabled={
                exerciseIndex === selectedWorkoutSession.exercises.length - 1
              }
              onPress={() => setExeriseIndex((prev) => prev + 1)}
            >
              <Text className="text-text-primary font-sans-semibold">Next</Text>
              <SymbolView name="chevron.right" tintColor="#ffffff" size={10} />
            </Pressable>
          </View>
          {message && (
            <View className="flex items-center justify-center w-9/10 flex-1">
              <Text
                className={`${message.ok ? "text-accent-2" : "text-accent-1"} text-center`}
              >
                {message.message}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default ExerciseDetailScreen;

const styles = StyleSheet.create({
  dropdownMenuStyle: {
    backgroundColor: "#181818",
    borderRadius: 10,
    width: 75,
  },
});
