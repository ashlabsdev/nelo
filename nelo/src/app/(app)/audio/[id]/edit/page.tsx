import { notFound } from "next/navigation";

import { AudioLines } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

import EditAudioForm from "@/components/audio/edit-audio-form";

type EditAudioPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type HashtagRelation = {
  hashtags:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

export default async function EditAudioPage({ params }: EditAudioPageProps) {
  const { id } = await params;

  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const supabase = await createClient();

  const { data: audio, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      user_id,
      title,
      content,
      media_path,
      status,

      post_hashtags (
        hashtags (
          name
        )
      )
    `,
    )
    .eq("id", id)
    .eq("type", "audio")
    .single();

  if (
    error ||
    !audio ||
    audio.user_id !== profile.id ||
    audio.status !== "active" ||
    !audio.media_path
  ) {
    notFound();
  }

  const relations = (audio.post_hashtags ?? []) as HashtagRelation[];

  const hashtags = relations.flatMap((relation) => {
    const tag = relation.hashtags;

    if (Array.isArray(tag)) {
      return tag.map((item) => item.name);
    }

    return tag ? [tag.name] : [];
  });

  const { data: publicUrlData } = supabase.storage
    .from("post-media")
    .getPublicUrl(audio.media_path);

  return (
    <section className="mx-auto max-w-3xl">
      <div className="flex items-start gap-3">
        <div className="theme-accent-bg flex h-11 w-11 items-center justify-center rounded-xl text-white">
          <AudioLines size={20} />
        </div>

        <div>
          <h1 className="text-3xl font-bold">Edit Audio</h1>

          <p className="theme-text-secondary mt-2">
            Update the title, description and hashtags.
          </p>
        </div>
      </div>

      <EditAudioForm
        userId={profile.id}
        postId={audio.id}
        audioUrl={publicUrlData.publicUrl}
        initialTitle={audio.title}
        initialDescription={audio.content}
        initialHashtags={hashtags}
      />
    </section>
  );
}
