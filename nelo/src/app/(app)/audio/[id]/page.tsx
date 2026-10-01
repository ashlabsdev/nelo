import Image from "next/image";

import {
  notFound,
} from "next/navigation";

import {
  CalendarDays,
  AudioLines,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAvatarSrc } from "@/lib/avatars";
import { getPostMediaUrl } from "@/lib/media";

type AudioPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AudioPage({
  params,
}: AudioPageProps) {
  const { id } =
    await params;

  const supabase =
    await createClient();

  const {
    data: post,
    error,
  } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      content,
      media_path,
      created_at,

      profiles!posts_user_id_fkey (
        username,
        avatar_id,
        bio
      ),

      post_hashtags (
        hashtags (
          name
        )
      )
    `)
    .eq("id", id)
    .eq("type", "audio")
    .eq("status", "active")
    .single();

  if (
    error ||
    !post ||
    !post.media_path
  ) {
    notFound();
  }

  const profile =
    Array.isArray(
      post.profiles
    )
      ? post.profiles[0]
      : post.profiles;

  if (!profile) {
    notFound();
  }

  const hashtags =
    post.post_hashtags
      ?.flatMap(
        (relation) => {
          const tag =
            relation.hashtags;

          if (
            Array.isArray(tag)
          ) {
            return tag;
          }

          return tag
            ? [tag]
            : [];
        }
      )
      .map(
        (tag) =>
          tag.name
      ) ?? [];

  const audioUrl =
    getPostMediaUrl(
      post.media_path
    );

  const publishedDate =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(
      new Date(
        post.created_at
      )
    );

  return (
    <article className="mx-auto max-w-3xl">

      <div className="flex items-center gap-3">

        <Image
          src={getAvatarSrc(
            profile.avatar_id
          )}
          alt={`${profile.username} avatar`}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />

        <div>
          <p className="font-medium">
            {profile.username}
          </p>

          <div className="theme-text-secondary mt-1 flex items-center gap-1 text-sm">
            <CalendarDays
              size={14}
            />

            {publishedDate}
          </div>
        </div>

      </div>

      <div className="theme-surface theme-border mt-8 rounded-2xl border p-6">

        <AudioLines
          size={38}
          className="theme-accent"
        />

        <h1 className="mt-4 text-3xl font-bold">
          {post.title}
        </h1>

        <audio
          controls
          src={audioUrl}
          className="mt-6 w-full"
        />

      </div>

      {post.content && (
        <p className="mt-6 whitespace-pre-line text-lg leading-8">
          {post.content}
        </p>
      )}

      {hashtags.length >
        0 && (
        <div className="mt-5 flex flex-wrap gap-3">

          {hashtags.map(
            (tag) => (
              <span
                key={tag}
                className="theme-accent text-sm"
              >
                #{tag}
              </span>
            )
          )}

        </div>
      )}

    </article>
  );
}