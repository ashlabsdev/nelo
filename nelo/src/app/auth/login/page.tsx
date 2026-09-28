"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/home");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md">
        <Image src="/icon.png" alt="NELO Logo" className="mx-auto mt-4" width={100} height={100} />

        <p className="mt-2 text-center text-gray-400">
          Welcome Back To NELO
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 outline-none"
          />

          <button
            disabled={loading}
            className="w-full rounded-lg bg-white py-3 font-semibold text-black"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-400">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          New to NELO?{" "}
          <Link
            href="/auth/signup"
            className="text-white underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}