import Image from "next/image";
import Link from "next/link";

import {
  ExternalLink,
  Pencil,
  Users,
  UserRoundCheck,
} from "lucide-react";

import { getCurrentProfile } from "@/lib/profile";
import { getAvatarSrc } from "@/lib/avatars";
import { createClient } from "@/lib/supabase/server";

import LogoutButton from "@/components/auth/logout-button";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const supabase = await createClient();

  const [
    followersResult,
    followingResult,
  ] = await Promise.all([
    supabase
      .from("follows")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("following_id", profile.id),

    supabase
      .from("follows")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("follower_id", profile.id),
  ]);

  const followers =
    followersResult.count ?? 0;

  const following =
    followingResult.count ?? 0;

  const links = [
    profile.website_url,
    profile.link_2,
    profile.link_3,
  ].filter(Boolean) as string[];

  return (
    <section className="mx-auto max-w-3xl">

      {/* Profile header */}

      <div className="theme-surface theme-border rounded-2xl border p-6 sm:p-8">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

          <Image
            src={getAvatarSrc(profile.avatar_id)}
            alt={`${profile.username} avatar`}
            width={120}
            height={120}
            className="h-28 w-28 rounded-full object-cover"
          />

          <div className="flex-1">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h1 className="text-3xl font-bold">
                  {profile.username}
                </h1>

                <p className="theme-text-secondary mt-1 text-sm">
                  NELO Profile
                </p>
              </div>

              <Link
                href="/profile/edit"
                className="theme-accent-bg inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
              >
                <Pencil size={16} />

                Edit Profile
              </Link>

            </div>

            {profile.bio ? (
              <p className="theme-text-secondary mt-5 whitespace-pre-line">
                {profile.bio}
              </p>
            ) : (
              <p className="theme-text-secondary mt-5 italic">
                No bio added yet.
              </p>
            )}

          </div>

        </div>

        {/* Follow counts */}

        <div className="theme-border mt-8 flex gap-8 border-t pt-6">

          <div className="flex items-center gap-2">
            <Users
              size={18}
              className="theme-accent"
            />

            <div>
              <p className="font-semibold">
                {followers}
              </p>

              <p className="theme-text-secondary text-sm">
                Followers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserRoundCheck
              size={18}
              className="theme-accent"
            />

            <div>
              <p className="font-semibold">
                {following}
              </p>

              <p className="theme-text-secondary text-sm">
                Following
              </p>
            </div>
          </div>

        </div>

      </div>


      {/* Links */}

      {links.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">
            Links
          </h2>

          <div className="mt-3 space-y-2">
            {links.map((link) => (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="theme-surface theme-border theme-accent flex items-center justify-between rounded-xl border px-4 py-3"
              >
                <span className="truncate">
                  {link}
                </span>

                <ExternalLink
                  size={16}
                  className="shrink-0"
                />
              </a>
            ))}
          </div>
        </div>
      )}


      {/* Account */}

      <div className="theme-border mt-10 border-t pt-6">
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