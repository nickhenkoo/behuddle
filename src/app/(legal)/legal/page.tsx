import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Notice — behuddle',
}

export default function LegalPage() {
  return (
    <article className="prose-policy">
      <div className="mb-12">
        <p className="text-[12px] text-hint uppercase tracking-widest font-medium mb-3">Legal</p>
        <h1 className="font-display text-[36px] font-bold tracking-tight text-heading leading-tight mb-4">
          Legal Notice
        </h1>
        <p className="text-[14px] text-secondary">Last updated: April 12, 2026</p>
      </div>

      <Section title="Company information">
        <p>
          behuddle is operated by an individual / early-stage startup.
          Full legal entity details will be published here upon company registration.
        </p>
        <p>
          <strong>Contact:</strong>{' '}
          <a href="mailto:contact@behuddle.com" className="link">contact@behuddle.com</a>
        </p>
      </Section>

      <Section title="Responsible for content">
        <p>
          The operator of behuddle.com is responsible for all content published on this platform
          in accordance with applicable law. User-generated content (profiles, project descriptions,
          messages) is the sole responsibility of the respective user.
        </p>
      </Section>

      <Section title="DMCA & copyright">
        <p>
          If you believe content on behuddle infringes your copyright, please send a notice to{' '}
          <a href="mailto:legal@behuddle.com" className="link">legal@behuddle.com</a> with:
        </p>
        <ul>
          <li>Identification of the copyrighted work claimed to be infringed</li>
          <li>Identification of the infringing material and its location on behuddle</li>
          <li>Your contact information</li>
          <li>A statement of good faith belief that the use is not authorised</li>
          <li>Your physical or electronic signature</li>
        </ul>
        <p>We will respond to valid notices promptly.</p>
      </Section>

      <Section title="Dispute resolution">
        <p>
          We aim to resolve any disputes directly and amicably. If you have a complaint,
          please contact us at{' '}
          <a href="mailto:legal@behuddle.com" className="link">legal@behuddle.com</a> first.
        </p>
        <p>
          The European Commission provides an online dispute resolution platform
          available at{' '}
          <a href="https://ec.europa.eu/consumers/odr" className="link" target="_blank" rel="noopener noreferrer">
            ec.europa.eu/consumers/odr
          </a>.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms and any disputes arising from them are governed by applicable law.
          Specific jurisdiction will be stated once the legal entity is registered.
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
