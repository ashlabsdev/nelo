"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import BlogEditor from "@/components/blog/blog-editor";

import { createClient } from "@/lib/supabase/client";
import { extractTextFromTiptap } from "@/lib/blog";

type CreateBlogFormProps = {
  userId: string;
};

export default function CreateBlogForm({
  userId,
}: CreateBlogFormProps) {
  const router = useRouter();

  const [title, setTitle] =
    useState("");

  const [editorJson, setEditorJson] =
    useState<object | null>(null);

  const [hashtags, setHashtags] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setErrorMessage("");

    // -----------------------------
    // Validate title
    // -----------------------------

    const cleanTitle =
      title.trim();

    if (
      cleanTitle.length < 3 ||
      cleanTitle.length > 150
    ) {
      setErrorMessage(
        "Title must be between 3 and 150 characters."
      );

      return;
    }

    // -----------------------------
    // Validate blog content
    // -----------------------------

    const plainText =
      extractTextFromTiptap(
        editorJson
      );

    if (!plainText) {
      setErrorMessage(
        "Please write some blog content."
      );

      return;
    }

    if (
      plainText.length > 50000
    ) {
      setErrorMessage(
        "Blog content cannot exceed 50,000 characters."
      );

      return;
    }

    setLoading(true);

    const supabase =
      createClient();

    // -----------------------------
    // Create blog post
    // -----------------------------

    const {
      data: post,
      error: postError,
    } = await supabase
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

    if (
      postError ||
      !post
    ) {
      setErrorMessage(
        postError?.message ??
          "Could not publish blog."
      );

      setLoading(false);

      return;
    }

    // -----------------------------
    // Parse hashtags
    // -----------------------------

    const parsedHashtags =
      hashtags
        .split(/[\s,]+/)
        .map((tag) =>
          tag
            .trim()
            .replace(/^#/, "")
            .toLowerCase()
        )
        .filter(Boolean)
        .filter((tag) =>
          /^[a-z0-9_]{1,30}$/.test(
            tag
          )
        );

    const uniqueHashtags = [
      ...new Set(
        parsedHashtags
      ),
    ].slice(0, 10);

    // -----------------------------
    // Create/find hashtags
    // -----------------------------

    if (
      uniqueHashtags.length > 0
    ) {
      const hashtagIds: number[] =
        [];

      for (
        const tag of uniqueHashtags
      ) {
        const {
          data: existing,
        } = await supabase
          .from("hashtags")
          .select("id")
          .eq("name", tag)
          .maybeSingle();

        if (existing) {
          hashtagIds.push(
            existing.id
          );

          continue;
        }

        const {
          data: created,
          error:
            hashtagError,
        } = await supabase
          .from("hashtags")
          .insert({
            name: tag,
          })
          .select("id")
          .single();

        if (
          hashtagError &&
          hashtagError.code !==
            "23505"
        ) {
          console.error(
            "Hashtag insert error:",
            hashtagError
          );

          continue;
        }

        if (created) {
          hashtagIds.push(
            created.id
          );
        } else {
          // Another user may have
          // created the same hashtag
          // at nearly the same time.

          const {
            data: retry,
          } = await supabase
            .from("hashtags")
            .select("id")
            .eq("name", tag)
            .single();

          if (retry) {
            hashtagIds.push(
              retry.id
            );
          }
        }
      }

      // -----------------------------
      // Connect hashtags to post
      // -----------------------------

      if (
        hashtagIds.length > 0
      ) {
        const {
          error:
            postHashtagError,
        } = await supabase
          .from(
            "post_hashtags"
          )
          .insert(
            hashtagIds.map(
              (
                hashtagId
              ) => ({
                post_id:
                  post.id,
                hashtag_id:
                  hashtagId,
              })
            )
          );

        if (
          postHashtagError
        ) {
          console.error(
            "Post hashtag insert error:",
            postHashtagError
          );
        }
      }
    }

    // -----------------------------
    // Redirect to published blog
    // -----------------------------

    router.push(
      `/blogs/${post.id}`
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8"
    >
      {/* Title */}

      <div>
        <label
          htmlFor="title"
          className="mb-2 block font-medium"
        >
          Title
        </label>

        <input
          id="title"
          type="text"
          value={title}
          maxLength={150}
          required
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          placeholder="Give your blog a title"
          className="theme-bg theme-text theme-border w-full rounded-xl border px-4 py-3 text-xl font-semibold outline-none"
        />

        <p className="theme-text-secondary mt-1 text-right text-xs">
          {title.length}/150
        </p>
      </div>

      {/* Editor */}

      <div className="mt-6">
        <label className="mb-2 block font-medium">
          Blog Content
        </label>

        <BlogEditor
          onChange={
            setEditorJson
          }
        />

        <p className="theme-text-secondary mt-2 text-xs">
          Maximum 50,000 characters.
        </p>
      </div>

      {/* Hashtags */}

      <div className="mt-6">
        <label
          htmlFor="hashtags"
          className="mb-2 block font-medium"
        >
          Hashtags
        </label>

        <input
          id="hashtags"
          type="text"
          value={hashtags}
          onChange={(event) =>
            setHashtags(
              event.target.value
            )
          }
          placeholder="#nextjs #supabase #webdev"
          className="theme-bg theme-text theme-border w-full rounded-xl border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-2 text-sm">
          Up to 10 hashtags. Letters,
          numbers and underscores only.
        </p>
      </div>

      {/* Error */}

      {errorMessage && (
        <p className="mt-5 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {/* Publish */}

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="theme-accent-bg rounded-lg px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Publishing..."
            : "Publish Blog"}
        </button>
      </div>
    </form>
  );
}