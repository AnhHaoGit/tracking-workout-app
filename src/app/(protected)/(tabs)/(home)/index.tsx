import {
  BASE_URL,
  itemSize1,
  // USER_KEY_NAME,
  WORKOUT_SESSIONS_KEY_NAME,
} from "@/constants/constants";
import { useUser } from "@/context/user";
// import { userCache } from "@/secure-store/user";
// import { workoutSessionCache } from "@/secure-store/workout-sessions";
import { Link, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { styled } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../../context/auth";
import { useWorkoutSessions } from "@/context/workout-sessions";
import showToast from "@/utils/toast";

const SafeAreaView = styled(RNSafeAreaView);

const HomeScreen = () => {
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();
  const { userData, updateUserData } = useUser();
  const { workoutSessions, saveWorkoutSessions, deleteWorkoutSession } =
    useWorkoutSessions();

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  const todaySessions = React.useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    return workoutSessions
      .filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startOfDay && sessionDate < endOfDay;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();

        if (dateA !== dateB) return dateA - dateB;
        return timeA - timeB;
      });
  }, [workoutSessions]);

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (!user || userData) return;

      try {
        console.log("Fetching user data");
        const response = await fetchWithAuth(`${BASE_URL}/api/database/user`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          updateUserData(data);
        } else {
          throw new Error();
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to load user data", error);
          showToast(
            "errorToast",
            "Failed to load user data. Check your Internet connection",
          );
        }
      }
    };
    fetchUserData();
  }, [fetchWithAuth, user]); // KHÔNG đưa userData vào đây

  React.useEffect(() => {
    const loadSessions = async () => {
      if (!user || workoutSessions.length > 0) return;

      try {
        console.log("Fetching workout sessions");

        const response = await fetchWithAuth(
          `${BASE_URL}/api/database/workout-sessions`,
          { method: "GET" },
        );
        if (response.ok) {
          const data = await response.json();
          saveWorkoutSessions(data);
        }
      } catch (error) {
        console.error("Failed to load workout sessions", error);
        showToast(
          "errorToast",
          "Failed to load workout sessions. Check your Internet connection",
        );
      }
    };

    loadSessions();
  }, [fetchWithAuth, user]);

  const handleDeleteWorkoutSession = async (_id: string) => {
    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/database/workout-sessions`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id }),
        },
      );

      if (res.ok) {
        deleteWorkoutSession(_id);
      }
    } catch (error) {
      console.error("Failed to create workout session", error);
      showToast(
        "errorToast",
        "Failed to delete workout session. Check your Internet connection",
      );
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 w-full bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 180,
          display: "flex",
          backgroundColor: "#000000",
          alignItems: "center",
          flexGrow: 1,
        }}
      >
        <View
          className="h-1/7 w-full flex flex-row justify-between items-center"
          style={{ width: itemSize1 }}
        >
          <View className="flex flex-row items-center gap-4">
            <View className="aspect-square h-9/10 flex justify-center items-center bg-background border-primary border-2 rounded-full">
              <View className="w-9/10 h-9/10 flex justify-center items-center bg-primary border-2 rounded-full">
                <Image
                  source={{ uri: user?.picture }}
                  className="w-full h-full rounded-full"
                />
              </View>
            </View>
            <View className="flex flex-col gap-1">
              <Text className="font-sans-regular text-lg text-text-secondary">
                Welcome back !
              </Text>
              <Text className="text-3xl font-sans-bold text-text-primary">
                {user?.name}
              </Text>
            </View>
          </View>
          {userData?.routine === "daily" && (
            <Link href="/(protected)/(tabs)/(home)/add-workout-session" asChild>
              <Pressable>
                <SymbolView
                  name="plus"
                  tintColor="#ffffff"
                  weight="bold"
                  size={30}
                />
              </Pressable>
            </Link>
          )}
        </View>

        <View className="mt-10 w-full" style={{ width: itemSize1 }}>
          <Text className="mb-3 font-sans-bold text-2xl text-text-primary">
            Today's workout
          </Text>

          {todaySessions.length === 0 ? (
            <View className="rounded-3xl border-2 border-primary bg-background/70 p-4">
              <Text className="font-sans-regular text-text-secondary">
                No workouts scheduled for today. Create one with the plus
                button.
              </Text>
            </View>
          ) : (
            todaySessions.map((session) => (
              <Link
                href={{
                  pathname: "/(protected)/[workoutSessionId]",
                  params: {
                    workoutSessionId: session._id,
                  },
                }}
                asChild
                key={session._id}
                className="flex flex-row items-center justify-between mb-3 rounded-3xl border-2 border-primary bg-background/80 p-4"
              >
                <Pressable>
                  <View>
                    <Text className="font-sans-bold text-xl text-text-primary">
                      {session.name}
                    </Text>
                    <Text className="mt-1 font-sans-regular text-sm text-text-secondary">
                      {new Date(session.date).toLocaleDateString()} •{" "}
                      {new Date(session.time).toLocaleTimeString()}
                    </Text>
                    <View className="mt-2 flex-row items-center justify-between gap-3">
                      <Text className="font-sans-medium text-sm text-text-secondary">
                        {session.exercises.length} exercise
                        {session.exercises.length === 1 ? "" : "s"}
                      </Text>
                      <View className="rounded-full border border-primary bg-primary/10 px-3 py-1 flex items-center justify-center">
                        <Text
                          className={`font-sans-medium text-xs ${session.status === "Not started yet" && "text-accent-1"} ${session.status === "In progress" && "text-accent-2"} ${session.status === "Completed" && "text-accent-3"}`}
                        >
                          {session.status ?? "Not started yet"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteWorkoutSession(session._id)}
                    className="rounded-full border border-white flex items-center justify-center mr-2 p-1"
                  >
                    <SymbolView name="multiply" tintColor="#ffffff" size={10} />
                  </Pressable>
                </Pressable>
              </Link>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default HomeScreen;
