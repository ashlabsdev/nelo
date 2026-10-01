import Image from "next/image";
import Link from "next/link";

import {
  Clock,
  ArrowRight,
} from "lucide-react";

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
        if (
          Array.isArray(
            relation.hashtags
          )
        ) {
          return relation.hashtags;
        }

        return relation.hashtags
          ? [relation.hashtags]
          : [];
      })
      .map((tag) => tag.name) ?? [];

  const publishedDate =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(
      new Date(blog.created_at)
    );

  return (
    <article className="theme-surface theme-border rounded-2xl border p-5 sm:p-6">

      {/* Author */}

      <div className="flex items-center gap-3">

        <Image
          src={getAvatarSrc(
            profile.avatar_id
          )}
          alt={`${profile.username} avatar`}
          width={44}
          height={44}
          className="h-11 w-11 rounded-full object-cover"
        />

        <div>
          <p className="font-medium">
            {profile.username}
          </p>

          <div className="theme-text-secondary mt-1 flex items-center gap-1 text-xs">
            <Clock size={13} />

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

      {hashtags.length > 0 && (
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


      {/* Read more */}

      <div className="theme-border mt-5 border-t pt-4">

        <Link
          href={`/blogs/${blog.id}`}
          className="theme-accent inline-flex items-center gap-2 text-sm font-medium"
        >
          Read Blog
          <ArrowRight size={16} />
        </Link>

      </div>

    </article>
  );
}