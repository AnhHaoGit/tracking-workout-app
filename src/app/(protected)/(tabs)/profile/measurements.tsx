import { SymbolView } from "expo-symbols";
import { Text, View } from "react-native";

const EditWorkoutRoutine = () => {
  return (
    <View className="flex-1 flex flex-col items-center bg-background">
      <SymbolView
        name="scalemass.fill"
        tintColor="#ffffff"
        weight="bold"
        size={80}
      />
      <Text className="font-sans-heavy text-4xl text-text-primary text-center">
        Measurements
      </Text>
    </View>
  );
};

export default EditWorkoutRoutine;
