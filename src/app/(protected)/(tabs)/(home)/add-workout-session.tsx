import { SymbolView } from "expo-symbols";
import { Text, View } from "react-native";

const AddWorkoutSession = () => {
  return (
    <View className="flex-1 flex flex-col items-center bg-background">
      <SymbolView
        name="calendar.badge.clock"
        tintColor="#ffffff"
        weight="bold"
        size={80}
      />
      <Text className="font-sans-heavy text-4xl text-text-primary text-center">
        Select and edit your workout routine
      </Text>
    </View>
  );
};

export default AddWorkoutSession;
