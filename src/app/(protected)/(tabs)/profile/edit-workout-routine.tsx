import { BASE_URL, itemSize1, USER_KEY_NAME } from "@/constants/constants";
import { useAuth } from "@/context/auth";
import { userCache } from "@/secure-store/user";
import { Checkbox } from "expo-checkbox";
import { SymbolView } from "expo-symbols";
import * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { UserData, useUser } from "@/context/user";

const EditWorkoutRoutine = () => {
  const [isOnTheGoChecked, setOnTheGoChecked] = React.useState(false);
  const [isWeeklyFixedChecked, setWeeklyFixedChecked] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const { fetchWithAuth, user } = useAuth();
  const { userData, updateUserData } = useUser();

  React.useEffect(() => {
    if (userData && userData.routine === "daily") {
      setOnTheGoChecked(true);
    } else if (userData && userData.routine === "weekly") {
      setWeeklyFixedChecked(true);
    } else {
      setWeeklyFixedChecked(true);
    }
  }, [userData, setOnTheGoChecked, setWeeklyFixedChecked]);


  const handleCheckOnTheGo = (checked: boolean) => {
    setOnTheGoChecked(checked);
    setWeeklyFixedChecked(!checked);

    if (checked) {
      handleChangeRoutine("daily");
    }
  };

  const handleCheckWeeklyFixed = (checked: boolean) => {
    setWeeklyFixedChecked(checked);
    setOnTheGoChecked(!checked);

    if (checked) {
      handleChangeRoutine("weekly");
    }
  };

  const handleShowMessage = (receivedMessage: string) => {
    setMessage(receivedMessage);
    setTimeout(() => {
      setMessage(null);
    }, 2000);
  };

  const handleChangeRoutine = async (routine: string) => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/database/routine`, {
        method: "POST",
        body: JSON.stringify({ routine, sub: user?.sub }),
      });

      const data = await response.json();
      if (userData !== null) {
        const updatedUserData = { ...userData, routine };
        updateUserData(updatedUserData);
        userCache?.saveUserData(USER_KEY_NAME, updatedUserData);
      }

      handleShowMessage(data.message);
    } catch (error) {
      handleShowMessage("Cannot update workout routine. Try again later.");
    }
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
      <View className="m-15 flex flex-col gap-4">
        <View style={{ width: itemSize1 }}>
          <View style={styles.checkBoxSection} className="bg-primary">
            <Checkbox
              style={styles.checkbox}
              value={isOnTheGoChecked}
              onValueChange={handleCheckOnTheGo}
              color="#ff9100"
            />
            <View>
              <Text style={styles.paragraph} className="font-sans-bold">
                On-the-Go
              </Text>
              <Text className="text-text-secondary text-xs">
                Plan a one-time workout whenever you're ready.
              </Text>
            </View>
          </View>
          <View></View>
        </View>

        <View
          style={{ width: itemSize1 }}
          className="flex flex-row justify-between items-center"
        >
          <View style={styles.checkBoxSection} className="bg-primary">
            <Checkbox
              style={styles.checkbox}
              value={isWeeklyFixedChecked}
              onValueChange={handleCheckWeeklyFixed}
              color="#ff9100"
            />
            <View>
              <Text style={styles.paragraph} className="font-sans-bold">
                Weekly Fixed
              </Text>
              <Text className="text-text-secondary text-xs">
                Keep your training consistent every single week.
              </Text>
            </View>
          </View>
          <Pressable
            className="flex bg-primary justify-center items-center"
            style={styles.editButton}
          >
            <SymbolView
              name="pencil"
              tintColor="#ffffff"
              weight="bold"
              size={15}
            />
          </Pressable>
        </View>
      </View>
      <Text className="font-sans-regular text-ms text-accent-2 text-center">
        {message}
      </Text>
    </View>
  );
};

export default EditWorkoutRoutine;

const styles = StyleSheet.create({
  checkBoxSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: "90%",
    borderRadius: 30,
    gap: 4,
  },
  paragraph: {
    fontSize: 16,
    color: "#ffffff",
  },
  checkbox: {
    margin: 8,
    borderRadius: "100%",
    color: "#000000",
  },
  editButton: {
    width: 30,
    height: 30,
    padding: 5,
    borderRadius: "100%",
  },
});
