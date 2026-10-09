import Image from "next/image";
import Link from "next/link";

import { ShieldCheck } from "lucide-react";

import NavLinks from "@/components/layout/nav-links";
import FeedMenu from "@/components/layout/feed-menu";

import { getAvatarSrc } from "@/lib/avatars";

import ThemeQuickSwitch from "@/components/theme/theme-quick-switch";

type NavbarProps = {
  username: string;
  avatarId: number;
  userId: string;
  isAdmin: boolean;
};

export default function Navbar({
  username,
  avatarId,
  userId,
  isAdmin,
}: NavbarProps) {
  return (
    <header className="theme-bg theme-border fixed left-0 right-0 top-0 z-50 border-b">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}

        <Link href="/blogs" className="flex items-center">
          <Image
            src="/logo.png"
            alt="NELO"
            width={100}
            height={100}
            loading="eager"
            className="h-auto w-24"
          />
        </Link>

        {/* Desktop navigation */}

        <nav className="hidden items-center gap-1 md:flex">
          <FeedMenu />

          <NavLinks userId={userId} isAdmin={isAdmin} />
        </nav>

        {/* Right section */}

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeQuickSwitch />

          {/* Mobile admin shortcut */}

          {isAdmin && (
            <Link
              href="/admin"
              title="Admin Dashboard"
              aria-label="Admin Dashboard"
              className="theme-text-secondary theme-border theme-surface flex h-9 w-9 items-center justify-center rounded-full border transition hover:opacity-70 md:hidden"
            >
              <ShieldCheck size={18} />
            </Link>
          )}

          <Link
            href="/profile"
            title={username}
            className="flex items-center gap-2"
          >
            <Image
              src={getAvatarSrc(avatarId)}
              alt={`${username} avatar`}
              width={40}
              height={40}
              className="h-8 w-8 rounded-full object-cover"
            />

            <span className="theme-text hidden text-sm font-medium xl:block">
              {username}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
