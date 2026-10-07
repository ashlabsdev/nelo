"use client";

import { FormEvent, useState } from "react";

import Link from "next/link";

import { Save } from "lucide-react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import { useToast } from "@/components/ui/toast-provider";

type EditAudioFormProps = {
  userId: string;
  postId: string;

  audioUrl: string;

  initialTitle: string | null;

  initialDescription: string | null;

  initialHashtags: string[];
};

export default function EditAudioForm({
  userId,
  postId,
  audioUrl,
  initialTitle,
  initialDescription,
  initialHashtags,
}: EditAudioFormProps) {
  const router = useRouter();

  const { showToast } = useToast();

  const [title, setTitle] = useState(initialTitle ?? "");

  const [description, setDescription] = useState(initialDescription ?? "");

  const [hashtags, setHashtags] = useState(
    initialHashtags.map((tag) => `#${tag}`).join(" "),
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);

  function parseHashtags() {
    return [
      ...new Set(
        hashtags
          .split(/[\s,]+/)
          .map((tag) => tag.trim().replace(/^#/, "").toLowerCase())
          .filter(Boolean)
          .filter((tag) => /^[a-z0-9_]{1,30}$/.test(tag)),
      ),
    ].slice(0, 10);
  }

  async function syncHashtags() {
    const supabase = createClient();

    const uniqueHashtags = parseHashtags();

    const { error: deleteError } = await supabase
      .from("post_hashtags")
      .delete()
      .eq("post_id", postId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (uniqueHashtags.length === 0) {
      return;
    }

    const ids: number[] = [];

    for (const tag of uniqueHashtags) {
      const { data: existing } = await supabase
        .from("hashtags")
        .select("id")
        .eq("name", tag)
        .maybeSingle();

      if (existing) {
        ids.push(existing.id);

        continue;
      }

      const { data: created, error } = await supabase
        .from("hashtags")
        .insert({
          name: tag,
        })
        .select("id")
        .single();

      if (error && error.code !== "23505") {
        continue;
      }

      if (created) {
        ids.push(created.id);
      } else {
        const { data: retry } = await supabase
          .from("hashtags")
          .select("id")
          .eq("name", tag)
          .single();

        if (retry) {
          ids.push(retry.id);
        }
      }
    }

    if (ids.length > 0) {
      const { error } = await supabase.from("post_hashtags").insert(
        ids.map((hashtagId) => ({
          post_id: postId,

          hashtag_id: hashtagId,
        })),
      );

      if (error) {
        throw new Error(error.message);
      }
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

    const cleanDescription = description.trim();

    if (cleanDescription.length > 2000) {
      setErrorMessage("Description cannot exceed 2,000 characters.");

      return;
    }

    setLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("posts")
        .update({
          title: cleanTitle,

          content: cleanDescription || null,
        })
        .eq("id", postId)
        .eq("user_id", userId)
        .eq("type", "audio");

      if (error) {
        throw new Error(error.message);
      }

      await syncHashtags();

      showToast("Audio updated successfully.", "success");

      router.push(`/audio/${postId}`);

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update audio.";

      setErrorMessage(message);

      showToast("We couldn't update your audio.", "error");

      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* Existing audio */}

      <div>
        <label className="mb-2 block font-medium">Audio</label>

        <div className="theme-surface theme-border rounded-2xl border p-5">
          <audio controls src={audioUrl} className="w-full" />
        </div>

        <p className="theme-text-secondary mt-2 text-xs">
          The uploaded audio file cannot be replaced while editing.
        </p>
      </div>

      {/* Title */}

      <div>
        <label htmlFor="edit-audio-title" className="mb-2 block font-medium">
          Title
        </label>

        <input
          id="edit-audio-title"
          value={title}
          maxLength={150}
          required
          onChange={(event) => setTitle(event.target.value)}
          className="theme-bg theme-text theme-border w-full rounded-xl border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-1 text-right text-xs">
          {title.length}/150
        </p>
      </div>

      {/* Description */}

      <div>
        <label
          htmlFor="edit-audio-description"
          className="mb-2 block font-medium"
        >
          Description
        </label>

        <textarea
          id="edit-audio-description"
          value={description}
          maxLength={2000}
          rows={5}
          onChange={(event) => setDescription(event.target.value)}
          className="theme-bg theme-text theme-border w-full resize-none rounded-xl border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-1 text-right text-xs">
          {description.length}
          /2000
        </p>
      </div>

      {/* Hashtags */}

      <div>
        <label htmlFor="edit-audio-hashtags" className="mb-2 block font-medium">
          Hashtags
        </label>

        <input
          id="edit-audio-hashtags"
          value={hashtags}
          onChange={(event) => setHashtags(event.target.value)}
          placeholder="#music #podcast #nelo"
          className="theme-bg theme-text theme-border w-full rounded-xl border px-4 py-3 outline-none"
        />
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="flex justify-end gap-3">
        <Link
          href={`/audio/${postId}`}
          className="theme-text theme-border rounded-lg border px-5 py-3 text-sm font-medium"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="theme-accent-bg inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          <Save size={18} />

          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
