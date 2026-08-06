import { BASE_URL } from "@/constants/constants";
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
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/auth";
import { SymbolView } from "expo-symbols";
import { useWorkoutSessions } from "@/context/workout-sessions";
import { EXERCISES } from "@/constants/exercises";

import SelectDropdown from "react-native-select-dropdown";
import showToast from "@/utils/toast";
import ExercisesPickerModal from "@/components/ExercisesPickerModal";

const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
};

const TECHNIQUES = ["None", "Warm-up", "Failure"];
const ExerciseDetailScreen = () => {
  const params = useLocalSearchParams<{ workoutSessionId?: string }>();
  const [selectedWorkoutSession, setSelectedWorkoutSession] = React.useState<
    WorkoutSession | undefined
  >(undefined);
  const [exerciseIndex, setExeriseIndex] = React.useState<number>(0);
  const router = useRouter();
  const { user, isLoading, fetchWithAuth } = useAuth();
  const { updateWorkoutSessions } = useWorkoutSessions();
  const [isFetching, setIsFetching] = React.useState(false);
  const [isExerciseModalVisible, setExerciseModalVisible] =
    React.useState<boolean>(false);
  const [draftValues, setDraftValues] = React.useState<Record<string, string>>(
    {},
  );
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  React.useEffect(() => {
    const loadSession = async () => {
      if (!user || !params.workoutSessionId) return;

      setIsFetching(true);
      try {
        const res = await fetchWithAuth(
          `${BASE_URL}/api/database/workout-session?id=${params.workoutSessionId}`,
          { method: "GET" },
        );

        if (res.ok) {
          const fetchedData = await res.json();
          setSelectedWorkoutSession(fetchedData);
        } else if (res.status === 404) {
          router.replace("/not-found");
          return;
        } else {
          throw new Error();
        }
      } catch (error) {
        if (error instanceof Error) {
          showToast(
            "errorToast",
            "Cannot load the selected workout session. Check your internet connection.",
          );
        }
      } finally {
        setIsFetching(false);
      }
    };

    loadSession();
  }, [fetchWithAuth, user, params.workoutSessionId, router]);

  React.useEffect(() => {
    if (
      selectedWorkoutSession?.status !== "In progress" ||
      !selectedWorkoutSession.startedAt
    ) {
      return;
    }

    const startedAtMs = new Date(selectedWorkoutSession.startedAt).getTime();

    const updateElapsed = () => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)),
      );
    };

    updateElapsed(); // set ngay lần đầu, không đợi 1s
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [selectedWorkoutSession?.status, selectedWorkoutSession?.startedAt]);

  const handleChangeWorkoutSessionStatus = async (status: string) => {
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
          }),
        },
      );

      if (res.ok) {
        const { current } = await res.json();

        if (params.workoutSessionId) {
          const patch =
            status === "In progress"
              ? { status, startedAt: current }
              : { status, finishedAt: current };

          setSelectedWorkoutSession((prev) => {
            if (!prev) return prev;
            return { ...prev, ...patch };
          });

          updateWorkoutSessions(params.workoutSessionId, patch);
        }
      } else {
        throw new Error();
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          "errorToast",
          "Cannot change status of the workout session. Check your internet connection.",
        );
      }
    }
  };

  const getDraftKey = (setId: number, field: "weight" | "reps") =>
    `${exerciseIndex}-${setId}-${field}`;

  const getDisplayValue = (
    setId: number,
    field: "weight" | "reps",
    actualValue: string | null,
  ) => {
    const key = getDraftKey(setId, field);
    return draftValues[key] !== undefined
      ? draftValues[key]
      : (actualValue?.toString() ?? "");
  };

  const handleSetValueChange = (
    setId: number,
    field: "weight" | "reps",
    rawValue: string,
  ) => {
    let normalized = rawValue.replace(",", ".");

    // Reps là số nguyên -> không cho dấu chấm
    const pattern = field === "reps" ? /^\d*$/ : /^\d*\.?\d*$/;
    if (!pattern.test(normalized)) return; // ký tự không hợp lệ -> bỏ qua

    const key = getDraftKey(setId, field);
    setDraftValues((prev) => ({ ...prev, [key]: normalized }));

    // Chỉ ghi vào state chính khi chuỗi đã là số hợp lệ hoàn chỉnh
    // (bỏ qua các trạng thái đang gõ dở như "", ".", "12.")
    const isIntermediate = normalized === "" || normalized.endsWith(".");

    // chuỗi rỗng thì là null, còn lại thì parse thành number
    const numValue = normalized === "" ? null : Number(normalized);

    if (normalized === "" || (!isIntermediate && !isNaN(numValue as number))) {
      setSelectedWorkoutSession((prev) => {
        if (!prev) return prev;
        const updatedExercises = prev.exercises.map((exercise, idx) => {
          if (idx !== exerciseIndex) return exercise;
          return {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.id === setId ? { ...set, [field]: numValue } : set,
            ),
          };
        });
        return { ...prev, exercises: updatedExercises };
      });
    }
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

  const handleDeleteSet = (setId: number) => {
    setSelectedWorkoutSession((prev) => {
      if (!prev) return prev;
      const updatedExercises = prev.exercises.map((exercise, idx) => {
        if (idx !== exerciseIndex) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.filter((set) => set.id !== setId),
        };
      });
      return { ...prev, exercises: updatedExercises };
    });

    setDraftValues((prev) => {
      const updated = { ...prev };
      delete updated[getDraftKey(setId, "weight")];
      delete updated[getDraftKey(setId, "reps")];
      return updated;
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
    const hasIncompleteDecimal = Object.values(draftValues).some(
      (value) => value !== "" && value.endsWith("."),
    );

    if (hasIncompleteDecimal) {
      showToast(
        "infoToast",
        "Please complete the decimal number before saving.",
      );
      return;
    }

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
        }
        showToast("successToast", "Save workout session successfully!");
      } else {
        throw new Error();
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          "errorToast",
          "Cannot save your workout session. Check your internet connection.",
        );
      }
    }
  };

  const handleDeleteExercise = async (index: number) => {
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
            exerciseIndex: index,
          }),
        },
      );

      if (res.ok) {
        const response = await res.json();
        if (params.workoutSessionId) {
          updateWorkoutSessions(params.workoutSessionId, response.session);

          if (
            selectedWorkoutSession?.exercises.length &&
            index === selectedWorkoutSession.exercises.length - 1
          ) {
            setExeriseIndex((prev) => Math.max(prev - 1, 0));
          }
          setSelectedWorkoutSession(response.session);
        }
      } else {
        throw new Error();
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          "errorToast",
          "Cannot delete exercise. Check your internet connection.",
        );
      }
    }
  };

  const handleConfirmAddExercises = React.useCallback(
    async (selectedIds: number[]) => {
      const existingIds = new Set(
        selectedWorkoutSession?.exercises.map((exercise) => exercise.id),
      );

      const chosen = EXERCISES.filter(
        (exercise) =>
          selectedIds.includes(exercise.id) && !existingIds.has(exercise.id),
      ).map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        targetMuscle: exercise.targetMuscle,
        secondaryMuscles: exercise.secondaryMuscles,
        equipment: exercise.equipment,
        type: exercise.type,
        sets: [
          { id: 1, weight: null, reps: null },
          { id: 2, weight: null, reps: null },
          { id: 3, weight: null, reps: null },
        ],
        img: exercise.img,
      }));

      setExerciseModalVisible(false);

      try {
        const res = await fetchWithAuth(
          `${BASE_URL}/api/database/workout-session-exercise`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              _id: params.workoutSessionId,
              exercises: chosen,
            }),
          },
        );

        if (res.ok) {
          const response = await res.json();
          if (params.workoutSessionId) {
            setSelectedWorkoutSession(response.session);
            updateWorkoutSessions(params.workoutSessionId, response.session);
          }
        } else {
          throw new Error();
        }
      } catch (error) {
        if (error instanceof Error) {
          showToast(
            "errorToast",
            "Cannot add exercises. Check your internet connection.",
          );
        }
      }
    },
    [
      selectedWorkoutSession,
      params.workoutSessionId,
      fetchWithAuth,
      updateWorkoutSessions,
    ],
  );

  const completedDurationSeconds =
    selectedWorkoutSession?.status === "Completed" &&
    selectedWorkoutSession.startedAt &&
    selectedWorkoutSession.finishedAt
      ? Math.max(
          0,
          Math.floor(
            (new Date(selectedWorkoutSession.finishedAt).getTime() -
              new Date(selectedWorkoutSession.startedAt).getTime()) /
              1000,
          ),
        )
      : null;

  if (isFetching) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!selectedWorkoutSession) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-4 py-4">
        <Text className="font-sans-regular text-xl text-text-primary">
          Cannot load the selected workout session. Check your internet
          connection.
        </Text>
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
        className="flex flex-row items-center justify-between mb-4 rounded-3xl border-2 border-primary bg-background/80 p-5"
      >
        <View className="flex-1 pr-3">
          <View className="flex flex-row items-center gap-2 flex-wrap">
            <Text className="font-sans-bold text-2xl text-text-primary">
              {selectedWorkoutSession.name}
            </Text>
            <View
              className={`rounded-full border px-3 py-1 flex items-center justify-center ${
                selectedWorkoutSession.status === "Not started yet"
                  ? "border-accent-1 bg-accent-1/10"
                  : selectedWorkoutSession.status === "In progress"
                    ? "border-accent-2 bg-accent-2/10"
                    : "border-accent-3 bg-accent-3/10"
              }`}
            >
              <Text
                className={`font-sans-medium text-xs ${selectedWorkoutSession.status === "Not started yet" && "text-accent-1"} ${selectedWorkoutSession.status === "In progress" && "text-accent-2"} ${selectedWorkoutSession.status === "Completed" && "text-accent-3"}`}
              >
                {selectedWorkoutSession.status ?? "Not started yet"}
              </Text>
            </View>
          </View>

          <View className="flex gap-1 mt-2">
            <View className="flex flex-row items-center gap-1">
              <SymbolView name="calendar" tintColor="#717171" size={12} />

              <Text className="mt-1 font-sans-regular text-sm text-text-secondary">
                {new Date(selectedWorkoutSession.date).toLocaleDateString()} •{" "}
                {new Date(selectedWorkoutSession.time).toLocaleTimeString()}
              </Text>
            </View>

            {selectedWorkoutSession.status === "In progress" && (
              <View className="flex flex-row items-center gap-1">
                <SymbolView name="stopwatch" tintColor="#717171" size={12} />
                <Text className="font-sans-regular text-sm text-text-secondary">
                  {formatDuration(elapsedSeconds)}
                </Text>
              </View>
            )}

            {selectedWorkoutSession.status === "Completed" &&
              completedDurationSeconds !== null && (
                <View className="flex flex-row items-center gap-1">
                  <SymbolView
                    name="checkmark.circle"
                    tintColor="#717171"
                    size={12}
                  />
                  <Text className="font-sans-regular text-sm text-text-secondary">
                    Duration: {formatDuration(completedDurationSeconds)}
                  </Text>
                </View>
              )}
          </View>
        </View>

        {selectedWorkoutSession.status === "Not started yet" && (
          <Pressable
            onPress={() => handleChangeWorkoutSessionStatus("In progress")}
            className="bg-white px-5 py-3 rounded-full active:opacity-70"
          >
            <Text className="font-sans-semibold text-lg">Start</Text>
          </Pressable>
        )}
        {selectedWorkoutSession.status === "In progress" && (
          <Pressable
            className="bg-white px-5 py-3 rounded-full active:opacity-70"
            onPress={() => handleChangeWorkoutSessionStatus("Completed")}
          >
            <Text className="font-sans-semibold text-lg">Finish</Text>
          </Pressable>
        )}
      </View>

      {selectedWorkoutSession.status === "Not started yet" &&
        selectedWorkoutSession.exercises.length > 0 && (
          <View>
            <Text className="mt-1 font-sans-regular text-lg text-text-secondary">
              All exercises ({selectedWorkoutSession.exercises.length})
            </Text>
            <View className="mt-2">
              {selectedWorkoutSession.exercises.map((exercise, index) => (
                <View
                  key={index}
                  className="flex flex-row items-center justify-between mb-3 rounded-3xl border-2 border-primary bg-background/80 p-4"
                >
                  <View className="flex-1 flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
                      <Text className="font-sans-semibold text-text-primary text-sm">
                        {index + 1}
                      </Text>
                    </View>
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
                    onPress={() => handleDeleteExercise(index)}
                    className="rounded-full border border-white flex items-center justify-center mr-2 p-1"
                  >
                    <SymbolView name="multiply" tintColor="#ffffff" size={10} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
      {selectedWorkoutSession.status === "In progress" &&
        selectedWorkoutSession.exercises.length > 0 && (
          <View className="flex items-center mb-3 rounded-3xl border-2 border-primary bg-background/80 p-4">
            <View className="flex flex-row w-full justify-between items-center mb-8">
              <View className="flex-1 pr-3">
                <Text className="text-text-secondary font-sans-medium text-xs mb-1">
                  Exercise {exerciseIndex + 1} of{" "}
                  {selectedWorkoutSession.exercises.length}
                </Text>
                <Text className="text-text-primary font-sans-bold text-xl">
                  {selectedWorkoutSession.exercises[exerciseIndex].name}
                </Text>
              </View>

              <View className="flex flex-row items-center gap-3 justify-center">
                <Pressable className="w-8 h-8 items-center justify-center active:opacity-60">
                  <SymbolView
                    name="line.3.horizontal"
                    tintColor="#ffffff"
                    size={18}
                    weight="bold"
                  />
                </Pressable>
                <Pressable
                  onPress={() => handleDeleteExercise(exerciseIndex)}
                  className="w-8 h-8 items-center justify-center active:opacity-60"
                >
                  <SymbolView
                    name="multiply"
                    weight="bold"
                    tintColor="#ffffff"
                    size={18}
                  />
                </Pressable>
              </View>
            </View>

            <View className="w-full flex items-center mb-5">
              {/* Header */}
              {/* Header */}
              <View className="flex flex-row items-center mb-3 px-1">
                <Text className="flex-1 text-center font-sans-semibold text-text-secondary text-xs">
                  SET
                </Text>
                <Text className="flex-1 text-center font-sans-semibold text-text-secondary text-xs">
                  WEIGHT (KG)
                </Text>
                <Text className="flex-1 text-center font-sans-semibold text-text-secondary text-xs">
                  REPS
                </Text>
                <View className="w-8" />
              </View>

              {/* Rows */}
              <ScrollView
                className="w-full max-h-50"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {selectedWorkoutSession.exercises[exerciseIndex].sets.map(
                  (set, idx) => (
                    <View
                      key={set.id}
                      className={`flex flex-row items-center py-2 px-1 rounded-2xl mb-2 ${
                        idx % 2 === 0 ? "bg-white/5" : ""
                      }`}
                    >
                      <View className="flex-1 items-center">
                        <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
                          <Text className="text-white font-sans-semibold text-xs">
                            {idx + 1}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-1 items-center">
                        <TextInput
                          className="w-16 text-text-primary border-2 border-primary rounded-full py-2 font-sans-medium"
                          placeholder="0"
                          placeholderTextColor="#666"
                          keyboardType="decimal-pad"
                          value={getDisplayValue(set.id, "weight", set.weight)}
                          onChangeText={(value) =>
                            handleSetValueChange(set.id, "weight", value)
                          }
                          style={{ textAlign: "center" }}
                        />
                      </View>

                      <View className="flex-1 items-center">
                        <TextInput
                          className="w-16 text-white border-2 border-primary rounded-full py-2 font-sans-medium"
                          placeholder="0"
                          placeholderTextColor="#666"
                          keyboardType="number-pad"
                          value={getDisplayValue(set.id, "reps", set.reps)}
                          onChangeText={(value) =>
                            handleSetValueChange(set.id, "reps", value)
                          }
                          style={{ textAlign: "center" }}
                        />
                      </View>

                      <Pressable
                        onPress={() => handleDeleteSet(set.id)}
                        className="w-8 items-center justify-center active:opacity-60"
                      >
                        <SymbolView name="trash" tintColor="#999" size={15} />
                      </Pressable>
                    </View>
                  ),
                )}
              </ScrollView>

              {/* Add set button */}
              <Pressable
                onPress={handleAddSet}
                className="flex flex-row items-center justify-center gap-2 mt-3 rounded-full w-9/10 border-2 border-dashed border-primary py-3 active:bg-primary/10"
              >
                <SymbolView name="plus" tintColor="#ffffff" size={12} />
                <Text className="text-text-primary font-sans-semibold">
                  Add new set
                </Text>
              </Pressable>
            </View>
            <View className="flex flex-row mb-5 items-center gap-4 w-9/10">
              <Text className="text-text-secondary font-sans-medium text-sm">
                Technique
              </Text>
              <SelectDropdown
                data={TECHNIQUES}
                onSelect={(selectedItem, index) => {
                  handleChangeExerciseTechnique(selectedItem);
                }}
                defaultValue={
                  selectedWorkoutSession.exercises[exerciseIndex].technique
                }
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View className="flex flex-row items-center justify-center gap-2 px-3 border-2 border-primary py-2 rounded-full">
                      <Text
                        className={`text-sm font-sans-medium ${selectedItem === "Warm-up" ? "text-accent-2" : selectedItem === "Failure" ? "text-accent-1" : "text-text-primary"}`}
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

            <View className="w-9/10 mb-6">
              <Text className="text-text-secondary font-sans-medium text-sm mb-2">
                Note
              </Text>
              <TextInput
                className="w-full text-white border-2 border-primary rounded-2xl p-3"
                placeholderTextColor="#666"
                multiline={true}
                numberOfLines={4}
                style={{ minHeight: 80, textAlignVertical: "top" }}
                placeholder="Add some note about form, difficulty, etc."
                value={
                  selectedWorkoutSession.exercises[exerciseIndex].note ?? ""
                }
                onChangeText={(value) => handleChangeExerciseNote(value)}
              />
            </View>

            <View className="flex flex-row justify-between items-center w-full pt-2">
              <Pressable
                className="flex flex-row items-center gap-1 w-16 active:opacity-60"
                disabled={exerciseIndex === 0}
                onPress={() => setExeriseIndex((prev) => prev - 1)}
              >
                <SymbolView
                  name="chevron.left"
                  tintColor={`${exerciseIndex === 0 ? "#717171" : "#ffffff"}`}
                  size={10}
                  weight="bold"
                />
                <Text
                  className={`font-sans-semibold ${exerciseIndex === 0 ? "text-text-secondary" : "text-text-primary"}`}
                >
                  Back
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSaveWorkoutSession()}
                className="bg-white px-8 py-3 rounded-full active:opacity-70"
              >
                <Text className="font-sans-semibold text-base">Save</Text>
              </Pressable>

              <Pressable
                className="flex flex-row items-center justify-end gap-1 w-16 active:opacity-60"
                disabled={
                  exerciseIndex === selectedWorkoutSession.exercises.length - 1
                }
                onPress={() => setExeriseIndex((prev) => prev + 1)}
              >
                <Text
                  className={`font-sans-semibold ${exerciseIndex === selectedWorkoutSession.exercises.length - 1 ? "text-text-secondary" : "text-text-primary"}`}
                >
                  Next
                </Text>
                <SymbolView
                  name="chevron.right"
                  tintColor={`${exerciseIndex === selectedWorkoutSession.exercises.length - 1 ? "#717171" : "#ffffff"}`}
                  size={10}
                  weight="bold"
                />
              </Pressable>
            </View>
          </View>
        )}
      {selectedWorkoutSession.status === "Completed" &&
        selectedWorkoutSession.exercises.length > 0 && (
          <View>
            <Text className="mt-1 font-sans-regular text-lg text-text-secondary">
              All exercises ({selectedWorkoutSession.exercises.length})
            </Text>
            <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
              {selectedWorkoutSession.exercises.map((exercise) => (
                <View
                  key={exercise.id}
                  className="mb-3 rounded-3xl border-2 border-primary bg-background/80 p-4"
                >
                  <View className="mb-4 flex flex-row items-center justify-between">
                    <View className="flex flex-row items-center gap-2 flex-1">
                      <SymbolView
                        name="checkmark.circle.fill"
                        tintColor="#58c5cc"
                        size={18}
                      />
                      <Text className="text-text-primary font-sans-bold text-xl flex-1">
                        {exercise.name}
                      </Text>
                    </View>
                    {exercise.technique && exercise.technique !== "None" && (
                      <View className="rounded-full border border-primary bg-primary/10 px-3 py-1">
                        <Text
                          className={`font-sans-medium text-xs ${
                            exercise.technique === "Warm-up"
                              ? "text-accent-2"
                              : exercise.technique === "Failure"
                                ? "text-accent-1"
                                : "text-text-primary"
                          }`}
                        >
                          {exercise.technique}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className="font-sans-regular text-sm text-text-secondary mb-3">
                    {exercise.targetMuscle}
                    {exercise.secondaryMuscles.length > 0
                      ? `, ${exercise.secondaryMuscles.join(", ")}`
                      : ""}
                    {"  "}• {exercise.type}
                  </Text>

                  <View className="w-full flex items-center mb-2">
                    {/* Header */}
                    <View className="flex flex-row items-center mb-3 w-full">
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
                    {exercise.sets.map((set, idx) => (
                      <View
                        key={set.id}
                        className="flex flex-row items-center mb-2 w-full"
                      >
                        <Text className="flex-1 text-center text-white">
                          {idx + 1}
                        </Text>
                        <Text className="flex-1 text-center text-text-primary">
                          {set.weight ?? "-"}
                        </Text>
                        <Text className="flex-1 text-center text-white">
                          {set.reps ?? "-"}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {exercise.note ? (
                    <View className="w-full mt-2 rounded-2xl border-2 border-primary p-3">
                      <Text className="text-text-secondary text-xs font-sans-semibold mb-1">
                        Note
                      </Text>
                      <Text className="text-white font-sans-regular">
                        {exercise.note}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

      {selectedWorkoutSession.exercises.length === 0 && (
        <View className="rounded-3xl border-2 border-dashed border-primary mb-3 bg-background/70 p-6 items-center">
          <SymbolView name="dumbbell" tintColor="#666" size={28} />
          <Text className="font-sans-regular text-text-secondary text-center mt-3">
            No exercises in this workout session. Add one with the button below.
          </Text>
        </View>
      )}
      {selectedWorkoutSession.status !== "Completed" && (
        <Pressable
          onPress={() => setExerciseModalVisible(true)}
          className="flex flex-row items-center justify-center gap-1 rounded-full bg-primary py-2"
        >
          <SymbolView name="plus" tintColor="#717171" size={10} />
          <Text className="text-text-secondary font-sans-semibold">
            Add new exercise
          </Text>
        </Pressable>
      )}
      <ExercisesPickerModal
        visible={isExerciseModalVisible}
        onClose={() => setExerciseModalVisible(false)}
        existingExerciseIds={selectedWorkoutSession.exercises.map(
          (exercise) => exercise.id,
        )}
        onConfirm={handleConfirmAddExercises}
      />
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
