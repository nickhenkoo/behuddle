import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, profile_skills(skill_id, level, skills(id, name, category))")
    .eq("id", user.id)
    .single();

  const { data: skills } = await supabase
    .from("skills")
    .select("id, name, category")
    .order("category")
    .order("name");

  return (
    <SettingsClient
      profile={profile}
      email={user.email ?? ""}
      allSkills={skills ?? []}
    />
  );
}
