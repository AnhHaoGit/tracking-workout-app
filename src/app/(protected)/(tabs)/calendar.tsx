import { BASE_URL, WORKOUT_SESSIONS_KEY_NAME } from "@/constants/constants";
import { useAuth } from "@/context/auth";
import {
  WorkoutSession,
  workoutSessionCache,
} from "@/secure-store/workout-sessions";
import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { styled } from "nativewind";
import React from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

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

const Calendar = () => {
  const { fetchWithAuth } = useAuth();
  const [sessions, setSessions] = React.useState<WorkoutSession[]>([]);

  React.useEffect(() => {
    const load = async () => {
      const cached = await workoutSessionCache?.getWorkoutSessions(
        WORKOUT_SESSIONS_KEY_NAME,
      );
      if (cached && cached.length) setSessions(cached);

      try {
        const res = await fetchWithAuth(
          `${BASE_URL}/api/database/workout-sessions`,
          { method: "GET" },
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSessions(data);
            await workoutSessionCache?.saveWorkoutSessions(
              WORKOUT_SESSIONS_KEY_NAME,
              data,
            );
          }
        }
      } catch (e) {
        // ignore
      }
    };

    load();
  }, [fetchWithAuth]);

  // get the month that has the oldest session
  const start = React.useMemo(() => {
    if (!sessions || sessions.length === 0) return new Date();
    const oldest = sessions.reduce((min, s) => {
      const d = new Date(s.date);
      return d < min ? d : min;
    }, new Date(sessions[0].date));
    return oldest;
  }, [sessions]);

  // set how large the calendar is
  const end = React.useMemo(() => {
    const e = new Date(start);
    e.setFullYear(e.getFullYear() + 1);
    return e;
  }, [start]);

  // get list of all months
  const months = React.useMemo(
    () => getMonthsBetween(start, end),
    [start, end],
  );

  const dayMap = React.useMemo(() => {
    const map = new Map<string, WorkoutSession[]>();
    sessions.forEach((s) => {
      const key = isoDate(new Date(s.date));
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    });
    return map;
  }, [sessions]);

  const screenWidth = Dimensions.get("window").width;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-sans-bold text-text-primary mb-4">
          Calendar
        </Text>

        {months.map(({ year, month }) => {
          const matrix = getMonthMatrix(year, month);
          console.log(matrix);
          const monthName = new Date(year, month, 1).toLocaleString(undefined, {
            month: "long",
            year: "numeric",
          });

          return (
            <View
              key={`${year}-${month}`}
              className="mb-6 rounded-2xl border border-primary bg-background/90 p-4"
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
                      const sessionsOnDay = key ? (dayMap.get(key) ?? []) : [];
                      const hasSession = sessionsOnDay.length > 0;

                      return (
                        <View
                          key={j}
                          style={{ width: (screenWidth - 64) / 7 }}
                          className="items-center  border flex  justify-center"
                        >
                          {day ? (
                            <View className="w-9 h-9 rounded-md items-center justify-center">
                              {hasSession ? (
                                <Link href="/(protected)/(tabs)/statistics">
                                  <Pressable>
                                    <SymbolView
                                      name="flame.fill"
                                      tintColor="#ff9100"
                                      weight="bold"
                                      size={24}
                                    />
                                  </Pressable>
                                </Link>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default Calendar;
