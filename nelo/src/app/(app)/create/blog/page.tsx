import { getCurrentProfile } from "@/lib/profile";

import CreateBlogForm from "@/components/blog/create-blog-form";

export default async function CreateBlogPage() {
  const profile =
    await getCurrentProfile();

  if (!profile) {
    return null;
  }

  return (
    <section className="mx-auto max-w-4xl">

      <h1 className="text-3xl font-bold">
        Write a Blog
      </h1>

      <p className="theme-text-secondary mt-2">
        Share your thoughts with the NELO community.
      </p>

      <CreateBlogForm
        userId={profile.id}
      />

    </section>
  );
}