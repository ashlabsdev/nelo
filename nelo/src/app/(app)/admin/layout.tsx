import { ReactNode } from "react";

import { notFound } from "next/navigation";

import { ShieldCheck } from "lucide-react";

import { getCurrentAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="theme-surface theme-border mb-8 flex items-center gap-3 rounded-2xl border p-5">
        <div className="theme-accent-bg flex h-11 w-11 items-center justify-center rounded-xl text-white">
          <ShieldCheck size={21} />
        </div>

        <div>
          <p className="font-semibold">NELO Admin</p>

          <p className="theme-text-secondary text-sm">
            Signed in as @{admin.username}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}
