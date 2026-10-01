import Image from "next/image";

import {
  notFound,
} from "next/navigation";

import {
  CalendarDays,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAvatarSrc } from "@/lib/avatars";

import BlogContent from "@/components/blog/blog-content";
import PostActions from "@/components/post/post-actions";

type BlogPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BlogPage({
  params,
}: BlogPageProps) {
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
      content_json,
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
    .eq(
      "id",
      id
    )
    .eq(
      "type",
      "blog"
    )
    .eq(
      "status",
      "active"
    )
    .single();

  if (
    error ||
    !post ||
    !post.content_json
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
          const relationTag =
            relation.hashtags;

          if (
            Array.isArray(
              relationTag
            )
          ) {
            return relationTag;
          }

          return relationTag
            ? [relationTag]
            : [];
        }
      )
      .map(
        (tag) =>
          tag.name
      ) ?? [];

  const likeUserIds =
    post.likes?.map(
      (like) =>
        like.user_id
    ) ?? [];

  const boostUserIds =
    post.boosts?.map(
      (boost) =>
        boost.user_id
    ) ?? [];

  const commentCount =
    post.comments
      ?.length ?? 0;

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

      {/* Title */}

      <header>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          {post.title}
        </h1>

        {/* Author */}

        <div className="mt-7 flex items-center gap-3">
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

              <span>
                {publishedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Hashtags */}

        {hashtags.length > 0 && (
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
      </header>

      {/* Divider */}

      <div className="theme-border my-8 border-t" />

      {/* Blog content */}

      <BlogContent
        content={
          post.content_json as object
        }
      />

      {/* Post actions */}

      <div className="mt-10">
        <PostActions
          postId={post.id}
          postType="blog"
          likeUserIds={
            likeUserIds
          }
          commentCount={
            commentCount
          }
          boostUserIds={
            boostUserIds
          }
        />
      </div>

      {/* Author info */}

      <div className="theme-surface theme-border mt-12 rounded-2xl border p-5">
        <div className="flex items-center gap-4">
          <Image
            src={getAvatarSrc(
              profile.avatar_id
            )}
            alt={
              profile.username
            }
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover"
          />

          <div>
            <p className="font-semibold">
              {profile.username}
            </p>

            {profile.bio && (
              <p className="theme-text-secondary mt-1 text-sm">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

    </article>
  );
}