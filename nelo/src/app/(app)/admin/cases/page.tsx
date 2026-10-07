import { ShieldAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function ModerationCasesPage() {
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("moderation_cases")
    .select(
      `
      id,
      violation_number,
      status,
      deadline_at,
      resolved_at,
      auto_removed_at,
      created_at,

      user:profiles!moderation_cases_user_id_fkey (
        username,
        warning_count,
        account_status
      )
    `,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  return (
    <section>
      <div className="flex items-center gap-3">
        <ShieldAlert size={26} className="theme-accent" />

        <div>
          <h1 className="text-3xl font-bold">Moderation Cases</h1>

          <p className="theme-text-secondary mt-1">
            Enforcement history and active deadlines.
          </p>
        </div>
      </div>

      {!cases || cases.length === 0 ? (
        <div className="theme-surface theme-border mt-8 rounded-2xl border p-10 text-center">
          No moderation cases.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {cases.map((item) => {
            const user = Array.isArray(item.user) ? item.user[0] : item.user;

            return (
              <article
                key={item.id}
                className="theme-surface theme-border rounded-2xl border p-5"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {user ? `@${user.username}` : "Unknown user"}
                    </p>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Violation #{item.violation_number}
                    </p>
                  </div>

                  <span className="theme-bg theme-border rounded-full border px-3 py-1 text-xs font-medium capitalize">
                    {item.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="theme-text-secondary mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    Deadline:{" "}
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(item.deadline_at))}
                  </p>

                  {user && <p>Warnings: {user.warning_count}</p>}

                  {user && <p>Account: {user.account_status}</p>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
