import { getCurrentProfile } from "@/lib/profile";

import CreatePhotoForm from "@/components/photo/create-photo-form";

export default async function CreatePhotoPage() {
  const profile =
    await getCurrentProfile();

  if (!profile) {
    return null;
  }

  return (
    <section className="mx-auto max-w-4xl">

      <h1 className="text-3xl font-bold">
        Share a Photo
      </h1>

      <p className="theme-text-secondary mt-2">
        Upload a photo and share it
        with the NELO community.
      </p>

      <CreatePhotoForm
        userId={profile.id}
      />

    </section>
  );
}