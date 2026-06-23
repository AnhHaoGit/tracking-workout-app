import { Text, View, ActivityIndicator } from "react-native";
import React from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/auth";

const SafeAreaView = styled(RNSafeAreaView);

const HomeScreen = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    router.replace("/login");
  }
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-background">
      <Text className="font-sans-heavy text-5xl text-text-primary">
        HomeScreen
      </Text>
      {user && (
        <Text className="font-sans-regular text-lg text-text-primary">
          Welcome, {user.name}!
        </Text>
      )}
    </SafeAreaView>
  );
};
export default HomeScreen;
