import Image from "next/image";

import PostActions from "@/components/post/post-actions";

import {
  notFound,
} from "next/navigation";

import {
  CalendarDays,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAvatarSrc } from "@/lib/avatars";
import { getPostMediaUrl } from "@/lib/media";

type PhotoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PhotoPage({
  params,
}: PhotoPageProps) {
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
        ),

        likes (
          user_id
        ),

        comments (
          id
        ),

        boosts (
          user_id
        )

    `)
    .eq("id", id)
    .eq("type", "photo")
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
        (tag) => tag.name
      ) ?? [];

  const imageUrl =
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
    <article className="mx-auto max-w-4xl">

      {/* Author */}

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

      {/* Photo */}

      <div className="mt-6 overflow-hidden rounded-2xl">

        <Image
          src={imageUrl}
          alt={
            post.content ??
            "NELO photo"
          }
          width={1400}
          height={1000}
          className="max-h-200 w-full object-contain"
        />

      </div>

      {/* Description */}

      {post.content && (
        <p className="mt-6 whitespace-pre-line text-lg leading-8">
          {post.content}
        </p>
      )}

      {/* Hashtags */}

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

      <div className="mt-8">
        <PostActions
          postId={post.id}
          postType="photo"
          likeUserIds={
            post.likes?.map(
              (like) =>
                like.user_id
            ) ?? []
          }
          commentCount={
            post.comments
              ?.length ?? 0
          }
          boostUserIds={
            post.boosts?.map(
              (boost) =>
                boost.user_id
            ) ?? []
          }
        />
      </div>
      
    </article>
  );
}