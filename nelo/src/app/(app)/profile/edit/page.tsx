import Link from "next/link";

import { getCurrentProfile } from "@/lib/profile";

import ProfileForm from "@/components/profile/profile-form";
import ThemeSelector from "@/components/theme/theme-selector";

import BlockedUsers from "@/components/profile/blocked-users";
import { createClient } from "@/lib/supabase/client";

export default async function EditProfilePage() {
  const profile = await getCurrentProfile();

  const supabase = await createClient();

  const { data: blockedRows } = await supabase
    .from("blocks")
    .select(
      `
    blocked:profiles!blocks_blocked_id_fkey (
      id,
      username
    )
  `,
    )
    .eq("blocker_id", profile?.id);

  const blockedUsers =
    blockedRows?.flatMap((row) => {
      const blocked = row.blocked;

      if (Array.isArray(blocked)) {
        return blocked;
      }

      return blocked ? [blocked] : [];
    }) ?? [];

  if (!profile) {
    return null;
  }

  return (
    <>
      <section className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>

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

      <section className="theme-surface theme-border mt-8 rounded-2xl border p-5 sm:p-6">
        <h2 className="text-xl font-semibold">NELO Themes</h2>

        <div className="mt-5">
          <ThemeSelector />
        </div>
      </section>

      <section className="theme-surface theme-border mt-8 rounded-2xl border p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Blocked Users</h2>

        <p className="theme-text-secondary mt-1 text-sm">
          Manage people you have blocked.
        </p>

        <div className="mt-5">
          <BlockedUsers users={blockedUsers} />
        </div>
      </section>
    </>
  );
}
