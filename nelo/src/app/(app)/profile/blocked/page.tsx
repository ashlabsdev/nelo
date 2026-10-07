import { getCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

import BlockedUsers from "@/components/profile/blocked-users";

export default async function BlockedPage() {
  const profile =
    await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const supabase =
    await createClient();

  const {
    data: blockedRows,
    error,
  } = await supabase
    .from("blocks")
    .select(`
      blocked:profiles!blocks_blocked_id_fkey (
        id,
        username
      )
    `)
    .eq(
      "blocker_id",
      profile.id,
    );

  if (error) {
    console.error(
      "Blocked users error:",
      error,
    );
  }

  const blockedUsers =
    blockedRows?.flatMap(
      (row) => {
        const blocked =
          row.blocked;

        if (
          Array.isArray(
            blocked,
          )
        ) {
          return blocked;
        }

        return blocked
          ? [blocked]
          : [];
      },
    ) ?? [];

  return (
    <section>

      <h1 className="text-3xl font-bold">
        Blocked Users
      </h1>

      <p className="theme-text-secondary mt-2">
        Manage users you have blocked.
      </p>

      <div className="theme-surface theme-border mt-8 rounded-2xl border p-5 sm:p-6">
        <BlockedUsers
          users={blockedUsers}
        />
      </div>

    </section>
  );
}