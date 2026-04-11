import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  // Verify cron secret if provided
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createClient();

    // Get all users who opted in to digest
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .eq('email_digest_opt_in', true);

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users opted in' });
    }

    // Send digest for each user
    const results = [];
    for (const user of users) {
      try {
        const { sendWeeklyDigest } = await import('@/lib/supabase/actions');
        const result = await sendWeeklyDigest(user.id);
        results.push({ userId: user.id, ...result });
      } catch (error) {
        results.push({
          userId: user.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${users.length} users`,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
