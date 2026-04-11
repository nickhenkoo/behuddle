import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — behuddle',
}

export default function PrivacyPage() {
  return (
    <article className="prose-policy">
      <div className="mb-12">
        <p className="text-[12px] text-hint uppercase tracking-widest font-medium mb-3">Legal</p>
        <h1 className="font-display text-[36px] font-bold tracking-tight text-heading leading-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-[14px] text-secondary">Last updated: April 12, 2026</p>
      </div>

      <Section title="Who we are">
        <p>
          behuddle ("we", "us", "our") is a collaboration platform connecting builders and contributors.
          We are committed to protecting your privacy and handling your data transparently.
        </p>
        <p>
          For any privacy-related questions, contact us at{' '}
          <a href="mailto:privacy@behuddle.com" className="link">privacy@behuddle.com</a>.
        </p>
      </Section>

      <Section title="What data we collect">
        <p>We collect only what is necessary to operate the platform:</p>
        <ul>
          <li><strong>Account data</strong> — email address, full name, profile photo (via Google OAuth or provided by you)</li>
          <li><strong>Profile data</strong> — role (builder/contributor), bio, skills, motivation, availability, location (city-level only)</li>
          <li><strong>Usage data</strong> — projects you create, likes, matches you respond to, messages you send</li>
          <li><strong>Technical data</strong> — session tokens stored in cookies for authentication</li>
        </ul>
        <p>We do <strong>not</strong> collect financial data, device fingerprints, or precise GPS coordinates.</p>
      </Section>

      <Section title="How we use your data">
        <ul>
          <li>Authenticate you and maintain your session</li>
          <li>Match you with relevant builders or contributors using our scoring algorithm</li>
          <li>Send transactional emails (magic links, match notifications) via Resend</li>
          <li>Send optional weekly digest emails (opt-in, can be disabled in Settings)</li>
          <li>Display your public profile to other users on the platform</li>
        </ul>
        <p>We do <strong>not</strong> sell, rent, or share your data with third parties for advertising.</p>
      </Section>

      <Section title="Data storage & security">
        <p>
          Your data is stored securely in Supabase (PostgreSQL on AWS infrastructure in the EU region).
          Authentication is handled by Supabase Auth with industry-standard encryption.
        </p>
        <p>
          Location coordinates are rounded to approximately 10 km precision before being stored or displayed,
          so your exact address is never recorded.
        </p>
      </Section>

      <Section title="Your rights">
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access</strong> — request a copy of your personal data</li>
          <li><strong>Correction</strong> — update inaccurate data via Settings</li>
          <li><strong>Deletion</strong> — delete your account and all associated data via Settings → Account</li>
          <li><strong>Portability</strong> — request your data in a machine-readable format</li>
          <li><strong>Objection</strong> — opt out of non-essential communications</li>
        </ul>
        <p>
          To exercise any of these rights, email us at{' '}
          <a href="mailto:privacy@behuddle.com" className="link">privacy@behuddle.com</a>.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          We use strictly necessary cookies for authentication (Supabase session tokens).
          We use localStorage to remember your cookie consent preference.
          No third-party advertising or tracking cookies are used.
          See our <a href="/cookies" className="link">Cookie Policy</a> for details.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this policy from time to time. Significant changes will be communicated
          via email or a notice on the platform. The date at the top of this page reflects the
          most recent revision.
        </p>
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-[20px] font-semibold text-heading mb-4 tracking-tight">{title}</h2>
      <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a.link]:underline [&_a.link]:underline-offset-2 [&_a.link]:text-foreground [&_a.link]:hover:text-heading [&_a.link]:transition-colors">
        {children}
      </div>
    </section>
  )
}
