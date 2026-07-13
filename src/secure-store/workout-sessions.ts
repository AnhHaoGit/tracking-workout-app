import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { WorkoutSessionCache, WorkoutSession } from "@/constants/type";

const cache: WorkoutSessionCache | undefined =
  Platform.OS !== "web"
    ? {
        getWorkoutSessions: async (key): Promise<WorkoutSession[]> => {
          try {
            const item = await SecureStore.getItemAsync(key);
            if (!item) return [];
            const parsed = JSON.parse(item) as WorkoutSession[];
            return Array.isArray(parsed) ? parsed : [];
          } catch (error) {
            console.error(
              "Failed to load workout sessions from secure store",
              error,
            );
            return [];
          }
        },
        saveWorkoutSessions: async (key, sessions: WorkoutSession[]) => {
          await SecureStore.setItemAsync(key, JSON.stringify(sessions));
        },
        addWorkoutSession: async (key: string, session: WorkoutSession) => {
          const store = cache as WorkoutSessionCache;
          const current = await store.getWorkoutSessions(key);
          const next = [session, ...current];
          await store.saveWorkoutSessions(key, next);
          return next;
        },
      }
    : undefined;

export const workoutSessionCache = cache;
