import { Stack } from "expo-router";

export default function ProtectedLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#000000",
          },
        }}
      >
        <Stack.Screen
          key="tabs"
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          key="workout-session-detail"
          name="[workoutSessionId]"
          options={{
            title: "",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack>
    </>
  );
}
