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
          key="statistics-screen"
          name="statistics-screen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          key="volume"
          name="volume"
          options={{
            title: "",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
        <Stack.Screen
          key="duration"
          name="duration"
          options={{
            title: "",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
        <Stack.Screen
          key="reps-weight"
          name="reps-weight"
          options={{
            title: "",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
        <Stack.Screen
          key="reps"
          name="reps"
          options={{
            title: "",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack>
    </>
  );
}
