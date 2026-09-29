import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type BlogPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BlogPage({
  params,
}: BlogPageProps) {
  const { id } =
    await params;

  const supabase =
    await createClient();

  const {
    data: post,
    error,
  } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      content_json,
      created_at,
      user_id,
      profiles (
        username,
        avatar_id
      )
    `)
    .eq("id", id)
    .eq("type", "blog")
    .eq("status", "active")
    .single();

  if (
    error ||
    !post
  ) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl">

      <h1 className="text-4xl font-bold">
        {post.title}
      </h1>

      <p className="theme-text-secondary mt-3 text-sm">
        Published on{" "}
        {new Date(
          post.created_at
        ).toLocaleDateString()}
      </p>

      <div className="theme-surface theme-border mt-8 rounded-2xl border p-6">

        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(
            post.content_json,
            null,
            2
          )}
        </pre>

      </div>

    </article>
  );
}