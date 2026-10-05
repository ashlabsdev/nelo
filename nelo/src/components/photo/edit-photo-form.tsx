"use client";

import { FormEvent, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Save } from "lucide-react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import { useToast } from "@/components/ui/toast-provider";

type EditPhotoFormProps = {
  userId: string;
  postId: string;

  imageUrl: string;

  initialDescription: string | null;

  initialHashtags: string[];
};

export default function EditPhotoForm({
  userId,
  postId,
  imageUrl,
  initialDescription,
  initialHashtags,
}: EditPhotoFormProps) {
  const router = useRouter();

  const { showToast } = useToast();

  const [description, setDescription] = useState(initialDescription ?? "");

  const [hashtags, setHashtags] = useState(
    initialHashtags.map((tag) => `#${tag}`).join(" "),
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);

  function parseHashtags() {
    const parsed = hashtags
      .split(/[\s,]+/)
      .map((tag) => tag.trim().replace(/^#/, "").toLowerCase())
      .filter(Boolean)
      .filter((tag) => /^[a-z0-9_]{1,30}$/.test(tag));

    return [...new Set(parsed)].slice(0, 10);
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
        continue;
      }

      if (created) {
        hashtagIds.push(created.id);
      } else {
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

    if (hashtagIds.length > 0) {
      const { error } = await supabase.from("post_hashtags").insert(
        hashtagIds.map((hashtagId) => ({
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

    const cleanDescription = description.trim();

    if (cleanDescription.length > 2000) {
      setErrorMessage("Description cannot exceed 2,000 characters.");

      return;
    }

    setLoading(true);

    const supabase = createClient();

    try {
      const { error: updateError } = await supabase
        .from("posts")
        .update({
          content: cleanDescription || null,
        })
        .eq("id", postId)
        .eq("user_id", userId)
        .eq("type", "photo");

      if (updateError) {
        throw new Error(updateError.message);
      }

      await syncHashtags();

      showToast("Photo updated successfully.", "success");

      router.push(`/photos/${postId}`);

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update photo.";

      setErrorMessage(message);

      showToast("We couldn't update your photo.", "error");

      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* Existing image */}

      <div>
        <label className="mb-2 block font-medium">Photo</label>

        <div className="theme-surface theme-border rounded-2xl border p-3">
          <Image
            src={imageUrl}
            alt="Current photo"
            width={1200}
            height={900}
            className="max-h-125 w-full rounded-xl object-contain"
          />
        </div>

        <p className="theme-text-secondary mt-2 text-xs">
          The uploaded image cannot be replaced while editing. Delete and
          recreate the post if you want to use another image.
        </p>
      </div>

      {/* Description */}

      <div>
        <label htmlFor="photo-description" className="mb-2 block font-medium">
          Description
        </label>

        <textarea
          id="photo-description"
          value={description}
          maxLength={2000}
          rows={5}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Say something about this photo..."
          className="theme-bg theme-text theme-border w-full resize-none rounded-xl border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-1 text-right text-xs">
          {description.length}
          /2000
        </p>
      </div>

      {/* Hashtags */}

      <div>
        <label htmlFor="photo-hashtags" className="mb-2 block font-medium">
          Hashtags
        </label>

        <input
          id="photo-hashtags"
          type="text"
          value={hashtags}
          onChange={(event) => setHashtags(event.target.value)}
          placeholder="#photography #nature #nelo"
          className="theme-bg theme-text theme-border w-full rounded-xl border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-2 text-sm">Up to 10 hashtags.</p>
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="flex justify-end gap-3">
        <Link
          href={`/photos/${postId}`}
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
