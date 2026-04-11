'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { withAuth, ok, done, fail } from '@/lib/supabase/with-auth'
import { scoreMatch, toScoredProfile } from '@/lib/matching/score'
export type { ActionResult } from '@/lib/supabase/with-auth'

// In development, send from Resend's test address (no domain verification needed).
// In production, use the real verified domain.
const FROM_EMAIL = process.env.NODE_ENV === 'production'
    ? 'behuddle <contact@behuddle.com>'
    : 'behuddle <onboarding@resend.dev>'

export async function loginWithGoogle() {
    const supabase = await createClient()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) return { error: error.message }
    if (data.url) redirect(data.url)
}

export async function register(formData: FormData) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                full_name: formData.get('full_name') as string,
            },
        },
    })

    if (error) return { error: error.message }

    // Profile auto-created via trigger
    revalidatePath('/', 'layout')
    redirect('/onboarding')
}

export async function signUp(formData: FormData) {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const { Resend } = await import('resend')
    const { MagicLinkEmail } = await import('@/lib/resend/magic-link-email')
    const { render } = await import('@react-email/render')

    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.generateLink({
        type: 'invite',
        email,
        options: {
            data: { full_name: fullName },
            redirectTo: `${siteUrl}/auth/confirm?next=/onboarding`,
        },
    })

    if (error) return { error: error.message }

    const html = await render(MagicLinkEmail({ link: data.properties.action_link, type: 'signup', name: fullName }))

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Welcome to behuddle — activate your account',
        html,
    })

    if (emailError) return { error: 'Failed to send email. Please try again.' }
    return { success: true }
}

export async function loginWithOtp(formData: FormData) {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const { Resend } = await import('resend')
    const { MagicLinkEmail } = await import('@/lib/resend/magic-link-email')
    const { render } = await import('@react-email/render')

    const email = formData.get('email') as string
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
            redirectTo: `${siteUrl}/auth/confirm?next=/dashboard`,
        },
    })

    if (error) {
        // User not found — guide them to sign up
        if (error.message.toLowerCase().includes('not found') || error.status === 422) {
            return { error: 'No account found with this email. Try signing up instead.' }
        }
        return { error: error.message }
    }

    const html = await render(MagicLinkEmail({ link: data.properties.action_link, type: 'login' }))

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Your magic link for behuddle',
        html,
    })

    if (emailError) return { error: 'Failed to send email. Please try again.' }
    return { success: true }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function ensureSkills(names: string[]): Promise<number[]> {
    if (!names.length) return []
    const supabase = await createClient()

    // Upsert by name — returns existing or newly created rows
    const { data, error } = await supabase
        .from('skills')
        .upsert(
            names.map((name) => ({ name: name.trim(), category: 'other' })),
            { onConflict: 'name', ignoreDuplicates: false }
        )
        .select('id')

    if (error || !data) return []
    return data.map((row) => row.id)
}

export const updateProfile = withAuth(async ({ supabase, user }, data: {
    role?: string
    bio?: string
    motivation?: string
    location?: string
    status?: string
    availability_hours?: number
    is_open_to_match?: boolean
    email_digest_opt_in?: boolean
    skill_ids?: number[]
}) => {
    const { skill_ids, ...profileData } = data

    const { error } = await supabase
        .from('profiles')
        .update({ ...(profileData as Record<string, unknown>), updated_at: new Date().toISOString() })
        .eq('id', user.id)

    if (error) return fail(error.message)

    if (skill_ids && skill_ids.length > 0) {
        await supabase.from('profile_skills').delete().eq('profile_id', user.id)
        await supabase.from('profile_skills').insert(
            skill_ids.map(id => ({ profile_id: user.id, skill_id: id, level: 'mid' as const }))
        )
    }

    return done()
})

// ── Projects ──────────────────────────────────────────────────────────────────

export const createProject = withAuth(async ({ supabase, user }, data: {
    title: string
    description?: string
    stage?: string
    domain?: string
    what_exists?: string
    what_needed?: string
    skill_ids?: number[]
}) => {
    const { skill_ids, ...projectData } = data

    const { data: project, error } = await supabase
        .from('projects')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({ ...projectData, owner_id: user.id } as any)
        .select('id')
        .single()

    if (error || !project) return fail(error?.message ?? 'Failed to create project')

    if (skill_ids?.length) {
        await supabase.from('project_skill_needs').insert(
            skill_ids.map((id) => ({ project_id: project.id, skill_id: id, is_must_have: false }))
        )
    }

    revalidatePath('/dashboard/ideas')
    return ok(project.id)
})

