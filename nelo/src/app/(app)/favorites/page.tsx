import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

import BlogCard from "@/components/blog/blog-card";
import PhotoCard from "@/components/photo/photo-card";
import AudioCard from "@/components/audio/audio-card";

type FavoritesPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export default async function FavoritesPage({
  searchParams,
}: FavoritesPageProps) {
  const params = await searchParams;

  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const selectedType =
    params.type === "blog" || params.type === "photo" || params.type === "audio"
      ? params.type
      : "all";

  const supabase = await createClient();

  const { data: favoriteRows, error: favoriteError } = await supabase
    .from("favorites")
    .select(
      `
      post_id,
      created_at
    `,
    )
    .eq("user_id", profile.id)
    .order("created_at", {
      ascending: false,
    });

  if (favoriteError) {
    console.error("Favorites load error:", favoriteError);
  }

  const favoriteIds = favoriteRows?.map((favorite) => favorite.post_id) ?? [];

  if (favoriteIds.length === 0) {
    return (
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Favorites</h1>

        <p className="theme-text-secondary mt-2">
          Posts you save will appear here.
        </p>

        <div className="theme-surface theme-border mt-8 rounded-2xl border p-10 text-center">
          <p className="font-medium">No favorites yet</p>

          <p className="theme-text-secondary mt-2 text-sm">
            Use the bookmark icon on a post to save it.
          </p>
        </div>
      </section>
    );
  }

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      `
      id, user_id,
      type,
      title,
      content,
      content_json,
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
    `,
    )
    .in("id", favoriteIds)
    .eq("status", "active");

  if (postsError) {
    console.error("Favorite posts error:", postsError);
  }

  const orderedPosts = favoriteIds
    .map((id) => posts?.find((post) => post.id === id))
    .filter((post): post is NonNullable<typeof post> => Boolean(post));

  const filteredPosts =
    selectedType === "all"
      ? orderedPosts
      : orderedPosts.filter((post) => post.type === selectedType);

  const filters = [
    {
      label: "All",
      value: "all",
      href: "/favorites",
    },
    {
      label: "Blogs",
      value: "blog",
      href: "/favorites?type=blog",
    },
    {
      label: "Photos",
      value: "photo",
      href: "/favorites?type=photo",
    },
    {
      label: "Audio",
      value: "audio",
      href: "/favorites?type=audio",
    },
  ];

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Favorites</h1>

      <p className="theme-text-secondary mt-2">Your saved NELO posts.</p>

      {/* Filters */}

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = selectedType === filter.value;

          return (
            <Link
              key={filter.value}
              href={filter.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? "theme-accent-bg text-white"
                  : "theme-surface theme-border border"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {/* Posts */}

      {filteredPosts.length === 0 ? (
        <div className="theme-surface theme-border mt-8 rounded-2xl border p-10 text-center">
          <p>No saved posts in this category.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {filteredPosts.map((post) => {
            if (post.type === "blog") {
              return <BlogCard key={post.id} blog={post} />;
            }

            if (post.type === "photo") {
              return <PhotoCard key={post.id} photo={post} />;
            }

            if (post.type === "audio") {
              return <AudioCard key={post.id} audio={post} />;
            }

            return null;
          })}
        </div>
      )}
    </section>
  );
}
