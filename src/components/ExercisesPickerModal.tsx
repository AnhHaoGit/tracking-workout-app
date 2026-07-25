import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  FlatList,
  Image,
} from "react-native";
import { EXERCISES } from "@/constants/exercises";

type ExercisePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  existingExerciseIds: number[];
  onConfirm: (selectedIds: number[]) => void;
};

const ExercisesPickerModal = ({
  visible,
  onClose,
  existingExerciseIds,
  onConfirm,
}: ExercisePickerModalProps) => {
  const [exerciseSearch, setExerciseSearch] = React.useState("");
  const [selectedTarget, setSelectedTarget] = React.useState("All");
  const [selectedEquipment, setSelectedEquipment] = React.useState("All");
  const [pendingExerciseIds, setPendingExerciseIds] = React.useState<number[]>(
    [],
  );

  React.useEffect(() => {
    if (visible) {
      setPendingExerciseIds(existingExerciseIds);
      setExerciseSearch("");
      setSelectedTarget("All");
      setSelectedEquipment("All");
    }
  }, [visible]);

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

  const handleConfirm = () => {
    onConfirm(pendingExerciseIds);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-full rounded-t-[28px] border border-primary bg-background p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-sans-semibold text-xl text-text-primary">
              Choose exercises
            </Text>
            <Pressable onPress={onClose}>
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
            onPress={handleConfirm}
            className="mt-4 rounded-full bg-accent-2 px-4 py-3"
          >
            <Text className="text-center font-sans-semibold text-base text-background">
              Add selected exercises
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(ExercisesPickerModal);
