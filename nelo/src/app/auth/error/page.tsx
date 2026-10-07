import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Authentication Error
        </h1>

        <p className="mt-3 text-gray-400">
          Something went wrong while signing you in.
        </p>

        <Link
          href="/auth/login"
          className="mt-6 inline-block underline"
        >
          Return to login
        </Link>
      </div>
    </main>
  );
}