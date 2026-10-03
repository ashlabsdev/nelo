import Link from "next/link";

import {
  Plus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { getBlockedUserIds } from "@/lib/blocks";

import AudioCard from "@/components/audio/audio-card";

export default async function AudioPage() {
  const profile =
    await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const supabase =
    await createClient();

  const blockedUserIds =
    await getBlockedUserIds(
      profile.id,
    );

  const {
    data: audioPosts,
    error,
  } = await supabase
    .from("posts")
    .select(`
      id,
      user_id,
      title,
      content,
      media_path,
      created_at,

      profiles!posts_user_id_fkey (
        username,
        avatar_id
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
    `)
    .eq(
      "type",
      "audio",
    )
    .eq(
      "status",
      "active",
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(20);

  if (error) {
    console.error(
      "Audio feed error:",
      error,
    );
  }

  const visibleAudio =
    audioPosts?.filter(
      (audio) =>
        !blockedUserIds.includes(
          audio.user_id,
        ),
    ) ?? [];

  const uniqueAudio =
    visibleAudio.filter(
      (
        audio,
        index,
        array,
      ) =>
        index ===
        array.findIndex(
          (item) =>
            item.media_path ===
            audio.media_path,
        ),
    );

  return (
    <section className="mx-auto max-w-3xl">

      <div className="flex items-start justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Audio
          </h1>

          <p className="theme-text-secondary mt-2">
            Listen to audio shared by the NELO community.
          </p>
        </div>

        <Link
          href="/create/audio"
          className="theme-accent-bg flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          <Plus size={17} />

          <span className="hidden sm:inline">
            Add Audio
          </span>
        </Link>

      </div>

      {uniqueAudio.length ===
      0 ? (
        <div className="theme-surface theme-border mt-8 rounded-2xl border p-8 text-center">

          <h2 className="text-xl font-semibold">
            No audio yet
          </h2>

          <p className="theme-text-secondary mt-2">
            Be the first person to share audio.
          </p>

        </div>
      ) : (
        <div className="mt-8 space-y-6">

          {uniqueAudio.map(
            (audio) => (
              <AudioCard
                key={audio.id}
                audio={audio}
              />
            ),
          )}

        </div>
      )}

    </section>
  );
}