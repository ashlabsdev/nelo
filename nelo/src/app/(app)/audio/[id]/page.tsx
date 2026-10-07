import Image from "next/image";

import { notFound } from "next/navigation";

import { CalendarDays, AudioLines } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAvatarSrc } from "@/lib/avatars";
import { getPostMediaUrl } from "@/lib/media";

import PostActions from "@/components/post/post-actions";
import PostManageMenu from "@/components/post/post-manage-menu";

type AudioPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AudioPage({ params }: AudioPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      id, user_id,
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
      ),

      likes (
        user_id
      ),

      comments (
        id
      ),

      boosts (
        user_id
      ),

      favorites (
        user_id
      )
    `,
    )
    .eq("id", id)
    .eq("type", "audio")
    .eq("status", "active")
    .single();

  if (error || !post || !post.media_path) {
    notFound();
  }

  const profile = Array.isArray(post.profiles)
    ? post.profiles[0]
    : post.profiles;

  if (!profile) {
    notFound();
  }

  const hashtags =
    post.post_hashtags
      ?.flatMap((relation) => {
        const tag = relation.hashtags;

        if (Array.isArray(tag)) {
          return tag;
        }

        return tag ? [tag] : [];
      })
      .map((tag) => tag.name) ?? [];

  const likeUserIds = post.likes?.map((like) => like.user_id) ?? [];

  const boostUserIds = post.boosts?.map((boost) => boost.user_id) ?? [];

  const commentCount = post.comments?.length ?? 0;

  const audioUrl = getPostMediaUrl(post.media_path);

  const publishedDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(post.created_at));

  return (
    <article className="mx-auto max-w-3xl">
      {/* Author */}

      <div className="flex items-center gap-3">
        <Image
          src={getAvatarSrc(profile.avatar_id)}
          alt={`${profile.username} avatar`}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />

        <div>
          <p className="font-medium">{profile.username}</p>

          <div className="theme-text-secondary mt-1 flex items-center gap-1 text-sm">
            <CalendarDays size={14} />

            <span>{publishedDate}</span>
          </div>
          <PostManageMenu
            postId={post.id}
            postType="audio"
            ownerUserId={post.user_id}
            mediaPath={post.media_path}
          />
        </div>
      </div>

      {/* Audio */}

      <div className="theme-surface theme-border mt-8 rounded-2xl border p-6">
        <AudioLines size={38} className="theme-accent" />

        <h1 className="mt-4 text-3xl font-bold">{post.title}</h1>

        <audio
          controls
          preload="metadata"
          src={audioUrl}
          className="mt-6 w-full"
        />
      </div>

      {/* Description */}

      {post.content && (
        <p className="mt-6 whitespace-pre-line text-lg leading-8">
          {post.content}
        </p>
      )}

      {/* Hashtags */}

      {hashtags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3">
          {hashtags.map((tag) => (
            <span key={tag} className="theme-accent text-sm">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Common actions */}

      <div className="mt-8">
        <PostActions
          postId={post.id}
          postType="audio"
          likeUserIds={likeUserIds}
          commentCount={commentCount}
          boostUserIds={boostUserIds}
          favoriteUserIds={
            post.favorites?.map((favorite) => favorite.user_id) ?? []
          }
        />
      </div>

      {/* Author info */}

      <div className="theme-surface theme-border mt-10 rounded-2xl border p-5">
        <div className="flex items-center gap-4">
          <Image
            src={getAvatarSrc(profile.avatar_id)}
            alt={profile.username}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover"
          />

          <div>
            <p className="font-semibold">{profile.username}</p>

            {profile.bio && (
              <p className="theme-text-secondary mt-1 text-sm">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
