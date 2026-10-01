import Link from "next/link";

import {
  Plus,
} from "lucide-react";

export default function PhotosPage() {
  return (
    <section className="mx-auto max-w-4xl">

      <div className="flex items-start justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Photos
          </h1>

          <p className="theme-text-secondary mt-2">
            Photos shared by the NELO community.
          </p>
        </div>

        <Link
          href="/create/photo"
          className="theme-accent-bg flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          <Plus size={17} />

          <span className="hidden sm:inline">
            Add Photo
          </span>
        </Link>

      </div>

      <div className="theme-surface theme-border mt-8 rounded-2xl border p-8 text-center">

        <p className="theme-text-secondary">
          Photo feed arrives on Day 11.
        </p>

      </div>

    </section>
  );
}