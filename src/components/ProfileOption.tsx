import { View, Text, Dimensions } from "react-native";
import { SymbolView, SFSymbol } from "expo-symbols";
import { Link } from "expo-router";

const { width } = Dimensions.get("window");
const MAX_WIDTH = width * 0.9;

const ProfileOption = ({
  symbolName,
  title,
}: {
  symbolName: SFSymbol;
  title: string;
}) => {
  return (
    <Link href="/(protected)/(tabs)/profile/edit-workout-routine">
      <View
        style={{ width: MAX_WIDTH }}
        className="w-full bg-primary rounded-full flex flex-row justify-between items-center py-3 px-4 mt-5"
      >
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
      </View>
    </Link>
  );
};

export default ProfileOption;
