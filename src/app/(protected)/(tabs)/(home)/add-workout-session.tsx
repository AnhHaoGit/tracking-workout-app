import { BASE_URL, WORKOUT_SESSIONS_KEY_NAME } from "@/constants/constants";
import { EXERCISES } from "@/constants/exercises";
import { useAuth } from "@/context/auth";
import {
  workoutSessionCache,
  type WorkoutExercise,
} from "@/secure-store/workout-sessions";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { styled } from "nativewind";

import React from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const suggestedNames = [
  "Pull Day",
  "Push Day",
  "Leg Day",
  "Chest Day",
  "Back Day",
  "Arm Day",
  "Stretching",
  "Cardio",
  "Upper Body",
  "Lower Body",
];

const AddWorkoutSession = () => {
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [title, setTitle] = React.useState("");

  const [selectedExercises, setSelectedExercises] = React.useState<
    WorkoutExercise[]
  >([]);
  const [isExerciseModalVisible, setExerciseModalVisible] =
    React.useState(false);
  const [exerciseSearch, setExerciseSearch] = React.useState("");
  const [selectedTarget, setSelectedTarget] = React.useState("All");
  const [selectedEquipment, setSelectedEquipment] = React.useState("All");
  const [pendingExerciseIds, setPendingExerciseIds] = React.useState<number[]>(
    [],
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [date, setDate] = React.useState(new Date());
  const [time, setTime] = React.useState(new Date());

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

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

  const handleAddExercises = () => {
    const chosen = EXERCISES.filter((exercise) =>
      pendingExerciseIds.includes(exercise.id),
    ).map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      targetMuscle: exercise.targetMuscle,
      secondaryMuscles: exercise.secondaryMuscles,
      equipment: exercise.equipment,
      type: exercise.type,
      img: exercise.img,
    }));

    setSelectedExercises((current) => {
      const existingIds = new Set(current.map((exercise) => exercise.id));
      const uniqueChosen = chosen.filter(
        (exercise) => !existingIds.has(exercise.id),
      );

      return [...current, ...uniqueChosen];
    });
    setPendingExerciseIds([]);
    setExerciseModalVisible(false);
  };

  const handleStepOneNext = () => {
    if (!title.trim()) {
      setErrorMessage("Please enter a name for your workout session.");
      return;
    }

    setErrorMessage("");
    setStep(2);
  };

  const handleStepTwoNext = () => {
    const selectedDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
    );
    const minimumDateTime = new Date(Date.now() + 60_000);

    if (selectedDateTime < minimumDateTime) {
      setErrorMessage(
        "Please choose a date and time at least 1 minute in the future.",
      );
      return;
    }

    setErrorMessage("");
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage("Please name your workout session.");
      return;
    }

    if (selectedExercises.length === 0) {
      setErrorMessage("Please add at least one exercise.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const session = {
      _id: null,
      name: title.trim(),
      date: date,
      time: time,
      exercises: selectedExercises,
      createdAt: new Date(),
      status: "Not started yet",
    };

    try {
      await workoutSessionCache?.addWorkoutSession(
        WORKOUT_SESSIONS_KEY_NAME,
        session,
      );
      await fetchWithAuth(`${BASE_URL}/api/database/workout-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(session),
      });
      router.replace("/(protected)/(tabs)/(home)");
    } catch (error) {
      console.error("Failed to create workout session", error);
      setErrorMessage(
        "Something went wrong while saving your workout session.",
      );
      setIsSaving(false);
    }
  };

  const renderStepOne = () => (
    <View className="flex-1">
      <Text className="mb-2 font-sans-semibold text-lg text-text-primary">
        Name your workout session
      </Text>
      <TextInput
        value={title}
        onChangeText={(value) => {
          setTitle(value);
          if (errorMessage) {
            setErrorMessage("");
          }
        }}
        placeholder="Pull Day, Cardio..."
        placeholderTextColor="#7A7A7A"
        className="mb-4 rounded-2xl border border-primary bg-background px-4 py-3 font-sans-regular text-base text-text-primary"
      />

      {errorMessage ? (
        <Text className="mb-4 font-sans-regular text-sm text-accent-1">
          {errorMessage}
        </Text>
      ) : null}

      <View className="flex-row flex-wrap">
        {suggestedNames.map((name) => (
          <Pressable
            key={name}
            onPress={() => setTitle(name)}
            className="mb-2 mr-2 rounded-full border border-primary px-3 py-2"
          >
            <Text className="font-sans-medium text-sm text-text-primary">
              {name}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-6 flex-row justify-end">
        <Pressable
          onPress={handleStepOneNext}
          className="rounded-full bg-accent-2 px-5 py-3"
        >
          <Text className="font-sans-semibold text-base text-background">
            Next
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderStepTwo = () => (
    <View className="flex-1">
      <Text className="mb-2 font-sans-semibold text-lg text-text-primary">
        Pick a date and time
      </Text>

      <View className="flex flex-col justify-between gap-10">
        <View className="flex flex-row items-center justify-items-startm mt-2">
          <DateTimePicker
            value={date}
            mode="date"
            themeVariant="dark"
            onValueChange={(event, selectedDate) => setDate(selectedDate)}
          />

          <DateTimePicker
            value={time}
            themeVariant="dark"
            mode="time"
            minuteInterval={15}
            onValueChange={(event, selectedTime) => setTime(selectedTime)}
          />
        </View>
        <Text className="font-sans-regular text-text-primary">
          Your workout session will start on {date.toLocaleDateString()} at{" "}
          {time.toLocaleTimeString()}
        </Text>
      </View>

      {errorMessage ? (
        <Text className="mt-4 font-sans-regular text-sm text-accent-1">
          {errorMessage}
        </Text>
      ) : null}

      <View className="mt-6 flex-row justify-between">
        <Pressable
          onPress={() => {
            setErrorMessage("");
            setStep(1);
          }}
          className="rounded-full border border-primary px-5 py-3"
        >
          <Text className="font-sans-semibold text-base text-text-primary">
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={handleStepTwoNext}
          className="rounded-full bg-accent-2 px-5 py-3"
        >
          <Text className="font-sans-semibold text-base text-background">
            Next
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderStepThree = () => (
    <View className="flex-1">
      <Text className="mb-2 font-sans-semibold text-lg text-text-primary">
        Add exercises
      </Text>

      <Pressable
        onPress={() => {
          setPendingExerciseIds(
            selectedExercises.map((exercise) => exercise.id),
          );
          setExerciseModalVisible(true);
        }}
        className="mb-4 rounded-2xl border border-primary bg-background px-4 py-3"
      >
        <Text className="font-sans-semibold text-base text-text-primary">
          + Add exercise
        </Text>
      </Pressable>

      {selectedExercises.length > 0 ? (
        <View className="mb-4">
          {selectedExercises.map((exercise) => (
            <View
              key={exercise.id}
              className="mb-3 flex-row items-center justify-between gap-3 rounded-2xl border border-primary bg-background/90 px-3 py-3"
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
              <Pressable
                onPress={() =>
                  setSelectedExercises((current) =>
                    current.filter((item) => item.id !== exercise.id),
                  )
                }
                className="rounded-full border border-white flex items-center justify-center mr-2 p-1"
              >
                <SymbolView name="multiply" tintColor="#ffffff" size={10} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text className="mb-4 font-sans-regular text-sm text-text-secondary">
          No exercises added yet.
        </Text>
      )}

      {errorMessage ? (
        <Text className="mb-3 font-sans-regular text-sm text-accent-1">
          {errorMessage}
        </Text>
      ) : null}

      <View className="mt-6 flex-row justify-between">
        <Pressable
          onPress={() => {
            setErrorMessage("");
            setStep(2);
          }}
          className="rounded-full border border-primary px-5 py-3"
        >
          <Text className="font-sans-semibold text-base text-text-primary">
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          className="rounded-full bg-accent-2 px-5 py-3"
          disabled={isSaving}
        >
          <Text className="font-sans-semibold text-base text-background">
            {isSaving ? "Saving..." : "Done!"}
          </Text>
        </Pressable>
      </View>

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
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text className="mb-2 font-sans-bold text-3xl text-text-primary">
          Create workout session
        </Text>
        <Text className="mb-4 font-sans-regular text-base text-text-secondary">
          Step {step} of 3
        </Text>
        {step === 1
          ? renderStepOne()
          : step === 2
            ? renderStepTwo()
            : renderStepThree()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddWorkoutSession;
