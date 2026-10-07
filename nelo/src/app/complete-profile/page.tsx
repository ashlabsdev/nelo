import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

import ProfileForm from "@/components/profile/profile-form";

export default async function CompleteProfilePage() {
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

  if (!profile.username.startsWith("user_")) {
    redirect("/blogs");
  }

  return (
    <main className="min-h-screen bg-white p-10 text-black">
      <div className="mx-auto max-w-3xl">
        
        <h1 className="mt-6 text-3xl font-bold">
          Complete your profile
        </h1>

        <p className="mt-2 text-gray-500">
          Choose your NELO username and avatar.
        </p>

        <ProfileForm
          userId={profile.id}
          initialUsername={profile.username}
          initialAvatarId={profile.avatar_id}
          isFirstSetup
        />
      </div>
    </main>
  );
}