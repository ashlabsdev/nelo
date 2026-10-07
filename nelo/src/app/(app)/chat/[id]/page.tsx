import Image from "next/image";

import {
  notFound,
} from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { getAvatarSrc } from "@/lib/avatars";

import ChatRoom from "@/components/chat/chat-room";

type ChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChatPage({
  params,
}: ChatPageProps) {
  const { id } =
    await params;

  const profile =
    await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const supabase =
    await createClient();

  const {
    data: members,
    error:
      memberError,
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
      id,
    );

  if (
    memberError ||
    !members
  ) {
    notFound();
  }

  const myMembership =
    members.find(
      (member) =>
        member.user_id ===
        profile.id,
    );

  if (!myMembership) {
    notFound();
  }

  const otherMembership =
    members.find(
      (member) =>
        member.user_id !==
        profile.id,
    );

  if (!otherMembership) {
    notFound();
  }

  const otherProfile =
    Array.isArray(
      otherMembership.profiles,
    )
      ? otherMembership
          .profiles[0]
      : otherMembership.profiles;

  if (!otherProfile) {
    notFound();
  }

  const {
    data: messages,
    error:
      messagesError,
  } = await supabase
    .from("messages")
    .select(`
      id,
      sender_id,
      content,
      created_at
    `)
    .eq(
      "conversation_id",
      id,
    )
    .order(
      "created_at",
      {
        ascending: true,
      },
    )
    .limit(100);

  if (messagesError) {
    console.error(
      "Messages error:",
      messagesError,
    );
  }

  return (
    <section className="mx-auto max-w-3xl">

      <div className="mb-5 flex items-center gap-3">

        <Image
          src={getAvatarSrc(
            otherProfile.avatar_id,
          )}
          alt={`${otherProfile.username} avatar`}
          width={46}
          height={46}
          className="h-11 w-11 rounded-full object-cover"
        />

        <div>
          <h1 className="text-xl font-semibold">
            {
              otherProfile.username
            }
          </h1>

          <p className="theme-text-secondary text-xs">
            Direct message
          </p>
        </div>

      </div>

      <ChatRoom
        conversationId={id}
        currentUserId={
          profile.id
        }
        initialMessages={
          messages ?? []
        }
      />

    </section>
  );
}