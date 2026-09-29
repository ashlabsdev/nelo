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
  isFirstSetup?: boolean;
};

export default function ProfileForm({
  userId,
  initialUsername,
  initialAvatarId,
  isFirstSetup = false,
}: ProfileFormProps) {
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
        updated_at: new Date().toISOString(),
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
                onClick={() =>
                  setAvatarId(avatar.id)
                }
                className={`rounded-full border-4 p-1 transition ${
                  selected
                    ? "var(--accent)"
                    : "transparent"
                }`}
              >
                <Image
                  src={avatar.src}
                  alt={avatar.name}
                  width={80}
                  height={80}
                  loading="eager"
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