export const updateProject = withAuth(async ({ supabase, user }, id: string, data: {
    title?: string
    description?: string
    stage?: string
    domain?: string
    what_exists?: string
    what_needed?: string
    is_paused?: boolean
    skill_ids?: number[]
}) => {
    const { skill_ids, ...projectData } = data

    const { error } = await supabase
        .from('projects')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ ...projectData, last_updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .eq('owner_id', user.id)

    if (error) return fail(error.message)

    if (skill_ids !== undefined) {
        await supabase.from('project_skill_needs').delete().eq('project_id', id)
        if (skill_ids.length) {
            await supabase.from('project_skill_needs').insert(
                skill_ids.map((sid) => ({ project_id: id, skill_id: sid, is_must_have: false }))
            )
        }
    }

    revalidatePath('/dashboard/ideas')
    return done()
})

export const deleteProject = withAuth(async ({ supabase, user }, id: string) => {
    const { error } = await supabase
        .from('projects')
        .update({ is_active: false })
        .eq('id', id)
        .eq('owner_id', user.id)

    if (error) return fail(error.message)

    revalidatePath('/dashboard/ideas')
    return done()
})

export const toggleProjectLike = withAuth(async ({ supabase, user }, projectId: string) => {
    const { data: existing } = await supabase
        .from('project_likes')
        .select('project_id')
        .eq('profile_id', user.id)
        .eq('project_id', projectId)
        .single()

    if (existing) {
        await supabase.from('project_likes').delete()
            .eq('profile_id', user.id).eq('project_id', projectId)
    } else {
        await supabase.from('project_likes').insert({ profile_id: user.id, project_id: projectId })
    }

    revalidatePath('/dashboard/ideas')
    return done()
})

export const getProfile = withAuth(async ({ supabase, user }) => {
    const { data } = await supabase
        .from('profiles')
        .select('*, profile_skills(*, skills(*))')
        .eq('id', user.id)
        .single()

    return ok(data)
})

// ── Matchmaking ───────────────────────────────────────────────────────────────

export const runMatchmaking = withAuth(async ({ supabase, user }) => {

    type ProfileRow = { id: string; role: string | null; bio: string | null; full_name: string | null; motivation: string | null; availability_hours: number | null; location?: string | null; is_verified?: boolean; profile_skills: { skill_id: number }[] }

    // Get current user profile + skills
    const { data: meRaw } = await supabase
        .from('profiles')
        .select('id, role, bio, full_name, motivation, availability_hours, location, profile_skills(skill_id)')
        .eq('id', user.id)
        .single()
    const me = meRaw as unknown as ProfileRow | null

    if (!me) return fail('Profile not found')

    // Get candidates — open to match, not self
    const { data: candidatesRaw } = await supabase
        .from('profiles')
        .select('id, role, bio, full_name, motivation, availability_hours, is_verified, profile_skills(skill_id)')
        .eq('is_open_to_match', true)
        .neq('id', user.id)
        .limit(50)
    const candidates = candidatesRaw as unknown as ProfileRow[] | null

    if (!candidates?.length) return ok(0)

    // Get existing matches to avoid duplicates
    const { data: existingMatches } = await supabase
        .from('matches')
        .select('profile_a, profile_b')
        .or(`profile_a.eq.${user.id},profile_b.eq.${user.id}`)

    const matchedIds = new Set(
        (existingMatches ?? []).flatMap((m) => [m.profile_a, m.profile_b])
    )
    matchedIds.delete(user.id)

    // Get builder's projects
    let projects: { id: string; title: string; what_needed: string | null; description: string | null; project_skill_needs: { skill_id: number }[] }[] = []
    if (me.role === 'builder') {
        const { data } = await supabase
            .from('projects')
            .select('id, title, what_needed, description, project_skill_needs(skill_id)')
            .eq('owner_id', user.id)
            .eq('is_active', true)
            .limit(3)
        projects = data ?? []
    }

    const meScored = toScoredProfile(me)

    const newMatches: {
        profile_a: string; profile_b: string;
        score: number; source: 'ai'; project_id?: string | null
    }[] = []

    for (const candidate of candidates) {
        if (matchedIds.has(candidate.id)) continue

        const candidateScored = toScoredProfile(candidate)
        const score = scoreMatch({ me: meScored, candidate: candidateScored })
        if (score < 20) continue

        // Find best project match by skill overlap
        let projectId: string | null = null
        if (projects.length > 0) {
            const best = projects.find((p) =>
                p.project_skill_needs.some((psn) => candidateScored.skill_ids.has(psn.skill_id))
            ) ?? projects[0]
            projectId = best?.id ?? null
        }

        const [a, b] = user.id < candidate.id
            ? [user.id, candidate.id]
            : [candidate.id, user.id]

        newMatches.push({ profile_a: a, profile_b: b, score, source: 'ai', project_id: projectId })
    }

    if (newMatches.length === 0) return ok(0)

    await supabase.from('matches').upsert(newMatches, {
        onConflict: 'profile_a,profile_b',
        ignoreDuplicates: true,
    })

    // Generate Spark text for top 3 new matches (if Claude API key present)
    if (process.env.ANTHROPIC_API_KEY) {
        const { generateSpark } = await import('@/lib/claude/spark')
        const top = newMatches.sort((a, b) => b.score - a.score).slice(0, 3)

        for (const match of top) {
            const otherId = match.profile_a === user.id ? match.profile_b : match.profile_a
            const other = candidates.find((c) => c.id === otherId)
            if (!other) continue

            const project = projects.find((p) => p.id === match.project_id)
            const { data: otherSkills } = await supabase
                .from('profile_skills')
                .select('skills(name)')
                .eq('profile_id', otherId)

            const skillNames = (otherSkills ?? [])
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((ps: any) => (Array.isArray(ps.skills) ? ps.skills[0]?.name : ps.skills?.name) as string | undefined)
                .filter((n): n is string => Boolean(n))

            try {
                const sparkText = await generateSpark({
                    builder:     me.role === 'builder' ? me : other,
                    contributor: me.role === 'builder' ? other : me,
                    project:     project ?? { title: 'a project', what_needed: null, description: null },
                    skills:      skillNames,
                })

                if (sparkText) {
                    await supabase.from('matches')
                        .update({ spark_text: sparkText })
                        .eq('profile_a', match.profile_a)
                        .eq('profile_b', match.profile_b)
                }
            } catch {
                // Claude API unavailable — skip Spark for this match
            }
        }
    }

    revalidatePath('/dashboard/matches')
    return ok(newMatches.length)
})

