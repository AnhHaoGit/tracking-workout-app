import { styled } from "nativewind";

import {
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { useAuth } from "../context/auth";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import GoogleIcon from "../components/GoogleIcon";

const SafeAreaView = styled(RNSafeAreaView);


const SignIn = () => {
  const { signIn } = useAuth();
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior="padding" className="flex-1 w-full">
        <View className="flex items-center gap-2 mt-30">
          <Text className="font-sans-bold text-3xl text-text-primary">
            Welcome Back!
          </Text>
          <Text className="text-text-primary">
            Your next session is one sign-in away.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          className="w-full"
        >
          <Pressable className='bg-white px-8 py-4 mt-15 rounded-2xl flex flex-row items-center justify-center gap-4' onPress={signIn}>
            <GoogleIcon />
            <Text className="text-black font-sans-semibold text-xl">Sign in with Google</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
