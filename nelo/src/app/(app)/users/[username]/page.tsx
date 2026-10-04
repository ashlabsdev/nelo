import Image from "next/image";
import Link from "next/link";

import MessageButton from "@/components/chat/message-button";

import { notFound, redirect } from "next/navigation";

import {
  ExternalLink,
  Users,
  UserRoundCheck,
  FileText,
  ImageIcon,
  Headphones,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { getAvatarSrc } from "@/lib/avatars";

import FollowButton from "@/components/profile/follow-button";
import BlockButton from "@/components/profile/block-button";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;

  const currentProfile = await getCurrentProfile();

  if (!currentProfile) {
    return null;
  }

  if (currentProfile.username === username) {
    redirect("/profile");
  }

  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      username,
      avatar_id,
      bio,
      website_url,
      link_2,
      link_3
    `,
    )
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  /*
   * Check whether either user
   * has blocked the other.
   */

  const [iBlockedThem, theyBlockedMe] = await Promise.all([
    supabase
      .from("blocks")
      .select("blocker_id")
      .eq("blocker_id", currentProfile.id)
      .eq("blocked_id", profile.id)
      .maybeSingle(),

    supabase
      .from("blocks")
      .select("blocker_id")
      .eq("blocker_id", profile.id)
      .eq("blocked_id", currentProfile.id)
      .maybeSingle(),
  ]);

  if (iBlockedThem.data || theyBlockedMe.data) {
    notFound();
  }

  const [
    followersResult,
    followingResult,
    blogsResult,
    photosResult,
    audioResult,
    followingCheck,
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

    supabase
      .from("posts")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", profile.id)
      .eq("type", "blog")
      .eq("status", "active"),

    supabase
      .from("posts")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", profile.id)
      .eq("type", "photo")
      .eq("status", "active"),

    supabase
      .from("posts")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", profile.id)
      .eq("type", "audio")
      .eq("status", "active"),

    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", currentProfile.id)
      .eq("following_id", profile.id)
      .maybeSingle(),
  ]);

  const followers = followersResult.count ?? 0;

  const following = followingResult.count ?? 0;

  const blogs = blogsResult.count ?? 0;

  const photos = photosResult.count ?? 0;

  const audio = audioResult.count ?? 0;

  const isFollowing = Boolean(followingCheck.data);

  const links = [profile.website_url, profile.link_2, profile.link_3].filter(
    Boolean,
  ) as string[];

  return (
    <section className="mx-auto max-w-3xl">
      {/* Profile */}

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
            <h1 className="text-3xl font-bold">{profile.username}</h1>

            <p className="theme-text-secondary mt-1 text-sm">NELO Profile</p>

            {profile.bio ? (
              <p className="theme-text-secondary mt-5 whitespace-pre-line">
                {profile.bio}
              </p>
            ) : (
              <p className="theme-text-secondary mt-5 italic">
                No bio added yet.
              </p>
            )}

            {/* Actions */}

            <div className="mt-6 flex flex-wrap gap-3">
              <FollowButton
                targetUserId={profile.id}
                initialFollowing={isFollowing}
              />

              <MessageButton targetUserId={profile.id} />

              <BlockButton
                targetUserId={profile.id}
                username={profile.username}
              />
            </div>
          </div>
        </div>

        {/* Follow counts */}

        <div className="theme-border mt-8 flex gap-8 border-t pt-6">
          <Link
            href={`/users/${profile.username}/followers`}
            className="flex items-center gap-2 transition hover:opacity-70"
          >
            <Users size={18} className="theme-accent" />

            <div>
              <p className="font-semibold">{followers}</p>

              <p className="theme-text-secondary text-sm">Followers</p>
            </div>
          </Link>

          <Link
            href={`/users/${profile.username}/following`}
            className="flex items-center gap-2 transition hover:opacity-70"
          >
            <UserRoundCheck size={18} className="theme-accent" />

            <div>
              <p className="font-semibold">{following}</p>

              <p className="theme-text-secondary text-sm">Following</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Content stats */}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Content</h2>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="theme-surface theme-border rounded-xl border p-4 text-center">
            <FileText size={20} className="theme-accent mx-auto" />

            <p className="mt-2 text-xl font-bold">{blogs}</p>

            <p className="theme-text-secondary text-xs">Blogs</p>
          </div>

          <div className="theme-surface theme-border rounded-xl border p-4 text-center">
            <ImageIcon size={20} className="theme-accent mx-auto" />

            <p className="mt-2 text-xl font-bold">{photos}</p>

            <p className="theme-text-secondary text-xs">Photos</p>
          </div>

          <div className="theme-surface theme-border rounded-xl border p-4 text-center">
            <Headphones size={20} className="theme-accent mx-auto" />

            <p className="mt-2 text-xl font-bold">{audio}</p>

            <p className="theme-text-secondary text-xs">Audio</p>
          </div>
        </div>
      </div>

      {/* Links */}

      {links.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Links</h2>

          <div className="mt-3 space-y-2">
            {links.map((link) => (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="theme-surface theme-border theme-accent flex items-center justify-between rounded-xl border px-4 py-3"
              >
                <span className="truncate">{link}</span>

                <ExternalLink size={16} />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
