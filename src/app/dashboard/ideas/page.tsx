import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import IdeasClient from "./IdeasClient";

export default async function IdeasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: allProjects }, { data: myProjects }, { data: skills }, { data: myLikes }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(`
          id, title, description, stage, domain, what_exists, what_needed,
          owner_id, is_paused, created_at, last_updated_at,
          profiles(full_name, role),
          project_likes(profile_id),
          project_skill_needs(skill_id, is_must_have, skills(id, name))
        `)
        .eq("is_active", true)
        .neq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),

      supabase
        .from("projects")
        .select(`
          id, title, description, stage, domain, what_exists, what_needed,
          owner_id, is_paused, created_at, last_updated_at,
          project_likes(profile_id),
          project_skill_needs(skill_id, is_must_have, skills(id, name))
        `)
        .eq("is_active", true)
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("skills")
        .select("id, name, category")
        .order("category").order("name"),

      supabase
        .from("project_likes")
        .select("project_id")
        .eq("profile_id", user.id),
    ]);

  const likedIds = new Set((myLikes ?? []).map((l) => l.project_id));

  return (
    <IdeasClient
      allProjects={allProjects ?? []}
      myProjects={myProjects ?? []}
      likedIds={[...likedIds]}
      skills={skills ?? []}
      userId={user.id}
    />
  );
}
