import { BASE_URL, itemSize1, USER_KEY_NAME } from "@/constants/constants";
import { useAuth } from "@/context/auth";
import { Checkbox } from "expo-checkbox";
import { SymbolView } from "expo-symbols";
import * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useUser } from "@/context/user";
import showToast from "@/utils/toast";
import { useRouter } from "expo-router";

const EditWorkoutRoutine = () => {
  const router = useRouter();
  const [isOnTheGoChecked, setOnTheGoChecked] = React.useState(false);
  const [isWeeklyFixedChecked, setWeeklyFixedChecked] = React.useState(false);
  const { fetchWithAuth, isLoading, user } = useAuth();
  const { userData, updateUserData } = useUser();
  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  React.useEffect(() => {
    if (!userData) return;

    if (userData.routine === "daily") {
      setOnTheGoChecked(true);
      setWeeklyFixedChecked(false);
    } else {
      setOnTheGoChecked(false);
      setWeeklyFixedChecked(true);
    }
  }, [userData]);

  const handleCheckOnTheGo = (checked: boolean) => {
    setOnTheGoChecked(checked);
    setWeeklyFixedChecked(!checked);

    if (checked) {
      handleChangeRoutine("daily");
    }
  };

  const handleCheckWeeklyFixed = (checked: boolean) => {
    setWeeklyFixedChecked(checked);
    setOnTheGoChecked(!checked);

    if (checked) {
      handleChangeRoutine("weekly");
    }
  };

  const handleChangeRoutine = async (routine: string) => {
    const previous = { isOnTheGoChecked, isWeeklyFixedChecked };
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/database/routine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ routine, sub: user?.sub }),
      });

      if (!response.ok) {
        throw new Error(`Routine update failed with status ${response.status}`);
      }
      updateUserData({ routine });
      showToast("successToast", "Update workout routine successfully!");
    } catch (error) {
      if (error instanceof Error) {
        setOnTheGoChecked(previous.isOnTheGoChecked);
        setWeeklyFixedChecked(previous.isWeeklyFixedChecked);
        showToast(
          "errorToast",
          "Cannot update workout routine. Try again later.",
        );
      }
    }
  };

  return (
    <View className="flex-1 items-center bg-background px-4 pt-10">
      {/* Header */}
      <View className="h-20 w-20 items-center justify-center   ">
        <SymbolView
          name="calendar.badge.clock"
          tintColor="#ffffff"
          weight="bold"
          size={100}
        />
      </View>

      <Text className="mt-5 text-center font-sans-bold text-2xl text-text-primary">
        Select your workout routine
      </Text>
      <Text className="mt-1 text-center font-sans-regular text-sm text-text-secondary">
        Choose how you'd like to plan your training
      </Text>

      {/* Options */}
      <View className="mt-8 w-full gap-4">
        {/* On-the-Go */}
        <Pressable
          onPress={() => handleCheckOnTheGo(!isOnTheGoChecked)}
          className={`w-full flex-row items-center gap-3 rounded-3xl border-2 p-4 ${
            isOnTheGoChecked ? "border-accent-2" : "border-primary"
          } bg-background/80`}
        >
          <Checkbox
            value={isOnTheGoChecked}
            onValueChange={handleCheckOnTheGo}
            color={isOnTheGoChecked ? "#ff9100" : undefined}
            style={{ borderRadius: 100 }}
          />
          <View className="flex-1">
            <Text className="font-sans-bold text-lg text-text-primary">
              On-the-Go
            </Text>
            <Text className="mt-0.5 font-sans-regular text-sm text-text-secondary">
              Plan a one-time workout whenever you're ready.
            </Text>
          </View>
        </Pressable>

        {/* Weekly Fixed */}
        <Pressable
          onPress={() => handleCheckWeeklyFixed(!isWeeklyFixedChecked)}
          className={`w-full flex-row items-center gap-3 rounded-3xl border-2 p-4 ${
            isWeeklyFixedChecked ? "border-accent-2" : "border-primary"
          } bg-background/80`}
        >
          <Checkbox
            value={isWeeklyFixedChecked}
            onValueChange={handleCheckWeeklyFixed}
            color={isWeeklyFixedChecked ? "#ff9100" : undefined}
            style={{ borderRadius: 100 }}
          />
          <View className="flex-1">
            <Text className="font-sans-bold text-lg text-text-primary">
              Weekly Fixed
            </Text>
            <Text className="mt-0.5 font-sans-regular text-sm text-text-secondary">
              Keep your training consistent every single week.
            </Text>
          </View>

          {isWeeklyFixedChecked && (
            <Pressable className="h-9 w-9 items-center justify-center rounded-full border border-primary bg-primary/10">
              <SymbolView
                name="pencil"
                tintColor="#ffffff"
                weight="bold"
                size={15}
              />
            </Pressable>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default EditWorkoutRoutine;
