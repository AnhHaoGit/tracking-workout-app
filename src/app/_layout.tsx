import "../../global.css";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar, View, Text } from "react-native";
import { AuthProvider } from "../context/auth";
import { UserProvider } from "@/context/user";
import { WorkoutSessionsProvider } from "@/context/workout-sessions";
import Toast from "react-native-toast-message";
import { ToastConfigParams } from "react-native-toast-message";
import { SymbolView } from "expo-symbols";
import { NetworkProvider } from "@/context/network";


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-black": require("../assets/fonts/SF-Pro-Rounded-Black.otf"),
    "sans-bold": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
    "sans-heavy": require("../assets/fonts/SF-Pro-Rounded-Heavy.otf"),
    "sans-light": require("../assets/fonts/SF-Pro-Rounded-Light.otf"),
    "sans-medium": require("../assets/fonts/SF-Pro-Rounded-Medium.otf"),
    "sans-regular": require("../assets/fonts/SF-Pro-Rounded-Regular.otf"),
    "sans-semibold": require("../assets/fonts/SF-Pro-Rounded-Semibold.otf"),
    "sans-thin": require("../assets/fonts/SF-Pro-Rounded-Thin.otf"),
    "sans-ultralight": require("../assets/fonts/SF-Pro-Rounded-Ultralight.otf"),
  });

  const toastConfig = {
    successToast: ({ text1, text2 }: ToastConfigParams<any>) => (
      <View
        className="flex-row items-center gap-3 rounded-3xl border-2 border-primary bg-background px-4 py-3"
        style={{ width: "90%" }}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full border border-accent-3 bg-accent-3/10">
          <SymbolView
            name="checkmark"
            tintColor="#58c5cc"
            size={16}
            weight="bold"
          />
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-base text-accent-3">
            {text1}
          </Text>
          {text2 ? (
            <Text className="font-sans-regular text-sm text-text-primary">
              {text2}
            </Text>
          ) : null}
        </View>
      </View>
    ),

    errorToast: ({ text1, text2 }: ToastConfigParams<any>) => (
      <View
        className="flex-row items-center gap-3 rounded-3xl border-2 border-primary bg-background px-4 py-3"
        style={{ width: "90%" }}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full border border-accent-1 bg-accent-1/10">
          <SymbolView
            name="xmark"
            tintColor="#ff5050"
            size={16}
            weight="bold"
          />
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-base text-accent-1">
            {text1}
          </Text>
          {text2 ? (
            <Text className="font-sans-regular text-sm text-text-primary">
              {text2}
            </Text>
          ) : null}
        </View>
      </View>
    ),

    infoToast: ({ text1, text2 }: ToastConfigParams<any>) => (
      <View
        className="flex-row items-center gap-3 rounded-3xl border-2 border-primary bg-background px-4 py-3"
        style={{ width: "90%" }}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full border border-accent-2 bg-accent-2/10">
          <SymbolView
            name="info"
            tintColor="#ff9100"
            size={16}
            weight="bold"
          />
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-base text-accent-2">
            {text1}
          </Text>
          {text2 ? (
            <Text className="font-sans-regular text-sm text-text-primary">
              {text2}
            </Text>
          ) : null}
        </View>
      </View>
    ),
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <AuthProvider>
        <UserProvider>
          <WorkoutSessionsProvider>
            <NetworkProvider>
              <StatusBar barStyle="light-content" backgroundColor="#000000" />
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
            </NetworkProvider>
          </WorkoutSessionsProvider>
        </UserProvider>
      </AuthProvider>
      <Toast config={toastConfig} />
    </>
  );
}
