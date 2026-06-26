import { Dimensions } from "react-native";

// Authentication Constants
export const TOKEN_KEY_NAME = "accessToken";

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

// Size
const { width } = Dimensions.get("window");
export const PADDING = 0.05;
export const MARGIN = 0.9;
export const itemSize1 = width - width * PADDING * 2;
export const itemSize2 = (width * MARGIN - width * PADDING * 2) / 2;
export const itemSize3 = (width * MARGIN - width * PADDING * 2) / 3;
