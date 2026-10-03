import Image from "next/image";
import Link from "next/link";

import { CalendarDays, ExternalLink } from "lucide-react";

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

type AudioCardProps = {
  audio: {
    id: string;

    title: string | null;

    content: string | null;

    media_path: string | null;

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

    post_hashtags?: HashtagRelation[] | null;

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
  };
};

export default function AudioCard({ audio }: AudioCardProps) {
  const profile = Array.isArray(audio.profiles)
    ? audio.profiles[0]
    : audio.profiles;

  if (!profile || !audio.media_path) {
    return null;
  }

  const audioUrl = getPostMediaUrl(audio.media_path);

  const hashtags =
    audio.post_hashtags
      ?.flatMap((relation) => {
        const tag = relation.hashtags;

        if (Array.isArray(tag)) {
          return tag;
        }

        return tag ? [tag] : [];
      })
      .map((tag) => tag.name) ?? [];

  const likeUserIds = audio.likes?.map((like) => like.user_id) ?? [];

  const boostUserIds = audio.boosts?.map((boost) => boost.user_id) ?? [];

  const commentCount = audio.comments?.length ?? 0;

  const publishedDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(audio.created_at));

  const description =
    audio.content && audio.content.length > 300
      ? `${audio.content.slice(0, 300).trim()}...`
      : audio.content;

  return (
    <article className="theme-surface theme-border rounded-2xl border p-5 sm:p-6">
      {/* Author */}

      <div className="flex items-center gap-3">
        <Link href={`/users/${profile.username}`}>
          <Image
            src={getAvatarSrc(profile.avatar_id)}
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
            {profile.username}
          </Link>

          <div className="theme-text-secondary mt-1 flex items-center gap-1 text-xs">
            <CalendarDays size={13} />

            {publishedDate}
          </div>
        </div>
      </div>

      {/* Title */}

      <div className="mt-5">
        <Link href={`/audio/${audio.id}`}>
          <h2 className="text-2xl font-bold transition hover:opacity-70">
            {audio.title}
          </h2>
        </Link>
      </div>

      {/* Player */}

      <audio
        controls
        preload="metadata"
        src={audioUrl}
        className="mt-5 w-full"
      />

      {/* Description */}

      {description && (
        <p className="theme-text-secondary mt-5 whitespace-pre-line leading-7">
          {description}
        </p>
      )}

      {/* Hashtags */}

      {hashtags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {hashtags.map((tag) => (
            <span key={tag} className="theme-accent text-sm">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Detail link */}

      <div className="mt-5">
        <Link
          href={`/audio/${audio.id}`}
          className="theme-accent inline-flex items-center gap-2 text-sm font-medium"
        >
          Open Audio
          <ExternalLink size={15} />
        </Link>
      </div>

      {/* Shared actions */}

      <div className="mt-5">
        <PostActions
          postId={audio.id}
          postType="audio"
          likeUserIds={likeUserIds}
          commentCount={commentCount}
          boostUserIds={boostUserIds}
          favoriteUserIds={
            audio.favorites?.map((favorite) => favorite.user_id) ?? []
          }
        />
      </div>
    </article>
  );
}
