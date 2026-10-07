import Link from "next/link";

import { Flag, UserRound, FileText } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import ReportReviewActions from "@/components/admin/report-review-actions";

type ReportsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;

  const allowedStatuses = ["pending", "reviewed", "dismissed", "actioned"];

  const status =
    params.status && allowedStatuses.includes(params.status)
      ? params.status
      : null;

  const supabase = await createClient();

  let query = supabase
    .from("reports")
    .select(
      `
        id,
        reason,
        status,
        decision,
        admin_notes,
        created_at,
        reviewed_at,

        reporter:profiles!reports_reporter_id_fkey (
          id,
          username,
          avatar_id
        ),

        post:posts!reports_post_id_fkey (
          id,
          user_id,
          type,
          title,
          content,
          status,

          owner:profiles!posts_user_id_fkey (
            id,
            username,
            avatar_id
          )
        )
      `,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  if (status) {
    query = query.eq("status", status);
  }

  const { data: reports, error } = await query;

  if (error) {
    console.error("Admin reports error:", error);
  }

  return (
    <section>
      <div>
        <h1 className="text-3xl font-bold">Moderation Queue</h1>

        <p className="theme-text-secondary mt-2">
          Review user-submitted reports.
        </p>
      </div>

      {/* Filters */}

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["All", "/admin/reports"],
          ["Pending", "/admin/reports?status=pending"],
          ["Violations", "/admin/reports?status=reviewed"],
          ["Dismissed", "/admin/reports?status=dismissed"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="theme-surface theme-border rounded-lg border px-4 py-2 text-sm"
          >
            {label}
          </Link>
        ))}
      </div>

      {!reports || reports.length === 0 ? (
        <div className="theme-surface theme-border mt-8 rounded-2xl border p-10 text-center">
          <Flag size={32} className="theme-text-secondary mx-auto" />

          <p className="mt-4 font-medium">No reports found.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {reports.map((report) => {
            const reporter = Array.isArray(report.reporter)
              ? report.reporter[0]
              : report.reporter;

            const post = Array.isArray(report.post)
              ? report.post[0]
              : report.post;

            const owner = post
              ? Array.isArray(post.owner)
                ? post.owner[0]
                : post.owner
              : null;

            return (
              <article
                key={report.id}
                className="theme-surface theme-border rounded-2xl border p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Flag size={17} className="text-red-500" />

                      <p className="font-semibold">Report</p>
                    </div>

                    <p className="theme-text-secondary mt-1 text-xs">
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(report.created_at))}
                    </p>
                  </div>

                  <span className="theme-bg theme-border rounded-full border px-3 py-1 text-xs font-medium capitalize">
                    {report.status}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {/* Reporter */}

                  <div className="theme-bg theme-border rounded-xl border p-4">
                    <div className="flex items-center gap-2">
                      <UserRound size={17} className="theme-accent" />

                      <p className="text-sm font-semibold">Reporter</p>
                    </div>

                    <p className="mt-2">
                      {reporter ? `@${reporter.username}` : "Unknown user"}
                    </p>
                  </div>

                  {/* Reported user */}

                  <div className="theme-bg theme-border rounded-xl border p-4">
                    <div className="flex items-center gap-2">
                      <UserRound size={17} className="theme-accent" />

                      <p className="text-sm font-semibold">Reported user</p>
                    </div>

                    <p className="mt-2">
                      {owner ? `@${owner.username}` : "Unknown user"}
                    </p>
                  </div>
                </div>

                {/* Reason */}

                <div className="mt-5">
                  <p className="text-sm font-semibold">Reason</p>

                  <p className="theme-text-secondary mt-2 whitespace-pre-line text-sm">
                    {report.reason}
                  </p>
                </div>

                {/* Content */}

                {post && (
                  <div className="theme-bg theme-border mt-5 rounded-xl border p-4">
                    <div className="flex items-center gap-2">
                      <FileText size={17} className="theme-accent" />

                      <p className="text-sm font-semibold capitalize">
                        {post.type}
                      </p>
                    </div>

                    {post.title && (
                      <p className="mt-3 font-medium">{post.title}</p>
                    )}

                    {post.content && (
                      <p className="theme-text-secondary mt-2 line-clamp-4 whitespace-pre-line text-sm">
                        {post.content}
                      </p>
                    )}

                    <Link
                      href={
                        post.type === "blog"
                          ? `/blogs/${post.id}`
                          : post.type === "photo"
                            ? `/photos/${post.id}`
                            : `/audio/${post.id}`
                      }
                      className="theme-accent mt-3 inline-block text-sm font-medium"
                    >
                      View reported post
                    </Link>
                  </div>
                )}

                {/* Pending action */}

                {report.status === "pending" && (
                  <ReportReviewActions reportId={report.id} />
                )}

                {/* Completed review */}

                {report.status !== "pending" && (
                  <div className="theme-border mt-5 border-t pt-5">
                    <p className="text-sm">
                      Decision:{" "}
                      <span className="font-semibold capitalize">
                        {report.decision ?? report.status}
                      </span>
                    </p>

                    {report.admin_notes && (
                      <p className="theme-text-secondary mt-2 text-sm">
                        {report.admin_notes}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
