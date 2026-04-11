import Link from 'next/link'
import { ReactNode } from 'react'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="border-b border-neutral-200/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display font-bold text-[15px] text-foreground tracking-wide"
          >
            behuddle
          </Link>
          <Link
            href="/"
            className="text-[13px] text-secondary hover:text-foreground transition-colors flex items-center gap-1.5 group"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-0.5">←</span>
            Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/60 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-wrap gap-4 text-[12px] text-hint">
          <Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-secondary transition-colors">Cookie Policy</Link>
          <Link href="/legal" className="hover:text-secondary transition-colors">Legal Notice</Link>
        </div>
      </footer>
    </div>
  )
}
