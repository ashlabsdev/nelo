"use client";

import { useState } from "react";

import { CheckCircle2, ShieldAlert } from "lucide-react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import { useToast } from "@/components/ui/toast-provider";

type ReportReviewActionsProps = {
  reportId: string;
};

export default function ReportReviewActions({
  reportId,
}: ReportReviewActionsProps) {
  const router = useRouter();

  const { showToast } = useToast();

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState<"dismiss" | "violation" | null>(null);

  async function review(decision: "dismissed" | "violation") {
    if (loading) {
      return;
    }

    setLoading(decision === "dismissed" ? "dismiss" : "violation");

    const supabase = createClient();

    const { error } = await supabase.rpc("review_report", {
      target_report_id: reportId,

      target_decision: decision,

      target_notes: notes.trim() || null,
    });

    if (error) {
      showToast("We couldn't update this report.", "error");

      setLoading(null);

      return;
    }

    if (decision === "dismissed") {
      showToast("Report dismissed.", "success");
    } else {
      showToast(
        "Violation confirmed. Enforcement will be created in the next moderation step.",
        "success",
      );
    }

    router.refresh();

    setLoading(null);
  }

  return (
    <div className="mt-6">
      <label
        htmlFor={`notes-${reportId}`}
        className="mb-2 block text-sm font-medium"
      >
        Internal admin notes
      </label>

      <textarea
        id={`notes-${reportId}`}
        value={notes}
        maxLength={2000}
        rows={3}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Optional notes about your decision..."
        className="theme-bg theme-text theme-border w-full resize-none rounded-xl border px-4 py-3 outline-none"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void review("dismissed")}
          className="theme-border theme-surface inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          <CheckCircle2 size={17} />

          {loading === "dismiss" ? "Dismissing..." : "Dismiss Report"}
        </button>

        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void review("violation")}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <ShieldAlert size={17} />

          {loading === "violation" ? "Confirming..." : "Confirm Violation"}
        </button>
      </div>
    </div>
  );
}
