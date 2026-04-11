import React from 'react';

interface MagicLinkEmailProps {
  link: string;
  type: 'login' | 'signup';
  name?: string | null;
}

export function MagicLinkEmail({ link, type, name }: MagicLinkEmailProps) {
  const greeting = name ? `Hi ${name.split(' ')[0]},` : 'Hi there,';
  const headline =
    type === 'signup'
      ? 'Welcome to behuddle'
      : 'Your magic link';
  const subtext =
    type === 'signup'
      ? "You're one click away from finding your perfect collaborator."
      : 'Click the button below to sign in. No password needed.';
  const cta = type === 'signup' ? 'Activate my account' : 'Sign in to behuddle';

  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        backgroundColor: '#f6f5f4',
        padding: '40px 20px',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#1a1e19',
            borderRadius: '16px 16px 0 0',
            padding: '28px 36px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '22px',
              fontWeight: '700',
              color: '#f6f5f4',
              margin: '0',
              letterSpacing: '0.02em',
            }}
          >
            behuddle
          </p>
        </div>

        {/* Body */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '40px 36px',
            borderLeft: '1px solid #e8e6e3',
            borderRight: '1px solid #e8e6e3',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 24px 0',
            }}
          >
            {greeting}
          </p>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1A1918',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em',
            }}
          >
            {headline}
          </h1>

          <p
            style={{
              fontSize: '15px',
              color: '#6b7280',
              margin: '0 0 36px 0',
              lineHeight: '1.6',
            }}
          >
            {subtext}
          </p>

          {/* CTA Button */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <a
              href={link}
              style={{
                display: 'inline-block',
                backgroundColor: '#1A1918',
                color: '#f6f5f4',
                padding: '14px 32px',
                borderRadius: '100px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '0.01em',
              }}
            >
              {cta}
            </a>
          </div>

          {/* Fallback link */}
          <p
            style={{
              fontSize: '12px',
              color: '#9ca3af',
              margin: '0 0 4px 0',
            }}
          >
            Or copy this link into your browser:
          </p>
          <p
            style={{
              fontSize: '11px',
              color: '#8a9a86',
              wordBreak: 'break-all',
              margin: '0',
              lineHeight: '1.5',
            }}
          >
            {link}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: '#f6f5f4',
            borderRadius: '0 0 16px 16px',
            border: '1px solid #e8e6e3',
            borderTop: 'none',
            padding: '20px 36px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: '#9ca3af',
              margin: '0 0 4px 0',
            }}
          >
            This link expires in 24 hours.
          </p>
          <p
            style={{
              fontSize: '12px',
              color: '#9ca3af',
              margin: '0',
            }}
          >
            If you didn&apos;t request this, you can safely ignore it — your account is unaffected.
          </p>
        </div>

        {/* Copyright */}
        <p
          style={{
            fontSize: '11px',
            color: '#c9c4bc',
            textAlign: 'center',
            margin: '24px 0 0 0',
          }}
        >
          © {new Date().getFullYear()} behuddle. All rights reserved.
        </p>
      </div>
    </div>
  );
}
