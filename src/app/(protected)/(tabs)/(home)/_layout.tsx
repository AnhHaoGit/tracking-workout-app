import { Stack } from "expo-router";

export default function HomeLayout() {
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
          key="index"
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          key="add-workout-session"
          name="add-workout-session"
          options={{
            title: "",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack>
    </>
  );
}
