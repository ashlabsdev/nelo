"use client";

import {
  useState,
} from "react";

import {
  Ban,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type BlockButtonProps = {
  targetUserId: string;
};

export default function BlockButton({
  targetUserId,
}: BlockButtonProps) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function blockUser() {
    const confirmed =
      window.confirm(
        "Block this user? You will both be unfollowed and they will no longer be able to interact with you."
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const supabase =
      createClient();

    const {
      error,
    } = await supabase.rpc(
      "block_user",
      {
        target_user_id:
          targetUserId,
      }
    );

    if (error) {
      console.error(
        "Block error:",
        error
      );

      setLoading(false);

      return;
    }

    router.push(
      "/blogs"
    );

    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={
        blockUser
      }
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      <Ban size={17} />

      {loading
        ? "Blocking..."
        : "Block"}
    </button>
  );
}