"use client";

import { FormEvent, useState } from "react";

import { Flag, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { useCurrentUser } from "@/components/auth/current-user-provider";
import { useToast } from "@/components/ui/toast-provider";

type ReportPostButtonProps = {
  postId: string;
  ownerUserId: string;
};

const reasons = [
  {
    value: "spam",
    label: "Spam",
  },
  {
    value: "harassment",
    label: "Harassment or bullying",
  },
  {
    value: "hate",
    label: "Hate or abusive content",
  },
  {
    value: "sexual",
    label: "Sexual or inappropriate content",
  },
  {
    value: "violence",
    label: "Violence or dangerous content",
  },
  {
    value: "misleading",
    label: "Misleading content",
  },
  {
    value: "other",
    label: "Other",
  },
];

export default function ReportPostButton({
  postId,
  ownerUserId,
}: ReportPostButtonProps) {
  const { userId } = useCurrentUser();

  const { showToast } = useToast();

  const [open, setOpen] = useState(false);

  const [reason, setReason] = useState("");

  const [details, setDetails] = useState("");

  const [submitting, setSubmitting] = useState(false);

  if (!userId || userId === ownerUserId) {
    return null;
  }

  async function submitReport(event: FormEvent) {
    event.preventDefault();

    if (!reason) {
      showToast("Please choose a reason for your report.", "info");

      return;
    }

    setSubmitting(true);

    const supabase = createClient();

    const combinedReason = details.trim()
      ? `${reason}: ${details.trim()}`
      : reason;

    const { error } = await supabase.from("reports").insert({
      reporter_id: userId,

      post_id: postId,

      reason: combinedReason,

      status: "pending",
    });

    if (error) {
      if (error.code === "23505") {
        showToast("You have already reported this post.", "info");
      } else {
        showToast("We couldn't submit your report. Please try again.", "error");
      }

      setSubmitting(false);

      return;
    }

    showToast(
      "Report submitted. Our moderation team will review it.",
      "success",
    );

    setReason("");
    setDetails("");
    setOpen(false);
    setSubmitting(false);
  }

  return (
    <>
      <button
        type="button"
        title="Report post"
        onClick={() => setOpen(true)}
        className="theme-text-secondary inline-flex items-center gap-2 text-sm transition hover:text-red-500"
      >
        <Flag size={16} />
        Report
      </button>

      {open && (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={submitReport}
            className="theme-bg theme-border w-full max-w-lg rounded-2xl border p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Report this post</h2>

                <p className="theme-text-secondary mt-2 text-sm leading-6">
                  Reports are confidential. The person who posted this content
                  will not be told who reported them.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close report"
                className="theme-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6">
              <label htmlFor="report-reason" className="mb-2 block font-medium">
                Reason
              </label>

              <select
                id="report-reason"
                required
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="theme-bg theme-text theme-border w-full rounded-xl border px-4 py-3 outline-none"
              >
                <option value="">Select a reason</option>

                {reasons.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <label
                htmlFor="report-details"
                className="mb-2 block font-medium"
              >
                Additional details
              </label>

              <textarea
                id="report-details"
                value={details}
                maxLength={1000}
                rows={4}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Tell the moderation team anything else that may help..."
                className="theme-bg theme-text theme-border w-full resize-none rounded-xl border px-4 py-3 outline-none"
              />

              <p className="theme-text-secondary mt-1 text-right text-xs">
                {details.length}
                /1000
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setOpen(false)}
                className="theme-border rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
