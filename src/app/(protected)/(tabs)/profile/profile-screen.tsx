import { styled } from "nativewind";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import ProfileOption from "../../../../components/ProfileOption";
import { informationOptions } from "../../../../constants/constants";
import InformationOption from "../../../../components/InformationOption";
import { SignOutButton } from "@/components/SignOutButton";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { useAuth } from "../../../../context/auth";

const SafeAreaView = styled(RNSafeAreaView);

const ProfileScreen = () => {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 120, alignItems: "center" }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar and name section */}
        <View className="mt-4 w-full items-center gap-4">
          <View className="aspect-square h-28 items-center justify-center rounded-full border-2 border-primary bg-background/80">
            <View className="h-9/10 w-9/10 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-background">
              <Image
                source={{ uri: user?.picture }}
                className="h-full w-full rounded-full"
              />
            </View>
          </View>
          <Text className="font-sans-bold text-3xl text-text-primary">
            {user?.name}
          </Text>
        </View>

        {/* Menu options */}
        <View className="mt-8 w-full gap-2">
          <ProfileOption
            symbolName="medal.fill"
            title="Achievements"
            link="achievements"
          />
          <ProfileOption
            symbolName="scalemass.fill"
            title="Measurements"
            link="measurements"
          />
          <ProfileOption
            symbolName="calendar.badge.clock"
            title="Edit workout routine"
            link="edit-workout-routine"
          />
        </View>

        {/* Information section */}
        <View className="mt-8 w-full gap-2">
          <Text className="mb-2 font-sans-bold text-lg text-text-secondary">
            Information
          </Text>
          {informationOptions.map((option) => (
            <InformationOption
              key={option.id}
              symbolName={option.symbolName}
              title={option.title}
            />
          ))}
        </View>

        {/* Account section */}
        <View className="mt-6 w-full">
          <View className="rounded-3xl border-2 border-primary bg-background/80">
            <SignOutButton />
            <DeleteAccountButton />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
