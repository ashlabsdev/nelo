"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  UserRound,
  Pencil,
  Palette,
  Ban,
  Settings,
  Library,
} from "lucide-react";

const items = [
  {
    name: "Overview",
    href: "/profile",
    icon: UserRound,
  },
  {
    name: "Edit",
    href: "/profile/edit",
    icon: Pencil,
  },
  {
    name: "My Content",
    href: "/profile/content",
    icon: Library,
  },
  {
    name: "Appearance",
    href: "/profile/appearance",
    icon: Palette,
  },
  {
    name: "Blocked",
    href: "/profile/blocked",
    icon: Ban,
  },
  {
    name: "Settings",
    href: "/profile/settings",
    icon: Settings,
  },
];

export default function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="theme-surface theme-border mb-8 flex gap-2 overflow-x-auto rounded-xl border p-2">
      {items.map((item) => {
        const Icon = item.icon;

        const active =
          item.href === "/profile"
            ? pathname === "/profile"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              active
                ? "theme-accent-bg text-white"
                : "theme-text-secondary hover:opacity-70"
            }`}
          >
            <Icon size={16} />

            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
