import Link from "next/link";

import { FileText, ImageIcon, Headphones, Plus } from "lucide-react";

import { getCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

import PostManageMenu from "@/components/post/post-manage-menu";

type ContentPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export default async function ContentPage({ searchParams }: ContentPageProps) {
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

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      user_id,
      type,
      title,
      content,
      media_path,
      status,
      created_at,
      updated_at
    `,
    )
    .eq("user_id", profile.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("My Content error:", error);
  }

  const filteredPosts =
    selectedType === "all"
      ? (posts ?? [])
      : (posts?.filter((post) => post.type === selectedType) ?? []);

  const filters = [
    {
      name: "All",
      value: "all",
      href: "/profile/content",
    },
    {
      name: "Blogs",
      value: "blog",
      href: "/profile/content?type=blog",
    },
    {
      name: "Photos",
      value: "photo",
      href: "/profile/content?type=photo",
    },
    {
      name: "Audio",
      value: "audio",
      href: "/profile/content?type=audio",
    },
  ];

  function getPostLink(post: { id: string; type: string }) {
    switch (post.type) {
      case "blog":
        return `/blogs/${post.id}`;

      case "photo":
        return `/photos/${post.id}`;

      case "audio":
        return `/audio/${post.id}`;

      default:
        return "#";
    }
  }

  function getCreateLink(type: string) {
    switch (type) {
      case "photo":
        return "/create/photo";

      case "audio":
        return "/create/audio";

      default:
        return "/create/blog";
    }
  }

  function getIcon(type: string) {
    if (type === "photo") {
      return ImageIcon;
    }

    if (type === "audio") {
      return Headphones;
    }

    return FileText;
  }

  return (
    <section>
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Content</h1>

          <p className="theme-text-secondary mt-2">
            Manage everything you have published on NELO.
          </p>
        </div>

        <Link
          href={getCreateLink(selectedType)}
          className="theme-accent-bg inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          <Plus size={17} />
          Create
        </Link>
      </div>

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
              {filter.name}
            </Link>
          );
        })}
      </div>

      {/* Content */}

      {filteredPosts.length === 0 ? (
        <div className="theme-surface theme-border mt-8 rounded-2xl border p-10 text-center">
          <h2 className="text-lg font-semibold">No content here yet</h2>

          <p className="theme-text-secondary mt-2 text-sm">
            Create something and it will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {filteredPosts.map((post) => {
            const Icon = getIcon(post.type);

            const displayTitle =
              post.title ||
              post.content?.slice(0, 70).trim() ||
              (post.type === "photo" ? "Photo" : "Untitled content");

            const date = new Intl.DateTimeFormat("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(post.created_at));

            return (
              <div
                key={post.id}
                className="theme-surface theme-border flex items-center gap-4 rounded-xl border p-4"
              >
                <div className="theme-bg theme-border flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                  <Icon size={20} className="theme-accent" />
                </div>

                <Link href={getPostLink(post)} className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{displayTitle}</p>

                  <div className="theme-text-secondary mt-1 flex flex-wrap gap-2 text-xs">
                    <span className="capitalize">{post.type}</span>

                    <span>•</span>

                    <span>{date}</span>

                    <span>•</span>

                    <span className="capitalize">{post.status}</span>
                  </div>
                </Link>

                <PostManageMenu
                  postId={post.id}
                  postType={post.type as "blog" | "photo" | "audio"}
                  ownerUserId={post.user_id}
                  mediaPath={post.media_path}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
