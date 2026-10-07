import { getCurrentProfile } from "@/lib/profile";

import CreateAudioForm from "@/components/audio/create-audio-form";

export default async function CreateAudioPage() {
  const profile =
    await getCurrentProfile();

  if (!profile) {
    return null;
  }

  return (
    <section className="mx-auto max-w-4xl">

      <h1 className="text-3xl font-bold">
        Share Audio
      </h1>

      <p className="theme-text-secondary mt-2">
        Upload audio and share it
        with the NELO community.
      </p>

      <CreateAudioForm
        userId={profile.id}
      />

    </section>
  );
}