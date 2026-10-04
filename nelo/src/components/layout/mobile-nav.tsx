"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  Search,
  MessageCircle,
  Bell,
} from "lucide-react";

import MobileFeedMenu from "@/components/layout/mobile-feed-menu";

import ChatUnreadBadge from "@/components/chat/chat-unread-badge";

type MobileNavProps = {
  userId: string;
};

export default function MobileNav({
  userId,
}: MobileNavProps) {
  const pathname =
    usePathname();

  const items = [
    {
      href: "/search",
      label: "",
      icon: Search,
    },
    {
      href: "/chat",
      label: "",
      icon: MessageCircle,
    },
    {
      href:
        "/notifications",
      label:
        "",
      icon: Bell,
    },
  ];

  return (
    <nav className="theme-bg theme-border fixed bottom-0 left-0 right-0 z-50 border-t md:hidden">

      <div className="grid h-16 grid-cols-4">

        {/* Feed */}

        <MobileFeedMenu />

        {/* Other nav items */}

        {items.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              pathname ===
                item.href ||
              pathname.startsWith(
                `${item.href}/`,
              );

            return (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                className={`relative flex flex-col items-center justify-center gap-1 text-[10px] ${
                  active
                    ? "theme-accent"
                    : "theme-text-secondary"
                }`}
              >
                <div className="relative">

                  <Icon
                    size={21}
                  />

                  {item.href ===
                    "/chat" && (
                    <div className="absolute -right-4 -top-2">
                      <ChatUnreadBadge
                        userId={
                          userId
                        }
                      />
                    </div>
                  )}

                </div>

                <span>
                  {item.label}
                </span>

              </Link>
            );
          },
        )}

      </div>

    </nav>
  );
}