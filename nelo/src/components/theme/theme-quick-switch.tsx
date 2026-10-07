"use client";

import {
  useTheme,
  THEME_ORDER,
} from "@/components/theme/theme-provider";

import {
  themes,
} from "@/components/theme/theme-selector";

export default function ThemeQuickSwitch() {
  const {
    theme,
    setTheme,
  } = useTheme();

  const currentTheme =
    themes.find(
      (item) =>
        item.id === theme
    ) ?? themes[0];

  function switchTheme() {
    const currentIndex =
      THEME_ORDER.indexOf(
        theme
      );

    const nextIndex =
      (
        currentIndex + 1
      ) %
      THEME_ORDER.length;

    setTheme(
      THEME_ORDER[
        nextIndex
      ]
    );
  }

  return (
    <button
      type="button"
      onClick={
        switchTheme
      }
      title={`Theme: ${currentTheme.name}. Click to switch.`}
      aria-label={`Current theme ${currentTheme.name}. Switch theme.`}
      className="theme-border theme-surface flex h-9 w-9 items-center justify-center rounded-full border transition hover:scale-105"
    >
      <span
        className="h-4 w-4 rounded-full"
        style={{
          backgroundColor:
            currentTheme.color,
        }}
      />
    </button>
  );
}