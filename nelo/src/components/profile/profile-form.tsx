"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AVATARS } from "@/lib/avatars";

type ProfileFormProps = {
  userId: string;
  initialUsername: string;
  initialAvatarId: number;

  initialBio?: string | null;
  initialWebsiteUrl?: string | null;
  initialLink2?: string | null;
  initialLink3?: string | null;

  isFirstSetup?: boolean;
};

export default function ProfileForm({
  userId,
  initialUsername,
  initialAvatarId,
  initialBio = "",
  initialWebsiteUrl = "",
  initialLink2 = "",
  initialLink3 = "",
  isFirstSetup = false,
}: ProfileFormProps) {
  const [bio, setBio] =
  useState(initialBio ?? "");

const [websiteUrl, setWebsiteUrl] =
  useState(initialWebsiteUrl ?? "");

const [link2, setLink2] =
  useState(initialLink2 ?? "");

const [link3, setLink3] =
  useState(initialLink3 ?? "");

  const [username, setUsername] =
    useState(initialUsername.startsWith("user_") ? "" : initialUsername);
  const router = useRouter();
  const [avatarId, setAvatarId] =
    useState(initialAvatarId);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    const cleanUsername = username
      .trim()
      .toLowerCase();

    const usernameRegex = /^[a-z0-9_]{3,20}$/;

    if (!usernameRegex.test(cleanUsername)) {
      setErrorMessage(
        "Username must be 3–20 characters and contain only letters, numbers, or underscores."
      );

      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        username: cleanUsername,
        avatar_id: avatarId,

        bio: bio.trim() || null,

        website_url:
          websiteUrl.trim() || null,

        link_2:
          link2.trim() || null,

        link_3:
          link3.trim() || null,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      if (
        error.code === "23505" ||
        error.message
          .toLowerCase()
          .includes("duplicate")
      ) {
        setErrorMessage(
          "That username is already taken."
        );
      } else {
        setErrorMessage(error.message);
      }

      setLoading(false);
      return;
    }

    if (isFirstSetup) {
      router.push("/home");
      return;
    }

    setMessage("Profile updated successfully.");
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 max-w-xl"
    >
      <div>
        <label
          htmlFor="username"
          className="mb-2 block font-medium"
        >
          Username
        </label>

        <input
          id="username"
          type="text"
          value={username}
          maxLength={20}
          required
          onChange={(event) =>
            setUsername(event.target.value)
          }
          placeholder="Choose a username"
          className="theme-bg theme-text theme-border w-full rounded-lg border px-4 py-3 outline-none"
        />

        <p className="mt-2 text-sm theme-text-secondary">
          3–20 characters. Letters, numbers and
          underscores only.
        </p>
      </div>

      <div className="mt-6">
        <label
          htmlFor="bio"
          className="mb-2 block font-medium"
        >
          Bio
        </label>

        <textarea
          id="bio"
          value={bio}
          maxLength={300}
          rows={4}
          onChange={(event) =>
            setBio(event.target.value)
          }
          placeholder="Tell people a little about yourself..."
          className="theme-bg theme-text theme-border w-full resize-none rounded-lg border px-4 py-3 outline-none"
        />

        <p className="theme-text-secondary mt-1 text-sm">
          {bio.length}/300
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">
          Links
        </h2>

        <p className="theme-text-secondary mt-1 text-sm">
          Add websites or social links you want
          visitors to see.
        </p>

        <div className="mt-4 space-y-3">

          <input
            type="url"
            value={websiteUrl}
            onChange={(event) =>
              setWebsiteUrl(event.target.value)
            }
            placeholder="https://yourwebsite.com"
            className="theme-bg theme-text theme-border w-full rounded-lg border px-4 py-3 outline-none"
          />

          <input
            type="url"
            value={link2}
            onChange={(event) =>
              setLink2(event.target.value)
            }
            placeholder="https://github.com/..."
            className="theme-bg theme-text theme-border w-full rounded-lg border px-4 py-3 outline-none"
          />

          <input
            type="url"
            value={link3}
            onChange={(event) =>
              setLink3(event.target.value)
            }
            placeholder="https://linkedin.com/..."
            className="theme-bg theme-text theme-border w-full rounded-lg border px-4 py-3 outline-none"
          />

        </div>
      </div>

      <div className="mt-8">
        <p className="font-medium">
          Choose your avatar
        </p>

        <div className="mt-4 grid grid-cols-5 gap-4">
          {AVATARS.map((avatar) => {
            const selected =
              avatar.id === avatarId;

            return (
              <button
                type="button"
                key={avatar.id}
                onClick={() => setAvatarId(avatar.id)}
                aria-label={`Select ${avatar.name}`}
                className="rounded-full bg-transparent p-1 transition hover:scale-105"
                style={{
                  boxShadow: selected
                    ? "0 0 0 4px var(--accent)"
                    : "none",
                }}
              >
                <Image
                  src={avatar.src}
                  alt={avatar.name}
                  width={80}
                  height={80}
                  className="aspect-square rounded-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <p className="mt-6 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {message && (
        <p className="mt-6 text-sm text-green-600">
          {message}
        </p>
      )}

      <button
        disabled={loading}
        className="theme-accent-bg mt-8 rounded-lg px-6 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : isFirstSetup
            ? "Complete Profile"
            : "Save Changes"}
      </button>
    </form>
  );
}