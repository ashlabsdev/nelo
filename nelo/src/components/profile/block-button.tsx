"use client";

import { useState } from "react";

import { Ban, X } from "lucide-react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";

type BlockButtonProps = {
  targetUserId: string;
  username?: string;
};

export default function BlockButton({
  targetUserId,
  username,
}: BlockButtonProps) {
  const router = useRouter();

  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  async function blockUser() {
    if (loading) {
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.rpc("block_user", {
      target_user_id: targetUserId,
    });

    if (error) {
      showToast("We couldn't block this user. Please try again.", "error");

      setLoading(false);

      return;
    }

    showToast(
      username
        ? `@${username} has been blocked.`
        : "User blocked successfully.",
      "success",
    );

    setShowConfirm(false);

    router.push("/blogs");

    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 transition hover:opacity-80"
      >
        <Ban size={17} />
        Block
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/50 p-4">
          <div className="theme-bg theme-border w-full max-w-md rounded-2xl border p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Block user?</h2>

                <p className="theme-text-secondary mt-2 text-sm leading-6">
                  {username
                    ? `@${username} will no longer be able to follow, message, or normally interact with you.`
                    : "This user will no longer be able to follow, message, or normally interact with you."}
                </p>

                <p className="theme-text-secondary mt-2 text-sm">
                  Any existing follow relationship between you will also be
                  removed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="theme-text-secondary"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="theme-border rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={blockUser}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {loading ? "Blocking..." : "Block User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
