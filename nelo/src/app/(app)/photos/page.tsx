import Link from "next/link";

import {
  Plus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import PhotoCard from "@/components/photo/photo-card";

export default async function PhotosPage() {
  const supabase =
    await createClient();

  const {
    data: photos,
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
      )
    `)
    .eq(
      "type",
      "photo"
    )
    .eq(
      "status",
      "active"
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(20);

  if (error) {
    console.error(
      "Photo feed error:",
      error
    );
  }

  /*
   * Defensive duplicate protection.
   *
   * If two database rows somehow point
   * to the exact same uploaded image,
   * only show it once.
   */
  const uniquePhotos =
    photos?.filter(
      (
        photo,
        index,
        array
      ) =>
        index ===
        array.findIndex(
          (item) =>
            item.media_path ===
            photo.media_path
        )
    ) ?? [];

  return (
    <section className="mx-auto max-w-3xl">

      <div className="flex items-start justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Photos
          </h1>

          <p className="theme-text-secondary mt-2">
            Photos shared by the NELO community.
          </p>
        </div>

        <Link
          href="/create/photo"
          className="theme-accent-bg flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          <Plus size={17} />

          <span className="hidden sm:inline">
            Add Photo
          </span>
        </Link>

      </div>

      {uniquePhotos.length === 0 ? (
        <div className="theme-surface theme-border mt-8 rounded-2xl border p-8 text-center">

          <h2 className="text-xl font-semibold">
            No photos yet
          </h2>

          <p className="theme-text-secondary mt-2">
            Be the first person to share a photo.
          </p>

        </div>
      ) : (
        <div className="mt-8 space-y-6">

          {uniquePhotos.map(
            (photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
              />
            )
          )}

        </div>
      )}

    </section>
  );
}