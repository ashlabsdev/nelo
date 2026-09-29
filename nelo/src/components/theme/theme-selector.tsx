"use client";

import {
  Theme,
  useTheme,
} from "@/components/theme/theme-provider";

const themes: {
  id: Theme;
  name: string;
  color: string;
}[] = [
  {
    id: "default",
    name: "Default",
    color: "#6366F1",
  },
  {
    id: "midnight",
    name: "Midnight",
    color: "#818CF8",
  },
  {
    id: "forest",
    name: "Forest",
    color: "#16A34A",
  },
  {
    id: "warm",
    name: "Warm",
    color: "#EA580C",
  },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {themes.map((item) => {
        const selected = theme === item.id;

        return (
          <button
            key={item.id}
            type="button"
            title={item.name}
            aria-label={`Use ${item.name} theme`}
            onClick={() => setTheme(item.id)}
            className={`h-6 w-6 rounded-full border-2 transition ${
              selected
                ? "scale-110 border-current"
                : "border-transparent"
            }`}
            style={{
              backgroundColor: item.color,
            }}
          />
        );
      })}
    </div>
  );
}