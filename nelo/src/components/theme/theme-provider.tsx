"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

export type Theme =
  | "default"
  | "midnight"
  | "forest"
  | "warm"
  | "ocean"
  | "grape"
  | "rose"
  | "graphite";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext =
  createContext<
    ThemeContextType | undefined
  >(undefined);

const STORAGE_KEY =
  "nelo-theme";

let currentTheme: Theme =
  "default";

let initialized = false;

const listeners =
  new Set<() => void>();

export const THEME_ORDER: Theme[] =
  [
    "default",
    "midnight",
    "forest",
    "warm",
    "ocean",
    "grape",
    "rose",
    "graphite",
  ];

function isValidTheme(
  value: string | null
): value is Theme {
  return (
    value === "default" ||
    value === "midnight" ||
    value === "forest" ||
    value === "warm" ||
    value === "ocean" ||
    value === "grape" ||
    value === "rose" ||
    value === "graphite"
  );
}

function subscribe(
  listener: () => void
) {
  listeners.add(
    listener
  );

  return () => {
    listeners.delete(
      listener
    );
  };
}

function getSnapshot(): Theme {
  return currentTheme;
}

function getServerSnapshot(): Theme {
  return "default";
}

function updateStoreTheme(
  theme: Theme
) {
  if (
    currentTheme === theme
  ) {
    return;
  }

  currentTheme =
    theme;

  listeners.forEach(
    (listener) => {
      listener();
    }
  );
}

function initializeTheme() {
  if (
    initialized ||
    typeof window ===
      "undefined"
  ) {
    return;
  }

  initialized = true;

  const savedTheme =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (
    isValidTheme(
      savedTheme
    )
  ) {
    updateStoreTheme(
      savedTheme
    );
  }
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const theme =
    useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );

  useEffect(() => {
    initializeTheme();
  }, []);

  useEffect(() => {
    if (
      theme ===
      "default"
    ) {
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

  function setTheme(
    newTheme: Theme
  ) {
    localStorage.setItem(
      STORAGE_KEY,
      newTheme
    );

    updateStoreTheme(
      newTheme
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
  const context =
    useContext(
      ThemeContext
    );

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}