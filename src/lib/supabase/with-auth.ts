import { createClient } from './server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

// ── Unified action result type ─────────────────────────────────────────────────
//
// All server actions should return ActionResult<T> so callers always have
// a discriminated union to pattern-match against.
//
// Usage:
//   export const myAction = withAuth(async ({ supabase, user }) => {
//     const { data, error } = await supabase.from('...').select()
//     if (error) return fail(error.message)
//     return ok(data)
//   })

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export const ok = <T>(data: T): ActionResult<T> => ({ success: true, data })

// void variant — for actions that don't return data
export const done = (): ActionResult<void> => ({ success: true, data: undefined })

export const fail = (message: string): ActionResult<never> => ({
  success: false,
  error: message,
})

// ── withAuth HOF ───────────────────────────────────────────────────────────────
//
// Wraps a server action that requires authentication.
// Handles the createClient() + getUser() boilerplate in one place.
//
// Usage:
//   export const deleteProject = withAuth(async ({ supabase, user }, id: string) => {
//     const { error } = await supabase.from('projects')
//       .update({ is_active: false })
//       .eq('id', id)
//       .eq('owner_id', user.id)
//     if (error) return fail(error.message)
//     return done()
//   })

type AuthCtx = { supabase: SupabaseClient; user: User }

type AuthedFn<TArgs extends unknown[], TReturn> = (
  ctx: AuthCtx,
  ...args: TArgs
) => Promise<TReturn>

export function withAuth<TArgs extends unknown[], TReturn>(
  fn: AuthedFn<TArgs, TReturn>
): (...args: TArgs) => Promise<TReturn | ActionResult<never>> {
  return async (...args: TArgs) => {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return fail('Not authenticated')
    return fn({ supabase, user }, ...args)
  }
}
