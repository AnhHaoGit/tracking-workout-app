import * as React from "react";

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

const UserContext = React.createContext({
  userData: null as UserData | null,
  updateUserData: (data: UserData) => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = React.useState<UserData | null>(null);

  const updateUserData = (data: UserData) => {
    setUserData(data);
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        updateUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within an UserProvider");
  }
  return context;
};
