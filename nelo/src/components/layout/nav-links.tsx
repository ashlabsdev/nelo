"use client";

import Link from "next/link";
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
    icon: FileText,
  },
  {
    name: "Photos",
    href: "/photos",
    icon: ImageIcon,
  },
  {
    name: "Audio",
    href: "/audio",
    icon: Headphones,
  },
  {
    name: "Favorites",
    href: "/favorites",
    icon: Heart,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;

        const active =
          pathname === item.href;

        const isCreate =
          item.href === "/create";

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              isCreate
                ? "theme-accent-bg text-white"
                : active
                  ? "theme-accent font-semibold"
                  : "theme-text-secondary"
            }`}
          >
            <Icon size={18} />

            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );
}