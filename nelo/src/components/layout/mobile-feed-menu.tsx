"use client";

import { useState } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  BookOpen,
  FileText,
  ImageIcon,
  Headphones,
  Bookmark,
  X,
} from "lucide-react";

const feedItems = [
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
    icon: Bookmark,
  },
];

export default function MobileFeedMenu() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const active =
    pathname.startsWith("/blogs") ||
    pathname.startsWith("/photos") ||
    pathname.startsWith("/audio") ||
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/create/blog") ||
    pathname.startsWith("/create/photo") ||
    pathname.startsWith("/create/audio");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex flex-col items-center justify-center gap-1 text-[10px] ${
          active ? "theme-accent" : "theme-text-secondary"
        }`}
      >
        <BookOpen size={21} />

        <span></span>
      </button>

      {open && (
        <div className="fixed inset-0 z-100 md:hidden">
          {/* Background overlay */}

          <button
            type="button"
            aria-label="Close feed menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          {/* Bottom sheet */}

          <div className="theme-bg theme-border absolute bottom-0 left-0 right-0 rounded-t-3xl border-t p-5 pb-8 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Explore Feed</h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="theme-surface theme-border flex h-9 w-9 items-center justify-center rounded-full border"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {feedItems.map((item) => {
                const Icon = item.icon;

                const selected =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`theme-border flex items-center gap-3 rounded-xl border p-4 ${
                      selected ? "theme-accent-bg text-white" : "theme-surface"
                    }`}
                  >
                    <Icon size={20} />

                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
