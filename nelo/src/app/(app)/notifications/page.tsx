import { Bell } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

import NotificationItem from "@/components/notifications/notification-item";

import MarkAllReadButton from "@/components/notifications/mark-all-read-button";

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const supabase = await createClient();

  const { data: notificationRows, error } = await supabase
    .from("notifications")
    .select(
      `
      id,
      type,
      is_read,
      created_at,
      data,

      actor:profiles!notifications_actor_id_fkey (
        username,
        avatar_id
      ),

      post:posts!notifications_post_id_fkey (
        id,
        type,
        title
      )
    `,
    )
    .eq("user_id", profile.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(50);

  if (error) {
    console.error("Notifications error:", error);
  }

  const notifications =
    notificationRows?.map((row) => {
      const actor = Array.isArray(row.actor) ? row.actor[0] : row.actor;

      const post = Array.isArray(row.post) ? row.post[0] : row.post;

      return {
        id: row.id,
        data: row.data,
        type: row.type,

        isRead: row.is_read,

        createdAt: row.created_at,

        actor: actor
          ? {
              username: actor.username,

              avatarId: actor.avatar_id,
            }
          : null,

        post: post
          ? {
              id: post.id,

              type: post.type,

              title: post.title,
            }
          : null,
      };
    }) ?? [];

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <section className="mx-auto max-w-3xl">
      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell size={28} className="theme-accent" />

          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>
        </div>

        {unreadCount > 0 && <MarkAllReadButton userId={profile.id} />}
      </div>

      {/* Unread count */}

      {unreadCount > 0 && (
        <p className="theme-text-secondary mt-5 text-sm">
          You have <span className="font-semibold">{unreadCount}</span> unread{" "}
          {unreadCount === 1 ? "notification" : "notifications"}.
        </p>
      )}

      {/* List */}

      {notifications.length === 0 ? (
        <div className="theme-surface theme-border mt-8 rounded-2xl border p-10 text-center">
          <Bell size={34} className="theme-text-secondary mx-auto" />

          <h2 className="mt-4 text-lg font-semibold">No notifications yet</h2>

          <p className="theme-text-secondary mt-2 text-sm">
            Likes, comments, boosts and follows will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </section>
  );
}
