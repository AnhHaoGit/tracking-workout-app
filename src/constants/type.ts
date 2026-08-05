export type WorkoutExercise = {
  id: number;
  name: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: string[];
  type: string;
  img?: string;
  sets: { id: number; reps: string | null; weight: string | null }[];
  note?: string;
  technique?: string;
};

export type WorkoutSession = {
  _id: any;
  name: string;
  date: Date;
  time: Date;
  exercises: WorkoutExercise[];
  createdAt: Date;
  status: string;
  startedAt: Date;
  finishedAt: Date;
};

export type WorkoutSessionCache = {
  getWorkoutSessions: (key: string) => Promise<WorkoutSession[]>;
  saveWorkoutSessions: (
    key: string,
    sessions: WorkoutSession[],
  ) => Promise<void>;
  addWorkoutSession: (
    key: string,
    session: WorkoutSession,
  ) => Promise<WorkoutSession[]>;
  updateWorkoutSessions: (key: string, _id: string, data: any) => Promise<void>;
  deleteWorkoutSession: (key: string, _id: string) => Promise<void>;
};

export type UserData = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  provider?: string;
  iat?: number;
  exp?: number;
  routine?: string;
};

export type AuthUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  provider?: string;
  iat?: number;
  exp?: number;
  type?: string;
};

export type StatisticsDataPoint = {
  label: string;
  value: number;
};
