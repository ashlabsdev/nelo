"use client";

import Image from "next/image";
import { convertImageToWebP } from "@/lib/image";

import Link from "next/link";

import { ChangeEvent, FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { ImagePlus, Upload, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type CreatePhotoFormProps = {
  userId: string;
};

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export default function CreatePhotoForm({ userId }: CreatePhotoFormProps) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [description, setDescription] = useState("");

  const [hashtags, setHashtags] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setErrorMessage("");

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMessage("Only JPG, PNG and WebP images are allowed.");

      event.target.value = "";

      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage("Image must be 8 MB or smaller.");

      event.target.value = "";

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(selectedFile);

    setFile(selectedFile);

    setPreviewUrl(objectUrl);
  }

  function removePhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);

    setPreviewUrl(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setErrorMessage("");

    if (!file) {
      setErrorMessage("Please select a photo.");

      return;
    }

    const cleanDescription = description.trim();

    if (cleanDescription.length > 2000) {
      setErrorMessage("Description cannot exceed 2,000 characters.");

      return;
    }

    let processedFile: File;

    try {
      processedFile = await convertImageToWebP(file);
    } catch {
      setErrorMessage("Could not process the selected image.");

      setLoading(false);

      return;
    }

    setLoading(true);

    const supabase = createClient();

    // const extension =
    //   file.name
    //     .split(".")
    //     .pop()
    //     ?.toLowerCase() ??
    //   "jpg";

    const fileName = `${crypto.randomUUID()}.webp`;

    const storagePath = `photos/${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("post-media")
      .upload(storagePath, processedFile, {
        cacheControl: "3600",

        upsert: false,

        contentType: "image/webp",
      });

    if (uploadError) {
      setErrorMessage(uploadError.message);

      setLoading(false);

      return;
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        type: "photo",
        title: null,
        content: cleanDescription || null,
        content_json: null,
        media_path: storagePath,
      })
      .select("id")
      .single();

    if (postError || !post) {
      await supabase.storage.from("post-media").remove([storagePath]);

      setErrorMessage(postError?.message ?? "Could not create photo post.");

      setLoading(false);

      return;
    }

    const parsedHashtags = hashtags
      .split(/[\s,]+/)
      .map((tag) => tag.trim().replace(/^#/, "").toLowerCase())
      .filter(Boolean)
      .filter((tag) => /^[a-z0-9_]{1,30}$/.test(tag));

    const uniqueHashtags = [...new Set(parsedHashtags)].slice(0, 10);

    if (uniqueHashtags.length > 0) {
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
        const { error: postHashtagError } = await supabase
          .from("post_hashtags")
          .insert(
            hashtagIds.map((hashtagId) => ({
              post_id: post.id,
              hashtag_id: hashtagId,
            })),
          );

        if (postHashtagError) {
          console.error("Photo hashtag insert error:", postHashtagError);
        }
      }
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    router.push(`/photos/${post.id}`);

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label className="mb-2 block font-medium">Photo</label>

        {!previewUrl ? (
          <label className="theme-surface theme-border flex min-h-65 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition hover:opacity-80">
            <ImagePlus size={42} className="theme-accent" />

            <p className="mt-4 font-medium">Choose a photo</p>

            <p className="theme-text-secondary mt-1 text-sm">
              JPG, PNG or WebP • Max 8 MB
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={previewUrl}
              alt="Photo preview"
              width={1200}
              height={900}
              unoptimized
              className="max-h-150 w-full rounded-2xl object-contain"
            />

            <button
              type="button"
              onClick={removePhoto}
              title="Remove photo"
              className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block font-medium">
          Description
        </label>

        <textarea
          id="description"
          value={description}
          maxLength={2000}
          rows={5}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Say something about this photo..."
          className="theme-bg theme-text theme-border w-full resize-none rounded-xl border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-1 text-right text-xs">
          {description.length}/2000
        </p>
      </div>

      <div>
        <label htmlFor="hashtags" className="mb-2 block font-medium">
          Hashtags
        </label>

        <input
          id="hashtags"
          value={hashtags}
          onChange={(event) => setHashtags(event.target.value)}
          placeholder="#photography #nature #nelo"
          className="theme-bg theme-text theme-border w-full rounded-xl border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-2 text-sm">Up to 10 hashtags.</p>
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/photos"
          className="theme-text theme-border rounded-lg border px-5 py-3 text-sm font-medium transition hover:opacity-70"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="theme-accent-bg inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload size={18} />

          {loading ? "Uploading..." : "Publish Photo"}
        </button>
      </div>
    </form>
  );
}
