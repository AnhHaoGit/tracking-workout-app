import { Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useAuth } from "@/context/auth";

export const SignOutButton = () => {
  const { signOut } = useAuth();

  return (
    <Pressable
      onPress={signOut}
      className="w-full flex-row items-center justify-between border-b border-primary px-4 py-4"
    >
      <View className="flex-row items-center justify-center gap-3">
        <SymbolView
          name="rectangle.portrait.and.arrow.right"
          tintColor="#ffffff"
          weight="bold"
          size={18}
        />
        <Text className="font-sans-semibold text-lg text-text-primary">
          Sign out
        </Text>
      </View>
      <SymbolView name="chevron.right" tintColor="#717171" size={15} />
    </Pressable>
  );
};
