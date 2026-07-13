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

// Size
const { width } = Dimensions.get("window");
export const PADDING = 0.05;
export const MARGIN = 0.9;
export const itemSize1 = width - width * PADDING * 2;
export const itemSize2 = (width * MARGIN - width * PADDING * 2) / 2;
export const itemSize3 = (width * MARGIN - width * PADDING * 2) / 3;

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

export const USER_DATA = {
  userId: "1234556789",
  name: "Anh Hao Nguyen",
  email: "nguyenanhhao090708@gmail.com",
  password: "(encrypted password)",
  profilePicture: "(path to profile picture)",
  workoutRoutine: [
    {
      id: "11",
      name: "On-the-Go",
      isActivated: true,
      description: "Plan a one-time workout whenever you're ready.",
    },
    {
      id: "22",
      name: "Weekly Fixed",
      description: "Keep your training consistent every single week.",
      isActivated: true,
      schedule: [
        {
          id: "1",
          day: "Monday",
          title: "Pull Day",
          time: "(date format)",
          exercises: [
            {
              name: "Bench Press",
              sets: [
                {
                  id: 1,
                  reps: 5,
                  weight: "BW",
                  type: "Warm-up",
                  note: "Add 5kg band",
                },
                {
                  id: 2,
                  reps: 5,
                  weight: "BW",
                  type: "Warm-up",
                  note: "Add 5kg band",
                },
                {
                  id: 3,
                  reps: 5,
                  weight: "BW",
                  type: "Warm-up",
                  note: "Add 5kg band",
                },
                {
                  id: 4,
                  reps: 10,
                  weight: "BW",
                  type: "Failure",
                  note: "",
                },
                {
                  id: 5,
                  reps: 9,
                  weight: "BW",
                  type: "Failure",
                  note: "",
                },
                {
                  id: 8,
                  reps: 5,
                  weight: "BW",
                  type: "Failure",
                  note: "",
                },
              ],
            },
            {
              name: "Chin-up",
              sets: [
                {
                  id: 1,
                  reps: 9,
                  weight: "BW",
                  type: "Failure",
                  note: "Add 5kg band",
                },
                {
                  id: 2,
                  reps: 8,
                  weight: "BW",
                  type: "Failure",
                  note: "Add 5kg band",
                },
                {
                  id: 3,
                  reps: 7,
                  weight: "BW",
                  type: "Failure",
                  note: "Add 5kg band",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "22",
      name: "Cycle Flow",
      description: "Repeat your custom routine cycle after cycle..",
      isActivated: true,
      schedule: [
        {
          id: "1",
          time: "(date format)",
          title: "Pull Day",
          exercises: [
            {
              name: "Bench Press",
              sets: [
                {
                  id: 1,
                  reps: 5,
                  weight: "BW",
                  type: "Warm-up",
                  note: "Add 5kg band",
                },
                {
                  id: 2,
                  reps: 5,
                  weight: "BW",
                  type: "Warm-up",
                  note: "Add 5kg band",
                },
                {
                  id: 3,
                  reps: 5,
                  weight: "BW",
                  type: "Warm-up",
                  note: "Add 5kg band",
                },
                {
                  id: 4,
                  reps: 10,
                  weight: "BW",
                  type: "Failure",
                  note: "",
                },
                {
                  id: 5,
                  reps: 9,
                  weight: "BW",
                  type: "Failure",
                  note: "",
                },
                {
                  id: 8,
                  reps: 5,
                  weight: "BW",
                  type: "Failure",
                  note: "",
                },
              ],
            },
            {
              name: "Chin-up",
              sets: [
                {
                  id: 1,
                  reps: 9,
                  weight: "BW",
                  type: "Failure",
                  note: "Add 5kg band",
                },
                {
                  id: 2,
                  reps: 8,
                  weight: "BW",
                  type: "Failure",
                  note: "Add 5kg band",
                },
                {
                  id: 3,
                  reps: 7,
                  weight: "BW",
                  type: "Failure",
                  note: "Add 5kg band",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  measurements: {
    bodyWeight: [
      { date: "(date format)", weight: 70 },
      { date: "(date format)", weight: 72 },
      { date: "(date format)", weight: 74 },
      { date: "(date format)", weight: 76 },
    ],
    bodyFatPercentage: [
      { date: "(date format)", percentage: 15 },
      { date: "(date format)", percentage: 14 },
      { date: "(date format)", percentage: 13 },
      { date: "(date format)", percentage: 12 },
    ],
    currentWeight: 65,
    height: 167,
    bust: 95,
    waist: 75,
    hips: 90,
  },
  gender: 1,
  achievements: [
    {
      id: "1",
      type: "statistic",
      title: "Max dips",
      content: 20,
      change: "+2",
      unit: "reps",
      date: "(date format)",
    },
    {
      id: "2",
      type: "statistic",
      title: "Max push-ups",
      content: 50,
      change: "+2",
      unit: "reps",
      date: "(date format)",
    },
    {
      id: "3",
      type: "statistic",
      title: "Max pull-ups",
      content: 12,
      change: "+2",
      unit: "reps",
      date: "(date format)",
    },
  ],
  schedule: [
    {
      id: "1",
      title: "Pull Day",
      date: "(date format)",
      duration: "(date format)",
      routine: "Weekly Fixed",
      status: "Completed",
      percentageCompleted: 100,
      exercises: [
        {
          name: "Bench Press",
          sets: [
            {
              id: 1,
              reps: 5,
              weight: "BW",
              type: "Warm-up",
              note: "Add 5kg band",
            },
            {
              id: 2,
              reps: 5,
              weight: "BW",
              type: "Warm-up",
              note: "Add 5kg band",
            },
            {
              id: 3,
              reps: 5,
              weight: "BW",
              type: "Warm-up",
              note: "Add 5kg band",
            },
            {
              id: 4,
              reps: 10,
              weight: "BW",
              type: "Failure",
              note: "",
            },
            {
              id: 5,
              reps: 9,
              weight: "BW",
              type: "Failure",
              note: "",
            },
            {
              id: 8,
              reps: 5,
              weight: "BW",
              type: "Failure",
              note: "",
            },
          ],
        },
        {
          name: "Chin-up",
          sets: [
            {
              id: 1,
              reps: 9,
              weight: "BW",
              type: "Failure",
              note: "Add 5kg band",
            },
            {
              id: 2,
              reps: 8,
              weight: "BW",
              type: "Failure",
              note: "Add 5kg band",
            },
            {
              id: 3,
              reps: 7,
              weight: "BW",
              type: "Failure",
              note: "Add 5kg band",
            },
          ],
        },
      ],
      expectedResults: [
        {
          name: "Bench Press",
          sets: [
            {
              id: 1,
              reps: 5,
              weight: "BW",
              type: "Warm-up",
              note: "Add 5kg band",
            },
            {
              id: 2,
              reps: 5,
              weight: "BW",
              type: "Warm-up",
              note: "Add 5kg band",
            },
            {
              id: 3,
              reps: 5,
              weight: "BW",
              type: "Warm-up",
              note: "Add 5kg band",
            },
            {
              id: 4,
              reps: 10,
              weight: "BW",
              type: "Failure",
              note: "",
            },
            {
              id: 5,
              reps: 9,
              weight: "BW",
              type: "Failure",
              note: "",
            },
            {
              id: 8,
              reps: 5,
              weight: "BW",
              type: "Failure",
              note: "",
            },
          ],
        },
        {
          name: "Chin-up",
          sets: [
            {
              id: 1,
              reps: 9,
              weight: "BW",
              type: "Failure",
              note: "Add 5kg band",
            },
            {
              id: 2,
              reps: 8,
              weight: "BW",
              type: "Failure",
              note: "Add 5kg band",
            },
            {
              id: 3,
              reps: 7,
              weight: "BW",
              type: "Failure",
              note: "Add 5kg band",
            },
          ],
        },
      ],
    },
  ],
};

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