"use client";

import {
  useState,
} from "react";

import {
  UserPlus,
  UserCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { useCurrentUser } from "@/components/auth/current-user-provider";

type FollowButtonProps = {
  targetUserId: string;
  initialFollowing: boolean;
};

export default function FollowButton({
  targetUserId,
  initialFollowing,
}: FollowButtonProps) {
  const { userId } =
    useCurrentUser();

  const [
    following,
    setFollowing,
  ] = useState(
    initialFollowing
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function toggleFollow() {
    if (
      loading ||
      userId === targetUserId
    ) {
      return;
    }

    setLoading(true);

    const supabase =
      createClient();

    const nextFollowing =
      !following;

    setFollowing(
      nextFollowing
    );

    let error = null;

    if (nextFollowing) {
      const result =
        await supabase
          .from("follows")
          .insert({
            follower_id:
              userId,

            following_id:
              targetUserId,
          });

      error =
        result.error;
    } else {
      const result =
        await supabase
          .from("follows")
          .delete()
          .eq(
            "follower_id",
            userId
          )
          .eq(
            "following_id",
            targetUserId
          );

      error =
        result.error;
    }

    if (error) {
      setFollowing(
        !nextFollowing
      );

      console.error(
        "Follow error:",
        error
      );
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={
        toggleFollow
      }
      className={
        following
          ? "theme-border theme-surface theme-text inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
          : "theme-accent-bg inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      }
    >
      {following ? (
        <>
          <UserCheck
            size={17}
          />

          Following
        </>
      ) : (
        <>
          <UserPlus
            size={17}
          />

          Follow
        </>
      )}
    </button>
  );
}