"use client";

import {
  useRouter,
} from "next/navigation";

import {
  UserRoundX,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type BlockedUser = {
  id: string;
  username: string;
};

type BlockedUsersProps = {
  users: BlockedUser[];
};

export default function BlockedUsers({
  users,
}: BlockedUsersProps) {
  const router =
    useRouter();

  async function unblock(
    userId: string
  ) {
    const supabase =
      createClient();

    const {
      error,
    } = await supabase.rpc(
      "unblock_user",
      {
        target_user_id:
          userId,
      }
    );

    if (error) {
      console.error(
        "Unblock error:",
        error
      );

      return;
    }

    router.refresh();
  }

  return (
    <div>

      {users.length === 0 ? (
        <p className="theme-text-secondary text-sm">
          You have not blocked anyone.
        </p>
      ) : (
        <div className="space-y-3">

          {users.map(
            (user) => (
              <div
                key={
                  user.id
                }
                className="theme-surface theme-border flex items-center justify-between rounded-xl border p-4"
              >
                <div className="flex items-center gap-2">

                  <UserRoundX
                    size={18}
                    className="theme-text-secondary"
                  />

                  <span className="font-medium">
                    {
                      user.username
                    }
                  </span>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    unblock(
                      user.id
                    )
                  }
                  className="theme-accent text-sm font-medium"
                >
                  Unblock
                </button>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}