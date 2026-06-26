import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useAuth } from "@/context/auth";

export const SignOutButton = () => {
  const { signOut } = useAuth();

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={signOut}
    >
      <View className="flex flex-row gap-2 justify-center items-center">
        <SymbolView
          name="rectangle.portrait.and.arrow.right"
          tintColor="#ffffff"
          weight="bold"
          size={18}
        />
        <Text className="text-text-primary text-xl font-sans-semibold">
          Sign out
        </Text>
      </View>

      <SymbolView name="chevron.right" tintColor="#717171" size={15} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#181818",
    paddingVertical: 4,
    paddingHorizontal: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
