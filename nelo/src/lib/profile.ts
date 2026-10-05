import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return null;
  }

  const userId = claimsData.claims.sub;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      username,
      avatar_id,
      bio,
      website_url,
      link_2,
      link_3,
      role,
      created_at,
      updated_at
    `,
    )
    .eq("id", userId)
    .single();

  if (error) {
    return null;
  }

  return profile;
}
