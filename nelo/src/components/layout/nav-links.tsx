"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { Search, MessageCircle, Bell, ShieldCheck } from "lucide-react";

import ChatUnreadBadge from "@/components/chat/chat-unread-badge";

import NotificationUnreadBadge from "@/components/notifications/notification-unread-badge";

type NavLinksProps = {
  userId: string;
  isAdmin: boolean;
};

export default function NavLinks({ userId, isAdmin }: NavLinksProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "",
      href: "/search",
      activePaths: ["/search"],
      icon: Search,
    },

    {
      name: "",
      href: "/chat",
      activePaths: ["/chat"],
      icon: MessageCircle,
    },

    {
      name: "",
      href: "/notifications",
      activePaths: ["/notifications"],
      icon: Bell,
    },

    ...(isAdmin
      ? [
          {
            name: "",
            href: "/admin",
            activePaths: ["/admin"],
            icon: ShieldCheck,
          },
        ]
      : []),
  ];

  function isActive(paths: string[]) {
    return paths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  }

  return (
    <div className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;

        const active = isActive(item.activePaths);

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.name}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "theme-accent text-white"
                : "theme-text-secondary hover:opacity-70"
            }`}
          >
            <Icon size={17} />

            <span className="hidden lg:inline">{item.name}</span>

            {item.href === "/chat" && <ChatUnreadBadge userId={userId} />}

            {item.href === "/notifications" && (
              <NotificationUnreadBadge userId={userId} />
            )}
          </Link>
        );
      })}
    </div>
  );
}
