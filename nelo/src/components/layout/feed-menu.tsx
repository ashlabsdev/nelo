"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  BookOpen,
  ChevronDown,
  FileText,
  ImageIcon,
  Headphones,
  Bookmark,
} from "lucide-react";

const items = [
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

export default function FeedMenu() {
  const pathname = usePathname();

  const menuRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const active =
    pathname.startsWith("/blogs") ||
    pathname.startsWith("/photos") ||
    pathname.startsWith("/audio") ||
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/create/blog") ||
    pathname.startsWith("/create/photo") ||
    pathname.startsWith("/create/audio");

  /*
   * Close when user clicks
   * anywhere outside dropdown.
   */
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
          active
            ? "theme-accent text-white"
            : "theme-text-secondary hover:opacity-70"
        }`}
      >
        <BookOpen size={17} />

        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="theme-bg theme-border absolute left-0 top-full z-50 mt-2 w-52 rounded-xl border p-2 shadow-xl">
          {items.map((item) => {
            const Icon = item.icon;

            const selected =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  selected
                    ? "theme-surface theme-accent"
                    : "theme-text-secondary hover:opacity-70"
                }`}
              >
                <Icon size={17} />

                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
