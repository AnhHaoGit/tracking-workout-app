import { Stack } from "expo-router";

export default function ProfileLayout() {
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
          key="profile-screen"
          name="profile-screen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          key="edit-workout-routine"
          name="edit-workout-routine"
          options={{
            title: "",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
        <Stack.Screen
          key="achievements"
          name="achievements"
          options={{
            title: "",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
        <Stack.Screen
          key="measurements"
          name="measurements"
          options={{
            title: "",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack>
    </>
  );
}
