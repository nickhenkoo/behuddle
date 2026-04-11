import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — behuddle',
}

export default function TermsPage() {
  return (
    <article className="prose-policy">
      <div className="mb-12">
        <p className="text-[12px] text-hint uppercase tracking-widest font-medium mb-3">Legal</p>
        <h1 className="font-display text-[36px] font-bold tracking-tight text-heading leading-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-[14px] text-secondary">Last updated: April 12, 2026</p>
      </div>

      <Section title="Acceptance">
        <p>
          By creating an account or using behuddle, you agree to these Terms of Service.
          If you do not agree, please do not use the platform.
        </p>
      </Section>

      <Section title="Who can use behuddle">
        <p>
          behuddle is available to individuals aged 16 and over. By using the platform,
          you represent that you meet this requirement and that all information you provide is accurate.
        </p>
      </Section>

      <Section title="Your account">
        <p>
          You are responsible for maintaining the security of your account.
          Magic link emails are single-use and expire within 24 hours.
          Do not share your login links with others.
        </p>
        <p>
          We reserve the right to suspend or terminate accounts that violate these Terms or
          engage in harmful behavior.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>Impersonate another person or misrepresent your skills or identity</li>
          <li>Harass, threaten, or harm other users</li>
          <li>Post spam, fraudulent projects, or misleading information</li>
          <li>Attempt to reverse-engineer, scrape, or exploit the platform</li>
          <li>Use the platform for any illegal purpose</li>
        </ul>
        <p>
          Violations may result in immediate account termination without notice.
        </p>
      </Section>

      <Section title="Your content">
        <p>
          You retain ownership of everything you post on behuddle — your profile, projects, and messages.
          By posting, you grant behuddle a limited, non-exclusive license to display your content to
          other users as part of the service.
        </p>
        <p>
          You are solely responsible for the content you share. Do not post content that is
          confidential, unlicensed, or that you do not have the right to share.
        </p>
      </Section>

      <Section title="Intellectual property">
        <p>
          The behuddle platform, including its design, code, and branding, is owned by behuddle.
          Nothing in these Terms grants you a right to use our trademarks or brand assets.
        </p>
      </Section>

      <Section title="Disclaimer of warranties">
        <p>
          behuddle is provided "as is" without warranties of any kind. We do not guarantee that
          matches will lead to successful collaborations, that the platform will be available at all times,
          or that profiles are verified unless explicitly marked.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, behuddle shall not be liable for any indirect,
          incidental, or consequential damages arising from your use of the platform.
          Our total liability to you shall not exceed €100.
        </p>
      </Section>

      <Section title="Changes to these Terms">
        <p>
          We may update these Terms. Continued use of the platform after changes are posted
          constitutes acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these Terms? Email us at{' '}
          <a href="mailto:legal@behuddle.com" className="link">legal@behuddle.com</a>.
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
