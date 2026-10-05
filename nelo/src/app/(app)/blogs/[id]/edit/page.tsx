import { notFound } from "next/navigation";

import type { JSONContent } from "@tiptap/react";

import { Pencil } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

import BlogForm from "@/components/blog/blog-form";

type EditBlogPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;

  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const supabase = await createClient();

  const { data: blog, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      user_id,
      type,
      title,
      content_json,
      status,

      post_hashtags (
        hashtags (
          name
        )
      )
    `,
    )
    .eq("id", id)
    .eq("type", "blog")
    .single();

  /*
   * Do not reveal whether another
   * user's private edit route exists.
   */
  if (error || !blog || blog.user_id !== profile.id) {
    notFound();
  }

  /*
   * Removed/moderated posts should
   * not be editable in this workflow.
   */
  if (blog.status !== "active") {
    notFound();
  }

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

  const hashtagRelations = (blog.post_hashtags ?? []) as HashtagRelation[];

  const hashtags = hashtagRelations.flatMap((relation) => {
    const tag = relation.hashtags;

    if (Array.isArray(tag)) {
      return tag.map((item) => item.name);
    }

    if (tag) {
      return [tag.name];
    }

    return [];
  });

  return (
    <section className="mx-auto max-w-3xl">
      <div className="flex items-start gap-3">
        <div className="theme-accent-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white">
          <Pencil size={20} />
        </div>

        <div>
          <h1 className="text-3xl font-bold">Edit Blog</h1>

          <p className="theme-text-secondary mt-2">
            Update your story and save your changes.
          </p>
        </div>
      </div>

      <BlogForm
        mode="edit"
        userId={profile.id}
        postId={blog.id}
        initialTitle={blog.title ?? ""}
        initialContent={blog.content_json as JSONContent | null}
        initialHashtags={hashtags}
      />
    </section>
  );
}
