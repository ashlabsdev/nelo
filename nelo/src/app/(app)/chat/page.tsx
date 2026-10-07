import Image from "next/image";
import Link from "next/link";

import {
  MessageCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { getAvatarSrc } from "@/lib/avatars";

export default async function ChatPage() {
  const profile =
    await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const supabase =
    await createClient();

  const {
    data: memberships,
    error,
  } = await supabase
    .from(
      "conversation_members",
    )
    .select(
      "conversation_id",
    )
    .eq(
      "user_id",
      profile.id,
    )
    .order(
      "joined_at",
      {
        ascending: false,
      },
    );

  if (error) {
    console.error(
      "Conversation list error:",
      error,
    );
  }

  const conversations =
    await Promise.all(
      (
        memberships ??
        []
      ).map(
        async (
          membership,
        ) => {
          const {
            data:
              otherMembers,
          } = await supabase
            .from(
              "conversation_members",
            )
            .select(`
              user_id,

              profiles!conversation_members_user_id_fkey (
                username,
                avatar_id
              )
            `)
            .eq(
              "conversation_id",
              membership.conversation_id,
            )
            .neq(
              "user_id",
              profile.id,
            );

          const other =
            otherMembers?.[0];

          if (!other) {
            return null;
          }

          const otherProfile =
            Array.isArray(
              other.profiles,
            )
              ? other
                  .profiles[0]
              : other.profiles;

          if (!otherProfile) {
            return null;
          }

          const {
            data:
              latestMessages,
          } = await supabase
            .from("messages")
            .select(`
              content,
              created_at
            `)
            .eq(
              "conversation_id",
              membership.conversation_id,
            )
            .order(
              "created_at",
              {
                ascending:
                  false,
              },
            )
            .limit(1);

          return {
            id:
              membership.conversation_id,

            profile:
              otherProfile,

            latest:
              latestMessages?.[0] ??
              null,
          };
        },
      ),
    );

  const validConversations =
    conversations.filter(
      (
        conversation,
      ): conversation is NonNullable<
        typeof conversation
      > =>
        Boolean(
          conversation,
        ),
    );

  return (
    <section className="mx-auto max-w-3xl">

      <div className="flex items-center gap-3">

        <MessageCircle
          className="theme-accent"
        />

        <div>
          <h1 className="text-3xl font-bold">
            Chat
          </h1>

          <p className="theme-text-secondary mt-1">
            Your private NELO conversations.
          </p>
        </div>

      </div>

      {validConversations.length ===
      0 ? (
        <div className="theme-surface theme-border mt-8 rounded-2xl border p-10 text-center">

          <p className="font-medium">
            No conversations yet
          </p>

          <p className="theme-text-secondary mt-2 text-sm">
            Search for a user and start a conversation from their profile.
          </p>

          <Link
            href="/search"
            className="theme-accent mt-4 inline-block text-sm font-medium"
          >
            Search Users
          </Link>

        </div>
      ) : (
        <div className="mt-8 space-y-3">

          {validConversations.map(
            (
              conversation,
            ) => (
              <Link
                key={
                  conversation.id
                }
                href={`/chat/${conversation.id}`}
                className="theme-surface theme-border flex items-center gap-4 rounded-xl border p-4 transition hover:opacity-80"
              >
                <Image
                  src={getAvatarSrc(
                    conversation
                      .profile
                      .avatar_id,
                  )}
                  alt={`${conversation.profile.username} avatar`}
                  width={52}
                  height={52}
                  className="h-13 w-13 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">

                  <p className="font-semibold">
                    {
                      conversation
                        .profile
                        .username
                    }
                  </p>

                  <p className="theme-text-secondary mt-1 truncate text-sm">
                    {conversation
                      .latest
                      ?.content ??
                      "Start a conversation"}
                  </p>

                </div>

              </Link>
            ),
          )}

        </div>
      )}

    </section>
  );
}