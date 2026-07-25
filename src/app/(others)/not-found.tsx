import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";

const NotFoundScreen = () => {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="font-sans-bold text-3xl text-text-primary mb-2">
        404
      </Text>
      <Text className="font-sans-regular text-text-secondary text-center mb-6">
        No data found.
      </Text>
      <Pressable
        onPress={() => router.replace("/")}
        className="bg-white px-6 py-3 rounded-full"
      >
        <Text className="font-sans-semibold">Return to Home</Text>
      </Pressable>
    </View>
  );
};

export default NotFoundScreen;
