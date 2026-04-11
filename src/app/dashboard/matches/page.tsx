import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MatchesClient from "./MatchesClient";

export default async function MatchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id, score, spark_text, project_id, status_a, status_b, created_at,
      profile_a, profile_b,
      profiles_a:profiles!matches_profile_a_fkey(
        id, full_name, avatar_url, role, bio, motivation,
        location, status, availability_hours, is_verified,
        profile_skills(skills(name))
      ),
      profiles_b:profiles!matches_profile_b_fkey(
        id, full_name, avatar_url, role, bio, motivation,
        location, status, availability_hours, is_verified,
        profile_skills(skills(name))
      ),
      projects(id, title, what_needed, description),
      conversations(id)
    `)
    .or(`profile_a.eq.${user.id},profile_b.eq.${user.id}`)
    .order("score", { ascending: false });

  return (
    <MatchesClient
      matches={matches ?? []}
      userId={user.id}
    />
  );
}
