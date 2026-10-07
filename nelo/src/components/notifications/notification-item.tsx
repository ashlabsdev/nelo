"use client";

import Image from "next/image";

import { useRouter } from "next/navigation";

import {
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  Bell,
  ShieldAlert,
  Clock3,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { getAvatarSrc } from "@/lib/avatars";

type NotificationItemProps = {
  notification: {
    id: string;

    type: string;

    isRead: boolean;

    createdAt: string;

    actor: {
      username: string;
      avatarId: number;
    } | null;
    data?: {
      deadline?: string;
      violation_number?: number;
    };
    post: {
      id: string;
      type: string | null;
      title: string | null;
    } | null;
  };
};

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const router = useRouter();

  function renderTypeIcon() {
    switch (notification.type) {
      case "moderation_violation":
        return (
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-red-500" />
        );

      case "post_removed":
        return <Clock3 size={16} className="mt-0.5 shrink-0 text-red-500" />;
      case "like":
        return <Heart size={16} className="theme-accent mt-0.5 shrink-0" />;

      case "comment":
        return (
          <MessageCircle size={16} className="theme-accent mt-0.5 shrink-0" />
        );

      case "boost":
        return <Repeat2 size={16} className="theme-accent mt-0.5 shrink-0" />;

      case "follow":
        return <UserPlus size={16} className="theme-accent mt-0.5 shrink-0" />;

      default:
        return <Bell size={16} className="theme-accent mt-0.5 shrink-0" />;
    }
  }

  function getMessage() {
    const username = notification.actor?.username;

    switch (notification.type) {
      case "moderation_violation":
        return "A post you published was found to violate NELO rules. You have 24 hours to delete it.";

      case "post_removed":
        return "Your post was automatically removed because the moderation deadline expired.";
      case "follow":
        return username
          ? `@${username} started following you.`
          : "Someone started following you.";

      case "like":
        return username
          ? `@${username} liked your post.`
          : "Someone liked your post.";

      case "comment":
        return username
          ? `@${username} commented on your post.`
          : "Someone commented on your post.";

      case "boost":
        return username
          ? `@${username} boosted your post.`
          : "Someone boosted your post.";

      default:
        return "You have a new NELO notification.";
    }
  }

  function getTarget() {
    if (notification.type === "follow" && notification.actor) {
      return `/users/${notification.actor.username}`;
    }

    if (notification.post) {
      switch (notification.post.type) {
        case "blog":
          return `/blogs/${notification.post.id}`;

        case "photo":
          return `/photos/${notification.post.id}`;

        case "audio":
          return `/audio/${notification.post.id}`;
      }
    }

    return "/notifications";
  }

  async function openNotification() {
    if (!notification.isRead) {
      const supabase = createClient();

      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq("id", notification.id);

      if (error) {
        console.error("Notification read error:", error);
      }
    }

    router.push(getTarget());
  }

  const createdDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(notification.createdAt));

  return (
    <button
      type="button"
      onClick={openNotification}
      className={`theme-border flex w-full items-start gap-4 rounded-xl border p-4 text-left transition hover:opacity-80 ${
        notification.isRead
          ? "theme-surface"
          : "theme-surface ring-1 ring-(--accent)"
      }`}
    >
      {/* Actor avatar */}

      {notification.actor ? (
        <Image
          src={getAvatarSrc(notification.actor.avatarId)}
          alt={`${notification.actor.username} avatar`}
          width={46}
          height={46}
          className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="theme-accent-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white">
          <Bell size={18} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {renderTypeIcon()}

          <p className="text-sm leading-6">{getMessage()}</p>
        </div>

        {notification.type === "moderation_violation" &&
          notification.data?.deadline && (
            <p className="mt-2 text-xs font-medium text-red-500">
              Delete deadline:{" "}
              {new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(notification.data.deadline))}
            </p>
          )}
        {notification.post?.title && (
          <p className="theme-text-secondary mt-1 truncate text-xs">
            {notification.post.title}
          </p>
        )}

        <p className="theme-text-secondary mt-2 text-xs">{createdDate}</p>
      </div>

      {!notification.isRead && (
        <span className="theme-accent-bg mt-2 h-2.5 w-2.5 shrink-0 rounded-full" />
      )}
    </button>
  );
}
