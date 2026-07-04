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
          key="exercises-screen"
          name="exercises-screen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          key="exercise-detail"
          name="[exerciseId]"
          options={{
            title: "",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack>
    </>
  );
}
