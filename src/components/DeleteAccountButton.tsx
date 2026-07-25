import { Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

export const DeleteAccountButton = () => {
  return (
    <Pressable
      className="w-full flex-row items-center justify-between px-4 py-4"
      onPress={() => {
        // TODO: xử lý xoá tài khoản
      }}
    >
      <View className="flex-row items-center justify-center gap-3">
        <SymbolView
          name="trash.fill"
          tintColor="#ff5050"
          weight="bold"
          size={18}
        />
        <Text className="font-sans-semibold text-lg text-accent-1">
          Delete account
        </Text>
      </View>
      <SymbolView name="chevron.right" tintColor="#ff5050" size={15} />
    </Pressable>
  );
};
