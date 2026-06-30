import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type UserCache = {
  getUserData: (key: string) => Promise<string | null>;
  saveUserData: (key: string, data: Object) => Promise<void>;
  deleteUserData: (key: string) => Promise<void>;
};

const createUserCache = (): UserCache => {
  return {
    getUserData: async (key: string) => {
      try {
        const item = await SecureStore.getItemAsync(key);
        return item;
      } catch (error) {
        console.error("secure store get item error: ", error);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },

    saveUserData: (key: string, data: object) => {
      return SecureStore.setItemAsync(key, JSON.stringify(data));
    },
    deleteUserData: (key: string) => {
      return SecureStore.deleteItemAsync(key);
    },
  };
};

export const userCache = Platform.OS !== "web" ? createUserCache() : undefined;
