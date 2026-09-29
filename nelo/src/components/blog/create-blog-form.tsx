"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import BlogEditor from "@/components/blog/blog-editor";

import { createClient } from "@/lib/supabase/client";

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

  const [errorMessage, setErrorMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

    function hasEditorContent(
        json: object | null
        ) {
        if (!json) {
            return false;
        }

        const document =
            json as {
            content?: unknown[];
            };

        return (
            Array.isArray(
            document.content
            ) &&
            document.content.length > 0
        );
        }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setErrorMessage("");

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

    if (
        !hasEditorContent(
            editorJson
        )
        ) {
      setErrorMessage(
        "Please write some blog content."
      );
      return;
    }

    setLoading(true);

    const supabase =
      createClient();

    const { data: post, error } =
      await supabase
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

    if (error || !post) {
      setErrorMessage(
        error?.message ??
          "Could not publish blog."
      );

      setLoading(false);
      return;
    }

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
        .filter(
          (tag) =>
            /^[a-z0-9_]{1,30}$/.test(
              tag
            )
        );

    const uniqueHashtags = [
      ...new Set(
        parsedHashtags
      ),
    ].slice(0, 10);

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
          error: hashtagError,
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
            hashtagError
          );

          continue;
        }

        if (created) {
          hashtagIds.push(
            created.id
          );
        } else {
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

      if (
        hashtagIds.length > 0
      ) {
        await supabase
          .from("post_hashtags")
          .insert(
            hashtagIds.map(
              (hashtagId) => ({
                post_id:
                  post.id,
                hashtag_id:
                  hashtagId,
              })
            )
          );
      }
    }

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

      <div>
        <label
          htmlFor="title"
          className="mb-2 block font-medium"
        >
          Title
        </label>

        <input
          id="title"
          value={title}
          maxLength={150}
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


      <div className="mt-6">

        <label className="mb-2 block font-medium">
          Blog Content
        </label>

        <BlogEditor
          onChange={
            setEditorJson
          }
        />

      </div>


      <div className="mt-6">

        <label
          htmlFor="hashtags"
          className="mb-2 block font-medium"
        >
          Hashtags
        </label>

        <input
          id="hashtags"
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
          Up to 10 hashtags.
        </p>

      </div>


      {errorMessage && (
        <p className="mt-5 text-sm text-red-600">
          {errorMessage}
        </p>
      )}


      <div className="mt-8 flex justify-end">

        <button
          type="submit"
          disabled={loading}
          className="theme-accent-bg rounded-lg px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading
            ? "Publishing..."
            : "Publish Blog"}
        </button>

      </div>

    </form>
  );
}