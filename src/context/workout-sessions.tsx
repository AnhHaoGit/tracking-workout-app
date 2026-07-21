import * as React from "react";
import { WorkoutSession } from "@/constants/type";

const WorkoutSessionsContext = React.createContext({
  workoutSessions: [] as WorkoutSession[] | [],
  saveWorkoutSessions: (data: WorkoutSession[]) => {},
  updateWorkoutSessions: (_id: string, data: any) => {},
  addWorkoutSession: (data: WorkoutSession) => {},
  deleteWorkoutSession: (_id: string) => {},
});

export const WorkoutSessionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [workoutSessions, setWorkoutSessions] = React.useState<
    WorkoutSession[]
  >([]);

  const saveWorkoutSessions = (data: WorkoutSession[]) => {
    setWorkoutSessions(data);
  };

  const updateWorkoutSessions = (_id: string, data: any) => {
    setWorkoutSessions((prev) =>
      prev.map((session) =>
        session._id === _id ? { ...session, ...data } : session,
      ),
    );
  };

  const addWorkoutSession = (data: WorkoutSession) => {
    setWorkoutSessions((prev) => [...prev, data]);
  };

  const deleteWorkoutSession = (_id: string) => {
    setWorkoutSessions((prev) => prev.filter((session) => session._id !== _id));
  };
  return (
    <WorkoutSessionsContext.Provider
      value={{
        workoutSessions,
        saveWorkoutSessions,
        updateWorkoutSessions,
        addWorkoutSession,
        deleteWorkoutSession,
      }}
    >
      {children}
    </WorkoutSessionsContext.Provider>
  );
};

export const useWorkoutSessions = () => {
  const context = React.useContext(WorkoutSessionsContext);
  if (context === undefined) {
    throw new Error(
      "useWorkoutSessions must be used within an WorkoutSessionsProvider",
    );
  }
  return context;
};
