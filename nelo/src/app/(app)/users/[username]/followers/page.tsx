import {
  notFound,
} from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import UserListCard from "@/components/profile/user-list-card";

type FollowersPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function FollowersPage({
  params,
}: FollowersPageProps) {
  const {
    username,
  } = await params;

  const supabase =
    await createClient();

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(
      "id, username"
    )
    .eq(
      "username",
      username
    )
    .single();

  if (!profile) {
    notFound();
  }

  const {
    data: follows,
    error,
  } = await supabase
    .from("follows")
    .select(`
      follower:profiles!follows_follower_id_fkey (
        username,
        avatar_id,
        bio
      )
    `)
    .eq(
      "following_id",
      profile.id
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    console.error(
      "Followers error:",
      error
    );
  }

  return (
    <section className="mx-auto max-w-2xl">

      <h1 className="text-3xl font-bold">
        Followers
      </h1>

      <p className="theme-text-secondary mt-2">
        People following @{username}.
      </p>

      {!follows ||
      follows.length === 0 ? (
        <div className="theme-surface theme-border mt-8 rounded-xl border p-8 text-center">
          No followers yet.
        </div>
      ) : (
        <div className="mt-8 space-y-3">

          {follows.map(
            (
              relation,
              index
            ) => {
              const follower =
                Array.isArray(
                  relation.follower
                )
                  ? relation
                      .follower[0]
                  : relation.follower;

              if (!follower) {
                return null;
              }

              return (
                <UserListCard
                  key={`${follower.username}-${index}`}
                  profile={
                    follower
                  }
                />
              );
            }
          )}

        </div>
      )}

    </section>
  );
}