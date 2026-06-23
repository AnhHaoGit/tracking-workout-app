import { styled } from "nativewind";

import {
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/auth";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const { width } = Dimensions.get("window");
const MARGIN = 0.9;

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
          <View
            style={{ width: width * MARGIN }}
            className="border-primary flex border-2 w-full mt-20 px-5 py-8 rounded-4xl"
          >
            <Pressable style={styles.googleButton} onPress={signIn}>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  button: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 100,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  buttonContainer: {
    gap: 16,
    marginTop: 40,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
