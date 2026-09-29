import Image from "next/image";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

import ProfileForm from "@/components/profile/profile-form";
import LogoutButton from "@/components/auth/logout-button";

export default async function ProfilePage() {
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
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <Image
            src="/logo.png"
            alt="NELO Logo"
            width={160}
            height={160}
          />

          <LogoutButton />
        </div>

        <h1 className="mt-8 text-3xl font-bold">
          Profile
        </h1>

        <p className="mt-2 text-gray-500">
          Update your NELO profile.
        </p>

        <ProfileForm
          userId={profile.id}
          initialUsername={profile.username}
          initialAvatarId={profile.avatar_id}
        />
      </div>
    </main>
  );
}