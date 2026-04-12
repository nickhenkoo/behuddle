"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Heart, ChevronDown, ChevronUp, Lightbulb
} from "lucide-react";
import {
  createProject, updateProject, deleteProject, toggleProjectLike,
} from "@/lib/supabase/actions";
import { roleLabel } from "@/lib/utils/roles";

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
  profiles?: { full_name: string | null; role?: string | null } | { full_name: string | null; role?: string | null }[] | null;
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
  idea:      "bg-amber-400 text-white",
  prototype: "bg-blue-500 text-white",
  building:  "bg-indigo-600 text-white",
  launched:  "bg-emerald-500 text-white",
};

const CATEGORIES = ["engineering", "design", "business", "marketing", "other"];

const inputCls = "w-full bg-white border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-black/[0.15] focus:border-black/[0.25] focus:ring-0 rounded-2xl px-4 py-3.5 text-[14px] text-[#1A1918] placeholder-neutral-400 outline-none transition-all duration-200";

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
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.what_exists.trim()) { setError("Please specify what already exists."); return; }
    if (!form.what_needed.trim()) { setError("Please specify what you need."); return; }
    if (form.skill_ids.length === 0) { setError("Please select at least one skill."); return; }
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
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Title */}
      <div className="space-y-2">
        <label className="block text-[13px] font-bold text-[#1A1918]">Project name <span className="text-red-500">*</span></label>
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
      <div className="space-y-2">
        <label className="block text-[13px] font-bold text-[#1A1918]">Stage <span className="text-red-500">*</span></label>
        <div className="flex bg-black/[0.03] p-1.5 rounded-2xl gap-1">
          {STAGES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => set("stage", s.value)}
              className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-200 ${
                form.stage === s.value
                  ? "bg-white text-[#1A1918] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  : "text-neutral-500 hover:text-[#1A1918] hover:bg-black/[0.02]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-[13px] font-bold text-[#1A1918]">
          Description <span className="text-red-500">*</span>
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
      <div className="space-y-2">
        <label className="block text-[13px] font-bold text-[#1A1918]">
          Domain <span className="text-neutral-400 font-normal ml-1">Optional</span>
        </label>
        <input
          type="text"
          value={form.domain}
          onChange={(e) => set("domain", e.target.value)}
          placeholder="e.g. fintech, health, edtech, SaaS…"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* What exists */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold text-[#1A1918]">
            Already exists? <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.what_exists}
            onChange={(e) => set("what_exists", e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Landing page, Figma mockup…"
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* What needed */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold text-[#1A1918]">
            What do you need? <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.what_needed}
            onChange={(e) => set("what_needed", e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="A frontend dev, designer…"
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {/* Skills needed */}
      <div className="space-y-3 pt-2">
        <label className="block text-[13px] font-bold text-[#1A1918]">Skills needed <span className="text-red-500">*</span></label>
        <div className="bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] rounded-[24px] p-5 space-y-4">
          {CATEGORIES.map((cat) => {
            const catSkills = skills.filter((s) => s.category === cat);
            if (!catSkills.length) return null;
            return (
              <div key={cat}>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.06em] mb-2.5">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {catSkills.map((skill) => {
                    const active = form.skill_ids.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
                          active
                            ? "border-[#1A1918] bg-[#1A1918] text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                            : "border-black/[0.08] bg-transparent hover:bg-black/[0.02] text-neutral-600"
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
      </div>

      {error && (
        <p className="text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{error}</p>
      )}

      {/* Actions */}
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
          className="btn-pill-dark px-8 py-3 text-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] disabled:opacity-50"
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

  // Stage accent left border color
  const STAGE_ACCENT: Record<string, string> = {
    idea:      "border-l-amber-400",
    prototype: "border-l-blue-400",
    building:  "border-l-indigo-500",
    launched:  "border-l-emerald-500",
  };
  const accentBorder = project.stage ? (STAGE_ACCENT[project.stage] ?? "border-l-neutral-200") : "border-l-neutral-200";

  return (
    <div className={`bg-white border border-l-[3px] rounded-2xl transition-all duration-200 ${accentBorder} ${
      isOwn ? "border-neutral-200" : "border-neutral-150 hover:border-neutral-300 hover:shadow-[0_4px_16px_rgba(26,25,24,0.05)]"
    }`}>
      <div className="px-5 py-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h3 className="text-[15px] font-bold text-[#1A1918] leading-snug">{project.title}</h3>
              {project.stage && (
                <span className={`text-[10.5px] px-2.5 py-0.5 rounded-full font-semibold shadow-sm ${STAGE_COLORS[project.stage] ?? "bg-neutral-100 text-neutral-500"}`}>
                  {STAGES.find((s) => s.value === project.stage)?.label ?? project.stage}
                </span>
              )}
              {project.is_paused && (
                <span className="text-[10.5px] px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-400 border border-neutral-200 font-medium">paused</span>
              )}
            </div>

            {project.description && (
              <p className="text-[13px] text-neutral-500 line-clamp-2 leading-relaxed">{project.description}</p>
            )}

            {project.what_needed && (
              <span className="inline-flex mt-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2.5 py-0.5 text-[12px] font-medium">
                {project.what_needed}
              </span>
            )}
          </div>

          {/* Owner actions */}
          {isOwn && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                title="Edit"
              >
                <img src="/icons/edit-2.svg" alt="Edit" className="w-3.5 h-3.5 brightness-0 opacity-40 hover:opacity-70" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(project.id)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <img src="/icons/trash-square.svg" alt="Delete" className="w-3.5 h-3.5" style={{ filter: "invert(35%) sepia(80%) saturate(400%) hue-rotate(320deg) opacity(0.7)" }} />
              </button>
            </div>
          )}
        </div>

        {/* Skills */}
        {skillNeeds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skillNeeds.slice(0, 4).map((sn) => (
              <span key={sn.skill_id} className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                sn.is_must_have
                  ? "bg-indigo-600 text-white shadow-[0_1px_4px_rgba(79,70,229,0.25)]"
                  : "bg-neutral-100 text-neutral-600 border border-neutral-200"
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
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-50">
          {/* By + role badge */}
          {!isOwn && owner?.full_name && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-neutral-400">by {owner.full_name}</span>
              {owner.role && (
                <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-bold px-3 py-0.5 rounded-full tracking-wide ${
                  owner.role === "builder"
                    ? "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.4)]"
                    : "bg-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.4)]"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
                  {roleLabel(owner.role)}
                </span>
              )}
            </div>
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
        <h3 className="font-display text-[17px] font-semibold text-[#1A1918] mb-1.5">Delete project?</h3>
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-xl bg-[#fcfcfc] shadow-[-12px_0_48px_rgba(0,0,0,0.12)] flex flex-col h-full sm:rounded-l-[32px] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-black/[0.04] shrink-0 bg-white">
          <h2 className="font-display text-[18px] sm:text-[20px] font-bold text-[#1A1918]">{title}</h2>
          <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-black/[0.03] hover:bg-black/[0.06] text-neutral-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8 custom-scrollbar">
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
    <div className="w-full">
      <div className="max-w-2xl mx-auto pt-4 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-[24px] font-semibold tracking-tight text-[#1A1918]">Ideas</h1>
            <p className="text-[13.5px] text-neutral-500 mt-0.5">Projects looking for contributors.</p>
          </div>
          <button
            type="button"
            onClick={() => setPanel({ type: "create" })}
            className="flex items-center gap-2 btn-pill-dark"
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
            <h3 className="font-display text-[17px] font-semibold text-[#1A1918] mb-2">No projects yet</h3>
            <p className="text-[13.5px] text-neutral-500 max-w-xs mb-5">
              Share your idea and find the right people to build it with.
            </p>
            <button
              type="button"
              onClick={() => setPanel({ type: "create" })}
              className="flex items-center gap-2 btn-pill-dark"
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
