import { EXERCISES } from "@/constants/exercises";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const PAGE_SIZE = 15;

type ExerciseItem = {
  id: number;
  name: string;
  difficulty: string;
  type: string;
  logType: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: string[];
  instruction: string[];
  gif: string;
  img: string;
};

const exerciseData = EXERCISES as ExerciseItem[];

const ExercisesScreen = () => {
  const [search, setSearch] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<string>("All");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("All");
  const [page, setPage] = useState(1);

  const targetMuscles = useMemo<string[]>(
    () => [
      "All",
      ...Array.from(
        new Set(
          exerciseData
            .map((item) => item.targetMuscle)
            .filter((target): target is string => Boolean(target)),
        ),
      ),
    ],
    [],
  );

  const equipmentOptions = useMemo<string[]>(
    () => [
      "All",
      ...Array.from(new Set(exerciseData.flatMap((item) => item.equipment))),
    ],
    [],
  );

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exerciseData.filter((exercise) => {
      const matchesSearch =
        query.length === 0 || exercise.name.toLowerCase().includes(query);
      const matchesTarget =
        selectedTarget === "All" || exercise.targetMuscle === selectedTarget;
      const matchesEquipment =
        selectedEquipment === "All" ||
        exercise.equipment.includes(selectedEquipment);

      return matchesSearch && matchesTarget && matchesEquipment;
    });
  }, [search, selectedTarget, selectedEquipment]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedTarget, selectedEquipment]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredExercises.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pagedExercises = filteredExercises.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const renderExerciseCard = ({ item }: { item: ExerciseItem }) => (
    <Link
      key={item.id}
      href={{
        pathname: "/(protected)/(tabs)/exercises/[exerciseId]",
        params: { exerciseId: String(item.id) },
      }}
      asChild
    >
      <Pressable className="mb-4 overflow-hidden rounded-3xl border border-primary bg-background/90 p-3">
        <View className="flex-row items-center gap-3">
          <Image
            source={{ uri: item.img }}
            className="h-20 w-20 rounded-2xl"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="font-sans-semibold text-lg text-text-primary">
              {item.name}
            </Text>
            <Text className="mt-1 font-sans-regular text-sm text-text-secondary">
              Muscles: {item.targetMuscle}
              {item.secondaryMuscles.length > 0
                ? `, ${item.secondaryMuscles.join(", ")}`
                : ""}
            </Text>
            <Text className="font-sans-regular text-sm text-text-secondary">
              Type: {item.type}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <Text className="mb-4 font-sans-bold text-3xl text-text-primary">
          Exercises
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercises"
          placeholderTextColor="#7A7A7A"
          className="mb-4 rounded-2xl border border-primary bg-background px-4 py-3 font-sans-regular text-base text-text-primary"
        />

        <Text className="mb-2 font-sans-semibold text-base text-text-primary">
          Target muscle
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
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
                  className={`font-sans-medium text-sm ${
                    selected ? "text-background" : "text-text-primary"
                  }`}
                >
                  {target}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text className="mb-2 font-sans-semibold text-base text-text-primary">
          Equipment
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
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
                  className={`font-sans-medium text-sm ${
                    selected ? "text-background" : "text-text-primary"
                  }`}
                >
                  {equipment}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FlatList
          data={pagedExercises}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          renderItem={renderExerciseCard}
          ListEmptyComponent={() => (
            <View className="rounded-2xl border border-primary bg-background/70 p-4">
              <Text className="font-sans-medium text-text-primary">
                No exercises match your filters.
              </Text>
            </View>
          )}
        />

        <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-primary bg-background/70 px-3 py-3">
          <Pressable
            onPress={() => setPage(1)}
            className="rounded-full border border-primary px-3 py-2"
            disabled={safePage === 1}
          >
            <Text className="font-sans-semibold text-text-primary">First</Text>
          </Pressable>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-full border border-primary px-3 py-2"
              disabled={safePage === 1}
            >
              <Text className="font-sans-semibold text-text-primary">←</Text>
            </Pressable>

            <Text className="font-sans-semibold text-text-primary">
              Page {safePage} of {totalPages}
            </Text>

            <Pressable
              onPress={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              className="rounded-full border border-primary px-3 py-2"
              disabled={safePage === totalPages}
            >
              <Text className="font-sans-semibold text-text-primary">→</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => setPage(totalPages)}
            className="rounded-full border border-primary px-3 py-2"
            disabled={safePage === totalPages}
          >
            <Text className="font-sans-semibold text-text-primary">Last</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExercisesScreen;
