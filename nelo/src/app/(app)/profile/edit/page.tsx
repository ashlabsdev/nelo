import Link from "next/link";

import { getCurrentProfile } from "@/lib/profile";

import ProfileForm from "@/components/profile/profile-form";

export default async function EditProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Edit Profile
          </h1>

          <p className="theme-text-secondary mt-2">
            Update your NELO profile.
          </p>
        </div>

        <Link
          href="/profile"
          className="theme-border rounded-lg border px-4 py-2 text-sm"
        >
          Cancel
        </Link>
      </div>

      <ProfileForm
        userId={profile.id}
        initialUsername={profile.username}
        initialAvatarId={profile.avatar_id}
        initialBio={profile.bio}
        initialWebsiteUrl={profile.website_url}
        initialLink2={profile.link_2}
        initialLink3={profile.link_3}
      />
    </section>
  );
}