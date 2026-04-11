import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  type ConvRow = {
    id: string;
    context: string | null;
    created_at: string;
    matches: {
      profile_a: string;
      profile_b: string;
      profiles_a: { id: string; full_name: string | null; avatar_url: string | null } | { id: string; full_name: string | null; avatar_url: string | null }[];
      profiles_b: { id: string; full_name: string | null; avatar_url: string | null } | { id: string; full_name: string | null; avatar_url: string | null }[];
    } | null;
  };

  const { data: convRaw } = await supabase
    .from("conversations")
    .select(`
      id, context, created_at,
      matches!inner(profile_a, profile_b,
        profiles_a:profiles!matches_profile_a_fkey(id, full_name, avatar_url),
        profiles_b:profiles!matches_profile_b_fkey(id, full_name, avatar_url)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(30);
  const conversations = convRaw as unknown as ConvRow[] | null;

  // Fetch last message per conversation
  const convIds = (conversations ?? []).map((c) => c.id);
  const lastMessageMap: Record<string, { content: string; created_at: string; sender_id: string }> = {};

  if (convIds.length > 0) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at, sender_id")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false })
      .limit(convIds.length * 5);

    for (const msg of msgs ?? []) {
      if (!lastMessageMap[msg.conversation_id]) {
        lastMessageMap[msg.conversation_id] = msg;
      }
    }
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="font-display text-[24px] font-semibold tracking-tight text-neutral-900">Messages</h1>
          <p className="text-[13.5px] text-neutral-500 mt-0.5">Conversations with your matches.</p>
        </div>

        {!conversations?.length ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="font-display text-[17px] font-semibold text-neutral-900 mb-2">No conversations yet</h3>
            <p className="text-[13.5px] text-neutral-500 max-w-xs">
              When both sides accept a match, a conversation opens here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const match = Array.isArray(conv.matches) ? conv.matches[0] : conv.matches;
              const other = match?.profile_a === user.id
                ? (Array.isArray(match?.profiles_b) ? match.profiles_b[0] : match?.profiles_b)
                : (Array.isArray(match?.profiles_a) ? match.profiles_a[0] : match?.profiles_a);

              const lastMsg = lastMessageMap[conv.id];
              const isMyMessage = lastMsg?.sender_id === user.id;

              return (
                <Link
                  key={conv.id}
                  href={`/dashboard/messages/${conv.id}`}
                  className="flex items-center gap-3 bg-white border border-neutral-200/80 rounded-xl px-4 py-3.5 hover:border-neutral-300 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-[13px] font-semibold text-neutral-600 overflow-hidden">
                    {other?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (other?.full_name?.[0] ?? "?").toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium text-neutral-900">
                      {other?.full_name ?? "Someone"}
                    </p>
                    {lastMsg ? (
                      <p className="text-[12px] text-neutral-400 truncate">
                        {isMyMessage ? "You: " : ""}{lastMsg.content}
                      </p>
                    ) : conv.context ? (
                      <p className="text-[12px] text-neutral-400 truncate">{conv.context}</p>
                    ) : null}
                  </div>
                  {lastMsg && (
                    <span className="text-[11px] text-neutral-400 shrink-0 ml-2">
                      {timeAgo(lastMsg.created_at)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
