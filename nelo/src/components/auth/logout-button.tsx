"use client";
import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  compact?: boolean;
};

export default function LogoutButton({compact = false,}: LogoutButtonProps) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/auth/login");
  }

  return (
    <button
      onClick={logout}
      title="Logout"
      className="theme-text flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:opacity-70"
    >
      <LogOut size={17} />

      {!compact && (
        <span>Logout</span>
      )}
    </button>
  );
}