import { View, Text, Pressable } from "react-native";
import { SymbolView, SFSymbol } from "expo-symbols";

const InformationOption = ({
  symbolName,
  title,
}: {
  symbolName: SFSymbol;
  title: string;
}) => {
  return (
    <Pressable className="w-full flex-row items-center justify-between rounded-full border-2 border-primary bg-background/80 px-4 py-4">
      <View className="flex-row items-center justify-center gap-3">
        <SymbolView
          name={symbolName}
          tintColor="#ffffff"
          weight="bold"
          size={18}
        />
        <Text className="font-sans-semibold text-lg text-text-primary">
          {title}
        </Text>
      </View>
      <SymbolView name="chevron.right" tintColor="#717171" size={15} />
    </Pressable>
  );
};

export default InformationOption;
