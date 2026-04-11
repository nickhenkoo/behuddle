"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Globe } from "lucide-react";
import { createPost } from "@/lib/supabase/actions";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Post {
  id: string;
  title: string;
  body?: string | null;
  type?: string | null;
  upvotes: number;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null; role: string | null } | null;
  projects?: { title: string } | null;
}

interface Project { id: string; title: string; }

const TYPE_OPTIONS = [
  { value: "question", label: "Question",   desc: "Ask the community" },
  { value: "find",     label: "Find",        desc: "Looking for something" },
  { value: "case",     label: "Case study",  desc: "Share a lesson" },
] as const;

const TYPE_BADGE: Record<string, string> = {
  question:  "bg-blue-50 text-blue-600 border-blue-200",
  find:      "bg-amber-50 text-amber-600 border-amber-200",
  case:      "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const inputCls = "w-full bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150";

// ── Post form ─────────────────────────────────────────────────────────────────

function PostForm({ myProjects, onClose }: { myProjects: Project[]; onClose: () => void }) {
  const [type, setType] = useState<"question" | "find" | "case">("question");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [projectId, setProjectId] = useState<string>(myProjects[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setError(null);
    start(async () => {
      const result = await createPost({
        title: title.trim(),
        body:  body || undefined,
        type,
        project_id: projectId || undefined,
      });
      if (!result?.success) { setError('error' in result ? result.error : 'Failed'); return; }
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type */}
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">Post type</label>
        <div className="grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`py-2.5 px-2 text-center rounded-xl border transition-all duration-100 ${
                type === t.value
                  ? "bg-neutral-900 border-neutral-900 text-white"
                  : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <p className="text-[12.5px] font-medium">{t.label}</p>
              <p className={`text-[10.5px] mt-0.5 ${type === t.value ? "text-neutral-400" : "text-neutral-400"}`}>{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            type === "question" ? "What do you want to know?"
            : type === "find" ? "What are you looking for?"
            : "What did you learn?"
          }
          autoFocus
          maxLength={200}
          className={inputCls}
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">
          Details <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Add context, share what you've already tried, or describe the situation…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Linked project */}
      {myProjects.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-neutral-600">Linked project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={inputCls}
          >
            <option value="">No project</option>
            {myProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
        <button type="button" onClick={onClose} className="text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors px-2">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="ml-auto bg-neutral-900 hover:bg-neutral-800 text-white text-[13.5px] font-medium rounded-xl px-5 py-2.5 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isPending ? "Posting…" : "Publish"}
        </button>
      </div>
    </form>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
  const project = Array.isArray(post.projects) ? post.projects[0] : post.projects;

  return (
    <div className="bg-white border border-neutral-200/80 rounded-xl px-4 py-4 hover:border-neutral-300 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {post.type && (
          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${TYPE_BADGE[post.type] ?? "bg-neutral-100 text-neutral-500 border-neutral-200"}`}>
            {TYPE_OPTIONS.find((t) => t.value === post.type)?.label ?? post.type}
          </span>
        )}
        {project?.title && (
          <span className="text-[11.5px] text-neutral-400">· {project.title}</span>
        )}
      </div>

      <h3 className="text-[14px] font-semibold text-neutral-900 leading-snug">{post.title}</h3>

      {post.body && (
        <p className="text-[13px] text-neutral-500 mt-1.5 line-clamp-3 leading-relaxed">{post.body}</p>
      )}

      <div className="flex items-center gap-3 mt-3">
        {author && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[9px] font-semibold text-neutral-600 overflow-hidden">
              {author.avatar_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
                : (author.full_name?.[0] ?? "?").toUpperCase()
              }
            </div>
            <span className="text-[12px] text-neutral-400">{author.full_name ?? "Anonymous"}</span>
          </div>
        )}
        <span className="text-[12px] text-neutral-300">·</span>
        <span className="text-[12px] text-neutral-400">
          {new Date(post.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
        </span>
        {post.upvotes > 0 && (
          <>
            <span className="text-[12px] text-neutral-300">·</span>
            <span className="text-[12px] text-neutral-400">{post.upvotes} ↑</span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CommunityClient({ posts, myProjects }: { posts: Post[]; myProjects: Project[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-[24px] font-semibold tracking-tight text-neutral-900">Community</h1>
            <p className="text-[13.5px] text-neutral-500 mt-0.5">Questions and case studies tied to real projects.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[13px] font-medium rounded-xl px-4 py-2.5 transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            New post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="font-display text-[17px] font-semibold text-neutral-900 mb-2">Nothing here yet</h3>
            <p className="text-[13.5px] text-neutral-500 max-w-xs mb-5">
              Share a question, post what you&apos;re looking for, or write up a lesson from your project.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[13px] font-medium rounded-xl px-4 py-2.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Write the first post
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>

      {/* Slide-over */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col h-full"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
                <h2 className="font-display text-[17px] font-semibold text-neutral-900">New post</h2>
                <button type="button" onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <PostForm myProjects={myProjects} onClose={() => setOpen(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
