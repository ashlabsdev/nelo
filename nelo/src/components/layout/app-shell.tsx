import Navbar from "@/components/layout/navbar";
import MobileNav from "@/components/layout/mobile-nav";
import Footer from "@/components/layout/footer";

import { CurrentUserProvider } from "@/components/auth/current-user-provider";

type AppShellProps = {
  children: React.ReactNode;
  userId: string;
  username: string;
  avatarId: number;
};

export default function AppShell({
  children,
  userId,
  username,
  avatarId,
}: AppShellProps) {
  return (
    <CurrentUserProvider
      userId={userId}
    >
      <div className="theme-bg theme-text flex min-h-screen flex-col">

        <Navbar
          username={username}
          avatarId={avatarId}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-28 sm:px-6 md:pb-10 lg:px-8">
          {children}
        </main>

        <Footer />

        <MobileNav />

      </div>
    </CurrentUserProvider>
  );
}