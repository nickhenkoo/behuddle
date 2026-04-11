"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Pencil, Trash2, Heart, ChevronDown, ChevronUp, Lightbulb
} from "lucide-react";
import {
  createProject, updateProject, deleteProject, toggleProjectLike,
} from "@/lib/supabase/actions";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Skill { id: number; name: string; category: string | null; }

interface SkillNeed { skill_id: number; is_must_have: boolean; skills: { id: number; name: string } | null; }

interface Project {
  id: string;
  title: string;
  description?: string | null;
  stage?: string | null;
  domain?: string | null;
  what_exists?: string | null;
  what_needed?: string | null;
  owner_id: string;
  is_paused?: boolean | null;
  created_at: string;
  profiles?: { full_name: string | null } | { full_name: string | null }[] | null;
  project_likes?: { profile_id: string }[] | null;
  project_skill_needs?: SkillNeed[] | null;
}

interface Props {
  allProjects: Project[];
  myProjects: Project[];
  likedIds: string[];
  skills: Skill[];
  userId: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STAGES = [
  { value: "idea",      label: "Idea" },
  { value: "prototype", label: "Prototype" },
  { value: "building",  label: "Building" },
  { value: "launched",  label: "Launched" },
];

const STAGE_COLORS: Record<string, string> = {
  idea:      "bg-amber-50 text-amber-700 border-amber-200",
  prototype: "bg-blue-50 text-blue-700 border-blue-200",
  building:  "bg-indigo-50 text-indigo-700 border-indigo-200",
  launched:  "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const CATEGORIES = ["engineering", "design", "business", "marketing", "other"];

const inputCls = "w-full bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150";

// ── Project form (create / edit) ──────────────────────────────────────────────

interface FormData {
  title: string;
  description: string;
  stage: string;
  domain: string;
  what_exists: string;
  what_needed: string;
  skill_ids: number[];
}

const EMPTY_FORM: FormData = {
  title: "", description: "", stage: "idea",
  domain: "", what_exists: "", what_needed: "", skill_ids: [],
};

function ProjectForm({
  initial,
  editId,
  skills,
  onClose,
}: {
  initial?: Partial<FormData>;
  editId?: string;
  skills: Skill[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleSkill = (id: number) =>
    set("skill_ids", form.skill_ids.includes(id)
      ? form.skill_ids.filter((x) => x !== id)
      : [...form.skill_ids, id]
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setError(null);

    start(async () => {
      const payload = {
        title:       form.title.trim(),
        description: form.description || undefined,
        stage:       form.stage || undefined,
        domain:      form.domain || undefined,
        what_exists: form.what_exists || undefined,
        what_needed: form.what_needed || undefined,
        skill_ids:   form.skill_ids,
      };

      const result = editId
        ? await updateProject(editId, payload)
        : await createProject(payload);

      if ("error" in result && result.error) { setError(result.error); return; }
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Title */}
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">Project name *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="What are you building?"
          autoFocus
          className={inputCls}
        />
      </div>

      {/* Stage */}
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">Stage</label>
        <div className="grid grid-cols-4 gap-1.5">
          {STAGES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => set("stage", s.value)}
              className={`py-2 text-[12px] font-medium rounded-lg border transition-all duration-100 ${
                form.stage === s.value
                  ? "bg-neutral-900 border-neutral-900 text-white"
                  : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">
          Description <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="What problem does it solve? Who is it for?"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Domain */}
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">
          Domain <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={form.domain}
          onChange={(e) => set("domain", e.target.value)}
          placeholder="e.g. fintech, health, edtech, SaaS…"
          className={inputCls}
        />
      </div>

      {/* What exists */}
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">
          What already exists <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.what_exists}
          onChange={(e) => set("what_exists", e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="Landing page, Figma mockup, MVP in progress…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* What needed */}
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">
          What do you need <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.what_needed}
          onChange={(e) => set("what_needed", e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="A frontend dev who can take Figma to React, a designer for the mobile app…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Skills needed */}
      <div className="space-y-2">
        <p className="text-[12.5px] font-medium text-neutral-600">Skills needed</p>
        {CATEGORIES.map((cat) => {
          const catSkills = skills.filter((s) => s.category === cat);
          if (!catSkills.length) return null;
          return (
            <div key={cat}>
              <p className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">{cat}</p>
              <div className="flex flex-wrap gap-1.5">
                {catSkills.map((skill) => {
                  const active = form.skill_ids.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`text-[12px] px-2.5 py-1 rounded-lg border transition-all duration-100 ${
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 text-neutral-600"
                      }`}
                    >
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
        <button
          type="button"
          onClick={onClose}
          className="text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors px-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="ml-auto bg-neutral-900 hover:bg-neutral-800 text-white text-[13.5px] font-medium rounded-xl px-5 py-2.5 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isPending ? "Saving…" : editId ? "Save changes" : "Create project"}
        </button>
      </div>
    </form>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  isOwn,
  isLiked,
  userId,
  onEdit,
  onDelete,
}: {
  project: Project;
  isOwn: boolean;
  isLiked: boolean;
  userId: string;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(project.project_likes?.length ?? 0);
  const [isPending, start] = useTransition();

  const owner = project.profiles
    ? Array.isArray(project.profiles) ? project.profiles[0] : project.profiles
    : null;

  const skillNeeds = project.project_skill_needs ?? [];

  const handleLike = () => {
    if (isOwn) return;
    setLiked((v) => !v);
    setLikeCount((n) => liked ? n - 1 : n + 1);
    start(async () => { await toggleProjectLike(project.id); });
  };

  return (
    <div className={`bg-white border rounded-xl transition-all duration-150 ${
      isOwn ? "border-neutral-300" : "border-neutral-200/80 hover:border-neutral-300"
    }`}>
      <div className="px-4 py-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-[14px] font-semibold text-neutral-900 leading-snug">{project.title}</h3>
              {project.stage && (
                <span className={`text-[10.5px] px-2 py-0.5 rounded-full border font-medium ${STAGE_COLORS[project.stage] ?? "bg-neutral-100 text-neutral-500 border-neutral-200"}`}>
                  {STAGES.find((s) => s.value === project.stage)?.label ?? project.stage}
                </span>
              )}
              {project.is_paused && (
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400 border border-neutral-200 font-medium">paused</span>
              )}
            </div>

            {project.description && (
              <p className="text-[13px] text-neutral-500 line-clamp-2 leading-relaxed">{project.description}</p>
            )}

            {project.what_needed && (
              <p className="text-[12.5px] text-indigo-600 mt-1.5 font-medium">
                → {project.what_needed}
              </p>
            )}
          </div>

          {/* Owner actions */}
          {isOwn && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(project.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Skills */}
        {skillNeeds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skillNeeds.slice(0, 4).map((sn) => (
              <span key={sn.skill_id} className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                sn.is_must_have
                  ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                  : "bg-neutral-50 text-neutral-500 border-neutral-200"
              }`}>
                {sn.skills?.name ?? `skill_${sn.skill_id}`}
              </span>
            ))}
            {skillNeeds.length > 4 && (
              <span className="text-[11px] px-2 py-0.5 text-neutral-400">+{skillNeeds.length - 4} more</span>
            )}
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center gap-3 mt-3">
          {/* By */}
          {!isOwn && owner?.full_name && (
            <span className="text-[12px] text-neutral-400">by {owner.full_name}</span>
          )}
          {project.domain && (
            <span className="text-[12px] text-neutral-400">{project.domain}</span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {/* Like */}
            {!isOwn && (
              <button
                type="button"
                onClick={handleLike}
                disabled={isPending}
                className={`flex items-center gap-1 text-[12px] font-medium transition-colors ${
                  liked ? "text-red-500" : "text-neutral-400 hover:text-red-400"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500" : ""}`} />
                {likeCount > 0 && likeCount}
              </button>
            )}

            {/* Expand */}
            {(project.what_exists || project.domain) && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? "Less" : "More"}
              </button>
            )}
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-neutral-100 space-y-2">
                {project.what_exists && (
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-0.5">Already exists</p>
                    <p className="text-[13px] text-neutral-600">{project.what_exists}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────

function DeleteConfirm({ projectId, onCancel }: { projectId: string; onCancel: () => void }) {
  const [isPending, start] = useTransition();

  const confirm = () => {
    start(async () => {
      await deleteProject(projectId);
      onCancel();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-sm p-5"
      >
        <h3 className="font-display text-[17px] font-semibold text-neutral-900 mb-1.5">Delete project?</h3>
        <p className="text-[13.5px] text-neutral-500 mb-5">
          The project will be hidden from the community. This can&apos;t be undone.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 border border-neutral-200 text-neutral-700 text-[13.5px] font-medium rounded-xl py-2.5 hover:bg-neutral-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={confirm} disabled={isPending} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[13.5px] font-medium rounded-xl py-2.5 transition-colors disabled:opacity-50">
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Slide-over panel ──────────────────────────────────────────────────────────

function SlideOver({ title, children, onClose }: {
  title: string; children: React.ReactNode; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col h-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <h2 className="font-display text-[17px] font-semibold text-neutral-900">{title}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Panel =
  | { type: "create" }
  | { type: "edit"; project: Project }
  | null;

export default function IdeasClient({
  allProjects, myProjects, likedIds, skills, userId,
}: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const likedSet = new Set(likedIds);

  const formInitial = panel?.type === "edit"
    ? {
        title:       panel.project.title,
        description: panel.project.description ?? "",
        stage:       panel.project.stage ?? "idea",
        domain:      panel.project.domain ?? "",
        what_exists: panel.project.what_exists ?? "",
        what_needed: panel.project.what_needed ?? "",
        skill_ids:   (panel.project.project_skill_needs ?? []).map((sn) => sn.skill_id),
      }
    : undefined;

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-[24px] font-semibold tracking-tight text-neutral-900">Ideas</h1>
            <p className="text-[13.5px] text-neutral-500 mt-0.5">Projects looking for contributors.</p>
          </div>
          <button
            type="button"
            onClick={() => setPanel({ type: "create" })}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[13px] font-medium rounded-xl px-4 py-2.5 transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            New project
          </button>
        </div>

        {/* My projects */}
        {myProjects.length > 0 && (
          <div className="mb-8">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Your projects</p>
            <div className="space-y-2">
              {myProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  isOwn
                  isLiked={false}
                  userId={userId}
                  onEdit={(proj) => setPanel({ type: "edit", project: proj })}
                  onDelete={setDeleteId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Community projects */}
        {allProjects.length > 0 && (
          <div>
            {myProjects.length > 0 && (
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Community</p>
            )}
            <div className="space-y-2">
              {allProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  isOwn={false}
                  isLiked={likedSet.has(p.id)}
                  userId={userId}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!allProjects.length && !myProjects.length && (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="font-display text-[17px] font-semibold text-neutral-900 mb-2">No projects yet</h3>
            <p className="text-[13.5px] text-neutral-500 max-w-xs mb-5">
              Share your idea and find the right people to build it with.
            </p>
            <button
              type="button"
              onClick={() => setPanel({ type: "create" })}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[13px] font-medium rounded-xl px-4 py-2.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Post your first project
            </button>
          </div>
        )}
      </div>

      {/* Slide-over */}
      <AnimatePresence>
        {panel && (
          <SlideOver
            title={panel.type === "create" ? "New project" : "Edit project"}
            onClose={() => setPanel(null)}
          >
            <ProjectForm
              initial={formInitial}
              editId={panel.type === "edit" ? panel.project.id : undefined}
              skills={skills}
              onClose={() => setPanel(null)}
            />
          </SlideOver>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      {deleteId && (
        <DeleteConfirm
          projectId={deleteId}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
