import { createClient } from "@/lib/supabase/server";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: skills } = await supabase
    .from("skills")
    .select("id, name, category")
    .order("category")
    .order("name");

  return <OnboardingClient skills={skills ?? []} />;
}
