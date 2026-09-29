import Link from "next/link";

import {
  FileText,
  ImageIcon,
  Headphones,
} from "lucide-react";

const types = [
  {
    title: "Blog",
    description:
      "Write and publish a blog.",
    href: "/create/blog",
    icon: FileText,
  },
  {
    title: "Photo",
    description:
      "Upload and share a photo.",
    href: "/create/photo",
    icon: ImageIcon,
  },
  {
    title: "Audio",
    description:
      "Upload and share audio.",
    href: "/create/audio",
    icon: Headphones,
  },
];

export default function CreatePage() {
  return (
    <section className="mx-auto max-w-4xl">

      <h1 className="text-3xl font-bold">
        Create
      </h1>

      <p className="theme-text-secondary mt-2">
        What would you like to share?
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">

        {types.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="theme-surface theme-border rounded-2xl border p-6 transition hover:-translate-y-1"
            >
              <Icon
                size={30}
                className="theme-accent"
              />

              <h2 className="mt-5 text-xl font-semibold">
                {item.title}
              </h2>

              <p className="theme-text-secondary mt-2 text-sm">
                {item.description}
              </p>

            </Link>
          );
        })}

      </div>

    </section>
  );
}