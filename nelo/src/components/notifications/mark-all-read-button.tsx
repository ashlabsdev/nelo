"use client";

import { useState } from "react";

import { CheckCheck } from "lucide-react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type MarkAllReadButtonProps = {
  userId: string;
};

export default function MarkAllReadButton({ userId }: MarkAllReadButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function markAllRead() {
    if (loading) {
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Mark notifications error:", error);

      setLoading(false);

      return;
    }

    router.refresh();

    setLoading(false);
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={markAllRead}
      className="theme-border theme-surface inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
    >
      <CheckCheck size={17} />

      {loading ? "Updating..." : "Mark all read"}
    </button>
  );
}
