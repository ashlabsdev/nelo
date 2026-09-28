import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/logout-button";
import Image from "next/image";

export default async function HomePage() {
  const supabase = await createClient();

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
            Authentication is working.
          </p>
        </div>

        <LogoutButton />
      </div>
    </main>
  );
}