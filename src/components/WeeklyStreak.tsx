import { WorkoutSession } from "@/constants/type";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Text, View } from "react-native";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

type DayStatus = "completed" | "planned" | "empty";

const toMondayFirstIndex = (jsDay: number) => (jsDay + 6) % 7;

const isSameLocalDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getStartOfWeek = (date: Date) => {
  const mondayIndex = toMondayFirstIndex(date.getDay());
  const start = new Date(date);
  start.setDate(date.getDate() - mondayIndex);
  start.setHours(0, 0, 0, 0);
  return start;
};

const WeeklyStreak = ({
  workoutSessions,
}: {
  workoutSessions: WorkoutSession[];
}) => {
  const weekDays = React.useMemo(() => {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);

    return Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + offset);

      const sessionsOnDay = workoutSessions.filter((session) =>
        isSameLocalDate(new Date(session.date), date),
      );

      let status: DayStatus = "empty";
      if (sessionsOnDay.some((s) => s.status === "Completed")) {
        status = "completed";
      } else if (sessionsOnDay.length > 0) {
        status = "planned";
      }

      return {
        label: DAY_LABELS[offset],
        date,
        status,
        isToday: isSameLocalDate(date, today),
      };
    });
  }, [workoutSessions]);

  const weeklyStreak = React.useMemo(() => {
    const completedDates = workoutSessions
      .filter((s) => s.status === "Completed")
      .map((s) => new Date(s.date));

    const hasCompletedInWeek = (weekStart: Date) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      return completedDates.some((d) => d >= weekStart && d < weekEnd);
    };

    const today = new Date();
    let cursor = getStartOfWeek(today);

    if (!hasCompletedInWeek(cursor)) {
      cursor.setDate(cursor.getDate() - 7);
    }

    let streak = 0;
    const MAX_WEEKS_LOOKBACK = 520;

    for (let i = 0; i < MAX_WEEKS_LOOKBACK; i++) {
      if (!hasCompletedInWeek(cursor)) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 7);
    }

    return streak;
  }, [workoutSessions]);

  return (
    <View className="mb-6 flex-row items-center gap-4 rounded-3xl border-2 border-primary bg-background/80 p-4">
      <View
        className="items-center justify-center pr-4"
        style={{ borderRightWidth: 1, borderRightColor: "#2a2a2a" }}
      >
        <Text className="font-sans-bold text-3xl text-accent-2">
          {weeklyStreak}
        </Text>
        <Text className="font-sans-regular text-xs text-text-secondary">
          week streak
        </Text>
      </View>

      <View className="flex-1 flex-row justify-between">
        {weekDays.map((day) => (
          <View
            key={day.label + day.date.toISOString()}
            className="items-center gap-1"
          >
            <SymbolView
              name="flame.fill"
              size={20}
              tintColor={
                day.status === "completed"
                  ? "#ff9100"
                  : day.status === "planned"
                    ? "#5c3d1a"
                    : "#333333"
              }
            />
            <Text
              className={`font-sans-medium text-xs ${
                day.isToday ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              {day.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default WeeklyStreak;
