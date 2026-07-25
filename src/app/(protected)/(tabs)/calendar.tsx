import { BASE_URL, WORKOUT_SESSIONS_KEY_NAME } from "@/constants/constants";
import { useAuth } from "@/context/auth";
// import { workoutSessionCache } from "@/secure-store/workout-sessions";
import { WorkoutSession } from "@/constants/type";
import { Link, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { styled } from "nativewind";
import React from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useWorkoutSessions } from "@/context/workout-sessions";
import showToast from "@/utils/toast";

const SafeAreaView = styled(RNSafeAreaView);

const screenWidth = Dimensions.get("window").width;

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// get all pair of month and year from start point to end point
const getMonthsBetween = (start: Date, end: Date) => {
  const months: { year: number; month: number }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth() });
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
};

const getMonthMatrix = (year: number, month: number) => {
  // get the first day of month
  const first = new Date(year, month, 1);

  // get the number of days in that month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // JS: 0=Sun..6=Sat. We want Monday-first index 0..6
  // --> 0=Mon
  const firstWeekday = (first.getDay() + 6) % 7;

  const matrix: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(firstWeekday).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }

  return matrix;
};

const isPickedClasses = "p-2 bg-white rounded-full";
const isNotPickedClasses = "p-2 border-2 border-primary rounded-full";

const Calendar = () => {
  const router = useRouter();
  const { user, isLoading, fetchWithAuth } = useAuth();
  const { workoutSessions, saveWorkoutSessions, deleteWorkoutSession } =
    useWorkoutSessions();
  const [isDisplayingListView, setIsDisplayingListView] =
    React.useState<boolean>(false);

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  React.useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;

      // const cachedSessions = await workoutSessionCache?.getWorkoutSessions(
      //   WORKOUT_SESSIONS_KEY_NAME,
      // );

      // if (cachedSessions) {
      //   saveWorkoutSessions(cachedSessions);
      // } else {
        try {
          const response = await fetchWithAuth(
            `${BASE_URL}/api/database/workout-sessions`,
            {
              method: "GET",
            },
          );
          if (response.ok) {
            const data = await response.json();
            // await workoutSessionCache?.saveWorkoutSessions(
            //   WORKOUT_SESSIONS_KEY_NAME,
            //   data,
            // );
            saveWorkoutSessions(data);
          }
        } catch (error) {
          console.error("Failed to load workout sessions", error);
          showToast(
            "errorToast",
            "Failed to load workout sessions. Check your Internet connection",
          );
        }
      // }
    };

    loadSessions();
  }, [fetchWithAuth, user]);

  // get the month that has the oldest session
  const start = React.useMemo(() => {
    if (!workoutSessions || workoutSessions.length === 0) return new Date();
    const oldest = workoutSessions.reduce((min, s) => {
      const d = new Date(s.date);
      return d < min ? d : min;
    }, new Date(workoutSessions[0].date));
    return oldest;
  }, [workoutSessions]);

  // set how large the calendar is
  const end = React.useMemo(() => {
    const e = new Date(start);
    e.setFullYear(e.getFullYear());
    return e;
  }, [start]);

  // get list of all months
  const months = React.useMemo(
    () => getMonthsBetween(start, end),
    [start, end],
  );

  const dayMap = React.useMemo(() => {
    const map = new Map<string, WorkoutSession[]>();
    workoutSessions.forEach((s) => {
      const key = isoDate(new Date(s.date));
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    });
    return map;
  }, [workoutSessions]);

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
        // await workoutSessionCache?.deleteWorkoutSession(
        //   WORKOUT_SESSIONS_KEY_NAME,
        //   _id,
        // );
      } else {
        throw new Error();
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          "errorToast",
          "Cannot delete workout session. Check your internet connection.",
        );
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="flex flex-row justify-between items-center">
          <Text className="text-3xl font-sans-bold text-text-primary">
            Calendar
          </Text>

          <View className="flex flex-row justify-between items-center gap-4">
            <Pressable
              onPress={() => setIsDisplayingListView(!isDisplayingListView)}
              className={
                isDisplayingListView ? isNotPickedClasses : isPickedClasses
              }
            >
              <SymbolView
                name="calendar"
                tintColor={isDisplayingListView ? "#ffffff" : "#000000"}
                weight="bold"
                size={24}
              />
            </Pressable>
            <Pressable
              onPress={() => setIsDisplayingListView(!isDisplayingListView)}
              className={
                isDisplayingListView ? isPickedClasses : isNotPickedClasses
              }
            >
              <SymbolView
                name="line.3.horizontal"
                tintColor={!isDisplayingListView ? "#ffffff" : "#000000"}
                weight="bold"
                size={24}
              />
            </Pressable>
          </View>
        </View>

        {isDisplayingListView ? (
          <View className="mt-6">
            {workoutSessions.length === 0 ? (
              <View className="rounded-3xl border border-primary bg-background/70 p-4">
                <Text className="font-sans-regular text-text-secondary">
                  No workouts scheduled. Create one with the plus button in the
                  home page.
                </Text>
              </View>
            ) : (
              workoutSessions.map((session) => (
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
                      <SymbolView
                        name="multiply"
                        tintColor="#ffffff"
                        size={10}
                      />
                    </Pressable>
                  </Pressable>
                </Link>
              ))
            )}
          </View>
        ) : (
          <View className="flex gap-6 mt-6">
            {months.map(({ year, month }) => {
              const matrix = getMonthMatrix(year, month);
              const monthName = new Date(year, month, 1).toLocaleString(
                undefined,
                {
                  month: "long",
                  year: "numeric",
                },
              );

              return (
                <View
                  key={`${year}-${month}`}
                  className="rounded-2xl border-2 border-primary bg-background/90 p-4"
                >
                  <Text className="font-sans-bold text-lg text-text-primary mb-3">
                    {monthName}
                  </Text>
                  <View className="flex-row justify-between mb-2">
                    {weekDays.map((d) => (
                      <Text
                        key={d}
                        className="text-xs font-sans-semibold text-text-secondary"
                        style={{
                          width: (screenWidth - 64) / 7,
                          textAlign: "center",
                        }}
                      >
                        {d}
                      </Text>
                    ))}
                  </View>

                  <View>
                    {matrix.map((week, i) => (
                      <View key={i} className="flex-row mb-2">
                        {week.map((day, j) => {
                          const key = day ? isoDate(day) : null;
                          const sessionsOnDay = key
                            ? (dayMap.get(key) ?? [])
                            : [];
                          const hasSession = sessionsOnDay.length > 0;

                          return (
                            <View
                              key={j}
                              style={{ width: (screenWidth - 64) / 7 }}
                              className="items-center border flex justify-center"
                            >
                              {day ? (
                                <View className="w-9 h-9 rounded-md items-center justify-center">
                                  {hasSession ? (
                                    <SymbolView
                                      name="flame.fill"
                                      tintColor="#ff9100"
                                      weight="bold"
                                      size={24}
                                    />
                                  ) : (
                                    <Text className="font-sans-regular text-sm text-text-primary">
                                      {day.getDate()}
                                    </Text>
                                  )}
                                </View>
                              ) : (
                                <View className="w-9 h-9 items-center justify-center">
                                  <Text className="font-sans-regular text-sm text-text-primary">
                                    -
                                  </Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Calendar;
