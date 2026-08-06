import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const NoConnectionScreen = () => {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = React.useState(false);
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const ringScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });
  const ringOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  const handleRetry = async () => {
    setIsRetrying(true);
    const state = await NetInfo.fetch();
    const connected =
      !!state.isConnected && state.isInternetReachable !== false;

    setIsRetrying(false);

    if (connected) {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6 bg-background">
        <View className="items-center justify-center mb-8">
          <Animated.View
            style={{
              position: "absolute",
              width: 88,
              height: 88,
              borderRadius: 44,
              borderWidth: 2,
              borderColor: "#ff5050",
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            }}
          />
          <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-accent-1 bg-accent-1/10">
            <SymbolView
              name="wifi.slash"
              tintColor="#ff5050"
              size={32}
              weight="semibold"
            />
          </View>
        </View>

        <Text className="font-sans-bold text-2xl text-text-primary text-center">
          No connection
        </Text>
        <Text className="font-sans-regular text-base text-text-secondary text-center mt-2 max-w-xs">
          Your workout data is safe. Reconnect to Wi-Fi or mobile data to keep
          going.
        </Text>

        <Pressable
          onPress={handleRetry}
          disabled={isRetrying}
          className="mt-8 bg-white px-8 py-3 rounded-full active:opacity-70"
          style={{ opacity: isRetrying ? 0.6 : 1 }}
        >
          <View className="flex-row items-center gap-2">
            {isRetrying && (
              <SymbolView
                name="arrow.triangle.2.circlepath"
                tintColor="#000000"
                size={16}
                weight="bold"
              />
            )}
            <Text className="font-sans-semibold text-base">
              {isRetrying ? "Checking..." : "Try again"}
            </Text>
          </View>
        </Pressable>

        <View className="flex-row items-center gap-2 mt-6 rounded-full border-2 border-primary px-4 py-2">
          <View className="h-2 w-2 rounded-full bg-accent-1" />
          <Text className="font-sans-medium text-xs text-text-secondary">
            Reconnecting automatically when a signal is found
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NoConnectionScreen;
