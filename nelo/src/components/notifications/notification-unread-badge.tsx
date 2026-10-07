"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type NotificationUnreadBadgeProps = {
  userId: string;
};

export default function NotificationUnreadBadge({
  userId,
}: NotificationUnreadBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  /*
   * Desktop and mobile badges are
   * both mounted simultaneously.
   *
   * Unique ID prevents duplicate
   * Supabase channel names.
   */
  const reactId = useId();

  const channelInstanceId = reactId.replace(/:/g, "");

  const loadUnreadCount = useCallback(async () => {
    const supabase = createClient();

    const { count, error } = await supabase
      .from("notifications")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Notification count error:", error);

      return;
    }

    setUnreadCount(count ?? 0);
  }, [userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUnreadCount();
    }, 0);

    const supabase = createClient();

    const channel = supabase.channel(
      `notifications-${userId}-${channelInstanceId}`,
    );

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        void loadUnreadCount();
      },
    );

    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        void loadUnreadCount();
      },
    );

    channel.on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        void loadUnreadCount();
      },
    );

    channel.subscribe();

    return () => {
      window.clearTimeout(timer);

      void supabase.removeChannel(channel);
    };
  }, [userId, channelInstanceId, loadUnreadCount]);

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="theme-accent-bg inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
