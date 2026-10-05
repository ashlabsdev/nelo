"use client";

import { useEffect, useRef, useState } from "react";

import { Ellipsis, Pencil, Trash2, X } from "lucide-react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

import { useCurrentUser } from "@/components/auth/current-user-provider";
import { useToast } from "@/components/ui/toast-provider";

type PostType = "blog" | "photo" | "audio";

type PostManageMenuProps = {
  postId: string;
  postType: PostType;
  ownerUserId: string;

  /*
   * Needed only for Photo/Audio.
   */
  mediaPath?: string | null;
};

export default function PostManageMenu({
  postId,
  postType,
  ownerUserId,
  mediaPath,
}: PostManageMenuProps) {
  const { userId } = useCurrentUser();

  const router = useRouter();

  const { showToast } = useToast();

  const menuRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const isOwner = userId === ownerUserId;

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setDeleteOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!isOwner) {
    return null;
  }

  function getEditPath() {
    switch (postType) {
      case "blog":
        return `/blogs/${postId}/edit`;

      case "photo":
        return `/photos/${postId}/edit`;

      case "audio":
        return `/audio/${postId}/edit`;
    }
  }

  function getFeedPath() {
    switch (postType) {
      case "blog":
        return "/blogs";

      case "photo":
        return "/photos";

      case "audio":
        return "/audio";
    }
  }

  async function deletePost() {
    if (deleting) {
      return;
    }

    setDeleting(true);

    const supabase = createClient();

    /*
     * Delete DB record first.
     *
     * If Storage cleanup fails afterwards,
     * the user-facing post is still safely
     * removed. We may only have an orphaned
     * storage file rather than a broken post.
     */
    const { error: postDeleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", userId);

    if (postDeleteError) {
      showToast("We couldn't delete this post. Please try again.", "error");

      setDeleting(false);

      return;
    }

    /*
     * Photo and Audio storage cleanup.
     */
    if (mediaPath && (postType === "photo" || postType === "audio")) {
      const { error: storageError } = await supabase.storage
        .from("post-media")
        .remove([mediaPath]);

      if (storageError) {
        console.error("Storage cleanup error:", storageError);
      }
    }

    showToast("Post deleted successfully.", "success");

    setDeleteOpen(false);
    setMenuOpen(false);

    router.push(getFeedPath());

    router.refresh();
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Manage post"
          title="Manage post"
          className="theme-text-secondary theme-border theme-surface flex h-9 w-9 items-center justify-center rounded-full border transition hover:opacity-70"
        >
          <Ellipsis size={19} />
        </button>

        {menuOpen && (
          <div className="theme-bg theme-border absolute right-0 top-full z-40 mt-2 w-40 rounded-xl border p-2 shadow-xl">
            <Link
              href={getEditPath()}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:opacity-70"
            >
              <Pencil size={16} />
              Edit
            </Link>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);

                setDeleteOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-500/10"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation */}

      {deleteOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 p-4">
          <div className="theme-bg theme-border w-full max-w-md rounded-2xl border p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Delete this post?</h2>

                <p className="theme-text-secondary mt-2 text-sm leading-6">
                  This action cannot be undone. Likes, comments, boosts,
                  favorites and related notifications will also be removed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                aria-label="Close"
                className="theme-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
                className="theme-border rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={deletePost}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
