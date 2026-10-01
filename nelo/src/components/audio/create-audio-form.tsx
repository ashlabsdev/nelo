"use client";

import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AudioLines,
  Upload,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type CreateAudioFormProps = {
  userId: string;
};

const MAX_AUDIO_SIZE =
  20 * 1024 * 1024;

const allowedAudioTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/ogg",
];

export default function CreateAudioForm({
  userId,
}: CreateAudioFormProps) {
  const router = useRouter();

  const [file, setFile] =
    useState<File | null>(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<string | null>(null);

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [hashtags, setHashtags] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setErrorMessage("");

    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (
      !allowedAudioTypes.includes(
        selectedFile.type
      )
    ) {
      setErrorMessage(
        "Only MP3, WAV, M4A and OGG audio files are allowed."
      );

      event.target.value = "";

      return;
    }

    if (
      selectedFile.size >
      MAX_AUDIO_SIZE
    ) {
      setErrorMessage(
        "Audio file must be 20 MB or smaller."
      );

      event.target.value = "";

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    const objectUrl =
      URL.createObjectURL(
        selectedFile
      );

    setFile(selectedFile);

    setPreviewUrl(
      objectUrl
    );
  }

  function removeAudio() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setFile(null);

    setPreviewUrl(null);
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!file) {
      setErrorMessage(
        "Please select an audio file."
      );

      return;
    }

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

    const cleanDescription =
      description.trim();

    if (
      cleanDescription.length >
      2000
    ) {
      setErrorMessage(
        "Description cannot exceed 2,000 characters."
      );

      return;
    }

    setLoading(true);

    const supabase =
      createClient();

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() ??
      "mp3";

    const fileName =
      `${crypto.randomUUID()}.${extension}`;

    const storagePath =
      `audio/${userId}/${fileName}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("post-media")
      .upload(
        storagePath,
        file,
        {
          cacheControl:
            "3600",

          upsert: false,

          contentType:
            file.type,
        }
      );

    if (uploadError) {
      setErrorMessage(
        uploadError.message
      );

      setLoading(false);

      return;
    }

    const {
      data: post,
      error: postError,
    } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        type: "audio",
        title: cleanTitle,
        content:
          cleanDescription ||
          null,
        content_json: null,
        media_path:
          storagePath,
      })
      .select("id")
      .single();

    if (
      postError ||
      !post
    ) {
      await supabase.storage
        .from("post-media")
        .remove([
          storagePath,
        ]);

      setErrorMessage(
        postError?.message ??
          "Could not create audio post."
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

    if (
      uniqueHashtags.length >
      0
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
        hashtagIds.length >
        0
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
            "Audio hashtag insert error:",
            postHashtagError
          );
        }
      }
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    router.push(
      `/audio/${post.id}`
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
    >
      <div>
        <label className="mb-2 block font-medium">
          Audio
        </label>

        {!previewUrl ? (
          <label className="theme-surface theme-border flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition hover:opacity-80">

            <AudioLines
              size={42}
              className="theme-accent"
            />

            <p className="mt-4 font-medium">
              Choose an audio file
            </p>

            <p className="theme-text-secondary mt-1 text-sm">
              MP3, WAV, M4A or OGG
              • Max 20 MB
            </p>

            <input
              type="file"
              accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/ogg"
              onChange={
                handleFileChange
              }
              className="hidden"
            />
          </label>
        ) : (
          <div className="theme-surface theme-border rounded-2xl border p-5">

            <div className="flex items-center justify-between gap-4">

              <div className="min-w-0">
                <p className="truncate font-medium">
                  {file?.name}
                </p>

                <p className="theme-text-secondary mt-1 text-xs">
                  {file
                    ? (
                        file.size /
                        1024 /
                        1024
                      ).toFixed(
                        2
                      )
                    : "0"}
                  {" MB"}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  removeAudio
                }
                title="Remove audio"
                className="rounded-full bg-black/70 p-2 text-white"
              >
                <X size={18} />
              </button>

            </div>

            <audio
              controls
              src={
                previewUrl
              }
              className="mt-5 w-full"
            />

          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="audio-title"
          className="mb-2 block font-medium"
        >
          Title
        </label>

        <input
          id="audio-title"
          type="text"
          value={title}
          maxLength={150}
          required
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          placeholder="Give your audio a title"
          className="theme-bg theme-text theme-border w-full rounded-xl border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-1 text-right text-xs">
          {title.length}/150
        </p>
      </div>

      <div>
        <label
          htmlFor="audio-description"
          className="mb-2 block font-medium"
        >
          Description
        </label>

        <textarea
          id="audio-description"
          value={description}
          maxLength={2000}
          rows={5}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          placeholder="Tell people about this audio..."
          className="theme-bg theme-text theme-border w-full resize-none rounded-xl border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-1 text-right text-xs">
          {description.length}/2000
        </p>
      </div>

      <div>
        <label
          htmlFor="audio-hashtags"
          className="mb-2 block font-medium"
        >
          Hashtags
        </label>

        <input
          id="audio-hashtags"
          type="text"
          value={hashtags}
          onChange={(event) =>
            setHashtags(
              event.target.value
            )
          }
          placeholder="#music #podcast #nelo"
          className="theme-bg theme-text theme-border w-full rounded-xl border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-2 text-sm">
          Up to 10 hashtags.
        </p>
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="theme-accent-bg inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload size={18} />

          {loading
            ? "Uploading..."
            : "Publish Audio"}
        </button>
      </div>
    </form>
  );
}