import Link from "next/link";

import { Flag, Clock3, ShieldAlert, CheckCircle2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const [pendingResult, reviewedResult, dismissedResult] = await Promise.all([
    supabase
      .from("reports")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending"),

    supabase
      .from("reports")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "reviewed"),

    supabase
      .from("reports")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "dismissed"),
  ]);

  const pending = pendingResult.count ?? 0;

  const reviewed = reviewedResult.count ?? 0;

  const dismissed = dismissedResult.count ?? 0;

  return (
    <section>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <p className="theme-text-secondary mt-2">
        Review reports and moderate NELO content.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/reports?status=pending"
          className="theme-surface theme-border rounded-2xl border p-5"
        >
          <Clock3 size={22} className="theme-accent" />

          <p className="mt-4 text-3xl font-bold">{pending}</p>

          <p className="theme-text-secondary mt-1 text-sm">Pending reports</p>
        </Link>

        <Link
          href="/admin/reports?status=reviewed"
          className="theme-surface theme-border rounded-2xl border p-5"
        >
          <ShieldAlert size={22} className="theme-accent" />

          <p className="mt-4 text-3xl font-bold">{reviewed}</p>

          <p className="theme-text-secondary mt-1 text-sm">
            Confirmed violations
          </p>
        </Link>

        <Link
          href="/admin/reports?status=dismissed"
          className="theme-surface theme-border rounded-2xl border p-5"
        >
          <CheckCircle2 size={22} className="theme-accent" />

          <p className="mt-4 text-3xl font-bold">{dismissed}</p>

          <p className="theme-text-secondary mt-1 text-sm">Dismissed reports</p>
        </Link>
      </div>

      <Link
        href="/admin/reports"
        className="theme-accent-bg mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white"
      >
        <Flag size={17} />
        Open Moderation Queue
      </Link>
    </section>
  );
}
