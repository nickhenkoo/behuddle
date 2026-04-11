import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { SparkCard } from "@/components/dashboard/SparkCard";
import { NearbyPeople } from "@/components/dashboard/NearbyPeople";
import { WeeklyQuestion } from "@/components/dashboard/WeeklyQuestion";
import { SpotlightProject } from "@/components/dashboard/SpotlightProject";

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, status, location, availability_hours")
    .eq("id", user.id)
    .single();

  // Redirect to onboarding if role not set
  if (!profile?.role) redirect("/onboarding");

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-6">

        {/* Greeting */}
        <div>
          <h1 className="font-display text-[24px] font-semibold tracking-tight text-neutral-900">
            Hey, {firstName}
          </h1>
          <p className="text-[13.5px] text-neutral-500 mt-0.5">Here&apos;s what&apos;s happening.</p>
        </div>

        {/* Status bar */}
        <StatusBar profile={profile} />

        {/* Spark of the day */}
        <SparkCard userId={user.id} />

        {/* Nearby people */}
        <NearbyPeople profile={profile} currentUserId={user.id} />

        {/* Weekly question */}
        <WeeklyQuestion userId={user.id} />

        {/* Spotlight project */}
        <SpotlightProject />

      </div>
    </div>
  );
}
