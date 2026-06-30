import "../../global.css";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { AuthProvider } from "../context/auth";
import { UserProvider } from "@/context/user";

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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <UserProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </UserProvider>
    </AuthProvider>
  );
}
