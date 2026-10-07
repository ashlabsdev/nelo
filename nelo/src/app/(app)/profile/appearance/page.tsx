import ThemeSelector from "@/components/theme/theme-selector";

export default function AppearancePage() {
  return (
    <section>

      <h1 className="text-3xl font-bold">
        Appearance
      </h1>

      <p className="theme-text-secondary mt-2">
        Choose your preferred NELO theme.
      </p>

      <div className="theme-surface theme-border mt-8 rounded-2xl border p-5 sm:p-6">

        <h2 className="text-lg font-semibold">
          Themes
        </h2>

        <p className="theme-text-secondary mt-1 text-sm">
          Your selected theme is stored on this device.
        </p>

        <div className="mt-5">
          <ThemeSelector />
        </div>

      </div>

    </section>
  );
}