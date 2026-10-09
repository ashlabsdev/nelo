"use client";

import Image from "next/image";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { Send, Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { useCurrentUser } from "@/components/auth/current-user-provider";

import { getAvatarSrc } from "@/lib/avatars";

type CommentProfile = {
  username: string;
  avatar_id: number;
};

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;

  profiles: CommentProfile | CommentProfile[] | null;
};

type CommentsPanelProps = {
  postId: string;

  onCountChange: (amount: number) => void;
};

export default function CommentsPanel({
  postId,
  onCountChange,
}: CommentsPanelProps) {
  const { userId } = useCurrentUser();

  const [comments, setComments] = useState<Comment[]>([]);

  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const loadComments = useCallback(async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
            id,
            user_id,
            content,
            created_at,

            profiles!comments_user_id_fkey (
              username,
              avatar_id
            )
          `,
      )
      .eq("post_id", postId)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("Comment load error:", error);

      setErrorMessage("Could not load comments.");

      setLoading(false);

      return;
    }

    setComments((data ?? []) as Comment[]);

    setLoading(false);
  }, [postId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadComments();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadComments]);

  async function addComment(event: FormEvent) {
    event.preventDefault();

    const cleanContent = content.trim();

    if (!cleanContent) {
      return;
    }

    if (cleanContent.length > 2000) {
      setErrorMessage("Comment cannot exceed 2,000 characters.");

      return;
    }

    setSubmitting(true);

    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.from("comments").insert({
      user_id: userId,

      post_id: postId,

      content: cleanContent,
    });

    if (error) {
      setErrorMessage(error.message);

      setSubmitting(false);

      return;
    }

    setContent("");

    onCountChange(1);

    await loadComments();

    setSubmitting(false);
  }

  async function deleteComment(commentId: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) {
      console.error("Delete comment error:", error);

      return;
    }

    setComments((current) =>
      current.filter((comment) => comment.id !== commentId),
    );

    onCountChange(-1);
  }

  return (
    <div className="theme-border mt-4 border-t pt-4">
      {/* Add comment */}

      <form onSubmit={addComment} className="flex gap-2">
        <input
          type="text"
          value={content}
          maxLength={2000}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a comment..."
          className="theme-bg theme-text theme-border min-w-0 flex-1 rounded-lg border px-3 py-2 outline-none"
        />

        <button
          type="submit"
          disabled={submitting || !content.trim()}
          title="Post comment"
          className="theme-accent-bg rounded-lg px-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>

      {/* Error */}

      {errorMessage && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}

      {/* Comments */}

      {loading ? (
        <p className="theme-text-secondary mt-5 text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="theme-text-secondary mt-5 text-sm">No comments yet.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {comments.map((comment) => {
            const profile = Array.isArray(comment.profiles)
              ? comment.profiles[0]
              : comment.profiles;

            if (!profile) {
              return null;
            }

            return (
              <div key={comment.id} className="flex items-start gap-3">
                <Image
                  src={getAvatarSrc(profile.avatar_id)}
                  alt={`${profile.username} avatar`}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />

                <div className="theme-surface flex-1 rounded-xl px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {profile.username}
                      </p>

                      <p className="theme-text-secondary mt-1 wrap-break-word whitespace-pre-line text-sm">
                        {comment.content}
                      </p>
                    </div>

                    {comment.user_id === userId && (
                      <button
                        type="button"
                        title="Delete comment"
                        onClick={() => deleteComment(comment.id)}
                        className="theme-text-secondary shrink-0 transition hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
