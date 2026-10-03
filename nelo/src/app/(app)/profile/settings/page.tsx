import LogoutButton from "@/components/auth/logout-button";

export default function SettingsPage() {
  return (
    <section>

      <h1 className="text-3xl font-bold">
        Settings
      </h1>

      <p className="theme-text-secondary mt-2">
        Manage your NELO account.
      </p>

      <div className="theme-surface theme-border mt-8 rounded-2xl border p-5 sm:p-6">

        <h2 className="text-lg font-semibold">
          Session
        </h2>

        <p className="theme-text-secondary mt-1 text-sm">
          Sign out of your current NELO session.
        </p>

        <div className="mt-5">
          <LogoutButton />
        </div>

      </div>

    </section>
  );
}