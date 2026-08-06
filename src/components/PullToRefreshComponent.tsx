import { ScrollView, RefreshControl } from "react-native";
import React from "react";
import { useAuth } from "@/context/auth";
import { useUser } from "@/context/user";
import { useWorkoutSessions } from "@/context/workout-sessions";
import { BASE_URL } from "@/constants/constants";
import showToast from "@/utils/toast";

const PullToRefreshComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { user, fetchWithAuth } = useAuth();
  const { updateUserData } = useUser();
  const { saveWorkoutSessions } = useWorkoutSessions();

  const refreshData = React.useCallback(async () => {
    if (!user) return;

    try {
      const [userResponse, sessionsResponse] = await Promise.all([
        fetchWithAuth(`${BASE_URL}/api/database/user`, { method: "GET" }),
        fetchWithAuth(`${BASE_URL}/api/database/workout-sessions`, {
          method: "GET",
        }),
      ]);

      if (userResponse.ok) {
        const userJson = await userResponse.json();
        updateUserData(userJson);
      }

      if (sessionsResponse.ok) {
        const sessionsJson = await sessionsResponse.json();
        saveWorkoutSessions(sessionsJson);
      }

      if (!userResponse.ok || !sessionsResponse.ok) {
        throw new Error("Failed to refresh data");
      }
    } catch (error) {
      console.error("Failed to refresh data", error);
      showToast(
        "errorToast",
        "Failed to refresh data. Check your internet connection.",
      );
    }
  }, [fetchWithAuth, saveWorkoutSessions, updateUserData, user]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshData().finally(() => setRefreshing(false));
  }, [refreshData]);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 180,
        backgroundColor: "#000000",
      }}
      className="p-4"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#ffffff"
        />
      }
    >
      {children}
    </ScrollView>
  );
};

export default PullToRefreshComponent;