export const respondToMatch = withAuth(async ({ supabase, user }, matchId: string, response: 'yes' | 'no' | 'deferred') => {
    const { data: match } = await supabase
        .from('matches')
        .select('profile_a, profile_b')
        .eq('id', matchId)
        .single()

    if (!match) return fail('Match not found')

    const isA = match.profile_a === user.id
    const { error } = await supabase
        .from('matches')
        .update(isA ? { status_a: response } : { status_b: response })
        .eq('id', matchId)

    if (error) return fail(error.message)
    revalidatePath('/dashboard/matches')

    // On "yes": check if now mutual → create conversation if missing
    if (response === 'yes') {
        const { data: updated } = await supabase
            .from('matches')
            .select('status_a, status_b, project_id')
            .eq('id', matchId)
            .single()

        if (updated?.status_a === 'yes' && updated?.status_b === 'yes') {
            const { data: existing } = await supabase
                .from('conversations')
                .select('id')
                .eq('match_id', matchId)
                .maybeSingle()

            if (!existing) {
                let context = 'via Spark'
                if (updated.project_id) {
                    const { data: proj } = await supabase
                        .from('projects')
                        .select('title')
                        .eq('id', updated.project_id)
                        .single()
                    if (proj) context = `via Spark · ${proj.title}`
                }
                await supabase.from('conversations').insert({ match_id: matchId, context })
            }
            revalidatePath('/dashboard/messages')
        }
    }

    return done()
})

// ── Community ─────────────────────────────────────────────────────────────────

export const createPost = withAuth(async ({ supabase, user }, data: {
    title: string
    body?: string
    type: 'question' | 'find' | 'case'
    project_id?: string
}) => {
    const { error } = await supabase.from('posts').insert({
        ...data,
        author_id: user.id,
    })

    if (error) return fail(error.message)
    revalidatePath('/dashboard/community')
    return done()
})

// ── Messages ──────────────────────────────────────────────────────────────────

export const markMessagesAsRead = withAuth(async ({ supabase, user }, conversationId: string) => {
    // Mark all unread messages from other users as read
    const { error } = await supabase
        .from('messages')
        .update({ message_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('message_read_at', null)

    if (error) return fail(error.message)

    // Update or create conversation_reads entry
    const { error: upsertError } = await supabase
        .from('conversation_reads')
        .upsert({
            conversation_id: conversationId,
            user_id: user.id,
            last_read_at: new Date().toISOString(),
        })

    if (upsertError) return fail(upsertError.message)

    return done()
})

// ── Email Digest ──────────────────────────────────────────────────────────────

export async function sendWeeklyDigest(userId: string) {
    const supabase = await createClient()
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Get user profile
    const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (!user) return { error: 'User not found' }

    // Check if user opted in
    if (!user.email_digest_opt_in) return { success: false, reason: 'User opted out' }

    // Get user email from auth
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const authUser = users.find((u) => u.id === userId)
    if (!authUser?.email) return { error: 'User email not found' }

    // Get top 3 matches from past 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: matches } = await supabase
        .from('matches')
        .select('*, profile_a:profile_a(*), project:project_id(*)')
        .eq('profile_b', userId)
        .eq('status_b', 'pending')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('score', { ascending: false })
        .limit(3)

    if (!matches || matches.length === 0) {
        return { success: false, reason: 'No matches found' }
    }

    const { WeeklyMatchesEmail } = await import('@/lib/resend/emails')
    const { render } = await import('@react-email/render')
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/digest/unsubscribe?userId=${userId}`

    const html = await render(WeeklyMatchesEmail({ user, matches, unsubscribeUrl }))

    const { error: resendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: authUser.email,
        subject: 'Your weekly matches on behuddle',
        html,
    })

    if (resendError) return { error: resendError.message }

    return { success: true }
}