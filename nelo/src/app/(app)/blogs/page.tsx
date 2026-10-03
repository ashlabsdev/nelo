import Link from "next/link";

import {
  Plus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { getBlockedUserIds } from "@/lib/blocks";

import BlogCard from "@/components/blog/blog-card";

export default async function BlogsPage() {
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
    data: blogs,
    error,
  } = await supabase
    .from("posts")
    .select(`
      id,
      user_id,
      title,
      content_json,
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
      "blog",
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
      "Blog feed error:",
      error,
    );
  }

  const visibleBlogs =
    blogs?.filter(
      (blog) =>
        !blockedUserIds.includes(
          blog.user_id,
        ),
    ) ?? [];

  return (
    <section className="mx-auto max-w-3xl">

      <div className="flex items-start justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Blogs
          </h1>

          <p className="theme-text-secondary mt-2">
            Stories and ideas shared by the NELO community.
          </p>
        </div>

        <Link
          href="/create/blog"
          className="theme-accent-bg flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          <Plus size={17} />

          <span className="hidden sm:inline">
            Write Blog
          </span>
        </Link>

      </div>

      {visibleBlogs.length ===
      0 ? (
        <div className="theme-surface theme-border mt-8 rounded-2xl border p-8 text-center">

          <h2 className="text-xl font-semibold">
            No blogs yet
          </h2>

          <p className="theme-text-secondary mt-2">
            Be the first person to write something.
          </p>

        </div>
      ) : (
        <div className="mt-8 space-y-6">

          {visibleBlogs.map(
            (blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
              />
            ),
          )}

        </div>
      )}

    </section>
  );
}