import { getCurrentProfile } from "@/lib/profile";

import ProfileForm from "@/components/profile/profile-form";
import LogoutButton from "@/components/auth/logout-button";

export default async function ProfilePage() {
  const profile =
    await getCurrentProfile();

  if (!profile) {
    return null;
  }

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">
        Profile
      </h1>

      <p className="theme-text-secondary mt-2">
        Update your NELO profile.
      </p>

      <ProfileForm
        userId={profile.id}
        initialUsername={
          profile.username
        }
        initialAvatarId={
          profile.avatar_id
        }
      />

      <div className="theme-border mt-12 border-t pt-8">
        <h2 className="text-lg font-semibold">
          Account
        </h2>

        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>
    </section>
  );
}