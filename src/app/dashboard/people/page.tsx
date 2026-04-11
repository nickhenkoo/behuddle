import { createClient } from "@/lib/supabase/server";
import PeopleClient from "./PeopleClient";

export default async function PeoplePage() {
  const supabase = await createClient();

  const { data: people } = await supabase
    .from("profiles")
    .select(`
      id, full_name, role, bio, motivation, status, location,
      avatar_url, availability_hours, is_verified,
      profile_skills(skills(name))
    `)
    .not("role", "is", null)
    .eq("is_open_to_match", true)
    .order("created_at", { ascending: false })
    .limit(40);

  return <PeopleClient people={people ?? []} />;
}
