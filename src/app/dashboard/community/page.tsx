import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CommunityClient from "./CommunityClient";

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: posts }, { data: myProjects }] = await Promise.all([
    supabase
      .from("posts")
      .select(`
        id, title, body, type, upvotes, created_at,
        profiles(full_name, avatar_url, role),
        projects(title)
      `)
      .order("created_at", { ascending: false })
      .limit(30),

    supabase
      .from("projects")
      .select("id, title")
      .eq("owner_id", user.id)
      .eq("is_active", true),
  ]);

  return (
    <CommunityClient
      posts={posts ?? []}
      myProjects={myProjects ?? []}
    />
  );
}
