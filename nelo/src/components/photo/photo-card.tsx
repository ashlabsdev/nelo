import Image from "next/image";
import Link from "next/link";

import {
  CalendarDays,
} from "lucide-react";

import PostActions from "@/components/post/post-actions";

import { getAvatarSrc } from "@/lib/avatars";
import { getPostMediaUrl } from "@/lib/media";

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

type PhotoCardProps = {
  photo: {
    id: string;

    content:
      | string
      | null;

    media_path:
      | string
      | null;

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

    likes?: {
      user_id: string;
    }[];

    comments?: {
      id: string;
    }[];

    boosts?: {
      user_id: string;
    }[];
  };
};

export default function PhotoCard({
  photo,
}: PhotoCardProps) {
  const profile =
    Array.isArray(
      photo.profiles
    )
      ? photo.profiles[0]
      : photo.profiles;

  if (
    !profile ||
    !photo.media_path
  ) {
    return null;
  }

  const imageUrl =
    getPostMediaUrl(
      photo.media_path
    );

  const hashtags =
    photo.post_hashtags
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

  const likeUserIds =
    photo.likes?.map(
      (like) =>
        like.user_id
    ) ?? [];

  const boostUserIds =
    photo.boosts?.map(
      (boost) =>
        boost.user_id
    ) ?? [];

  const commentCount =
    photo.comments?.length ??
    0;

  const date =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(
      new Date(
        photo.created_at
      )
    );

  const description =
    photo.content &&
    photo.content.length > 300
      ? `${photo.content
          .slice(0, 300)
          .trim()}...`
      : photo.content;

  return (
    <article className="theme-surface theme-border overflow-hidden rounded-2xl border">

      {/* Author */}

      <div className="flex items-center gap-3 p-4 sm:p-5">

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
            <CalendarDays
              size={13}
            />

            <span>
              {date}
            </span>
          </div>
        </div>

      </div>

      {/* Photo */}

      <Link
        href={`/photos/${photo.id}`}
        className="block"
      >
        <Image
          src={imageUrl}
          alt={
            photo.content ??
            "NELO photo"
          }
          width={1200}
          height={900}
          className="max-h-175 w-full object-contain"
        />
      </Link>

      {/* Description */}

      <div className="p-4 sm:p-5">

        {description && (
          <p className="whitespace-pre-line leading-7">
            {description}
          </p>
        )}

        {/* Hashtags */}

        {hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">

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

        {/* Detail link */}

        <div className="mt-4">
          <Link
            href={`/photos/${photo.id}`}
            className="theme-accent text-sm font-medium"
          >
            View Photo
          </Link>
        </div>

        {/* Common actions */}

        <div className="mt-5">
          <PostActions
            postId={photo.id}
            postType="photo"
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

      </div>

    </article>
  );
}