import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RealtimeChat from "./RealtimeChat";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  type ConvResult = {
    id: string;
    context: string | null;
    matches: {
      profile_a: string;
      profile_b: string;
      profiles_a: { id: string; full_name: string | null; avatar_url: string | null } | { id: string; full_name: string | null; avatar_url: string | null }[];
      profiles_b: { id: string; full_name: string | null; avatar_url: string | null } | { id: string; full_name: string | null; avatar_url: string | null }[];
    } | null;
  } | null;

  const { data: convRaw } = await supabase
    .from("conversations")
    .select(`
      id, context,
      matches!inner(profile_a, profile_b,
        profiles_a:profiles!matches_profile_a_fkey(id, full_name, avatar_url),
        profiles_b:profiles!matches_profile_b_fkey(id, full_name, avatar_url)
      )
    `)
    .eq("id", conversationId)
    .single();
  const conv = convRaw as unknown as ConvResult;

  if (!conv) notFound();

  const match = Array.isArray(conv.matches) ? conv.matches[0] : conv.matches;
  if (match?.profile_a !== user.id && match?.profile_b !== user.id) redirect("/dashboard/messages");

  const other = match?.profile_a === user.id
    ? (Array.isArray(match?.profiles_b) ? match.profiles_b[0] : match?.profiles_b)
    : (Array.isArray(match?.profiles_a) ? match.profiles_a[0] : match?.profiles_a);

  const { data: initialMessages } = await supabase
    .from("messages")
    .select("id, content, sender_id, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh)] pb-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/[0.04] bg-white shrink-0">
        <Link href="/dashboard/messages" className="text-neutral-400 hover:text-neutral-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-[12px] font-semibold text-neutral-700 overflow-hidden shrink-0">
          {other?.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
            : (other?.full_name?.[0] ?? "?").toUpperCase()
          }
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#1A1918] leading-tight">{other?.full_name ?? "Someone"}</p>
          {conv.context && <p className="text-[11.5px] text-neutral-400 leading-tight">{conv.context}</p>}
        </div>
      </div>

      {/* Realtime messages + input */}
      <RealtimeChat
        conversationId={conversationId}
        userId={user.id}
        initialMessages={initialMessages ?? []}
      />
    </div>
  );
}
