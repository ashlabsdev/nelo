import Image from "next/image";
import Link from "next/link";

import {
  User,
} from "lucide-react";

import NavLinks from "./nav-links";

import ThemeSelector from "@/components/theme/theme-selector";
import { getAvatarSrc } from "@/lib/avatars";

type NavbarProps = {
  username: string;
  avatarId: number;
};

export default function Navbar({
  username,
  avatarId,
}: NavbarProps) {
  return (
    <header className="theme-bg theme-border fixed left-0 right-0 top-0 z-50 border-b">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}

        <Link
          href="/home"
          className="flex items-center"
        >
          <Image
            src="/logo.png"
            alt="NELO"
            width={100}
            height={100}
            loading="eager"
            className="h-auto w-25"
          />
        </Link>

        {/* Desktop navigation */}

        <nav className="hidden items-center gap-1 md:flex">
          <NavLinks />
        </nav>

        {/* Right section */}

        <div className="flex items-center gap-4">

          <ThemeSelector />

          <Link
            href="/profile"
            title={username}
            className="flex items-center gap-2"
          >
            <Image
              src={getAvatarSrc(
                avatarId
              )}
              alt={`${username} avatar`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />

            <span className="theme-text hidden text-sm font-medium lg:block">
              {username}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}