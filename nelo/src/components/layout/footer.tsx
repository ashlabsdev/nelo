export default function Footer() {
  return (
    <footer className="theme-border mt-auto hidden border-t py-6 md:block">
      <div className="mx-auto max-w-7xl px-6 text-center">

        <p className="theme-text-secondary mt-1 text-xs">
          AshLabs Pvt. Ltd. © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}