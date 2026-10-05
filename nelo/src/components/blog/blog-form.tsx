"use client";

import { FormEvent, useCallback, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import type { JSONContent } from "@tiptap/react";

import BlogEditor from "@/components/blog/blog-editor";

import { createClient } from "@/lib/supabase/client";

import { extractTextFromTiptap } from "@/lib/blog";

import { useToast } from "@/components/ui/toast-provider";

type BlogFormProps = {
  mode: "create" | "edit";

  userId: string;

  postId?: string;

  initialTitle?: string;

  initialContent?: JSONContent | null;

  initialHashtags?: string[];
};

export default function BlogForm({
  mode,
  userId,
  postId,
  initialTitle = "",
  initialContent = null,
  initialHashtags = [],
}: BlogFormProps) {
  const router = useRouter();

  const { showToast } = useToast();

  const [title, setTitle] = useState(initialTitle);

  const [editorJson, setEditorJson] = useState<JSONContent | null>(
    initialContent,
  );

  const [hashtags, setHashtags] = useState(
    initialHashtags.map((tag) => `#${tag}`).join(" "),
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);

  /*
   * Stable callback prevents BlogEditor
   * useEffect from firing repeatedly due
   * to a new function reference.
   */
  const handleEditorChange = useCallback((json: JSONContent) => {
    setEditorJson(json);
  }, []);

  function parseHashtags() {
    const parsed = hashtags
      .split(/[\s,]+/)
      .map((tag) => tag.trim().replace(/^#/, "").toLowerCase())
      .filter(Boolean)
      .filter((tag) => /^[a-z0-9_]{1,30}$/.test(tag));

    return [...new Set(parsed)].slice(0, 10);
  }

  async function syncHashtags(targetPostId: string) {
    const supabase = createClient();

    const uniqueHashtags = parseHashtags();

    /*
     * Edit mode:
     * remove old post/hashtag relationships.
     *
     * We do NOT delete hashtag rows themselves
     * because another post may use them.
     */
    if (mode === "edit") {
      const { error: deleteError } = await supabase
        .from("post_hashtags")
        .delete()
        .eq("post_id", targetPostId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }

    if (uniqueHashtags.length === 0) {
      return;
    }

    const hashtagIds: number[] = [];

    for (const tag of uniqueHashtags) {
      const { data: existing } = await supabase
        .from("hashtags")
        .select("id")
        .eq("name", tag)
        .maybeSingle();

      if (existing) {
        hashtagIds.push(existing.id);

        continue;
      }

      const { data: created, error: hashtagError } = await supabase
        .from("hashtags")
        .insert({
          name: tag,
        })
        .select("id")
        .single();

      if (hashtagError && hashtagError.code !== "23505") {
        console.error("Hashtag insert error:", hashtagError);

        continue;
      }

      if (created) {
        hashtagIds.push(created.id);
      } else {
        /*
         * Another user may have
         * created it simultaneously.
         */
        const { data: retry } = await supabase
          .from("hashtags")
          .select("id")
          .eq("name", tag)
          .single();

        if (retry) {
          hashtagIds.push(retry.id);
        }
      }
    }

    if (hashtagIds.length === 0) {
      return;
    }

    const { error: postHashtagError } = await supabase
      .from("post_hashtags")
      .insert(
        hashtagIds.map((hashtagId) => ({
          post_id: targetPostId,

          hashtag_id: hashtagId,
        })),
      );

    if (postHashtagError) {
      throw new Error(postHashtagError.message);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setErrorMessage("");

    const cleanTitle = title.trim();

    if (cleanTitle.length < 3 || cleanTitle.length > 150) {
      setErrorMessage("Title must be between 3 and 150 characters.");

      return;
    }

    const plainText = extractTextFromTiptap(editorJson);

    if (!plainText) {
      setErrorMessage("Please write some blog content.");

      return;
    }

    if (plainText.length > 50000) {
      setErrorMessage("Blog content cannot exceed 50,000 characters.");

      return;
    }

    if (mode === "edit" && !postId) {
      setErrorMessage("Blog post information is missing.");

      return;
    }

    setLoading(true);

    const supabase = createClient();

    try {
      let targetPostId = postId;

      /*
       * CREATE
       */
      if (mode === "create") {
        const { data: post, error: postError } = await supabase
          .from("posts")
          .insert({
            user_id: userId,

            type: "blog",

            title: cleanTitle,

            content_json: editorJson,

            content: null,

            media_path: null,
          })
          .select("id")
          .single();

        if (postError || !post) {
          throw new Error(postError?.message ?? "Could not publish blog.");
        }

        targetPostId = post.id;
      }

      /*
       * EDIT
       */
      if (mode === "edit" && postId) {
        const { error: updateError } = await supabase
          .from("posts")
          .update({
            title: cleanTitle,

            content_json: editorJson,

            content: null,
          })
          .eq("id", postId)
          .eq("user_id", userId)
          .eq("type", "blog");

        if (updateError) {
          throw new Error(updateError.message);
        }
      }

      if (!targetPostId) {
        throw new Error("Blog post could not be resolved.");
      }

      /*
       * Hashtags.
       */
      await syncHashtags(targetPostId);

      if (mode === "edit") {
        showToast("Blog updated successfully.", "success");
      } else {
        showToast("Blog published successfully.", "success");
      }

      router.push(`/blogs/${targetPostId}`);

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : mode === "edit"
            ? "Could not update blog."
            : "Could not publish blog.";

      setErrorMessage(message);

      showToast(
        mode === "edit"
          ? "We couldn't update your blog."
          : "We couldn't publish your blog.",
        "error",
      );

      setLoading(false);
    }
  }

  const isEdit = mode === "edit";

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      {/* Title */}

      <div>
        <label htmlFor="title" className="mb-2 block font-medium">
          Title
        </label>

        <input
          id="title"
          type="text"
          value={title}
          maxLength={150}
          required
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Give your blog a title"
          className="theme-bg theme-text theme-border w-full rounded-xl border px-4 py-3 text-xl font-semibold outline-none"
        />

        <p className="theme-text-secondary mt-1 text-right text-xs">
          {title.length}
          /150
        </p>
      </div>

      {/* Editor */}

      <div className="mt-6">
        <label className="mb-2 block font-medium">Blog Content</label>

        <BlogEditor
          initialContent={initialContent}
          onChange={handleEditorChange}
        />

        <p className="theme-text-secondary mt-2 text-xs">
          Maximum 50,000 characters.
        </p>
      </div>

      {/* Hashtags */}

      <div className="mt-6">
        <label htmlFor="hashtags" className="mb-2 block font-medium">
          Hashtags
        </label>

        <input
          id="hashtags"
          type="text"
          value={hashtags}
          onChange={(event) => setHashtags(event.target.value)}
          placeholder="#nextjs #supabase #webdev"
          className="theme-bg theme-text theme-border w-full rounded-xl border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-2 text-sm">
          Up to 10 hashtags. Letters, numbers and underscores only.
        </p>
      </div>

      {/* Error */}

      {errorMessage && (
        <p className="mt-5 text-sm text-red-600">{errorMessage}</p>
      )}

      {/* Actions */}

      <div className="mt-8 flex items-center justify-end gap-3">
        <Link
          href={isEdit && postId ? `/blogs/${postId}` : "/blogs"}
          className="theme-text theme-border rounded-lg border px-5 py-3 text-sm font-medium transition hover:opacity-70"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="theme-accent-bg rounded-lg px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? isEdit
              ? "Saving..."
              : "Publishing..."
            : isEdit
              ? "Save Changes"
              : "Publish Blog"}
        </button>
      </div>
    </form>
  );
}
