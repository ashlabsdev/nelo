"use client";

import {
  useState,
} from "react";

import {
  MessageCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";

type MessageButtonProps = {
  targetUserId: string;
};

export default function MessageButton({
  targetUserId,
}: MessageButtonProps) {
  const router =
    useRouter();

  const {
    showToast,
  } = useToast();

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function openChat() {
    if (loading) {
      return;
    }

    setLoading(true);

    const supabase =
      createClient();

    const {
      data,
      error,
    } = await supabase.rpc(
      "get_or_create_direct_conversation",
      {
        target_user_id:
          targetUserId,
      },
    );

    if (
      error ||
      !data
    ) {
      /*
       * Do not expose internal
       * Supabase errors to users.
       */
      if (
        error?.message
          ?.toLowerCase()
          .includes(
            "messaging unavailable",
          )
      ) {
        showToast(
          "Messaging is unavailable because one of you has blocked the other.",
          "info",
        );
      } else {
        showToast(
          "We couldn't open this conversation. Please try again.",
          "error",
        );
      }

      setLoading(false);

      return;
    }

    router.push(
      `/chat/${data}`,
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={openChat}
      className="theme-border theme-surface inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
    >
      <MessageCircle
        size={17}
      />

      {loading
        ? "Opening..."
        : "Message"}
    </button>
  );
}