import { styled } from "nativewind";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import ProfileOption from "../../../../components/ProfileOption";
import { USER_DATA, informationOptions } from "../../../../constants/data";
import { SymbolView } from "expo-symbols";
import InformationOption from "../../../../components/InformationOption";
import { SignOutButton } from "@/components/SignOutButton";
import { itemSize1, itemSize2, itemSize3 } from "@/constants/constants";
import { useAuth } from "../../../../context/auth";

const SafeAreaView = styled(RNSafeAreaView);
const achievements = USER_DATA.achievements;
const measurements = USER_DATA.measurements;

const ProfileScreen = () => {
  const { user } = useAuth();
  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 180,
          display: "flex",
          alignItems: "center",
          backgroundColor: "#000000",
          flexGrow: 1,
        }}
      >
        {/* Avatar and name section */}
        <View className="h-1/7 w-full flex items-center gap-4 ">
          <View className="aspect-square h-full flex justify-center items-center bg-background border-primary border-2 rounded-full">
            <View className="w-9/10 h-9/10 flex justify-center items-center bg-primary border-2 rounded-full">
              <Image source={{ uri: user?.picture }} className="w-full h-full rounded-full" />
            </View>
          </View>
          <Text className="text-4xl font-sans-bold text-text-primary">
            {user?.name}
          </Text>
        </View>

        <View className="w-full flex-row flex-wrap justify-between px-5 mt-20">
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={{ width: itemSize3, height: itemSize3 }}
              className="justify-end items-center bg-primary rounded-2xl p-2"
            >
              <View className="flex flex-row justify-center items-center gap-1 mb-2">
                <Text className="text-accent-2 font-sans-bold text-5xl">
                  {achievement.content}
                </Text>
                <Text className="text-text-primary font-sans-regular text-sm">
                  {achievement.change}
                </Text>
              </View>

              <Text className="text-text-primary text-md font-sans-regular">
                {achievement.title}
              </Text>
            </View>
          ))}
        </View>

        <ProfileOption symbolName="medal.fill" title="Achievements" />

        <View className="w-full flex flex-row justify-between px-5 mt-5">
          <View
            style={{ width: itemSize2 }}
            className="flex-row gap-5 bg-primary rounded-full p-4 items-center justify-center"
          >
            <View className="flex flex-row justify-center items-end">
              <Text className="text-accent-2 text-3xl font-sans-bold">
                {measurements.currentWeight}
              </Text>
              <Text className="text-accent-2 text-sm">kg</Text>
            </View>
            <Text className="text-text-primary text-xl font-sans-medium">
              Weight
            </Text>
          </View>

          <View
            style={{ width: itemSize2 }}
            className="flex-row gap-5 bg-primary rounded-full p-4 items-center justify-center"
          >
            <View className="flex flex-row justify-center items-end">
              <Text className="text-accent-2 text-3xl font-sans-bold">
                {measurements.height}
              </Text>
              <Text className="text-accent-2 text-sm">cm</Text>
            </View>
            <Text className="text-text-primary text-xl font-sans-medium">
              Height
            </Text>
          </View>
        </View>

        <ProfileOption symbolName="scalemass.fill" title="Measurements" />

        <ProfileOption
          symbolName="calendar.badge.clock"
          title="Edit workout routine"
        />

        <View className="w-full flex-row justify-items-start px-5 mt-10">
          <Text className="text-text-secondary font-sans-bold text-2xl">
            Information
          </Text>
        </View>

        <View
          style={{ width: itemSize1 }}
          className="bg-primary mt-2 py-5 rounded-4xl flex gap-5"
        >
          {informationOptions.map((option) => (
            <InformationOption
              key={option.id}
              symbolName={option.symbolName}
              title={option.title}
            />
          ))}
        </View>

        <View
          style={{ width: itemSize1 }}
          className="bg-primary mt-5 py-5 flex gap-5 rounded-4xl"
        >
          <SignOutButton />
          <TouchableOpacity className="w-full bg-primary flex flex-row justify-between items-center py-1 px-4">
            <View className="flex flex-row gap-2 justify-center items-center">
              <SymbolView
                name="trash.fill"
                tintColor="#ff5050"
                weight="bold"
                size={18}
              />
              <Text className="text-accent-1 text-xl font-sans-semibold">
                Delete account
              </Text>
            </View>
            <SymbolView name="chevron.right" tintColor="#ff5050" size={15} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
