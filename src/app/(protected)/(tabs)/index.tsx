import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/auth";
import { itemSize1, USER_KEY_NAME } from "@/constants/constants";
import { userCache } from "@/secure-store/user";
import { BASE_URL } from "@/constants/constants";
import { SymbolView } from "expo-symbols";

const SafeAreaView = styled(RNSafeAreaView);

const HomeScreen = () => {
  const { user, isLoading, fetchWithAuth } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = React.useState<Record<
    string,
    unknown
  > | null>(null);

  React.useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetchWithAuth(`${BASE_URL}/api/database/user`, {
        method: "GET",
      });

      const data = await response.json();
      setUserData(data);
      userCache?.saveUserData(USER_KEY_NAME, data);
    };

    fetchUserData();
  }, [fetchWithAuth]);

  React.useLayoutEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

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

  // async function fetchProtectedData() {
  //   try {
  //     const response = await fetchWithAuth(`${BASE_URL}/api/protected/data`, {
  //       method: "GET",
  //     });
  //     if (response.ok) {
  //       const data = await response.json();
  //       setData(data);
  //       console.log("Protected data:", data);
  //     } else {
  //       console.error("Failed to fetch protected data:", response.status);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching protected data:", error);
  //   }
  // }

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
          <Pressable>
            <SymbolView
              name="plus"
              tintColor="#ffffff"
              weight="bold"
              size={30}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default HomeScreen;
