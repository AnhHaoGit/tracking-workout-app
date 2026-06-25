import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/auth";
import { BASE_URL } from "@/constants/constants";

const SafeAreaView = styled(RNSafeAreaView);

const HomeScreen = () => {
  const { user, isLoading, signOut, fetchWithAuth } = useAuth();
  const router = useRouter();
  const [data, setData] = React.useState<any>(null);

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  console.log("user", user);

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

  async function fetchProtectedData() {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/protected/data`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setData(data);
        console.log("Protected data:", data);
      } else {
        console.error("Failed to fetch protected data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching protected data:", error);
    }
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-background">
      <Text className="font-sans-heavy text-5xl text-text-primary">
        Home Screen
      </Text>
      <Text className="font-sans-regular text-lg text-text-primary">
        Welcome back {user.name}!
      </Text>
      <Button title="Sign out" onPress={signOut} />
      <Button title="Fetch Protected Data" onPress={fetchProtectedData} />
      <Text className="font-sans-regular text-lg text-text-primary">
        {data ? JSON.stringify(data) : "No data fetched yet."}
      </Text>
    </SafeAreaView>
  );
};
export default HomeScreen;
