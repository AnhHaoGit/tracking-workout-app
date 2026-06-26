import { Text } from 'react-native'
import React from 'react'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const exercises = () => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-background">
      <Text className="font-sans-heavy text-5xl text-text-primary">
        Exercises
      </Text>
    </SafeAreaView>
  );
}

export default exercises