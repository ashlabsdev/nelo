import { ShieldAlert } from "lucide-react";

export default function SuspendedPage() {
  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
        <ShieldAlert size={26} />
      </div>

      <h1 className="mt-5 text-3xl font-bold">Account suspended</h1>

      <p className="theme-text-secondary mt-3 leading-7">
        This account has been suspended because of repeated confirmed content
        violations.
      </p>

      <p className="theme-text-secondary mt-3 text-sm">
        Contact NELO support if you believe this decision requires review.
      </p>
    </section>
  );
}
