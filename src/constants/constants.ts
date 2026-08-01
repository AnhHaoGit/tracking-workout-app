import { Dimensions } from "react-native";

// Authentication Constants
export const TOKEN_KEY_NAME = "accessToken";
export const USER_KEY_NAME = "userData";
export const WORKOUT_SESSIONS_KEY_NAME = "workoutSessions";

export const JWT_EXPIRATION_TIME = "30d"; // 30 days
export const REFRESH_TOKEN_EXPIRY = "30d"; // 30 days
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

// Refresh Token Constants
export const REFRESH_BEFORE_EXPIRY_SEC = 60; // Refresh token 1 minute before expiry

// Google OAuth Constants
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
export const GOOGLE_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/callback`;
export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

// Apple OAuth Constants
export const APPLE_CLIENT_ID = "com.beto.expoauthexample.web";
export const APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET!;
export const APPLE_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/apple/callback`;
export const APPLE_AUTH_URL = "https://appleid.apple.com/auth/authorize";

// Environment Constants
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const MONGODB_URI = process.env.MONGODB_URI!;


export const tabs: AppTab[] = [
  { name: "(home)", title: "Home", symbol: "house.fill" },
  { name: "calendar", title: "Calendar", symbol: "calendar" },
  {
    name: "exercises",
    title: "Exercises",
    symbol: "figure.strengthtraining.traditional",
  },
  {
    name: "statistics",
    title: "Statistics",
    symbol: "chart.line.uptrend.xyaxis",
  },
  { name: "profile", title: "Profile", symbol: "person.crop.circle" },
];

export const informationOptions: InformationOptionProps[] = [
  {
    id: 1,
    symbolName: "textformat",
    title: "Name",
  },
  {
    id: 2,
    symbolName: "birthday.cake.fill",
    title: "Birthday",
  },
  {
    id: 3,
    symbolName: "bell.fill",
    title: "Notifications",
  },
  {
    id: 4,
    symbolName: "person.crop.circle",
    title: "Profile picture",
  },
];

const repsWeightData = [
  [
    { label: "28/04/26", value: 49 },
    { label: "06/05/26", value: 47.83 },
    { label: "11/05/26", value: 50.17 },
    { label: "15/05/26", value: 47.83 },
    { label: "22/05/26", value: 51.25 },
    { label: "27/05/26", value: 55 },
    { label: "05/06/26", value: 53.75 },
    { label: "11/06/26", value: 49 },
    { label: "23/06/26", value: 53.75 },
    { label: "30/06/26", value: 58.67 },
    { label: "06/07/26", value: 57.33 },
    { label: "13/07/26", value: 56 },
    { label: "20/07/26", value: 51.33 },
  ],
  [
    { label: "28/04/26", value: 55.25 },
    { label: "06/05/26", value: 56.67 },
    { label: "11/05/26", value: 55.25 },
    { label: "15/05/26", value: 56.67 },
    { label: "22/05/26", value: 61.5 },
    { label: "27/05/26", value: 57 },
    { label: "05/06/26", value: 58.5 },
    { label: "11/06/26", value: 52 },
    { label: "23/06/26", value: 57 },
    { label: "30/06/26", value: 63.33 },
    { label: "06/07/26", value: 63.33 },
    { label: "13/07/26", value: 63.33 },
    { label: "20/07/26", value: 58.08 },
  ],
  [
    { label: "28/04/26", value: 52.42 },
    { label: "06/05/26", value: 51 },
    { label: "11/05/26", value: 56.67 },
    { label: "15/05/26", value: 56.67 },
    { label: "22/05/26", value: 61.5 },
    { label: "27/05/26", value: 60 },
    { label: "05/06/26", value: 57 },
    { label: "11/06/26", value: 53.33 },
    { label: "23/06/26", value: 57 },
    { label: "30/06/26", value: 63.33 },
    { label: "06/07/26", value: 63.33 },
    { label: "13/07/26", value: 57 },
    { label: "20/07/26", value: 55.25 },
  ],
  [
    { label: "28/04/26", value: 0 },
    { label: "06/05/26", value: 0 },
    { label: "11/05/26", value: 0 },
    { label: "15/05/26", value: 58.08 },
    { label: "22/05/26", value: 0 },
    { label: "27/05/26", value: 0 },
    { label: "05/06/26", value: 60 },
    { label: "11/06/26", value: 54.67 },
    { label: "23/06/26", value: 60 },
    { label: "30/06/26", value: 0 },
    { label: "06/07/26", value: 0 },
    { label: "13/07/26", value: 0 },
    { label: "20/07/26", value: 0 },
  ],
];