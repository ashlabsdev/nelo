"use client";

import {
  useState,
} from "react";

import {
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  Check,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { useCurrentUser } from "@/components/auth/current-user-provider";

import CommentsPanel from "@/components/post/comments-panel";

type PostType =
  | "blog"
  | "photo"
  | "audio";

type PostActionsProps = {
  postId: string;

  postType: PostType;

  likeUserIds: string[];

  commentCount: number;

  boostUserIds: string[];
};

export default function PostActions({
  postId,
  postType,
  likeUserIds,
  commentCount:
    initialCommentCount,
  boostUserIds,
}: PostActionsProps) {
  const { userId } =
    useCurrentUser();

  const initialLiked =
    likeUserIds.includes(
      userId
    );

  const initialBoosted =
    boostUserIds.includes(
      userId
    );

  const initialLikeCount =
    likeUserIds.length;

  const initialBoostCount =
    boostUserIds.length;

  const [
    liked,
    setLiked,
  ] = useState(
    initialLiked
  );

  const [
    likeCount,
    setLikeCount,
  ] = useState(
    initialLikeCount
  );

  const [
    boosted,
    setBoosted,
  ] = useState(
    initialBoosted
  );

  const [
    boostCount,
    setBoostCount,
  ] = useState(
    initialBoostCount
  );

  const [
    commentCount,
    setCommentCount,
  ] = useState(
    initialCommentCount
  );

  const [
    showComments,
    setShowComments,
  ] = useState(false);

  const [
    likeLoading,
    setLikeLoading,
  ] = useState(false);

  const [
    boostLoading,
    setBoostLoading,
  ] = useState(false);

  const [
    copied,
    setCopied,
  ] = useState(false);

  async function toggleLike() {
    if (likeLoading) {
      return;
    }

    setLikeLoading(true);

    const supabase =
      createClient();

    const nextLiked =
      !liked;

    /*
     * Optimistic UI
     */
    setLiked(
      nextLiked
    );

    setLikeCount(
      (
        current: number
      ) =>
        Math.max(
          0,
          current +
            (nextLiked
              ? 1
              : -1)
        )
    );

    let error = null;

    if (nextLiked) {
      const result =
        await supabase
          .from("likes")
          .insert({
            user_id:
              userId,

            post_id:
              postId,
          });

      error =
        result.error;
    } else {
      const result =
        await supabase
          .from("likes")
          .delete()
          .eq(
            "user_id",
            userId
          )
          .eq(
            "post_id",
            postId
          );

      error =
        result.error;
    }

    if (error) {
      /*
       * Roll back optimistic UI
       */
      setLiked(
        !nextLiked
      );

      setLikeCount(
        (
          current: number
        ) =>
          Math.max(
            0,
            current +
              (nextLiked
                ? -1
                : 1)
          )
      );

      console.error(
        "Like error:",
        error
      );
    }

    setLikeLoading(
      false
    );
  }

  async function toggleBoost() {
    if (boostLoading) {
      return;
    }

    setBoostLoading(true);

    const supabase =
      createClient();

    const nextBoosted =
      !boosted;

    /*
     * Optimistic UI
     */
    setBoosted(
      nextBoosted
    );

    setBoostCount(
      (
        current: number
      ) =>
        Math.max(
          0,
          current +
            (nextBoosted
              ? 1
              : -1)
        )
    );

    let error = null;

    if (nextBoosted) {
      const result =
        await supabase
          .from("boosts")
          .insert({
            user_id:
              userId,

            post_id:
              postId,
          });

      error =
        result.error;
    } else {
      const result =
        await supabase
          .from("boosts")
          .delete()
          .eq(
            "user_id",
            userId
          )
          .eq(
            "post_id",
            postId
          );

      error =
        result.error;
    }

    if (error) {
      /*
       * Roll back optimistic UI
       */
      setBoosted(
        !nextBoosted
      );

      setBoostCount(
        (
          current: number
        ) =>
          Math.max(
            0,
            current +
              (nextBoosted
                ? -1
                : 1)
          )
      );

      console.error(
        "Boost error:",
        error
      );
    }

    setBoostLoading(
      false
    );
  }

  function getPostPath() {
    switch (postType) {
      case "blog":
        return `/blogs/${postId}`;

      case "photo":
        return `/photos/${postId}`;

      case "audio":
        return `/audio/${postId}`;
    }
  }

  async function sharePost() {
    const postPath =
      getPostPath();

    const url =
      `${window.location.origin}${postPath}`;

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title: "NELO",
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(
        url
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(
            false
          );
        },
        2000
      );
    } catch (error) {
      /*
       * Cancelling a native
       * share sheet is normal.
       */
      console.log(
        "Share cancelled:",
        error
      );
    }
  }

  const normalButton =
    "theme-text-secondary flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div>
      {/* Actions */}

      <div className="theme-border flex flex-wrap items-center gap-2 border-t pt-4">

        {/* Like */}

        <button
          type="button"
          disabled={
            likeLoading
          }
          onClick={
            toggleLike
          }
          className={`${normalButton} ${
            liked
              ? "theme-accent"
              : ""
          }`}
          title={
            liked
              ? "Unlike"
              : "Like"
          }
        >
          <Heart
            size={19}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />

          <span>
            {likeCount}
          </span>
        </button>

        {/* Comments */}

        <button
          type="button"
          onClick={() =>
            setShowComments(
              (
                current
              ) =>
                !current
            )
          }
          className={normalButton}
          title="Comments"
        >
          <MessageCircle
            size={19}
          />

          <span>
            {commentCount}
          </span>
        </button>

        {/* Boost */}

        <button
          type="button"
          disabled={
            boostLoading
          }
          onClick={
            toggleBoost
          }
          className={`${normalButton} ${
            boosted
              ? "theme-accent"
              : ""
          }`}
          title={
            boosted
              ? "Remove boost"
              : "Boost"
          }
        >
          <Repeat2
            size={20}
          />

          <span>
            {boostCount}
          </span>
        </button>

        {/* Share */}

        <button
          type="button"
          onClick={
            sharePost
          }
          className={`${normalButton} ml-auto`}
          title="Share"
        >
          {copied ? (
            <Check
              size={19}
            />
          ) : (
            <Share2
              size={19}
            />
          )}

          <span className="hidden sm:inline">
            {copied
              ? "Copied"
              : "Share"}
          </span>
        </button>

      </div>

      {/* Comments */}

      {showComments && (
        <CommentsPanel
          postId={postId}
          onCountChange={(
            amount
          ) =>
            setCommentCount(
              (
                current: number
              ) =>
                Math.max(
                  0,
                  current +
                    amount
                )
            )
          }
        />
      )}
    </div>
  );
}