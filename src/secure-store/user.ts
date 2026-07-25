// import * as SecureStore from "expo-secure-store";
// import { Platform } from "react-native";
// import { useUser } from "@/context/user";
// import { UserData } from "@/constants/type";

// type UserCache = {
//   getUserData: (key: string) => Promise<UserData | null>;
//   saveUserData: (key: string, data: UserData) => Promise<void>;
//   deleteUserData: (key: string) => Promise<void>;
// };

// const createUserCache = (): UserCache => {
//   const { updateUserData } = useUser();
//   return {
//     getUserData: async (key: string) => {
//       try {
//         const item = await SecureStore.getItemAsync(key);
//         if (!item) return null;
//         const parsed = JSON.parse(item) as UserData;
//         return parsed;
//       } catch (error) {
//         console.error(
//           "Failed to load user data from secure store",
//           error,
//         );
//         return null;
//       }
//     },

//     saveUserData: (key: string, data: UserData) => {
//       updateUserData(data);
//       return SecureStore.setItemAsync(key, JSON.stringify(data));
//     },
//     deleteUserData: (key: string) => {
//       return SecureStore.deleteItemAsync(key);
//     },
//   };
// };

// export const userCache = Platform.OS !== "web" ? createUserCache() : undefined;
