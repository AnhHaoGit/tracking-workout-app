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
  Image,
  FlatList,
  Modal,
} from "react-native";
import { useAuth } from "../../context/auth";
import { SymbolView } from "expo-symbols";
import { useWorkoutSessions } from "@/context/workout-sessions";
import { EXERCISES } from "@/constants/exercises";

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
  const [isExerciseModalVisible, setExerciseModalVisible] =
    React.useState<boolean>(false);
  const [message, setMessage] = React.useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [exerciseSearch, setExerciseSearch] = React.useState("");
  const [selectedTarget, setSelectedTarget] = React.useState("All");
  const [selectedEquipment, setSelectedEquipment] = React.useState("All");
  const [pendingExerciseIds, setPendingExerciseIds] = React.useState<number[]>(
    [],
  );

  const targetMuscles = React.useMemo<string[]>(
    () => [
      "All",
      ...Array.from(
        new Set(
          EXERCISES.map((item) => item.targetMuscle).filter(
            (target): target is string => Boolean(target),
          ),
        ),
      ),
    ],
    [],
  );

  const equipmentOptions = React.useMemo<string[]>(
    () => [
      "All",
      ...Array.from(new Set(EXERCISES.flatMap((item) => item.equipment))),
    ],
    [],
  );

  const filteredExercises = React.useMemo(() => {
    const query = exerciseSearch.trim().toLowerCase();

    return EXERCISES.filter((exercise) => {
      const matchesSearch =
        query.length === 0 || exercise.name.toLowerCase().includes(query);
      const matchesTarget =
        selectedTarget === "All" || exercise.targetMuscle === selectedTarget;
      const matchesEquipment =
        selectedEquipment === "All" ||
        exercise.equipment.includes(selectedEquipment);
      return matchesSearch && matchesTarget && matchesEquipment;
    });
  }, [exerciseSearch, selectedTarget, selectedEquipment]);

  const pendingExerciseIdSet = React.useMemo(
    () => new Set(pendingExerciseIds),
    [pendingExerciseIds],
  );

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
          if (status === "In progress") {
            updateWorkoutSessions(params.workoutSessionId, {
              status,
              startedAt,
            });
            await workoutSessionCache?.updateWorkoutSessions(
              WORKOUT_SESSIONS_KEY_NAME,
              params.workoutSessionId,
              { status, startedAt },
            );
          } else {
            updateWorkoutSessions(params.workoutSessionId, {
              status,
            });
            await workoutSessionCache?.updateWorkoutSessions(
              WORKOUT_SESSIONS_KEY_NAME,
              params.workoutSessionId,
              { status },
            );
          }
        }
      } else {
        throw new Error();
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage({
          ok: false,
          message:
            "Cannot change status of the workout session. Check your internet connection.",
        });
      }
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
            set.id === setId
              ? { ...set, [field]: value === "" ? null : Number(value) }
              : set,
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
          if (
            selectedWorkoutSession?.exercises.length &&
            exerciseIndex === selectedWorkoutSession.exercises.length - 1
          ) {
            setExeriseIndex(exerciseIndex - 1);
          }
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

  const handleAddExercises = async () => {
    const existingIds = new Set(
      selectedWorkoutSession?.exercises.map((exercise) => exercise.id),
    );

    const chosen = EXERCISES.filter(
      (exercise) =>
        pendingExerciseIds.includes(exercise.id) &&
        !existingIds.has(exercise.id),
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

    if (chosen.length === 0) {
      setPendingExerciseIds([]);
      setExerciseModalVisible(false);
      return;
    }

    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/database/workout-session-exercise`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
          await workoutSessionCache?.updateWorkoutSessions(
            WORKOUT_SESSIONS_KEY_NAME,
            params.workoutSessionId,
            response.session,
          );
        }

        setMessage({
          ok: true,
          message: "Add exercises successfully!",
        });
        setPendingExerciseIds([]);
        setExerciseModalVisible(false);
      } else {
        throw new Error();
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage({
          ok: false,
          message: "Cannot add exercises. Check your internet connection.",
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

      {selectedWorkoutSession.status === "Not started yet" &&
        selectedWorkoutSession.exercises.length > 0 && (
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
      {selectedWorkoutSession.status === "In progress" &&
        selectedWorkoutSession.exercises.length > 0 && (
          <View className="flex items-center mb-3 rounded-3xl border-2 border-primary bg-background/80 p-4">
            <View className="flex flex-row w-full justify-between items-center mb-10">
              <Text className="text-center text-text-primary font-sans-bold text-xl">
                {exerciseIndex + 1}.{" "}
                {selectedWorkoutSession.exercises[exerciseIndex].name}
              </Text>

              <View className="flex flex-row items-center gap-4 justify-center">
                <Pressable>
                  <SymbolView
                    name="line.3.horizontal"
                    tintColor="#ffffff"
                    size={18}
                    weight="bold"
                  />
                </Pressable>
                <Pressable
                  onPress={() =>
                    handleDeleteExercise(
                      selectedWorkoutSession.exercises[exerciseIndex].id,
                    )
                  }
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
              <ScrollView
                className="w-full max-h-50"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {selectedWorkoutSession.exercises[exerciseIndex].sets.map(
                  (set, idx) => (
                    <View
                      key={set.id}
                      className="flex flex-row items-center mb-2"
                    >
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
              </ScrollView>

              {/* Add set button */}
              <Pressable
                onPress={handleAddSet}
                className="flex flex-row items-center justify-center gap-1 mt-2 rounded-full w-9/10  bg-primary py-2"
              >
                <SymbolView name="plus" tintColor="#717171" size={10} />
                <Text className="text-text-secondary font-sans-semibold">
                  Add new set
                </Text>
              </Pressable>
            </View>
            <View className="flex flex-row mb-5 items-center justify-items-start w-9/10">
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
            <View className="w-9/10 mb-5">
              <TextInput
                className="w-full text-white border-2 border-primary rounded-2xl p-2"
                placeholderTextColor="#666"
                multiline={true}
                numberOfLines={4}
                style={{ minHeight: 80, textAlignVertical: "top" }}
                placeholder="Add some note"
                value={
                  selectedWorkoutSession.exercises[exerciseIndex].note ?? ""
                }
                onChangeText={(value) => handleChangeExerciseNote(value)}
              />
            </View>

            <View className="flex flex-row justify-between w-full">
              <Pressable
                className="flex flex-row items-center gap-1"
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
            {message && (
              <View className="flex items-center mt-5 justify-center w-9/10 flex-1">
                <Text
                  className={`${message.ok ? "text-accent-2" : "text-accent-1"} text-center`}
                >
                  {message.message}
                </Text>
              </View>
            )}
          </View>
        )}

      {selectedWorkoutSession.exercises.length === 0 && (
        <View className="rounded-3xl border-2 border-primary mb-3 bg-background/70 p-4">
          <Text className="font-sans-regular text-text-secondary">
            No exercises in this workout session. Add one with the button below.
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => {
          setPendingExerciseIds(
            selectedWorkoutSession.exercises.map((exercise) => exercise.id),
          );
          setExerciseModalVisible(true);
        }}
        className="flex flex-row items-center justify-center gap-1 rounded-full  bg-primary py-2"
      >
        <SymbolView name="plus" tintColor="#717171" size={10} />
        <Text className="text-text-secondary font-sans-semibold">
          Add new exercise
        </Text>
      </Pressable>
      <Modal
        visible={isExerciseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-full rounded-t-[28px] border border-primary bg-background p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-sans-semibold text-xl text-text-primary">
                Choose exercises
              </Text>
              <Pressable onPress={() => setExerciseModalVisible(false)}>
                <Text className="font-sans-semibold text-base text-accent-2">
                  Close
                </Text>
              </Pressable>
            </View>

            <TextInput
              value={exerciseSearch}
              onChangeText={setExerciseSearch}
              placeholder="Search exercises"
              placeholderTextColor="#7A7A7A"
              className="mb-3 rounded-2xl border border-primary bg-background px-4 py-3 font-sans-regular text-base text-text-primary"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              {targetMuscles.map((target) => {
                const selected = target === selectedTarget;
                return (
                  <Pressable
                    key={target}
                    onPress={() => setSelectedTarget(target)}
                    className={`mr-2 rounded-full border px-3 py-2 ${
                      selected
                        ? "border-accent-2 bg-accent-2"
                        : "border-primary bg-background"
                    }`}
                  >
                    <Text
                      className={`font-sans-medium text-sm ${selected ? "text-background" : "text-text-primary"}`}
                    >
                      {target}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              {equipmentOptions.map((equipment) => {
                const selected = equipment === selectedEquipment;
                return (
                  <Pressable
                    key={equipment}
                    onPress={() => setSelectedEquipment(equipment)}
                    className={`mr-2 rounded-full border px-3 py-2 ${
                      selected
                        ? "border-accent-1 bg-accent-1"
                        : "border-primary bg-background"
                    }`}
                  >
                    <Text
                      className={`font-sans-medium text-sm ${selected ? "text-background" : "text-text-primary"}`}
                    >
                      {equipment}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id.toString()}
              style={{ maxHeight: 320 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              renderItem={({ item: exercise }) => {
                const selected = pendingExerciseIdSet.has(exercise.id);

                return (
                  <Pressable
                    key={exercise.id}
                    onPress={() => {
                      setPendingExerciseIds((current) =>
                        current.includes(exercise.id)
                          ? current.filter((id) => id !== exercise.id)
                          : [...current, exercise.id],
                      );
                    }}
                    className={`mb-3 rounded-2xl border p-3 ${
                      selected
                        ? "border-accent-2 bg-accent-2/10"
                        : "border-primary bg-background"
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <Image
                        source={{ uri: exercise.img }}
                        className="h-15 w-15 rounded-xl"
                        resizeMode="cover"
                      />
                      <View className="flex-1">
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
                  </Pressable>
                );
              }}
            />

            <Pressable
              onPress={handleAddExercises}
              className="mt-4 rounded-full bg-accent-2 px-4 py-3"
            >
              <Text className="text-center font-sans-semibold text-base text-background">
                Add selected exercises
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
