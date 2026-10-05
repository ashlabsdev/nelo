import { notFound } from "next/navigation";

import { ImageIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

import EditPhotoForm from "@/components/photo/edit-photo-form";

type EditPhotoPageProps = {
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

export default async function EditPhotoPage({ params }: EditPhotoPageProps) {
  const { id } = await params;

  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const supabase = await createClient();

  const { data: photo, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      user_id,
      type,
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
    .eq("type", "photo")
    .single();

  if (
    error ||
    !photo ||
    photo.user_id !== profile.id ||
    photo.status !== "active" ||
    !photo.media_path
  ) {
    notFound();
  }

  const hashtagRelations = (photo.post_hashtags ?? []) as HashtagRelation[];

  const hashtags = hashtagRelations.flatMap((relation) => {
    const tag = relation.hashtags;

    if (Array.isArray(tag)) {
      return tag.map((item) => item.name);
    }

    return tag ? [tag.name] : [];
  });

  const { data: publicUrlData } = supabase.storage
    .from("post-media")
    .getPublicUrl(photo.media_path);

  return (
    <section className="mx-auto max-w-3xl">
      <div className="flex items-start gap-3">
        <div className="theme-accent-bg flex h-11 w-11 items-center justify-center rounded-xl text-white">
          <ImageIcon size={20} />
        </div>

        <div>
          <h1 className="text-3xl font-bold">Edit Photo</h1>

          <p className="theme-text-secondary mt-2">
            Update the description and hashtags for your photo.
          </p>
        </div>
      </div>

      <EditPhotoForm
        userId={profile.id}
        postId={photo.id}
        imageUrl={publicUrlData.publicUrl}
        initialDescription={photo.content}
        initialHashtags={hashtags}
      />
    </section>
  );
}
