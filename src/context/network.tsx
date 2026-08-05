import NetInfo from "@react-native-community/netinfo";
import { usePathname, useRouter } from "expo-router";
import React from "react";

type NetworkContextType = {
  isConnected: boolean;
};

const NetworkContext = React.createContext<NetworkContextType>({
  isConnected: true,
});

export const useNetwork = () => React.useContext(NetworkContext);

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isConnected, setIsConnected] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const wasDisconnected = React.useRef(false);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected =
        !!state.isConnected && state.isInternetReachable !== false;

      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const isOnNoConnectionScreen = pathname === "/no-connection";

    if (!isConnected && !isOnNoConnectionScreen) {
      wasDisconnected.current = true;
      router.push("/no-connection");
    }

    if (isConnected && isOnNoConnectionScreen && wasDisconnected.current) {
      wasDisconnected.current = false;
      router.back();
    }
  }, [isConnected, pathname, router]);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};
