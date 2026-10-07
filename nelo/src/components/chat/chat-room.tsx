"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { Send } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type ChatMessage = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type ChatRoomProps = {
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
};

export default function ChatRoom({
  conversationId,
  currentUserId,
  initialMessages,
}: ChatRoomProps) {
  const [messages, setMessages] = useState(initialMessages);

  const [content, setContent] = useState("");

  const [sending, setSending] = useState(false);

  const markConversationRead = useCallback(async () => {
    const supabase = createClient();

    const { error } = await supabase
      .from("conversation_members")
      .update({
        last_read_at: new Date().toISOString(),
      })
      .eq("conversation_id", conversationId)
      .eq("user_id", currentUserId);

    if (error) {
      console.error("Mark read error:", error);
    }
  }, [conversationId, currentUserId]);

  /*
   * Mark conversation read
   * when room opens.
   */
  useEffect(() => {
    void markConversationRead();
  }, [markConversationRead]);

  /*
   * Realtime messages.
   */
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const message = payload.new as ChatMessage;

          setMessages((current) => {
            if (current.some((item) => item.id === message.id)) {
              return current;
            }

            return [...current, message];
          });

          /*
           * If we're already
           * inside this chat,
           * receiving the message
           * counts as reading it.
           */
          if (message.sender_id !== currentUserId) {
            void markConversationRead();
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, markConversationRead]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const cleanContent = content.trim();

    if (!cleanContent || sending) {
      return;
    }

    setSending(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,

        sender_id: currentUserId,

        content: cleanContent,
      })
      .select(
        `
        id,
        sender_id,
        content,
        created_at
      `,
      )
      .single();

    if (error) {
      console.error("Message send error:", error);

      setSending(false);

      return;
    }

    /*
     * We add it locally immediately.
     * Realtime may also deliver it,
     * but duplicate protection handles that.
     */
    if (data) {
      setMessages((current) => {
        if (current.some((message) => message.id === data.id)) {
          return current;
        }

        return [...current, data];
      });
    }

    setContent("");

    setSending(false);
  }

  return (
    <div className="theme-surface theme-border overflow-hidden rounded-2xl border">
      {/* Messages */}

      <div className="max-h-[65vh] min-h-100 space-y-3 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          <p className="theme-text-secondary text-center text-sm">
            No messages yet.
          </p>
        ) : (
          messages.map((message) => {
            const mine = message.sender_id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    mine
                      ? "theme-accent-bg text-white"
                      : "theme-bg theme-border border"
                  }`}
                >
                  <p className="wrap-break-word whitespace-pre-line text-sm">
                    {message.content}
                  </p>

                  <p
                    className={`mt-1 text-[10px] ${
                      mine ? "text-white/70" : "theme-text-secondary"
                    }`}
                  >
                    {new Intl.DateTimeFormat("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(message.created_at))}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message input */}

      <form
        onSubmit={sendMessage}
        className="theme-border flex gap-2 border-t p-3 sm:p-4"
      >
        <input
          type="text"
          value={content}
          maxLength={2000}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a message..."
          className="theme-bg theme-text theme-border min-w-0 flex-1 rounded-xl border px-4 py-3 outline-none"
        />

        <button
          type="submit"
          disabled={sending || !content.trim()}
          title="Send message"
          className="theme-accent-bg rounded-xl px-4 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
