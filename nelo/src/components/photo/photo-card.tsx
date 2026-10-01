import Image from "next/image";
import Link from "next/link";

import {
  CalendarDays,
} from "lucide-react";

import {
  getAvatarSrc,
} from "@/lib/avatars";

import {
  getPostMediaUrl,
} from "@/lib/media";

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

    created_at:
      string;

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
          <Link
            href={`/users/${profile.username}`}
            className="font-medium hover:underline"
          >
            {profile.username}
          </Link>

          <div className="theme-text-secondary mt-1 flex items-center gap-1 text-xs">
            <CalendarDays
              size={13}
            />

            {date}
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

      {/* Content */}

      {(photo.content ||
        hashtags.length >
          0) && (
        <div className="p-4 sm:p-5">

          {photo.content && (
            <p className="whitespace-pre-line leading-7">
              {photo.content}
            </p>
          )}

          {hashtags.length >
            0 && (
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

        </div>
      )}

    </article>
  );
}