import Image from "next/image";
import Link from "next/link";

import {
  ExternalLink,
  FileText,
  ImageIcon,
  Headphones,
  Bookmark,
} from "lucide-react";

import { getCurrentProfile } from "@/lib/profile";
import { getAvatarSrc } from "@/lib/avatars";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const supabase = await createClient();

  const [
    followersResult,
    followingResult,
    blogsResult,
    photosResult,
    audioResult,
    favoritesResult,
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
      .from("favorites")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", profile.id),
  ]);

  const followers = followersResult.count ?? 0;

  const following = followingResult.count ?? 0;

  const blogs = blogsResult.count ?? 0;

  const photos = photosResult.count ?? 0;

  const audio = audioResult.count ?? 0;

  const favorites = favoritesResult.count ?? 0;

  const links = [profile.website_url, profile.link_2, profile.link_3].filter(
    Boolean,
  ) as string[];

  return (
    <div>
      {/* Main profile */}

      <div className="theme-surface theme-border rounded-2xl border p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Image
            src={getAvatarSrc(profile.avatar_id)}
            alt={`${profile.username} avatar`}
            width={112}
            height={112}
            className="h-28 w-28 rounded-full object-cover"
          />

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold">{profile.username}</h1>

            {profile.bio ? (
              <p className="theme-text-secondary mt-3 max-w-2xl whitespace-pre-line">
                {profile.bio}
              </p>
            ) : (
              <p className="theme-text-secondary mt-3 italic">
                No bio added yet.
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-6">
              <Link
                href={`/users/${profile.username}/followers`}
                className="transition hover:opacity-70"
              >
                <span className="font-bold">{followers}</span>

                <span className="theme-text-secondary ml-2 text-sm">
                  Followers
                </span>
              </Link>

              <Link
                href={`/users/${profile.username}/following`}
                className="transition hover:opacity-70"
              >
                <span className="font-bold">{following}</span>

                <span className="theme-text-secondary ml-2 text-sm">
                  Following
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard counts */}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Your NELO</h2>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/profile/content?type=blog"
            className="theme-surface theme-border rounded-xl border p-4 text-center transition hover:opacity-80"
          >
            <FileText size={20} className="theme-accent mx-auto" />

            <p className="mt-2 text-xl font-bold">{blogs}</p>

            <p className="theme-text-secondary text-xs">Blogs</p>
          </Link>

          <Link
            href="/profile/content?type=photo"
            className="theme-surface theme-border rounded-xl border p-4 text-center transition hover:opacity-80"
          >
            <ImageIcon size={20} className="theme-accent mx-auto" />

            <p className="mt-2 text-xl font-bold">{photos}</p>

            <p className="theme-text-secondary text-xs">Photos</p>
          </Link>

          <Link
            href="/profile/content?type=audio"
            className="theme-surface theme-border rounded-xl border p-4 text-center transition hover:opacity-80"
          >
            <Headphones size={20} className="theme-accent mx-auto" />

            <p className="mt-2 text-xl font-bold">{audio}</p>

            <p className="theme-text-secondary text-xs">Audio</p>
          </Link>

          <Link
            href="/favorites"
            className="theme-surface theme-border rounded-xl border p-4 text-center transition hover:opacity-80"
          >
            <Bookmark size={20} className="theme-accent mx-auto" />

            <p className="mt-2 text-xl font-bold">{favorites}</p>

            <p className="theme-text-secondary text-xs">Favorites</p>
          </Link>
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
    </div>
  );
}
