"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  FileText,
  ImageIcon,
  Headphones,
  MessageCircle,
} from "lucide-react";

export const navItems = [
  {
    name: "Home",
    href: "/home",
    icon: Home,
  },
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
    name: "Chat",
    href: "/chat",
    icon: MessageCircle,
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

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              active
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