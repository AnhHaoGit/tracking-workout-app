import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SymbolView, SFSymbol } from "expo-symbols";
const InformationOption = ({
  symbolName,
  title,
}: {
  symbolName: SFSymbol;
  title: string;
}) => {
  return (
    <TouchableOpacity className="w-full bg-primary flex flex-row justify-between py-1 items-center px-4">
      <View className="flex flex-row gap-2 justify-center items-center">
        <SymbolView
          name={symbolName}
          tintColor="#ffffff"
          weight="bold"
          size={18}
        />
        <Text className="text-text-primary text-xl font-sans-semibold">
          {title}
        </Text>
      </View>
      <SymbolView name="chevron.right" tintColor="#717171" size={15} />
    </TouchableOpacity>
  );
};

export default InformationOption;
