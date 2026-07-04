import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useUser } from "@/context/user";
import { UserData } from "@/context/user";

type UserCache = {
  // getUserData: (key: string) => Promise<string | null>;
  saveUserData: (key: string, data: UserData) => Promise<void>;
  deleteUserData: (key: string) => Promise<void>;
};

const createUserCache = (): UserCache => {
  const { updateUserData } = useUser();
  return {
    // getUserData: async (key: string) => {
    //   try {
    //     const item = await SecureStore.getItemAsync(key);
    //     return item;
    //   } catch (error) {
    //     console.error("secure store get item error: ", error);
    //     await SecureStore.deleteItemAsync(key);
    //     return null;
    //   }
    // },

    saveUserData: (key: string, data: UserData) => {
      updateUserData(data);
      return SecureStore.setItemAsync(key, JSON.stringify(data));
    },
    deleteUserData: (key: string) => {
      return SecureStore.deleteItemAsync(key);
    },
  };
};

export const userCache = Platform.OS !== "web" ? createUserCache() : undefined;
