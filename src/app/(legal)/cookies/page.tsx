import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — behuddle',
}

export default function CookiesPage() {
  return (
    <article className="prose-policy">
      <div className="mb-12">
        <p className="text-[12px] text-hint uppercase tracking-widest font-medium mb-3">Legal</p>
        <h1 className="font-display text-[36px] font-bold tracking-tight text-heading leading-tight mb-4">
          Cookie Policy
        </h1>
        <p className="text-[14px] text-secondary">Last updated: April 12, 2026</p>
      </div>

      <Section title="What are cookies?">
        <p>
          Cookies are small text files stored in your browser. We also use browser localStorage
          to store lightweight preferences on your device.
        </p>
      </Section>

      <Section title="Cookies we use">
        <p>We use only <strong>strictly necessary cookies</strong>:</p>
        <Table
          headers={['Name', 'Type', 'Purpose', 'Expires']}
          rows={[
            ['sb-*-auth-token', 'HTTP Cookie', 'Supabase authentication session', 'Session / 1 week'],
            ['sb-*-auth-token-code-verifier', 'HTTP Cookie', 'PKCE OAuth security token', 'Session'],
          ]}
        />
        <p>
          These cookies are essential for you to log in and use the platform.
          Blocking them will prevent authentication from working.
        </p>
      </Section>

      <Section title="localStorage (not cookies)">
        <p>We use your browser&apos;s localStorage for:</p>
        <Table
          headers={['Key', 'Purpose', 'Expires']}
          rows={[
            ['bh_cookie_consent', 'Remembers your cookie banner decision (accepted/declined)', '90 days (declined) / 1 year (accepted)'],
          ]}
        />
        <p>
          localStorage values are never sent to our servers. They exist only on your device.
        </p>
      </Section>

      <Section title="Third-party cookies">
        <p>
          We do <strong>not</strong> use analytics, advertising, or social media tracking cookies.
          No third-party services set cookies through behuddle.
        </p>
      </Section>

      <Section title="Managing cookies">
        <p>
          You can clear cookies and localStorage at any time through your browser settings.
          Note that clearing authentication cookies will log you out.
        </p>
        <p>
          To reset your cookie consent preference, open your browser&apos;s developer tools,
          navigate to Application → Local Storage → this site, and delete the{' '}
          <code className="font-mono text-[13px] bg-neutral-100 px-1.5 py-0.5 rounded">bh_cookie_consent</code> key.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about cookies? Email us at{' '}
          <a href="mailto:privacy@behuddle.com" className="link">privacy@behuddle.com</a>.
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

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl border border-neutral-200/60">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200/60">
            {headers.map(h => (
              <th key={h} className="text-left px-4 py-3 font-medium text-secondary">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-neutral-100 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-foreground/70 font-mono text-[12px] first:font-sans first:text-[13px] first:text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
