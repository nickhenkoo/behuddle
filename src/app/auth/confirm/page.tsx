'use client'
import { Suspense } from "react";

// Magic link handler — processes hash-fragment tokens from Supabase.
//
// Flow:
//   admin.generateLink() → action_link (Supabase verify URL)
//   → user clicks → Supabase verifies OTP → redirects here with
//     #access_token=...&refresh_token=...&type=magiclink
//   → createBrowserClient detects the hash and sets the session
//   → we redirect to /onboarding (new user) or /dashboard (returning)

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/clients'

function AuthConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const handle = async () => {
      // getSession() automatically reads the hash fragment and sets the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError('The link has expired or is invalid. Please request a new one.')
        return
      }

      // Determine destination: new users (no role) → onboarding, returning → dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const next = searchParams.get('next')
      const destination = !profile?.role ? '/onboarding' : (next ?? '/dashboard')
      router.replace(destination)
    }

    handle()
  }, [router, searchParams])

  if (error) {
    return (
      <main className="h-screen flex flex-col items-center justify-center gap-4 bg-background font-sans px-6 text-center">
        <p className="text-[15px] font-medium text-heading">Link expired</p>
        <p className="text-[13px] text-secondary max-w-xs">{error}</p>
        <a
          href="/login"
          className="mt-2 text-[13px] text-foreground font-medium underline underline-offset-4 decoration-neutral-300 hover:decoration-heading transition-colors"
        >
          Back to sign in
        </a>
      </main>
    )
  }

  return (
    <main className="h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="text-[13px] text-secondary">Signing you in…</p>
      </div>
    </main>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background"><p className="text-[13px] text-secondary">Loading...</p></div>}>
      <AuthConfirmContent />
    </Suspense>
  )
}
