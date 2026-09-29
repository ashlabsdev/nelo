"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/auth/login");
  }

  return (
    <button
      onClick={logout}
      className="theme-border theme-text rounded-lg border px-4 py-2 transition hover:opacity-70"
    >
      Logout
    </button>
  );
}