import PullToRefreshComponent from "@/components/PullToRefreshComponent";
import { BASE_URL } from "@/constants/constants";
import { WorkoutSession } from "@/constants/type";
import { useAuth } from "@/context/auth";
import { useWorkoutSessions } from "@/context/workout-sessions";
import showToast from "@/utils/toast";
import { Link, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { styled } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  InteractionManager,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const screenWidth = Dimensions.get("window").width;
const calendarCellWidth = (screenWidth - 64) / 7;

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// get all pair of month and year from start point to end point
const getMonthsBetween = (start: Date, end: Date) => {
  const months: { year: number; month: number }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= last) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth() });
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
};

const getMonthMatrix = (year: number, month: number) => {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
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

const FIRE_COLOR_COMPLETED = "#ff9100";
const FIRE_COLOR_PENDING = "#5c3d1a";

const getFireColor = (sessionsOnDay: WorkoutSession[]) => {
  const allCompleted = sessionsOnDay.every((s) => s.status === "Completed");
  return allCompleted ? FIRE_COLOR_COMPLETED : FIRE_COLOR_PENDING;
};

const formatDuration = (
  startedAt?: string | Date,
  finishedAt?: string | Date,
) => {
  if (!startedAt || !finishedAt) return null;

  const totalSeconds = Math.max(
    0,
    Math.floor(
      (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000,
    ),
  );

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
};

const isPickedClasses = "p-2 bg-white rounded-full";
const isNotPickedClasses = "p-2 border-2 border-primary rounded-full";

const MONTHS_PER_BATCH = 1;
const BATCH_DELAY = 60;

const Calendar = () => {
  const router = useRouter();
  const { user, isLoading, fetchWithAuth } = useAuth();
  const { workoutSessions, saveWorkoutSessions, deleteWorkoutSession } =
    useWorkoutSessions();
  const [isDisplayingListView, setIsDisplayingListView] =
    React.useState<boolean>(false);
  const [listFilter, setListFilter] = React.useState<
    "all" | "completed" | "remaining"
  >("all");
  // số tháng đang được render trong calendar view
  const [visibleMonthsCount, setVisibleMonthsCount] = React.useState(1);

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  React.useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;

      try {
        const response = await fetchWithAuth(
          `${BASE_URL}/api/database/workout-sessions`,
          {
            method: "GET",
          },
        );
        if (response.ok) {
          const data = await response.json();

          saveWorkoutSessions(data);
        } else {
          throw new Error();
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to load workout sessions", error);
          showToast(
            "errorToast",
            "Failed to load workout sessions. Check your Internet connection",
          );
        }
      }
    };

    loadSessions();
  }, [fetchWithAuth, user]);

  const start = React.useMemo(() => {
    if (!workoutSessions || workoutSessions.length === 0) return new Date();
    const oldest = workoutSessions.reduce((min, s) => {
      const d = new Date(s.date);
      return d < min ? d : min;
    }, new Date(workoutSessions[0].date));
    return oldest;
  }, [workoutSessions]);

  const end = React.useMemo(() => {
    if (!workoutSessions || workoutSessions.length === 0) return new Date();
    const latest = workoutSessions.reduce((max, s) => {
      const d = new Date(s.date);
      return d > max ? d : max;
    }, new Date(workoutSessions[0].date));
    return latest;
  }, [workoutSessions]);

  // get list of all months
  const months = React.useMemo(
    () => getMonthsBetween(start, end),
    [start, end],
  );

  // mỗi khi danh sách tháng thay đổi (vd: data workout session mới load xong),
  // reset lại về render 1 tháng rồi render dần tiếp
  React.useEffect(() => {
    setVisibleMonthsCount(1);
  }, [months.length]);

  // render dần từng tháng, đợi tương tác/animation hiện tại (chuyển màn hình) xong đã
  React.useEffect(() => {
    if (isDisplayingListView) return;
    if (visibleMonthsCount >= months.length) return;

    let timer: ReturnType<typeof setTimeout>;
    const interaction = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        setVisibleMonthsCount((c) =>
          Math.min(c + MONTHS_PER_BATCH, months.length),
        );
      }, BATCH_DELAY);
    });

    return () => {
      interaction.cancel();
      clearTimeout(timer);
    };
  }, [visibleMonthsCount, months.length, isDisplayingListView]);

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

  const visibleMonths = months.slice(0, visibleMonthsCount);
  const isStillRenderingMonths = visibleMonthsCount < months.length;

  const filteredAndSortedSessions = React.useMemo(() => {
    const filtered = workoutSessions.filter((session) => {
      if (listFilter === "completed") return session.status === "Completed";
      if (listFilter === "remaining") return session.status !== "Completed";
      return true; // "all"
    });

    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [workoutSessions, listFilter]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <PullToRefreshComponent>
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
        {isDisplayingListView && (
          <View className="flex flex-row gap-2 mt-4">
            {(
              [
                { key: "remaining", label: "Not completed" },
                { key: "completed", label: "Completed" },
                { key: "all", label: "All" },
              ] as const
            ).map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setListFilter(tab.key)}
                className={`px-4 py-2 rounded-full ${
                  listFilter === tab.key
                    ? "bg-white border-2 border-white"
                    : "border-2 border-primary"
                }`}
              >
                <Text
                  className={`font-sans-semibold text-sm ${
                    listFilter === tab.key ? "text-black" : "text-text-primary"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {isDisplayingListView ? (
          <View className="mt-6">
            {filteredAndSortedSessions.length === 0 ? (
              <View className="rounded-3xl border border-primary bg-background/70 p-4">
                <Text className="font-sans-regular text-text-secondary">
                  {listFilter === "completed"
                    ? "No completed workouts yet."
                    : listFilter === "remaining"
                      ? "No remaining workouts. Nice work!"
                      : "No workouts scheduled. Create one with the plus button in the home page."}
                </Text>
              </View>
            ) : (
              filteredAndSortedSessions.map((session) => {
                const duration =
                  session.status === "Completed"
                    ? formatDuration(session.startedAt, session.finishedAt)
                    : null;

                return (
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
                            {duration ? `  •  ${duration}` : ""}
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
                );
              })
            )}
          </View>
        ) : (
          <View className="flex gap-6 mt-6">
            {visibleMonths.map(({ year, month }) => {
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
                  <View className="mb-2 flex-row">
                    {weekDays.map((d) => (
                      <View
                        key={d}
                        style={{ width: calendarCellWidth }}
                        className="items-center"
                      >
                        <Text className="text-xs font-sans-semibold text-text-secondary">
                          {d}
                        </Text>
                      </View>
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
                              style={{ width: calendarCellWidth }}
                              className="items-center border flex justify-center"
                            >
                              {day ? (
                                <View className="w-9 h-9 rounded-md items-center justify-center">
                                  {hasSession ? (
                                    <SymbolView
                                      name="flame.fill"
                                      tintColor={getFireColor(sessionsOnDay)}
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

            {isStillRenderingMonths && (
              <View className="items-center justify-center py-4">
                <ActivityIndicator size="small" />
              </View>
            )}
          </View>
        )}
      </PullToRefreshComponent>
    </SafeAreaView>
  );
};

export default Calendar;
