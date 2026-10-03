"use client";

import Link from "next/link";

import {
  Search,
} from "lucide-react";

import { usePathname } from "next/navigation";

import {
  FileText,
  ImageIcon,
  Headphones,
  Heart,
  MessageCircle,
  Bell,
} from "lucide-react";

const navItems = [
  {
    name: "Blogs",
    href: "/blogs",
    activePaths: ["/blogs", "/create/blog"],
    icon: FileText,
  },
  {
    name: "Photos",
    href: "/photos",
    activePaths: ["/photos", "/create/photo"],
    icon: ImageIcon,
  },
  {
    name: "Audio",
    href: "/audio",
    activePaths: ["/audio", "/create/audio"],
    icon: Headphones,
  },
  {
    name: "Favorites",
    href: "/favorites",
    activePaths: ["/favorites"],
    icon: Heart,
  },
  {
    name: "Chat",
    href: "/chat",
    activePaths: ["/chat"],
    icon: MessageCircle,
  },
  {
    name: "Notifications",
    href: "/notifications",
    activePaths: ["/notifications"],
    icon: Bell,
  },
  {
    name: "Search",
    href: "/search",
    activePaths: ["/search"],
    icon: Search,
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  function isActive(paths: string[]) {
    return paths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  }

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;

        const active = isActive(item.activePaths);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center rounded-lg px-2 py-1.5 text-sm"
          >
            <span
              className={`flex items-center gap-2 rounded-md px-2 py-1 transition ${
                active
                  ? "theme-accent-bg text-white"
                  : "theme-text-secondary hover:opacity-70"
              }`}
            >
              <Icon size={17} />

              <span>{item.name}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
