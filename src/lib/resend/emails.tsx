import React from 'react';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  bio: string | null;
}

interface Project {
  title: string;
  description: string | null;
}

interface Match {
  profile_a: Profile;
  project_id: string;
  project: Project;
  spark_text: string | null;
  score: number;
}

interface WeeklyMatchesEmailProps {
  user: Profile;
  matches: Match[];
  unsubscribeUrl: string;
}

export function WeeklyMatchesEmail({
  user,
  matches,
  unsubscribeUrl,
}: WeeklyMatchesEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://behuddle.com';

  return (
    <div
      style={{
        fontFamily: 'DM Sans, system-ui, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 20px',
        backgroundColor: '#F8F9FA',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111111',
            margin: '0 0 8px 0',
          }}
        >
          Your weekly matches on behuddle
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#666666',
            margin: '0',
          }}
        >
          We found some great collaborators for you.
        </p>
      </div>

      {/* Matches */}
      {matches.map((match) => (
        <div
          key={match.project_id}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '16px',
            border: '1px solid #E5E5E5',
          }}
        >
          {/* Profile & Project Header */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {match.profile_a.avatar_url ? (
                <img
                  src={match.profile_a.avatar_url}
                  alt={match.profile_a.full_name || ''}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#E5E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666666',
                  }}
                >
                  {(match.profile_a.full_name || '?')
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()}
                </div>
              )}
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111111',
                    margin: '0',
                  }}
                >
                  {match.profile_a.full_name}
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#666666',
                    margin: '0',
                    textTransform: 'capitalize',
                  }}
                >
                  {match.profile_a.role}
                </p>
              </div>
            </div>

            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111111',
                margin: '0 0 4px 0',
              }}
            >
              {match.project.title}
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: '#666666',
                margin: '0',
                lineHeight: '1.5',
              }}
            >
              {match.project.description}
            </p>
          </div>

          {/* Spark Text */}
          {match.spark_text && (
            <div
              style={{
                backgroundColor: '#F5F5F5',
                borderLeft: '3px solid #4F46E5',
                padding: '12px 16px',
                marginBottom: '16px',
                borderRadius: '4px',
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  color: '#333333',
                  margin: '0',
                  lineHeight: '1.6',
                  fontStyle: 'italic',
                }}
              >
                {match.spark_text}
              </p>
            </div>
          )}

          {/* Score & CTA */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: '#999999',
                margin: '0',
              }}
            >
              Match score: {Math.round(match.score * 100) / 100}%
            </p>
            <a
              href={`${baseUrl}/dashboard/matches`}
              style={{
                display: 'inline-block',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              View Match
            </a>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div
        style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #E5E5E5',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            color: '#999999',
            margin: '0 0 12px 0',
          }}
        >
          This email is customized for you based on your skills and interests.
        </p>
        <a
          href={unsubscribeUrl}
          style={{
            fontSize: '12px',
            color: '#4F46E5',
            textDecoration: 'none',
          }}
        >
          Unsubscribe from digests
        </a>
      </div>

      {/* Copyright */}
      <p
        style={{
          fontSize: '11px',
          color: '#CCCCCC',
          textAlign: 'center',
          margin: '24px 0 0 0',
        }}
      >
        © {new Date().getFullYear()} behuddle. All rights reserved.
      </p>
    </div>
  );
}
