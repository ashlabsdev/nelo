export default function TestPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold">NELO Backend Test</h1>

        <p className="mt-4">
          Supabase URL:
        </p>

        <p className="mt-2 text-green-400">
          {supabaseUrl ? "Connected / Configured" : "Missing"}
        </p>
      </div>
    </main>
  );
}