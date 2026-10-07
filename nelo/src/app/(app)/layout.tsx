import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

import AppShell from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  /*
   * Suspended/banned accounts should
   * not enter the protected app.
   *
   * /suspended must live OUTSIDE
   * the (app) route group.
   */
  if (
    profile.account_status === "suspended" ||
    profile.account_status === "banned"
  ) {
    redirect("/suspended");
  }

  /*
   * First-time users still need
   * to choose their username.
   */
  if (profile.username.startsWith("user_")) {
    redirect("/complete-profile");
  }

  return (
    <AppShell
      userId={profile.id}
      username={profile.username}
      avatarId={profile.avatar_id}
      isAdmin={profile.role === "admin"}
    >
      {children}
    </AppShell>
  );
}
