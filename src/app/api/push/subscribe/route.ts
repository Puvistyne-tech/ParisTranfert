import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PushSubscriptionData;

    // Validate required fields
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: endpoint, keys.p256dh, keys.auth',
        },
        { status: 400 }
      );
    }

    // Get current user if authenticated
    let userId: string | null = null;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      userId = session?.user?.id || null;
    } catch (error) {
      // Not authenticated, continue without userId
      console.log('[Push] No authenticated user');
    }

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', body.endpoint)
      .single();

    if (existing) {
      // Update existing subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          p256dh: body.keys.p256dh,
          auth: body.keys.auth,
          user_id: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('endpoint', body.endpoint);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription updated',
      });
    }

    // Create new subscription
    const { error } = await supabase.from('push_subscriptions').insert({
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      user_id: userId,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription saved',
    });
  } catch (error) {
    console.error('[Push] Error saving subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as PushSubscriptionData;

    if (!body.endpoint) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: endpoint',
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', body.endpoint);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription removed',
    });
  } catch (error) {
    console.error('[Push] Error removing subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

