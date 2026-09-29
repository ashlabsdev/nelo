"use client";

import { createClient } from "@/lib/supabase/client";

export default function SocialLogin() {
  async function loginWithGoogle() {
    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

    if (error) {
      alert(error.message);
    }
  }

  async function loginWithGithub() {
    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "github",

        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

    if (error) {
      alert(error.message);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={loginWithGoogle}
        className="w-full rounded-lg border border-gray-700 py-3"
      >
        Continue with Google
      </button>

      <button
        onClick={loginWithGithub}
        className="w-full rounded-lg border border-gray-700 py-3"
      >
        Continue with GitHub
      </button>
    </div>
  );
}