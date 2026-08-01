import { BASE_URL } from "@/constants/constants";
import { EXERCISES } from "@/constants/exercises";
import { useAuth } from "@/context/auth";
import { WorkoutExercise } from "@/constants/type";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useWorkoutSessions } from "@/context/workout-sessions";
import ExercisesPickerModal from "@/components/ExercisesPickerModal";

import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import showToast from "@/utils/toast";

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

  const [isSaving, setIsSaving] = React.useState(false);
  const [date, setDate] = React.useState(new Date());
  const [time, setTime] = React.useState(new Date());
  const { addWorkoutSession } = useWorkoutSessions();

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  const handleConfirmExercises = React.useCallback((selectedIds: number[]) => {
    const chosen = EXERCISES.filter((exercise) =>
      selectedIds.includes(exercise.id),
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
      technique: "None",
    }));

    setSelectedExercises((current) => {
      const existingIds = new Set(current.map((exercise) => exercise.id));
      const uniqueChosen = chosen.filter(
        (exercise) => !existingIds.has(exercise.id),
      );
      return [...current, ...uniqueChosen];
    });
    setExerciseModalVisible(false);
  }, []);

  const handleStepOneNext = () => {
    if (!title.trim()) {
      showToast("infoToast", "Please enter a name for your workout session.");
      return;
    }

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
      showToast(
        "infoToast",
        "Please choose a date and time at least 1 minute in the future.",
      );
      return;
    }

    setStep(3);
  };

  const handleSubmit = async () => {
    if (selectedExercises.length === 0) {
      showToast("infoToast", "Please add at least one exercise.");
      return;
    }

    setIsSaving(true);

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
      const res = await fetchWithAuth(
        `${BASE_URL}/api/database/workout-sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(session),
        },
      );

      if (res.ok) {
        const finalSession = await res.json();

        addWorkoutSession(finalSession);

        router.replace("/(protected)/(tabs)/(home)");
      }
    } catch (error) {
      console.error("Failed to create workout session", error);
      showToast(
        "errorToast",
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

      <View className="flex-row flex-wrap mt-2">
        {suggestedNames.map((name) => (
          <Pressable
            key={name}
            onPress={() => setTitle(name)}
            className={`mb-2 mr-2 rounded-full border ${name === title ? "border-accent-2" : "border-primary"}  px-3 py-2`}
          >
            <Text
              className={`font-sans-medium text-sm ${name === title ? "text-accent-2" : "text-text-primary"}`}
            >
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

      <View className="mt-6 flex-row justify-between">
        <Pressable
          onPress={() => {
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
        onPress={() => setExerciseModalVisible(true)}
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

      <View className="mt-6 flex-row justify-between">
        <Pressable
          onPress={() => {
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
            {isSaving ? "Saving..." : "Done"}
          </Text>
        </Pressable>
      </View>

      <ExercisesPickerModal
        visible={isExerciseModalVisible}
        onClose={() => setExerciseModalVisible(false)}
        existingExerciseIds={selectedExercises.map((exercise) => exercise.id)}
        onConfirm={handleConfirmExercises}
      />
    </View>
  );

  return (
    <ScrollView
      className="flex-1 px-4 py-4 bg-background"
      contentContainerStyle={{ paddingBottom: 120 }}
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
  );
};

export default AddWorkoutSession;
