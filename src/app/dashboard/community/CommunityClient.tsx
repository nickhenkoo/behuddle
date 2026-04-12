"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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

const inputCls = "w-full bg-white border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-black/[0.15] focus:border-black/[0.25] focus:ring-0 rounded-2xl px-4 py-3.5 text-[14px] text-[#1A1918] placeholder-neutral-400 outline-none transition-all duration-200";

// ── Post form ─────────────────────────────────────────────────────────────────

function PostForm({ myProjects, onClose }: { myProjects: Project[]; onClose: () => void }) {
  const [type, setType] = useState<"question" | "find" | "case">("question");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [projectId, setProjectId] = useState<string>(myProjects[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    if (!body.trim()) { setError("Details are required."); return; }
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type */}
      <div className="space-y-2">
        <label className="block text-[13px] font-bold text-[#1A1918]">Post type <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`flex flex-col items-start px-4 py-3.5 text-left rounded-2xl border transition-all duration-200 ${
                type === t.value
                  ? "bg-white border-[#1A1918] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                  : "bg-black/[0.02] border-transparent hover:bg-black/[0.04]"
              }`}
            >
              <p className={`text-[13.5px] font-bold ${type === t.value ? "text-[#1A1918]" : "text-neutral-600"}`}>{t.label}</p>
              <p className="text-[11.5px] font-medium text-neutral-500 mt-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="block text-[13px] font-bold text-[#1A1918]">Title <span className="text-red-500">*</span></label>
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
      <div className="space-y-2">
        <label className="block text-[13px] font-bold text-[#1A1918]">
          Details <span className="text-red-500">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Add context, share what you've already tried, or describe the situation…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Linked project */}
      {myProjects.length > 0 && (
        <div className="space-y-2" ref={dropdownRef}>
          <label className="block text-[13px] font-bold text-[#1A1918]">Linked project</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className={`${inputCls} text-left flex items-center justify-between`}
            >
              <span className={projectId ? "text-[#1A1918]" : "text-neutral-400"}>
                {projectId ? myProjects.find((p) => p.id === projectId)?.title : "No project"}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isProjectDropdownOpen ? 'rotate-180' : ''}`}>
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#1A1918" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <AnimatePresence>
              {isProjectDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 w-full mt-2 bg-white border border-black/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl py-2 max-h-60 overflow-y-auto custom-scrollbar"
                >
                  <button
                    type="button"
                    onClick={() => { setProjectId(""); setIsProjectDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[13.5px] transition-colors ${!projectId ? 'bg-black/[0.03] font-semibold text-[#1A1918]' : 'text-neutral-600 hover:bg-black/[0.02] hover:text-[#1A1918]'}`}
                  >
                    No project
                  </button>
                  {myProjects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setProjectId(p.id); setIsProjectDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-[13.5px] transition-colors ${projectId === p.id ? 'bg-black/[0.03] font-semibold text-[#1A1918]' : 'text-neutral-600 hover:bg-black/[0.02] hover:text-[#1A1918]'}`}
                    >
                      {p.title}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{error}</p>
      )}

      <div className="flex items-center justify-between pt-6 mt-4 border-t border-black/[0.04]">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-3 rounded-2xl text-[14px] font-bold text-neutral-500 hover:bg-black/[0.03] hover:text-[#1A1918] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="btn-pill-dark px-8 py-3 text-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] disabled:opacity-50 transition-all active:scale-[0.99]"
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
    <div className="bg-white rounded-[24px] px-6 py-5 shadow-[0_4px_24px_rgba(26,25,24,0.03)] border border-black/[0.02] hover:shadow-[0_8px_32px_rgba(26,25,24,0.06)] hover:-translate-y-0.5 transition-all duration-200">
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

      <h3 className="text-[14px] font-semibold text-[#1A1918] leading-snug">{post.title}</h3>

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
    <div className="w-full">
      <div className="max-w-2xl mx-auto pt-4 pb-12">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-[24px] font-semibold tracking-tight text-[#1A1918]">Community</h1>
            <p className="text-[13.5px] text-neutral-500 mt-0.5">Questions and case studies tied to real projects.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 btn-pill-dark"
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
            <h3 className="font-display text-[17px] font-semibold text-[#1A1918] mb-2">Nothing here yet</h3>
            <p className="text-[13.5px] text-neutral-500 max-w-xs mb-5">
              Share a question, post what you&apos;re looking for, or write up a lesson from your project.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 btn-pill-dark"
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-10 w-full max-w-xl bg-[#fcfcfc] shadow-[-12px_0_48px_rgba(0,0,0,0.12)] flex flex-col h-full sm:rounded-l-[32px] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-black/[0.04] shrink-0 bg-white">
                <h2 className="font-display text-[18px] sm:text-[20px] font-bold text-[#1A1918]">New post</h2>
                <button type="button" onClick={() => setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-black/[0.03] hover:bg-black/[0.06] text-neutral-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8 custom-scrollbar">
                <PostForm myProjects={myProjects} onClose={() => setOpen(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
