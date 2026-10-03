import Link from "next/link";

import {
  Search,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { getBlockedUserIds } from "@/lib/blocks";

import UserListCard from "@/components/profile/user-list-card";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params =
    await searchParams;

  const query =
    params.q?.trim() ??
    "";

  const currentProfile =
    await getCurrentProfile();

  if (!currentProfile) {
    return null;
  }

  const supabase =
    await createClient();

  const blockedUserIds =
    await getBlockedUserIds(
      currentProfile.id,
    );

  let users:
    | {
        id: string;
        username: string;
        avatar_id: number;
        bio: string | null;
      }[]
    = [];

  if (query.length >= 2) {
    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        avatar_id,
        bio
      `)
      .ilike(
        "username",
        `%${query}%`,
      )
      .neq(
        "id",
        currentProfile.id,
      )
      .limit(20);

    if (error) {
      console.error(
        "User search error:",
        error,
      );
    }

    users =
      data?.filter(
        (user) =>
          !blockedUserIds.includes(
            user.id,
          ),
      ) ?? [];
  }

  return (
    <section className="mx-auto max-w-2xl">

      <h1 className="text-3xl font-bold">
        Search Users
      </h1>

      <p className="theme-text-secondary mt-2">
        Find people on NELO.
      </p>

      <form
        action="/search"
        className="mt-6 flex gap-2"
      >
        <div className="relative flex-1">

          <Search
            size={18}
            className="theme-text-secondary absolute left-3 top-1/2 -translate-y-1/2"
          />

          <input
            type="search"
            name="q"
            defaultValue={query}
            minLength={2}
            placeholder="Search username..."
            className="theme-bg theme-text theme-border w-full rounded-xl border py-3 pl-10 pr-4 outline-none"
          />

        </div>

        <button
          type="submit"
          className="theme-accent-bg rounded-xl px-5 py-3 font-medium text-white"
        >
          Search
        </button>
      </form>

      {query.length > 0 &&
      query.length < 2 && (
        <p className="theme-text-secondary mt-5 text-sm">
          Enter at least 2 characters.
        </p>
      )}

      {query.length >= 2 &&
      users.length === 0 && (
        <div className="theme-surface theme-border mt-8 rounded-xl border p-8 text-center">
          No users found.
        </div>
      )}

      {users.length > 0 && (
        <div className="mt-8 space-y-3">

          {users.map(
            (user) => (
              <UserListCard
                key={user.id}
                profile={user}
              />
            ),
          )}

        </div>
      )}

      {!query && (
        <div className="theme-surface theme-border mt-8 rounded-xl border p-8 text-center">

          <p className="theme-text-secondary">
            Search by username to find someone to follow.
          </p>

          <Link
            href="/blogs"
            className="theme-accent mt-3 inline-block text-sm"
          >
            Return to Blogs
          </Link>

        </div>
      )}

    </section>
  );
}