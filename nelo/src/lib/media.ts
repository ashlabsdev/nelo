export function getPostMediaUrl(
  path: string
) {
  const baseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    return "";
  }

  return `${baseUrl}/storage/v1/object/public/post-media/${path}`;
}