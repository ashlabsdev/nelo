import Image from "next/image";
import Link from "next/link";

import {
  Clock,
  ArrowRight,
} from "lucide-react";

import PostActions from "@/components/post/post-actions";

import { getAvatarSrc } from "@/lib/avatars";
import { createBlogPreview } from "@/lib/blog";

type HashtagRelation = {
  hashtags:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

type BlogCardProps = {
  blog: {
    id: string;
    title: string | null;
    content_json: unknown;
    created_at: string;

    profiles:
      | {
          username: string;
          avatar_id: number;
        }
      | {
          username: string;
          avatar_id: number;
        }[]
      | null;

    likes?: {
      user_id: string;
    }[];

    comments?: {
      id: string;
    }[];

    boosts?: {
      user_id: string;
    }[];

    favorites?: {
          user_id: string;
        }[];

    post_hashtags?:
      | HashtagRelation[]
      | null;
  };
};

export default function BlogCard({
  blog,
}: BlogCardProps) {
  const profile =
    Array.isArray(blog.profiles)
      ? blog.profiles[0]
      : blog.profiles;

  if (!profile) {
    return null;
  }

  const preview =
    createBlogPreview(
      blog.content_json
    );

  const hashtags =
    blog.post_hashtags
      ?.flatMap((relation) => {
        const relationHashtags =
          relation.hashtags;

        if (
          Array.isArray(
            relationHashtags
          )
        ) {
          return relationHashtags;
        }

        return relationHashtags
          ? [relationHashtags]
          : [];
      })
      .map((tag) => tag.name) ??
    [];

  const publishedDate =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(
      new Date(
        blog.created_at
      )
    );

  const likeUserIds =
    blog.likes?.map(
      (like) =>
        like.user_id
    ) ?? [];

  const boostUserIds =
    blog.boosts?.map(
      (boost) =>
        boost.user_id
    ) ?? [];

  const commentCount =
    blog.comments?.length ??
    0;

  return (
    <article className="theme-surface theme-border rounded-2xl border p-5 sm:p-6">

      {/* Author */}

      <div className="flex items-center gap-3">

        <Link
          href={`/users/${profile.username}`}
        >
          <Image
            src={getAvatarSrc(
              profile.avatar_id
            )}
            alt={`${profile.username} avatar`}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover transition hover:opacity-80"
          />
        </Link>

        <div>

          <Link
            href={`/users/${profile.username}`}
            className="font-medium hover:underline"
          >
            {
              profile.username
            }
          </Link>

          <div className="theme-text-secondary mt-1 flex items-center gap-1 text-xs">
            <Clock
              size={13}
            />

            <span>
              {publishedDate}
            </span>
          </div>

        </div>

      </div>

      {/* Blog */}

      <div className="mt-5">
        <Link
          href={`/blogs/${blog.id}`}
        >
          <h2 className="text-2xl font-bold transition hover:opacity-70">
            {blog.title}
          </h2>
        </Link>

        {preview && (
          <p className="theme-text-secondary mt-3 leading-7">
            {preview}
          </p>
        )}
      </div>

      {/* Hashtags */}

      {hashtags.length >
        0 && (
        <div className="mt-4 flex flex-wrap gap-2">
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

      {/* Read Blog */}

      <div className="mt-5">
        <Link
          href={`/blogs/${blog.id}`}
          className="theme-accent inline-flex items-center gap-2 text-sm font-medium"
        >
          Read Blog

          <ArrowRight
            size={16}
          />
        </Link>
      </div>

      {/* Shared actions */}

      <div className="mt-5">
        <PostActions
          postId={blog.id}
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
          favoriteUserIds={
            blog.favorites?.map(
              (favorite) =>
                favorite.user_id
            ) ?? []
          }
        />
      </div>

    </article>
  );
}