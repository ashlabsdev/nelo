"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme =
  | "default"
  | "midnight"
  | "forest"
  | "warm";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "default";
  }

  const savedTheme = localStorage.getItem("nelo-theme");

  if (
    savedTheme === "default" ||
    savedTheme === "midnight" ||
    savedTheme === "forest" ||
    savedTheme === "warm"
  ) {
    return savedTheme;
  }

  return "default";
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>(getInitialTheme);

  useEffect(() => {
    if (theme === "default") {
      document.documentElement.removeAttribute(
        "data-theme"
      );
    } else {
      document.documentElement.setAttribute(
        "data-theme",
        theme
      );
    }
  }, [theme]);

  function setTheme(theme: Theme) {
    setThemeState(theme);

    localStorage.setItem(
      "nelo-theme",
      theme
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}

