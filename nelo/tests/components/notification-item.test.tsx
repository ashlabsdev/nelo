// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import NotificationItem from "@/components/notifications/notification-item";

/*
 * Mock Next.js router.
 */
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

/*
 * Avoid Next/Image behavior inside jsdom.
 */
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

/*
 * Avatar helper.
 */
vi.mock("@/lib/avatars", () => ({
  getAvatarSrc: (avatarId: number) => `/avatars/avatar-${avatarId}.png`,
}));

/*
 * Supabase is not needed for these
 * rendering-only tests, but the component
 * imports it.
 */
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(),
  }),
}));

describe("NotificationItem", () => {
  it("renders a like notification", () => {
    render(
      <NotificationItem
        notification={{
          id: "notification-1",

          type: "like",

          isRead: false,

          createdAt: "2026-10-09T08:00:00.000Z",

          actor: {
            username: "testuser",

            avatarId: 1,
          },

          post: {
            id: "post-1",

            type: "blog",

            title: "Testing NELO",
          },
        }}
      />,
    );

    expect(screen.getByText("@testuser liked your post.")).toBeInTheDocument();

    expect(screen.getByText("Testing NELO")).toBeInTheDocument();

    expect(screen.getByAltText("testuser avatar")).toBeInTheDocument();
  });

  it("renders a follow notification", () => {
    render(
      <NotificationItem
        notification={{
          id: "notification-2",

          type: "follow",

          isRead: true,

          createdAt: "2026-10-09T08:00:00.000Z",

          actor: {
            username: "newfollower",

            avatarId: 2,
          },

          post: null,
        }}
      />,
    );

    expect(
      screen.getByText("@newfollower started following you."),
    ).toBeInTheDocument();
  });

  it("renders a comment notification", () => {
    render(
      <NotificationItem
        notification={{
          id: "notification-3",

          type: "comment",

          isRead: false,

          createdAt: "2026-10-09T08:00:00.000Z",

          actor: {
            username: "commenter",

            avatarId: 3,
          },

          post: {
            id: "post-2",

            type: "photo",

            title: null,
          },
        }}
      />,
    );

    expect(
      screen.getByText("@commenter commented on your post."),
    ).toBeInTheDocument();
  });

  it("uses a generic message when actor is missing", () => {
    render(
      <NotificationItem
        notification={{
          id: "notification-4",

          type: "like",

          isRead: false,

          createdAt: "2026-10-09T08:00:00.000Z",

          actor: null,

          post: {
            id: "post-3",

            type: "audio",

            title: "Test Audio",
          },
        }}
      />,
    );

    expect(screen.getByText("Someone liked your post.")).toBeInTheDocument();
  });
});
