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


const test = {
  _id: {
    $oid: "6a703d78184cc4be3f3d4c8b",
  },
  name: "Push Day",
  date: "2026-08-03T07:04:06.455Z",
  time: "2026-08-03T09:00:00.000Z",
  exercises: [
    {
      id: 2,
      name: "Dumbbell Lateral Raise",
      targetMuscle: "Shoulders",
      secondaryMuscles: [],
      equipment: ["Dumbbell"],
      type: "Strength",
      sets: [
        {
          id: 1,
          weight: null,
          reps: null,
        },
        {
          id: 2,
          weight: null,
          reps: null,
        },
        {
          id: 3,
          weight: null,
          reps: null,
        },
      ],
      img: "https://www.jefit.com/images/exercises/960_590/128.jpg",
      technique: "None",
    },
    {
      id: 2,
      name: "Dumbbell Lateral Raise",
      targetMuscle: "Shoulders",
      secondaryMuscles: [],
      equipment: ["Dumbbell"],
      type: "Strength",
      sets: [
        {
          id: 1,
          weight: null,
          reps: null,
        },
        {
          id: 2,
          weight: null,
          reps: null,
        },
        {
          id: 3,
          weight: null,
          reps: null,
        },
      ],
      img: "https://www.jefit.com/images/exercises/960_590/128.jpg",
      technique: "None",
    },
  ],
  createdAt: {
    $date: "2026-08-03T07:04:24.386Z",
  },
  status: "Not started yet",
  userId: "108231302162999552373",
};