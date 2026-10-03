import {
  createClient,
} from "@/lib/supabase/server";

export async function getBlockedUserIds(
  userId: string
) {
  const supabase =
    await createClient();

  const [
    blockedByMe,
    blockedMe,
  ] = await Promise.all([

    supabase
      .from("blocks")
      .select(
        "blocked_id"
      )
      .eq(
        "blocker_id",
        userId
      ),

    supabase
      .from("blocks")
      .select(
        "blocker_id"
      )
      .eq(
        "blocked_id",
        userId
      ),
  ]);

  const ids = [
    ...(
      blockedByMe.data?.map(
        (row) =>
          row.blocked_id
      ) ?? []
    ),

    ...(
      blockedMe.data?.map(
        (row) =>
          row.blocker_id
      ) ?? []
    ),
  ];

  return [
    ...new Set(ids),
  ];
}