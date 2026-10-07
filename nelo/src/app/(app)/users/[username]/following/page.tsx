import {
  notFound,
} from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import UserListCard from "@/components/profile/user-list-card";

type FollowingPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function FollowingPage({
  params,
}: FollowingPageProps) {
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
      following:profiles!follows_following_id_fkey (
        username,
        avatar_id,
        bio
      )
    `)
    .eq(
      "follower_id",
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
      "Following error:",
      error
    );
  }

  return (
    <section className="mx-auto max-w-2xl">

      <h1 className="text-3xl font-bold">
        Following
      </h1>

      <p className="theme-text-secondary mt-2">
        People @{username} follows.
      </p>

      {!follows ||
      follows.length === 0 ? (
        <div className="theme-surface theme-border mt-8 rounded-xl border p-8 text-center">
          Not following anyone yet.
        </div>
      ) : (
        <div className="mt-8 space-y-3">

          {follows.map(
            (
              relation,
              index
            ) => {
              const following =
                Array.isArray(
                  relation.following
                )
                  ? relation
                      .following[0]
                  : relation.following;

              if (!following) {
                return null;
              }

              return (
                <UserListCard
                  key={`${following.username}-${index}`}
                  profile={
                    following
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