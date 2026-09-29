"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  FileText,
  ImageIcon,
  Headphones,
  MessageCircle,
  User,
} from "lucide-react";

const items = [
  {
    href: "/home",
    label: "Home",
    icon: Home,
  },
  {
    href: "/blogs",
    label: "Blogs",
    icon: FileText,
  },
  {
    href: "/photos",
    label: "Photos",
    icon: ImageIcon,
  },
  {
    href: "/audio",
    label: "Audio",
    icon: Headphones,
  },
  {
    href: "/chat",
    label: "Chat",
    icon: MessageCircle,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="theme-bg theme-border fixed bottom-0 left-0 right-0 z-50 border-t md:hidden">
      <div className="grid h-16 grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] ${
                active
                  ? "theme-accent"
                  : "theme-text-secondary"
              }`}
            >
              <Icon size={20} />

              <span>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}