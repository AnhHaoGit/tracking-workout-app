import { Text, View, StyleSheet } from "react-native";
import { SymbolView } from "expo-symbols";
import { Checkbox } from "expo-checkbox";
import * as React from "react";
import { itemSize1 } from "@/constants/constants";

const EditWorkoutRoutine = () => {
  const [isOnTheGoChecked, setOnTheGoChecked] = React.useState(false);
  const [isWeeklyFixedChecked, setWeeklyFixedChecked] = React.useState(false);

  const handleCheckOnTheGo = () => {
    setOnTheGoChecked(true);
    setWeeklyFixedChecked(false);
  };

  const handleCheckWeeklyFixed = () => {
    setOnTheGoChecked(false);
    setWeeklyFixedChecked(true);
  };

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
      <View className="m-10 flex flex-col gap-4">
        <View style={styles.checkBoxSection} className="bg-primary">
          <Checkbox
            style={styles.checkbox}
            value={isOnTheGoChecked}
            onValueChange={handleCheckOnTheGo}
          />
          <Text style={styles.paragraph} className="font-sans-bold">
            On-the-Go
          </Text>
        </View>
        <View style={styles.checkBoxSection} className="bg-primary">
          <Checkbox
            style={styles.checkbox}
            value={isWeeklyFixedChecked}
            onValueChange={handleCheckWeeklyFixed}
          />
          <Text style={styles.paragraph} className="font-sans-bold">
            Weekly Fixed
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EditWorkoutRoutine;

const styles = StyleSheet.create({
  checkBoxSection: {
    flexDirection: "row",
    alignItems: "center",
    width: itemSize1,
    padding: 10,
    borderRadius: 30
  },
  paragraph: {
    fontSize: 16,
    color: "#ffffff",
  },
  checkbox: {
    margin: 8,
    borderRadius: "100%",
  },
});
