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
      className="rounded-lg border border-gray-300 px-4 py-2 text-black transition hover:bg-gray-100"
    >
      Logout
    </button>
  );
}