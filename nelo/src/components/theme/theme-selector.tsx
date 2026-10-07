"use client";

import {
  Check,
} from "lucide-react";

import {
  Theme,
  useTheme,
} from "@/components/theme/theme-provider";

export const themes: {
  id: Theme;
  name: string;
  description: string;
  color: string;
}[] = [
  {
    id: "default",
    name: "Daybreak",
    description:
      "Clean and bright",
    color: "#6366F1",
  },
  {
    id: "midnight",
    name: "Midnight",
    description:
      "Dark blue theme",
    color: "#818CF8",
  },
  {
    id: "forest",
    name: "Forest",
    description:
      "Fresh green theme",
    color: "#16A34A",
  },
  {
    id: "warm",
    name: "Warm",
    description:
      "Soft orange theme",
    color: "#EA580C",
  },
  {
    id: "ocean",
    name: "Ocean",
    description:
      "Cool blue theme",
    color: "#0284C7",
  },
  {
    id: "grape",
    name: "Grape",
    description:
      "Purple theme",
    color: "#9333EA",
  },
  {
    id: "rose",
    name: "Rose",
    description:
      "Soft pink theme",
    color: "#E11D48",
  },
  {
    id: "graphite",
    name: "Graphite",
    description:
      "Neutral dark theme",
    color: "#64748B",
  },
];

export default function ThemeSelector() {
  const {
    theme,
    setTheme,
  } = useTheme();

  return (
    <div className="grid gap-3 sm:grid-cols-2">

      {themes.map(
        (item) => {
          const selected =
            theme ===
            item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setTheme(
                  item.id
                )
              }
              className={`theme-border theme-surface flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                selected
                  ? "ring-2 ring-(--accent)"
                  : "hover:opacity-80"
              }`}
            >
              <span
                className="h-9 w-9 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    item.color,
                }}
              />

              <span className="min-w-0 flex-1">
                <span className="block font-medium">
                  {
                    item.name
                  }
                </span>

                <span className="theme-text-secondary mt-1 block text-xs">
                  {
                    item.description
                  }
                </span>
              </span>

              {selected && (
                <Check
                  size={18}
                  className="theme-accent"
                />
              )}
            </button>
          );
        }
      )}

    </div>
  );
}