// ── Match scoring algorithm ───────────────────────────────────────────────────
//
// Pure functions — no I/O, no Supabase, no side effects.
// Weights defined in CLAUDE.md:
//   skills  50%  | role complement 25%  | availability 15%  | activity 10%
//   +15% bonus if candidate is verified

export interface ScoredProfile {
  id: string
  role: string | null
  bio: string | null
  motivation: string | null
  availability_hours: number | null
  is_verified?: boolean
  skill_ids: Set<number>
}

export interface ScoreInput {
  me: ScoredProfile
  candidate: ScoredProfile
}

export function scoreMatch({ me, candidate }: ScoreInput): number {
  const mySkills = me.skill_ids
  const theirSkills = candidate.skill_ids

  // Skills overlap (0–50)
  const union = new Set([...mySkills, ...theirSkills])
  const intersection = [...mySkills].filter(id => theirSkills.has(id)).length
  const skillsScore = union.size > 0 ? (intersection / union.size) * 50 : 0

  // Availability compatibility (0–15)
  const myHours = me.availability_hours ?? 10
  const theirHours = candidate.availability_hours ?? 10
  const availScore = Math.min(myHours, theirHours) / Math.max(myHours, theirHours) * 15

  // Activity — presence of bio + motivation (0–10)
  const activityScore = (me.bio ? 5 : 0) + (candidate.bio ? 5 : 0)

  // Role complement (0–25): builder + contributor is ideal, same-role is weaker
  const roleScore = me.role !== candidate.role ? 25 : 10

  const raw = skillsScore + availScore + activityScore + roleScore

  // Verification bonus
  const boosted = candidate.is_verified ? raw * 1.15 : raw

  return Math.min(Math.round(boosted), 100)
}

// Normalise a raw Supabase profile row into the shape scoreMatch() expects
export function toScoredProfile(
  row: {
    id: string
    role: string | null
    bio: string | null
    motivation: string | null
    availability_hours: number | null
    is_verified?: boolean
    profile_skills: { skill_id: number }[]
  }
): ScoredProfile {
  return {
    id: row.id,
    role: row.role,
    bio: row.bio,
    motivation: row.motivation,
    availability_hours: row.availability_hours,
    is_verified: row.is_verified,
    skill_ids: new Set(row.profile_skills.map(ps => ps.skill_id)),
  }
}
