"use client";

import {
  createContext,
  ReactNode,
  useContext,
} from "react";

type CurrentUserContextType = {
  userId: string;
};

const CurrentUserContext =
  createContext<
    CurrentUserContextType | undefined
  >(undefined);

type CurrentUserProviderProps = {
  userId: string;
  children: ReactNode;
};

export function CurrentUserProvider({
  userId,
  children,
}: CurrentUserProviderProps) {
  return (
    <CurrentUserContext.Provider
      value={{
        userId,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context =
    useContext(
      CurrentUserContext
    );

  if (!context) {
    throw new Error(
      "useCurrentUser must be used inside CurrentUserProvider"
    );
  }

  return context;
}