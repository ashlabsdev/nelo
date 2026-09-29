import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import LogoutButton from "@/components/auth/logout-button";
import Image from "next/image";

export default async function HomePage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.username.startsWith("user_")) {
    redirect("/complete-profile");
  }

  const { data, error } =
    await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-white p-10 text-black">
      <div className="flex items-center justify-between">
        <div>
          <Image src="/logo.png" alt="NELO Logo" className="mx-auto mt-4" width={200} height={200} />
          
          <p className="mt-3 text-primary-500">
            Welcome, {profile.username}
          </p>
        </div>

        <LogoutButton />
      </div>
    </main>
  );
}