import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { getAvatarSrc } from "@/lib/avatars";

import LogoutButton from "@/components/auth/logout-button";

export default async function HomePage() {
  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.username.startsWith("user_")) {
    redirect("/complete-profile");
  }

  return (
    <main className="min-h-screen bg-white p-10 text-black">
      <div className="flex items-center justify-between">
        <div>
          <Image
            src="/logo.png"
            alt="NELO Logo"
            className="mt-4 h-auto w-50"
            width={200}
            height={200}
            loading="eager"
          />

          <div className="mt-4 flex items-center gap-3">
            <Image
              src={getAvatarSrc(profile.avatar_id)}
              alt={`${profile.username} avatar`}
              width={48}
              height={48}
              className="rounded-full object-cover"
              loading="eager"
            />

            <p className="text-primary-500">
              Welcome, {profile.username}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            Profile
          </Link>

          <LogoutButton />
        </div>
      </div>
    </main>
  );
}