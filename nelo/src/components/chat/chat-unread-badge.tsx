"use client";

import {
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type ChatUnreadBadgeProps = {
  userId: string;
};

export default function ChatUnreadBadge({
  userId,
}: ChatUnreadBadgeProps) {
  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  /*
   * Desktop and mobile navbars are both
   * mounted even when one is hidden.
   *
   * Give each badge its own unique
   * Supabase Realtime channel.
   */
  const reactId =
    useId();

  const channelInstanceId =
    reactId.replace(
      /:/g,
      "",
    );

  const loadUnreadCount =
    useCallback(
      async () => {
        const supabase =
          createClient();

        const {
          data:
            memberships,
          error:
            membershipsError,
        } = await supabase
          .from(
            "conversation_members",
          )
          .select(`
            conversation_id,
            last_read_at
          `)
          .eq(
            "user_id",
            userId,
          );

        if (
          membershipsError
        ) {
          console.error(
            "Unread memberships error:",
            membershipsError,
          );

          return;
        }

        if (
          !memberships ||
          memberships.length ===
            0
        ) {
          setUnreadCount(
            0,
          );

          return;
        }

        let totalUnread =
          0;

        for (
          const membership
          of memberships
        ) {
          const {
            count,
            error,
          } = await supabase
            .from(
              "messages",
            )
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq(
              "conversation_id",
              membership
                .conversation_id,
            )
            .neq(
              "sender_id",
              userId,
            )
            .gt(
              "created_at",
              membership
                .last_read_at,
            );

          if (error) {
            console.error(
              "Unread message count error:",
              error,
            );

            continue;
          }

          totalUnread +=
            count ?? 0;
        }

        setUnreadCount(
          totalUnread,
        );
      },
      [userId],
    );

  useEffect(() => {
    /*
     * Initial unread count.
     *
     * Keeping this asynchronous avoids
     * the set-state-in-effect lint issue
     * we encountered elsewhere.
     */
    const timer =
      window.setTimeout(
        () => {
          void loadUnreadCount();
        },
        0,
      );

    const supabase =
      createClient();

    /*
     * IMPORTANT:
     * This channel name must be unique
     * because desktop + mobile badges
     * can exist simultaneously.
     */
    const channel =
      supabase
        .channel(
          `chat-unread-${userId}-${channelInstanceId}`,
        )
        .on(
          "postgres_changes",
          {
            event:
              "INSERT",
            schema:
              "public",
            table:
              "messages",
          },
          () => {
            void loadUnreadCount();
          },
        )
        .subscribe();

    return () => {
      window.clearTimeout(
        timer,
      );

      void supabase.removeChannel(
        channel,
      );
    };
  }, [
    userId,
    channelInstanceId,
    loadUnreadCount,
  ]);

  if (
    unreadCount === 0
  ) {
    return null;
  }

  return (
    <span className="theme-accent-bg inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white">
      {unreadCount > 99
        ? "99+"
        : unreadCount}
    </span>
  );
}